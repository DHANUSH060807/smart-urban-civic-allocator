import pool from "@/lib/db";
import jwt from "jsonwebtoken";

function getAuthenticatedUser(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.substring(7);

  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || "civicflow_demo_secret"
    );
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        a.allocation_id,
        a.issue_id,
        a.resource_id,
        a.quantity,
        a.allocated_at,
        i.title AS issue_title,
        i.location,
        r.resource_name,
        d.department_name
      FROM allocations a
      JOIN issues i ON a.issue_id = i.issue_id
      JOIN resources r ON a.resource_id = r.resource_id
      JOIN departments d ON r.department_id = d.department_id
      ORDER BY a.allocation_id DESC
    `);

    return Response.json({
      success: true,
      count: result.rows.length,
      allocations: result.rows,
    });
  } catch (error) {
    console.error("Allocations API error:", error.message);

    return Response.json(
      {
        success: false,
        message: "Could not fetch allocations",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const user = getAuthenticatedUser(request);

  if (!user) {
    return Response.json(
      {
        success: false,
        message: "Authentication token is required or invalid",
      },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return Response.json(
      {
        success: false,
        message: "Only administrators can allocate resources",
      },
      { status: 403 }
    );
  }

  const client = await pool.connect();

  try {
    const body = await request.json();
    const { issue_id, resource_id, quantity } = body;

    if (
      !issue_id ||
      !resource_id ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Please provide a valid issue, resource, and quantity",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Check whether the issue exists.
    const issueResult = await client.query(
      `SELECT issue_id FROM issues WHERE issue_id = $1`,
      [Number(issue_id)]
    );

    if (issueResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        {
          success: false,
          message: "Selected issue was not found",
        },
        { status: 404 }
      );
    }

    // Lock the resource while checking its available quantity.
    const resourceResult = await client.query(
      `
        SELECT resource_id, resource_name, available_quantity
        FROM resources
        WHERE resource_id = $1
        FOR UPDATE
      `,
      [Number(resource_id)]
    );

    if (resourceResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        {
          success: false,
          message: "Selected resource was not found",
        },
        { status: 404 }
      );
    }

    const resource = resourceResult.rows[0];
    const requestedQuantity = Number(quantity);

    if (Number(resource.available_quantity) < requestedQuantity) {
      await client.query("ROLLBACK");

      return Response.json(
        {
          success: false,
          message: `Only ${resource.available_quantity} unit(s) of ${resource.resource_name} are available`,
        },
        { status: 400 }
      );
    }

    // Create the allocation using the currently logged-in administrator.
    const allocationResult = await client.query(
      `
        INSERT INTO allocations
          (issue_id, resource_id, allocated_by, quantity)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [
        Number(issue_id),
        Number(resource_id),
        Number(user.user_id),
        requestedQuantity,
      ]
    );

    // Reduce the available resource quantity.
    await client.query(
      `
        UPDATE resources
        SET available_quantity = available_quantity - $1
        WHERE resource_id = $2
      `,
      [requestedQuantity, Number(resource_id)]
    );

    await client.query("COMMIT");

    return Response.json(
      {
        success: true,
        message: "Resource allocated successfully!",
        allocation: allocationResult.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create allocation error:", error.message);

    return Response.json(
      {
        success: false,
        message: "Could not create allocation",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}