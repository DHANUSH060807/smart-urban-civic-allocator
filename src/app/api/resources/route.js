import pool from "@/lib/db";

// GET all resources
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        r.resource_id,
        r.resource_name,
        r.resource_type,
        r.total_quantity,
        r.available_quantity,
        d.department_name,
        r.department_id
      FROM resources r
      JOIN departments d
        ON r.department_id = d.department_id
      ORDER BY r.resource_id DESC
    `);

    return Response.json({
      success: true,
      count: result.rows.length,
      resources: result.rows,
    });
  } catch (error) {
    console.error("Resources API error:", error.message);

    return Response.json(
      {
        success: false,
        message: "Could not fetch resources",
      },
      { status: 500 }
    );
  }
}

// POST a new resource
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      resource_name,
      resource_type,
      department_id,
      total_quantity,
      available_quantity,
    } = body;

    // Validate the fields
    if (
      !resource_name?.trim() ||
      !resource_type?.trim() ||
      !department_id ||
      !Number.isInteger(Number(total_quantity)) ||
      Number(total_quantity) <= 0 ||
      !Number.isInteger(Number(available_quantity)) ||
      Number(available_quantity) < 0 ||
      Number(available_quantity) > Number(total_quantity)
    ) {
      return Response.json(
        {
          success: false,
          message: "Please enter valid resource details",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO resources
        (
          resource_name,
          resource_type,
          department_id,
          total_quantity,
          available_quantity
        )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        resource_name.trim(),
        resource_type.trim(),
        Number(department_id),
        Number(total_quantity),
        Number(available_quantity),
      ]
    );

    return Response.json(
      {
        success: true,
        message: "Resource added successfully!",
        resource: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create resource error:", error.message);

    return Response.json(
      {
        success: false,
        message: "Could not add resource",
      },
      { status: 500 }
    );
  }
}