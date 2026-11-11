import pool from "@/lib/db";

export async function GET() {
  try {
    // Total issues
    const issuesResult = await pool.query(`
      SELECT COUNT(*) AS total_issues
      FROM issues
    `);

    // Total departments
    const departmentsResult = await pool.query(`
      SELECT COUNT(*) AS total_departments
      FROM departments
    `);

    // Resource totals
    const resourcesResult = await pool.query(`
      SELECT
        COALESCE(SUM(total_quantity), 0) AS total_resources,
        COALESCE(SUM(available_quantity), 0) AS available_resources
      FROM resources
    `);

    // Issues grouped by status
    const statusResult = await pool.query(`
      SELECT
        status,
        COUNT(*) AS count
      FROM issues
      GROUP BY status
      ORDER BY status
    `);

    // Issues grouped by department
    const departmentIssuesResult = await pool.query(`
      SELECT
        d.department_name AS name,
        COUNT(i.issue_id) AS count
      FROM departments d
      LEFT JOIN issues i
        ON d.department_id = i.department_id
      GROUP BY d.department_id, d.department_name
      ORDER BY d.department_name
    `);

    // Issues grouped by priority
    const priorityResult = await pool.query(`
      SELECT
        priority,
        COUNT(*) AS count
      FROM issues
      GROUP BY priority
      ORDER BY priority
    `);

    const totalIssues = Number(issuesResult.rows[0].total_issues);
    const totalDepartments = Number(
      departmentsResult.rows[0].total_departments
    );
    const totalResources = Number(
      resourcesResult.rows[0].total_resources
    );
    const availableResources = Number(
      resourcesResult.rows[0].available_resources
    );

    return Response.json({
      success: true,

      summary: {
        totalIssues,
        totalDepartments,
        totalResources,
        availableResources,
        allocatedResources: totalResources - availableResources,
      },

      statusData: statusResult.rows.map((item) => ({
        name: item.status,
        count: Number(item.count),
      })),

      departmentData: departmentIssuesResult.rows.map((item) => ({
        name: item.name,
        count: Number(item.count),
      })),

      priorityData: priorityResult.rows.map((item) => ({
        name: item.priority,
        count: Number(item.count),
      })),
    });
  } catch (error) {
    console.error("Reports API error:", error.message);

    return Response.json(
      {
        success: false,
        message: "Could not fetch report data",
      },
      { status: 500 }
    );
  }
}