import pool from "@/lib/db";

export async function GET() {
  try {
    // Issue statistics
    const issueStatsResult = await pool.query(`
      SELECT
        COUNT(*) AS total_issues,
        COUNT(*) FILTER (WHERE status IN ('REPORTED', 'VERIFIED')) AS pending_issues,
        COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress,
        COUNT(*) FILTER (WHERE status = 'RESOLVED') AS resolved_issues
      FROM issues
    `);

    // Recent issues
    const recentIssuesResult = await pool.query(`
      SELECT
        i.issue_id,
        i.title,
        i.location,
        i.priority,
        i.status,
        d.department_name
      FROM issues i
      JOIN departments d ON i.department_id = d.department_id
      ORDER BY i.created_at DESC
      LIMIT 5
    `);

    // Resource overview
    const resourcesResult = await pool.query(`
      SELECT
        r.resource_id,
        r.resource_name,
        r.total_quantity,
        r.available_quantity,
        d.department_name
      FROM resources r
      JOIN departments d ON r.department_id = d.department_id
      ORDER BY r.resource_id
      LIMIT 5
    `);

    const stats = issueStatsResult.rows[0];

    return Response.json({
      success: true,

      statistics: {
        totalIssues: Number(stats.total_issues),
        pendingIssues: Number(stats.pending_issues),
        inProgress: Number(stats.in_progress),
        resolvedIssues: Number(stats.resolved_issues),
      },

      recentIssues: recentIssuesResult.rows,

      resources: resourcesResult.rows.map((item) => ({
        ...item,
        total_quantity: Number(item.total_quantity),
        available_quantity: Number(item.available_quantity),
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error.message);

    return Response.json(
      {
        success: false,
        message: "Could not fetch dashboard data",
      },
      { status: 500 }
    );
  }
}