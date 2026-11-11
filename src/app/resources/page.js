"use client";

import { useEffect, useState } from "react";

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [resourceName, setResourceName] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");

  async function fetchData() {
    try {
      const [resourcesRes, departmentsRes] = await Promise.all([
        fetch("/api/resources"),
        fetch("/api/departments"),
      ]);

      const resourcesData = await resourcesRes.json();
      const departmentsData = await departmentsRes.json();

      if (resourcesData.success) {
        setResources(resourcesData.resources);
      }

      if (departmentsData.success) {
        setDepartments(departmentsData.departments);
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
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource_name: resourceName,
          resource_type: resourceType,
          department_id: departmentId,
          total_quantity: totalQuantity,
          available_quantity: availableQuantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Could not add resource");
        return;
      }

      alert("Resource added successfully!");

      setResourceName("");
      setResourceType("");
      setDepartmentId("");
      setTotalQuantity("");
      setAvailableQuantity("");

      setShowForm(false);
      setLoading(true);
      await fetchData();
    } catch (error) {
      console.error("Add resource error:", error);
      alert("Could not add resource");
    }
  }

  const total = resources.reduce(
    (sum, item) => sum + Number(item.total_quantity),
    0
  );

  const available = resources.reduce(
    (sum, item) => sum + Number(item.available_quantity),
    0
  );

  const allocated = total - available;

  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm text-slate-500">
              Dashboard / Resources
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Resource Management
            </h1>
            <p className="mt-2 text-slate-500">
              Monitor and manage resources available across city departments.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            {showForm ? "Cancel" : "+ Add Resource"}
          </button>
        </div>

        {/* Add Resource Form */}
        {showForm && (
          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Add New Resource
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a new resource to a city department.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Resource Name
                </label>
                <input
                  type="text"
                  value={resourceName}
                  onChange={(event) => setResourceName(event.target.value)}
                  required
                  placeholder="Enter resource name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Resource Type
                </label>
                <select
                  value={resourceType}
                  onChange={(event) => setResourceType(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400"
                >
                  <option value="">Select type</option>
                  <option value="Manpower">Manpower</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Department
                </label>
                <select
                  value={departmentId}
                  onChange={(event) => setDepartmentId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400"
                >
                  <option value="">Select department</option>
                  {departments.map((department) => (
                    <option
                      key={department.department_id}
                      value={department.department_id}
                    >
                      {department.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Total Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalQuantity}
                  onChange={(event) => setTotalQuantity(event.target.value)}
                  required
                  placeholder="Enter total quantity"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Available Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={availableQuantity}
                  onChange={(event) =>
                    setAvailableQuantity(event.target.value)
                  }
                  required
                  placeholder="Enter available quantity"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            ["Total Resources", total, "text-blue-600"],
            ["Available Units", available, "text-emerald-600"],
            ["Allocated Units", allocated, "text-orange-600"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <h2 className={`mt-3 text-3xl font-bold ${color}`}>
                {value}
              </h2>
            </div>
          ))}
        </section>

        {/* Resource Inventory */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Resource Inventory
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Current resource availability by department.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-400">
                  <th className="px-4 py-4">RESOURCE</th>
                  <th className="px-4 py-4">TYPE</th>
                  <th className="px-4 py-4">DEPARTMENT</th>
                  <th className="px-4 py-4">TOTAL</th>
                  <th className="px-4 py-4">AVAILABLE</th>
                  <th className="px-4 py-4">UTILIZATION</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Loading resources...
                    </td>
                  </tr>
                ) : resources.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No resources found.
                    </td>
                  </tr>
                ) : (
                  resources.map((item) => {
                    const percentage =
                      Number(item.total_quantity) > 0
                        ? Math.round(
                            ((Number(item.total_quantity) -
                              Number(item.available_quantity)) /
                              Number(item.total_quantity)) *
                              100
                          )
                        : 0;

                    return (
                      <tr
                        key={item.resource_id}
                        className="border-b border-slate-100"
                      >
                        <td className="px-4 py-5 font-semibold text-slate-800">
                          {item.resource_name}
                        </td>
                        <td className="px-4 py-5 text-slate-600">
                          {item.resource_type}
                        </td>
                        <td className="px-4 py-5 text-slate-600">
                          {item.department_name}
                        </td>
                        <td className="px-4 py-5 text-slate-700">
                          {item.total_quantity}
                        </td>
                        <td className="px-4 py-5 font-semibold text-emerald-600">
                          {item.available_quantity}
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-600">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}