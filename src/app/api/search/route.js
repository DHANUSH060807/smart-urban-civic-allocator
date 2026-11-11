import pool from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get("issueId");

    if (!issueId) {
      return Response.json(
        {
          success: false,
          message: "Please provide an issueId",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        ie.issue_id,
        i.title,
        i.location,
        ie.issue_description,
        ie.embedding
      FROM issue_embeddings ie
      JOIN issues i ON ie.issue_id = i.issue_id
      WHERE ie.issue_id != $1
      ORDER BY ie.embedding <-> (
        SELECT embedding
        FROM issue_embeddings
        WHERE issue_id = $1
      )
      LIMIT 5
      `,
      [Number(issueId)]
    );

    return Response.json({
      success: true,
      searchedIssueId: Number(issueId),
      similarIssues: result.rows,
    });
  } catch (error) {
    console.error("Semantic search error:", error.message);

    return Response.json(
      {
        success: false,
        message: "Could not perform semantic search",
      },
      { status: 500 }
    );
  }
}