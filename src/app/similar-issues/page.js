"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SimilarIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [similarIssues, setSimilarIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchIssues() {
      try {
        const response = await fetch("/api/issues");
        const data = await response.json();

        if (data.success) {
          setIssues(data.issues);
        } else {
          setMessage("Could not load civic issues.");
        }
      } catch (error) {
        console.error("Fetch issues error:", error);
        setMessage("Could not load civic issues.");
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
  }, []);

  async function handleSearch() {
    if (!selectedIssue) {
      setMessage("Please select an issue first.");
      return;
    }

    setSearching(true);
    setMessage("");
    setSimilarIssues([]);

    try {
      const response = await fetch(
        `/api/similar-issues?issueId=${selectedIssue}`
      );

      const data = await response.json();

      if (data.success) {
        setSimilarIssues(data.similarIssues || []);

        if (!data.similarIssues || data.similarIssues.length === 0) {
          setMessage("No similar issues found.");
        }
      } else {
        setMessage(data.message || "Could not find similar issues.");
      }
    } catch (error) {
      console.error("Similar issues search error:", error);
      setMessage("Could not search for similar issues.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm text-slate-600">
              Dashboard / Similar Issues
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Similar Issues
            </h1>

            <p className="mt-2 text-slate-700">
              Find related civic issues using pgvector similarity search.
            </p>
          </div>

          <Link
            href="/issues"
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-800 hover:bg-slate-50"
          >
            View All Issues
          </Link>
        </div>

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Search for Similar Issues
          </h2>

          <p className="mt-2 text-sm text-slate-700">
            Select a civic issue to find related issues using vector embeddings
            and pgvector.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <select
              value={selectedIssue}
              onChange={(event) => setSelectedIssue(event.target.value)}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900"
            >
              <option value="">
                {loading ? "Loading issues..." : "Select an issue"}
              </option>

              {issues.map((issue) => (
                <option key={issue.issue_id} value={issue.issue_id}>
                  ISS-{String(issue.issue_id).padStart(3, "0")} —{" "}
                  {issue.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              disabled={searching || loading}
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searching ? "Searching..." : "Find Similar Issues"}
            </button>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Similar Issues Found
          </h2>

          <p className="mt-2 text-sm text-slate-700">
            Related civic issues identified using similarity search.
          </p>

          {message && (
            <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              {message}
            </div>
          )}

          {searching && (
            <p className="mt-6 text-slate-700">
              Searching for similar issues...
            </p>
          )}

          {!searching && similarIssues.length > 0 && (
            <div className="mt-6 space-y-4">
              {similarIssues.map((issue, index) => (
                <div
                  key={issue.issue_id}
                  className="rounded-xl border border-blue-200 bg-blue-50 p-5"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                        #{index + 1} Match
                      </span>

                      <span className="font-bold text-blue-700">
                        ISS-{String(issue.issue_id).padStart(3, "0")}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      {issue.title}
                    </h3>

                    <p className="mt-2 text-slate-800">
                      Location: {issue.location}
                    </p>

                    <p className="mt-3 text-slate-800">
                      {issue.issue_description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading &&
            !searching &&
            similarIssues.length === 0 &&
            !message && (
              <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-700">
                Select an issue above and click{" "}
                <strong>Find Similar Issues</strong>.
              </div>
            )}
        </section>
      </div>
    </main>
  );
}