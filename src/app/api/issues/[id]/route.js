import pool from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = [
      "REPORTED",
      "VERIFIED",
      "IN_PROGRESS",
      "RESOLVED",
      "REJECTED",
    ];

    if (!validStatuses.includes(status)) {
      return Response.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE issues
       SET status = $1
       WHERE issue_id = $2
       RETURNING *`,
      [status, Number(id)]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { success: false, message: "Issue not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Issue status updated successfully",
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