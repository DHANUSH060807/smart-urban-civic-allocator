"use client";

import { useEffect, useState } from "react";

const statusColors = {
  REPORTED: "bg-blue-500",
  VERIFIED: "bg-orange-500",
  IN_PROGRESS: "bg-purple-500",
  RESOLVED: "bg-emerald-500",
  REJECTED: "bg-red-500",
};

const priorityNames = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Critical",
  5: "Emergency",
};

const priorityColors = {
  1: "bg-emerald-500",
  2: "bg-yellow-500",
  3: "bg-orange-500",
  4: "bg-red-500",
  5: "bg-purple-600",
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch("/api/reports");
        const data = await response.json();

        if (data.success) {
          setReportData(data);
        }
      } catch (error) {
        console.error("Could not fetch reports:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-5 md:p-10">
        <div className="mx-auto max-w-7xl text-center text-slate-500">
          Loading reports...
        </div>
      </main>
    );
  }

  if (!reportData) {
    return (
      <main className="min-h-screen bg-slate-100 p-5 md:p-10">
        <div className="mx-auto max-w-7xl text-center text-red-500">
          Could not load report data.
        </div>
      </main>
    );
  }

  const {
    summary,
    statusData,
    departmentData,
    priorityData,
  } = reportData;

  const totalIssues = summary.totalIssues;

  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-slate-500">
            Dashboard / Reports
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Reports & Analytics
          </h1>

          <p className="mt-2 text-slate-500">
            Analyze civic issues and monitor resource distribution.
          </p>
        </div>

        {/* Summary Cards */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total Issues", summary.totalIssues, "text-blue-600"],
            ["Departments", summary.totalDepartments, "text-purple-600"],
            ["Total Resources", summary.totalResources, "text-orange-600"],
            [
              "Available Resources",
              summary.availableResources,
              "text-emerald-600",
            ],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">{label}</p>

              <h2 className={`mt-3 text-3xl font-bold ${color}`}>
                {value}
              </h2>
            </div>
          ))}
        </section>

        {/* Analytics Sections */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Issues by Status */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Issues by Status
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Current distribution of civic complaints.
            </p>

            <div className="mt-6 space-y-5">
              {statusData.map((item) => {
                const percentage =
                  totalIssues > 0
                    ? (item.count / totalIssues) * 100
                    : 0;

                return (
                  <div key={item.name}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {item.name.replace("_", " ")}
                      </span>

                      <span className="font-semibold text-slate-800">
                        {item.count}
                      </span>
                    </div>

                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className={`h-3 rounded-full ${
                          statusColors[item.name] || "bg-slate-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Issues by Department */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Issues by Department
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Complaints assigned to each department.
            </p>

            <div className="mt-6 space-y-5">
              {departmentData.map((item) => {
                const percentage =
                  totalIssues > 0
                    ? (item.count / totalIssues) * 100
                    : 0;

                return (
                  <div key={item.name}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {item.name}
                      </span>

                      <span className="font-semibold text-slate-800">
                        {item.count}
                      </span>
                    </div>

                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-emerald-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Priority Distribution
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Breakdown of complaints based on urgency.
            </p>

            <div className="mt-6 space-y-5">
              {priorityData.map((item) => {
                const percentage =
                  totalIssues > 0
                    ? (item.count / totalIssues) * 100
                    : 0;

                const priority = Number(item.name);

                return (
                  <div key={item.name}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {priorityNames[priority] ||
                          `Priority ${priority}`}
                      </span>

                      <span className="font-semibold text-slate-800">
                        {item.count}
                      </span>
                    </div>

                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className={`h-3 rounded-full ${
                          priorityColors[priority] || "bg-slate-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resource Utilization */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Resource Utilization
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Overview of city resource availability.
            </p>

            <div className="mt-8">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Allocated Resources
                </span>

                <span className="font-semibold text-slate-800">
                  {summary.allocatedResources} / {summary.totalResources}
                </span>
              </div>

              <div className="h-4 rounded-full bg-slate-100">
                <div
                  className="h-4 rounded-full bg-orange-500"
                  style={{
                    width: `${
                      summary.totalResources > 0
                        ? (summary.allocatedResources /
                            summary.totalResources) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-700">
                    Available
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {summary.availableResources}
                  </p>
                </div>

                <div className="rounded-lg bg-orange-50 p-4">
                  <p className="text-sm text-orange-700">
                    Allocated
                  </p>
                  <p className="mt-1 text-2xl font-bold text-orange-700">
                    {summary.allocatedResources}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}