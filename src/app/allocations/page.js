"use client";

import { useEffect, useState } from "react";

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [issues, setIssues] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [issueId, setIssueId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [quantity, setQuantity] = useState("");

  async function fetchData() {
    try {
      const [allocationsRes, issuesRes, resourcesRes] = await Promise.all([
        fetch("/api/allocations"),
        fetch("/api/issues"),
        fetch("/api/resources"),
      ]);

      const allocationsData = await allocationsRes.json();
      const issuesData = await issuesRes.json();
      const resourcesData = await resourcesRes.json();

      if (allocationsData.success) {
        setAllocations(allocationsData.allocations);
      }

      if (issuesData.success) {
        setIssues(issuesData.issues);
      }

      if (resourcesData.success) {
        setResources(resourcesData.resources);
      }
    } catch (error) {
      console.error("Could not fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch("/api/allocations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issue_id: issueId,
          resource_id: resourceId,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Could not create allocation");
        return;
      }

      alert("Resource allocated successfully!");

      setIssueId("");
      setResourceId("");
      setQuantity("");
      setShowForm(false);

      setLoading(true);
      await fetchData();
    } catch (error) {
      console.error("Create allocation error:", error);
      alert("Could not create allocation");
    }
  }

  const totalQuantity = allocations.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm text-slate-500">
              Dashboard / Allocations
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Resource Allocations
            </h1>
            <p className="mt-2 text-slate-500">
              Track resources assigned to reported civic issues.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            {showForm ? "Cancel" : "+ Create Allocation"}
          </button>
        </div>

        {showForm && (
          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Create New Allocation
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Assign a resource to a civic issue.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Select Issue
                </label>
                <select
                  value={issueId}
                  onChange={(event) => setIssueId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900"
                >
                  <option value="">Choose an issue</option>
                  {issues.map((issue) => (
                    <option key={issue.issue_id} value={issue.issue_id}>
                      {issue.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Select Resource
                </label>
                <select
                  value={resourceId}
                  onChange={(event) => setResourceId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900"
                >
                  <option value="">Choose a resource</option>
                  {resources.map((resource) => (
                    <option
                      key={resource.resource_id}
                      value={resource.resource_id}
                    >
                      {resource.resource_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  required
                  placeholder="Enter quantity"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Allocations</p>
            <h2 className="mt-3 text-3xl font-bold text-blue-600">
              {allocations.length}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Resource Units Allocated
            </p>
            <h2 className="mt-3 text-3xl font-bold text-orange-600">
              {totalQuantity}
            </h2>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Allocation Records
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Resources assigned to civic complaints.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-400">
                  <th className="px-4 py-4">ISSUE</th>
                  <th className="px-4 py-4">LOCATION</th>
                  <th className="px-4 py-4">RESOURCE</th>
                  <th className="px-4 py-4">DEPARTMENT</th>
                  <th className="px-4 py-4">QUANTITY</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                      Loading allocations...
                    </td>
                  </tr>
                ) : allocations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                      No allocations found.
                    </td>
                  </tr>
                ) : (
                  allocations.map((item) => (
                    <tr
                      key={item.allocation_id}
                      className="border-b border-slate-100"
                    >
                      <td className="px-4 py-5 font-semibold text-slate-800">
                        {item.issue_title}
                      </td>
                      <td className="px-4 py-5 text-slate-600">
                        {item.location}
                      </td>
                      <td className="px-4 py-5 text-slate-600">
                        {item.resource_name}
                      </td>
                      <td className="px-4 py-5 text-slate-600">
                        {item.department_name}
                      </td>
                      <td className="px-4 py-5 font-semibold text-slate-800">
                        {item.quantity}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}