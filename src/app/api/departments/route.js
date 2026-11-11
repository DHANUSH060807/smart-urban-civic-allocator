import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        department_id,
        department_name
      FROM departments
      ORDER BY department_id
    `);

    return Response.json({
      success: true,
      departments: result.rows,
    });
  } catch (error) {
    console.error("Departments API error:", error.message);

    return Response.json(
      {
        success: false,
        message: "Could not fetch departments",
      },
      { status: 500 }
    );
  }
}