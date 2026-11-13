"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function IssuesPage() {
  const router = useRouter();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category_id: "1",
    department_id: "1",
    priority: "3",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  function getAuthData() {
    const token = localStorage.getItem("civicflow_token");
    const storedUser = localStorage.getItem("civicflow_user");

    if (!token || !storedUser) {
      return null;
    }

    try {
      return {
        token,
        user: JSON.parse(storedUser),
      };
    } catch (error) {
      console.error("Could not read login information:", error);
      return null;
    }
  }

  function handleLogout() {
    localStorage.removeItem("civicflow_token");
    localStorage.removeItem("civicflow_user");
    router.push("/login");
  }

  useEffect(() => {
    const authData = getAuthData();

    if (!authData) {
      router.push("/login");
      return;
    }

    setUser(authData.user);

    async function fetchIssues() {
      try {
        const response = await fetch("/api/issues");

        if (!response.ok) {
          throw new Error("Failed to fetch issues");
        }

        const data = await response.json();
        setIssues(data.issues || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
  }, [router]);

  const getPriority = (priority) => {
    if (Number(priority) === 5) return "Critical";
    if (Number(priority) === 4) return "High";
    if (Number(priority) === 3) return "Medium";
    return "Low";
  };

  const getStatus = (status) =>
    status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  // Admin and Officer can update issue status
  const canUpdateStatus =
    user?.role === "ADMIN" || user?.role === "OFFICER";

  const activeIssues = issues.filter(
    (issue) => !["RESOLVED", "REJECTED"].includes(issue.status)
  ).length;

  const criticalIssues = issues.filter(
    (issue) => Number(issue.priority) === 5
  ).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMessage("");

    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit issue");
      }

      const refreshResponse = await fetch("/api/issues");
      const refreshedData = await refreshResponse.json();

      setIssues(refreshedData.issues || []);
      setFormMessage("Issue reported successfully!");

      setFormData({
        title: "",
        description: "",
        location: "",
        category_id: "1",
        department_id: "1",
        priority: "3",
      });

      setShowForm(false);
    } catch (err) {
      setFormMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!canUpdateStatus) {
      alert("You do not have permission to update issue status.");
      return;
    }

    try {
      const response = await fetch("/api/issues", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issue_id: selectedIssue.issue_id,
          status: selectedIssue.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setIssues(
        issues.map((issue) =>
          issue.issue_id === selectedIssue.issue_id
            ? { ...issue, status: selectedIssue.status }
            : issue
        )
      );

      alert("Issue status updated successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewDetails = (issue) => {
    setSelectedIssue({ ...issue });
  };

  const handleAllocateResources = () => {
    if (!selectedIssue) return;

    router.push(`/allocations?issueId=${selectedIssue.issue_id}`);
  };

  const closeDetails = () => {
    setSelectedIssue(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-5 text-slate-950 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              {user?.role === "CITIZEN"
                ? "Citizen Portal / Civic Issues"
                : "Dashboard / Civic Issues"}
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              {user?.role === "CITIZEN"
                ? "My Civic Issue Portal"
                : "Civic Issues"}
            </h1>

            <p className="mt-2 font-medium text-slate-900">
              {user?.role === "CITIZEN"
                ? "Report civic problems and track reported issues."
                : "Monitor, track and manage reported city complaints."}
            </p>

            {user && (
              <p className="mt-3 font-semibold text-slate-950">
                Logged in as: {user.full_name} ({user.role})
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              + Report New Issue
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Issue Details */}
        {selectedIssue && (
          <div className="mb-6 rounded-xl border border-slate-300 bg-white p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Issue Details
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  Complete information about the selected civic issue.
                </p>
              </div>

              <button
                onClick={closeDetails}
                className="text-xl font-bold text-slate-950 hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Issue ID
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  ISS-{String(selectedIssue.issue_id).padStart(3, "0")}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Status
                </p>

                {canUpdateStatus ? (
                  <select
                    value={selectedIssue.status}
                    onChange={(e) =>
                      setSelectedIssue({
                        ...selectedIssue,
                        status: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-400 bg-white p-2 font-medium text-slate-950"
                  >
                    <option value="REPORTED">Reported</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                ) : (
                  <p className="mt-1 font-semibold text-blue-700">
                    {getStatus(selectedIssue.status)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Title
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {selectedIssue.title}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Location
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {selectedIssue.location}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Category
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {selectedIssue.category_name}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Department
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {selectedIssue.department_name}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Priority
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {getPriority(selectedIssue.priority)}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Description
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {selectedIssue.description}
                </p>
              </div>
            </div>

            {/* Role-Based Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {canUpdateStatus && (
                <button
                  onClick={handleStatusUpdate}
                  className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Update Status
                </button>
              )}

              {user?.role === "ADMIN" && (
                <button
                  onClick={handleAllocateResources}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Allocate Resources
                </button>
              )}
            </div>

            {!canUpdateStatus && (
              <p className="mt-6 rounded-lg border border-blue-300 bg-blue-50 p-4 font-semibold text-blue-900">
                Citizens can view the current status of reported issues.
                Issue status updates are handled by authorized officers.
              </p>
            )}
          </div>
        )}

        {/* Report Issue Form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-slate-300 bg-white p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Report New Issue
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  Enter the details of the civic complaint.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="text-xl font-bold text-slate-950 hover:text-red-600"
              >
                ✕
              </button>
            </div>

            {formMessage && (
              <div
                className={`mb-4 rounded-lg p-3 text-sm font-semibold ${
                  formMessage.includes("successfully")
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {formMessage}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-950">
                  Issue Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter issue title"
                  className="w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-950"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-950">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: e.target.value,
                    })
                  }
                  placeholder="Enter location"
                  className="w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-950"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-950">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category_id: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-950"
                >
                  <option value="1">Pothole</option>
                  <option value="2">Garbage Accumulation</option>
                  <option value="3">Water Leakage</option>
                  <option value="4">Streetlight Failure</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-950">
                  Department
                </label>
                <select
                  value={formData.department_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      department_id: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-950"
                >
                  <option value="1">Road Maintenance</option>
                  <option value="2">Sanitation</option>
                  <option value="3">Water Supply</option>
                  <option value="4">Electrical</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-950">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-950"
                >
                  <option value="1">Low</option>
                  <option value="2">Low</option>
                  <option value="3">Medium</option>
                  <option value="4">High</option>
                  <option value="5">Critical</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-950">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the civic issue..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-400 bg-white p-3 text-slate-950"
                  required
                />
              </div>

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-400 px-5 py-3 text-sm font-semibold text-slate-950"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Issue"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">
              Total Issues
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {issues.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">
              Active Issues
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {activeIssues}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">
              Critical Priority
            </p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {criticalIssues}
            </p>
          </div>
        </div>

        {/* Issues Table */}
        <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950">
              All Reported Issues
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-900">
              Current civic complaints in the system.
            </p>
          </div>

          {loading && (
            <p className="py-8 text-center font-medium text-slate-950">
              Loading civic issues...
            </p>
          )}

          {error && (
            <p className="py-8 text-center font-semibold text-red-700">
              {error}
            </p>
          )}

          {!loading && !error && issues.length === 0 && (
            <p className="py-8 text-center font-medium text-slate-950">
              No civic issues found.
            </p>
          )}

          {!loading && !error && issues.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-300 text-xs font-bold text-slate-950">
                    <th className="px-3 py-4">ISSUE DETAILS</th>
                    <th className="px-3 py-4">LOCATION</th>
                    <th className="px-3 py-4">DEPARTMENT</th>
                    <th className="px-3 py-4">PRIORITY</th>
                    <th className="px-3 py-4">STATUS</th>
                    <th className="px-3 py-4">ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {issues.map((issue) => (
                    <tr
                      key={issue.issue_id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-3 py-5">
                        <p className="font-semibold text-slate-950">
                          {issue.title}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-700">
                          ISS-{String(issue.issue_id).padStart(3, "0")}
                        </p>
                      </td>

                      <td className="px-3 py-5 font-medium text-slate-950">
                        {issue.location}
                      </td>

                      <td className="px-3 py-5 font-medium text-slate-950">
                        {issue.department_name}
                      </td>

                      <td className="px-3 py-5">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-950">
                          {getPriority(issue.priority)}
                        </span>
                      </td>

                      <td className="px-3 py-5">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                          {getStatus(issue.status)}
                        </span>
                      </td>

                      <td className="px-3 py-5">
                        <button
                          onClick={() => handleViewDetails(issue)}
                          className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-950"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}