"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AllocationsPage() {
  const searchParams = useSearchParams();
  const preselectedIssueId = searchParams.get("issueId");

  const [allocations, setAllocations] = useState([]);
  const [issues, setIssues] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [issueId, setIssueId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [quantity, setQuantity] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function getAuthToken() {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("civicflow_token")
    );
  }

  async function fetchData() {
    setLoading(true);

    try {
      const [allocationsRes, issuesRes, resourcesRes] =
        await Promise.all([
          fetch("/api/allocations"),
          fetch("/api/issues"),
          fetch("/api/resources"),
        ]);

      const allocationsData = await allocationsRes.json();
      const issuesData = await issuesRes.json();
      const resourcesData = await resourcesRes.json();

      if (allocationsData.success) {
        setAllocations(allocationsData.allocations || []);
      }

      if (issuesData.success) {
        setIssues(issuesData.issues || []);
      }

      if (resourcesData.success) {
        setResources(resourcesData.resources || []);
      }
    } catch (error) {
      console.error("Could not fetch allocation data:", error);
      setMessage("Could not load allocation data.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Automatically open the allocation form when coming from Issue Details.
  useEffect(() => {
    if (preselectedIssueId) {
      setIssueId(preselectedIssueId);
      setShowForm(true);
    }
  }, [preselectedIssueId]);

  const selectedResource = resources.find(
    (resource) =>
      String(resource.resource_id) === String(resourceId)
  );

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!issueId || !resourceId || !quantity) {
      setMessage("Please select an issue, resource, and quantity.");
      setMessageType("error");
      return;
    }

    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
      setMessage("Please enter a valid quantity greater than zero.");
      setMessageType("error");
      return;
    }

    if (
      selectedResource &&
      requestedQuantity > Number(selectedResource.available_quantity)
    ) {
      setMessage(
        `Only ${selectedResource.available_quantity} unit(s) of ${selectedResource.resource_name} are available.`
      );
      setMessageType("error");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setMessage(
        "Authentication token was not found. Please log out and log in again as an administrator."
      );
      setMessageType("error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/allocations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          issue_id: Number(issueId),
          resource_id: Number(resourceId),
          quantity: requestedQuantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Could not create the resource allocation."
        );
        setMessageType("error");
        return;
      }

      setMessage("Resource allocated successfully!");
      setMessageType("success");

      setIssueId("");
      setResourceId("");
      setQuantity("");
      setShowForm(false);

      await fetchData();
    } catch (error) {
      console.error("Create allocation error:", error);

      setMessage("Could not create the resource allocation.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }

  const totalQuantity = allocations.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Dashboard / Allocations
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Resource Allocations
            </h1>

            <p className="mt-2 font-medium text-slate-900">
              Track and manage resources assigned to reported civic issues.
            </p>
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setMessage("");
              setMessageType("");
            }}
            className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            {showForm ? "Cancel" : "+ Create Allocation"}
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-lg border p-4 font-semibold ${
              messageType === "success"
                ? "border-green-300 bg-green-50 text-green-900"
                : "border-red-300 bg-red-50 text-red-900"
            }`}
          >
            {message}
          </div>
        )}

        {showForm && (
          <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Create New Allocation
            </h2>

            <p className="mt-1 font-medium text-slate-900">
              Assign an available resource to a civic issue.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-950">
                  Select Issue
                </label>

                <select
                  value={issueId}
                  onChange={(event) => setIssueId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-400 bg-white px-4 py-3 font-medium text-slate-950"
                >
                  <option value="">Choose an issue</option>

                  {issues.map((issue) => (
                    <option
                      key={issue.issue_id}
                      value={issue.issue_id}
                    >
                      ISS-{String(issue.issue_id).padStart(3, "0")} —{" "}
                      {issue.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-950">
                  Select Resource
                </label>

                <select
                  value={resourceId}
                  onChange={(event) =>
                    setResourceId(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-slate-400 bg-white px-4 py-3 font-medium text-slate-950"
                >
                  <option value="">Choose a resource</option>

                  {resources.map((resource) => (
                    <option
                      key={resource.resource_id}
                      value={resource.resource_id}
                    >
                      {resource.resource_name} — Available:{" "}
                      {resource.available_quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-950">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  required
                  placeholder="Enter quantity"
                  className="w-full rounded-lg border border-slate-400 bg-white px-4 py-3 font-medium text-slate-950"
                />

                {selectedResource && (
                  <p className="mt-2 text-sm font-semibold text-blue-800">
                    Available quantity:{" "}
                    {selectedResource.available_quantity}
                  </p>
                )}
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Allocation"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Total Allocations
            </p>

            <h2 className="mt-3 text-3xl font-bold text-blue-700">
              {allocations.length}
            </h2>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Total Resource Units Allocated
            </p>

            <h2 className="mt-3 text-3xl font-bold text-orange-700">
              {totalQuantity}
            </h2>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Allocation Records
          </h2>

          <p className="mt-2 font-medium text-slate-900">
            Resources currently assigned to civic complaints.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead>
                <tr className="border-b border-slate-300 text-xs font-bold text-slate-900">
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
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center font-medium text-slate-950"
                    >
                      Loading allocations...
                    </td>
                  </tr>
                ) : allocations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center font-medium text-slate-950"
                    >
                      No allocations found yet.
                    </td>
                  </tr>
                ) : (
                  allocations.map((item) => (
                    <tr
                      key={item.allocation_id}
                      className="border-b border-slate-200"
                    >
                      <td className="px-4 py-5 font-semibold text-slate-950">
                        {item.issue_title}
                      </td>

                      <td className="px-4 py-5 font-medium text-slate-950">
                        {item.location}
                      </td>

                      <td className="px-4 py-5 font-medium text-slate-950">
                        {item.resource_name}
                      </td>

                      <td className="px-4 py-5 font-medium text-slate-950">
                        {item.department_name}
                      </td>

                      <td className="px-4 py-5 font-bold text-slate-950">
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