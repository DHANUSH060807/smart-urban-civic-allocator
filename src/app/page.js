"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const priorityNames = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Critical",
  5: "Emergency",
};

const priorityStyles = {
  1: "bg-emerald-100 text-emerald-700",
  2: "bg-yellow-100 text-yellow-700",
  3: "bg-orange-100 text-orange-700",
  4: "bg-red-100 text-red-700",
  5: "bg-purple-100 text-purple-700",
};

export default function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch("/api/dashboard");
        const data = await response.json();

        if (data.success) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Could not fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-medium text-slate-900">Loading dashboard...</p>
      </main>
    );
  }

  if (!dashboardData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-medium text-red-700">
          Could not load dashboard data.
        </p>
      </main>
    );
  }

  const { statistics, recentIssues, resources } = dashboardData;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 md:flex">
      {/* Sidebar */}
      <aside className="w-full bg-slate-950 p-6 text-white md:min-h-screen md:w-64">
        <div className="mb-10">
          <h1 className="text-xl font-bold tracking-wide">
            Civic<span className="text-emerald-400">Flow.</span>
          </h1>
          <p className="mt-1 text-xs font-medium text-white">
            SMART URBAN MANAGEMENT
          </p>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase text-white">
          Main Menu
        </p>

        <nav className="space-y-2">
          {[
            { icon: "▦", name: "Dashboard", href: "/" },
            { icon: "◎", name: "Civic Issues", href: "/issues" },
            { icon: "♙", name: "Departments", href: "/departments" },
            { icon: "▤", name: "Resources", href: "/resources" },
            { icon: "↗", name: "Allocations", href: "/allocations" },
            { icon: "▥", name: "Reports", href: "/reports" },
            {
              icon: "⌕",
              name: "Find Similar Issues",
              href: "/similar-issues",
            },
          ].map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                index === 0
                  ? "bg-emerald-500 text-white"
                  : "text-white hover:bg-slate-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-12 rounded-xl border border-slate-700 p-4">
          <p className="text-sm font-semibold text-white">System Status</p>
          <p className="mt-2 text-xs font-medium text-emerald-400">
            ● All systems operational
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-5 md:p-8">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Overview / Dashboard
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Civic Dashboard
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-900">
              Monitor urban issues and manage city resources.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/issues"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              Manage Issues
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
              A
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-950">
                Administrator
              </p>
              <p className="text-xs font-medium text-slate-900">
                Admin Account
              </p>
            </div>
          </div>
        </header>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Total Issues",
              statistics.totalIssues,
              "All reported civic issues",
              "text-blue-700",
            ],
            [
              "Pending Issues",
              statistics.pendingIssues,
              "Awaiting action",
              "text-amber-700",
            ],
            [
              "In Progress",
              statistics.inProgress,
              "Currently assigned",
              "text-indigo-700",
            ],
            [
              "Resolved Issues",
              statistics.resolvedIssues,
              "Successfully completed",
              "text-emerald-700",
            ],
          ].map(([label, value, detail, color]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <h3 className={`mt-3 text-3xl font-bold ${color}`}>
                {value}
              </h3>
              <p className="mt-2 text-xs font-medium text-slate-900">
                {detail}
              </p>
            </div>
          ))}
        </section>

        {/* Middle Section */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Issues */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-950">
                  Recent Civic Issues
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-900">
                  Latest reported citizen complaints
                </p>
              </div>

              <Link
                href="/issues"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View all →
              </Link>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold text-slate-900">
                    <th className="pb-3">ISSUE</th>
                    <th className="pb-3">DEPARTMENT</th>
                    <th className="pb-3">PRIORITY</th>
                    <th className="pb-3">STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {recentIssues.map((issue) => (
                    <tr
                      key={issue.issue_id}
                      className="border-b border-slate-100"
                    >
                      <td className="py-4">
                        <p className="font-semibold text-slate-950">
                          {issue.title}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-900">
                          ISS-{String(issue.issue_id).padStart(3, "0")} ·{" "}
                          {issue.location}
                        </p>
                      </td>

                      <td className="py-4 text-xs font-medium text-slate-900">
                        {issue.department_name}
                      </td>

                      <td className="py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            priorityStyles[Number(issue.priority)] ||
                            "bg-slate-100 text-slate-900"
                          }`}
                        >
                          {priorityNames[Number(issue.priority)] ||
                            `Priority ${issue.priority}`}
                        </span>
                      </td>

                      <td className="py-4 text-xs font-semibold text-indigo-700">
                        {issue.status.replace("_", " ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resource Overview */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-bold text-slate-950">
              Resource Overview
            </h3>

            <p className="mt-1 text-xs font-medium text-slate-900">
              Current availability of city resources
            </p>

            {resources.map((resource) => {
              const percentage =
                resource.total_quantity > 0
                  ? Math.round(
                      (resource.available_quantity /
                        resource.total_quantity) *
                        100
                    )
                  : 0;

              return (
                <div key={resource.resource_id} className="mt-6">
                  <div className="mb-2 flex justify-between gap-2 text-sm">
                    <span className="truncate font-medium text-slate-900">
                      {resource.resource_name}
                    </span>

                    <span className="font-semibold text-slate-950">
                      {percentage}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="mt-1 text-xs font-medium text-slate-900">
                    {resource.available_quantity} of{" "}
                    {resource.total_quantity} available
                  </p>
                </div>
              );
            })}

            <Link
              href="/resources"
              className="mt-8 block w-full rounded-lg bg-slate-900 py-3 text-center text-sm font-semibold text-white hover:bg-slate-700"
            >
              Manage Resources
            </Link>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="mt-8 rounded-xl bg-emerald-950 p-6 text-white">
          <p className="text-sm font-semibold text-emerald-300">
            SMART CITY RESOURCE ALLOCATION
          </p>
          <h3 className="mt-2 text-xl font-bold">
            Better resources. Faster resolutions.
          </h3>
          <p className="mt-2 max-w-2xl text-sm font-medium text-white">
            Track complaints, prioritize urgent civic issues and coordinate
            departments to improve urban service delivery.
          </p>
        </section>

        <footer className="mt-8 text-center text-xs font-medium text-slate-900">
          Smart Urban Civic Issue and Resource Allocator © 2026
        </footer>
      </main>
    </div>
  );
}