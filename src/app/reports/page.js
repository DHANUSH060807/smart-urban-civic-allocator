"use client";

import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch("/api/reports");
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Could not load report data.");
          return;
        }

        setReportData(data);
      } catch (error) {
        console.error("Reports fetch error:", error);
        setError("Could not load report data.");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-5 md:p-10">
        <div className="mx-auto max-w-7xl rounded-xl bg-white p-8 text-center font-semibold text-slate-950 shadow-sm">
          Loading reports...
        </div>
      </main>
    );
  }

  if (error || !reportData) {
    return (
      <main className="min-h-screen bg-slate-100 p-5 md:p-10">
        <div className="mx-auto max-w-7xl rounded-xl border border-red-300 bg-white p-8 text-center font-semibold text-red-800 shadow-sm">
          {error || "Could not load report data."}
        </div>
      </main>
    );
  }

  const { summary, statusData, departmentData, priorityData } =
    reportData;

  const maxStatusCount = Math.max(
    ...statusData.map((item) => item.count),
    1
  );

  const maxDepartmentCount = Math.max(
    ...departmentData.map((item) => item.count),
    1
  );

  const maxPriorityCount = Math.max(
    ...priorityData.map((item) => item.count),
    1
  );

  const resourceUsagePercentage =
    summary.totalResources > 0
      ? Math.round(
          (summary.allocatedResources / summary.totalResources) * 100
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-slate-900">
            Dashboard / Reports
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Civic Operations Reports
          </h1>

          <p className="mt-2 font-medium text-slate-900">
            Overview of civic issues, departments, priorities, and resource
            utilization.
          </p>
        </div>

        {/* Summary Cards */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Total Issues
            </p>
            <h2 className="mt-3 text-3xl font-bold text-blue-700">
              {summary.totalIssues}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-900">
              All reported civic issues
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Active Issues
            </p>
            <h2 className="mt-3 text-3xl font-bold text-orange-700">
              {summary.activeIssues}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-900">
              Issues currently being handled
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Resolved Issues
            </p>
            <h2 className="mt-3 text-3xl font-bold text-emerald-700">
              {summary.resolvedIssues}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-900">
              Successfully resolved issues
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Departments
            </p>
            <h2 className="mt-3 text-3xl font-bold text-purple-700">
              {summary.totalDepartments}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-900">
              Departments managing civic services
            </p>
          </div>
        </section>

        {/* Issue Status and Priority */}
        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Issues by Status
            </h2>

            <p className="mt-2 font-medium text-slate-900">
              Current distribution of all reported issues.
            </p>

            <div className="mt-6 space-y-5">
              {statusData.length === 0 ? (
                <p className="font-medium text-slate-900">
                  No issue data available.
                </p>
              ) : (
                statusData.map((item) => (
                  <div key={item.name}>
                    <div className="mb-2 flex justify-between font-semibold text-slate-950">
                      <span>{item.name}</span>
                      <span>{item.count}</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${
                            (item.count / maxStatusCount) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Issues by Priority
            </h2>

            <p className="mt-2 font-medium text-slate-900">
              Priority distribution of reported civic issues.
            </p>

            <div className="mt-6 space-y-5">
              {priorityData.length === 0 ? (
                <p className="font-medium text-slate-900">
                  No priority data available.
                </p>
              ) : (
                priorityData.map((item) => (
                  <div key={item.name}>
                    <div className="mb-2 flex justify-between font-semibold text-slate-950">
                      <span>{item.name}</span>
                      <span>{item.count}</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{
                          width: `${
                            (item.count / maxPriorityCount) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Department Distribution */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Issues by Department
          </h2>

          <p className="mt-2 font-medium text-slate-900">
            Number of civic issues assigned to each department.
          </p>

          <div className="mt-6 space-y-5">
            {departmentData.length === 0 ? (
              <p className="font-medium text-slate-900">
                No department data available.
              </p>
            ) : (
              departmentData.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex flex-col justify-between gap-1 font-semibold text-slate-950 sm:flex-row">
                    <span>{item.name}</span>
                    <span>{item.count} issue(s)</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-purple-600"
                      style={{
                        width: `${
                          (item.count / maxDepartmentCount) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Resource Summary */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Resource Utilization
              </h2>

              <p className="mt-2 font-medium text-slate-900">
                Overview of available and allocated civic resources.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-blue-900">
                Resource Usage
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-800">
                {resourceUsagePercentage}%
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-900">
                Total Resources
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {summary.totalResources}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-900">
                Available Resources
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {summary.availableResources}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-900">
                Allocated Resources
              </p>
              <p className="mt-2 text-2xl font-bold text-orange-700">
                {summary.allocatedResources}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex justify-between font-semibold text-slate-950">
              <span>Resource utilization</span>
              <span>
                {summary.allocatedResources} of {summary.totalResources}
              </span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${resourceUsagePercentage}%`,
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}