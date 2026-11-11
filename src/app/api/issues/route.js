import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        i.issue_id,
        i.title,
        i.description,
        i.location,
        i.status,
        i.priority,
        i.created_at,
        c.category_name,
        d.department_name
      FROM issues i
      JOIN categories c ON i.category_id = c.category_id
      JOIN departments d ON i.department_id = d.department_id
      ORDER BY i.created_at DESC
    `);

    return Response.json({
      success: true,
      count: result.rows.length,
      issues: result.rows,
    });
  } catch (error) {
    console.error("Issues API error:", error.message);

    return Response.json(
      { success: false, message: "Could not fetch civic issues" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      location,
      category_id,
      department_id,
      priority,
    } = body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !location?.trim() ||
      !category_id ||
      !department_id ||
      ![1, 2, 3, 4, 5].includes(Number(priority))
    ) {
      return Response.json(
        { success: false, message: "Please fill in all fields" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO issues
       (title, description, location, category_id,
        reported_by, department_id, status, priority)
       VALUES ($1, $2, $3, $4, 1, $5, 'REPORTED', $6)
       RETURNING *`,
      [
        title.trim(),
        description.trim(),
        location.trim(),
        Number(category_id),
        Number(department_id),
        Number(priority),
      ]
    );

    return Response.json(
      {
        success: true,
        message: "Civic issue reported successfully!",
        issue: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create issue error:", error.message);

    return Response.json(
      { success: false, message: "Could not create civic issue" },
      { status: 500 }
    );
  }
}
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { issue_id, status } = body;

    const validStatuses = [
      "REPORTED",
      "VERIFIED",
      "IN_PROGRESS",
      "RESOLVED",
      "REJECTED",
    ];

    if (!issue_id || !validStatuses.includes(status)) {
      return Response.json(
        { success: false, message: "Invalid issue ID or status" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE issues
       SET status = $1
       WHERE issue_id = $2
       RETURNING *`,
      [status, Number(issue_id)]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { success: false, message: "Issue not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Issue status updated successfully!",
      issue: result.rows[0],
    });
  } catch (error) {
    console.error("Update issue error:", error.message);

    return Response.json(
      { success: false, message: "Could not update issue status" },
      { status: 500 }
    );
  }
}