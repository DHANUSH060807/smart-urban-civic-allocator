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

    // Get the embedding of the selected issue
    const selectedResult = await pool.query(
      `
      SELECT embedding
      FROM issue_embeddings
      WHERE issue_id = $1
      `,
      [Number(issueId)]
    );

    if (selectedResult.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No embedding found for this issue",
        },
        { status: 404 }
      );
    }

    const selectedEmbedding = selectedResult.rows[0].embedding;

    // Find genuinely similar issues using pgvector
    const result = await pool.query(
      `
      SELECT
        ie.issue_id,
        i.title,
        i.location,
        ie.issue_description
      FROM issue_embeddings ie
      JOIN issues i ON ie.issue_id = i.issue_id
      WHERE ie.issue_id != $2
        AND (ie.embedding <-> $1::vector) < 0.3
      ORDER BY ie.embedding <-> $1::vector
      LIMIT 5
      `,
      [selectedEmbedding, Number(issueId)]
    );

    return Response.json({
      success: true,
      searchedIssueId: Number(issueId),
      similarIssues: result.rows,
    });
  } catch (error) {
    console.error("Similar issues API error:", error.message);

    return Response.json(
      {
        success: false,
        message: "Could not search for similar issues",
      },
      { status: 500 }
    );
  }
}