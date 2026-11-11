import pool from "@/lib/db";

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

    // Check the available quantity of the selected resource
    const resourceResult = await client.query(
      `SELECT resource_id, resource_name, available_quantity
       FROM resources
       WHERE resource_id = $1
       FOR UPDATE`,
      [Number(resource_id)]
    );

    if (resourceResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        {
          success: false,
          message: "Resource not found",
        },
        { status: 404 }
      );
    }

    const resource = resourceResult.rows[0];

    // Prevent allocation if insufficient quantity is available
    if (Number(resource.available_quantity) < Number(quantity)) {
      await client.query("ROLLBACK");

      return Response.json(
        {
          success: false,
          message: `Only ${resource.available_quantity} unit(s) of ${resource.resource_name} are available`,
        },
        { status: 400 }
      );
    }

    // Create the allocation record
    const allocationResult = await client.query(
      `INSERT INTO allocations
        (issue_id, resource_id, allocated_by, quantity)
       VALUES ($1, $2, 4, $3)
       RETURNING *`,
      [
        Number(issue_id),
        Number(resource_id),
        Number(quantity),
      ]
    );

    // Reduce the available quantity
    await client.query(
      `UPDATE resources
       SET available_quantity = available_quantity - $1
       WHERE resource_id = $2`,
      [Number(quantity), Number(resource_id)]
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