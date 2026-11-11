
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    return Response.json({
      success: true,
      message: "PostgreSQL connected successfully!",
      databaseTime: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    return Response.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}
