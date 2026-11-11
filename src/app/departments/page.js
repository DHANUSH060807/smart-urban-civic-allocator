
const departments = [
  {
    id: 1,
    name: "Road Maintenance",
    description: "Handles potholes, damaged roads and road repairs.",
    officer: "Road Officer",
    issues: 2,
    status: "Active",
  },
  {
    id: 2,
    name: "Sanitation",
    description: "Manages garbage collection and public cleanliness.",
    officer: "Sanitation Officer",
    issues: 1,
    status: "Active",
  },
  {
    id: 3,
    name: "Water Supply",
    description: "Handles pipeline leakage and water supply problems.",
    officer: "Water Officer",
    issues: 1,
    status: "Active",
  },
  {
    id: 4,
    name: "Electrical",
    description: "Maintains streetlights and electrical infrastructure.",
    officer: "Electrical Officer",
    issues: 1,
    status: "Active",
  },
];

export default function DepartmentsPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm text-slate-500">
            Dashboard / Departments
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Department Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage city departments and monitor their responsibilities.
          </p>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total Departments", "4", "text-blue-600"],
            ["Active Departments", "4", "text-emerald-600"],
            ["Assigned Issues", "5", "text-orange-600"],
            ["Officers", "3", "text-purple-600"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <h2 className={`mt-3 text-3xl font-bold ${color}`}>
                {value}
              </h2>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {departments.map((department) => (
            <div
              key={department.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-600">
                    DEPARTMENT 0{department.id}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {department.name}
                  </h2>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {department.status}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {department.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                <div>
                  <p className="text-xs text-slate-400">Assigned Officer</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {department.officer}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Assigned Issues</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {department.issues}
                  </p>
                </div>
              </div>

              <button className="mt-6 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                View Department Details →
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
