import { useEffect, useMemo, useState } from "react";
import {
  createResource,
  deleteResource,
  getAllResources,
  searchResources,
} from "../services/resourceService";

const RESOURCE_TYPES = ["LAB", "LECTURE_HALL", "MEETING_ROOM", "EQUIPMENT"];
const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

const INITIAL_FORM = {
  name: "",
  type: "LAB",
  capacity: "",
  location: "",
  status: "ACTIVE",
  availableFrom: "",
  availableTo: "",
  description: "",
};

const INITIAL_FILTERS = {
  type: "",
  location: "",
  capacity: "",
};

export default function ResourcePage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const filteredResources = useMemo(() => resources, [resources]);

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    setLoading(true);
    setError("");

    try {
      const data = await getAllResources();
      setResources(data);
    } catch (err) {
      setError(readError(err, "Failed to load resources."));
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        availableFrom: form.availableFrom || null,
        availableTo: form.availableTo || null,
      };

      await createResource(payload);
      setForm(INITIAL_FORM);
      await loadResources();
    } catch (err) {
      setError(readError(err, "Failed to create resource."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this resource?")) {
      return;
    }

    setError("");

    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((resource) => resource.id !== id));
    } catch (err) {
      setError(readError(err, "Failed to delete resource."));
    }
  }

  async function handleSearch() {
    setLoading(true);
    setError("");

    try {
      const data = await searchResources(filters);
      setResources(data);
    } catch (err) {
      setError(readError(err, "Failed to search resources."));
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFilters(INITIAL_FILTERS);
    loadResources();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Module A
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Facilities &amp; Assets Catalogue
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-300">
            Track labs, lecture halls, meeting rooms, and shared equipment with real-time
            availability and status.
          </p>
        </header>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/30">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-white">Create a Resource</h2>
            <p className="text-sm text-slate-400">Add a new facility or asset to the catalogue.</p>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <div>
              <label className="text-sm text-slate-300">Name</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Main Lab A"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Type</label>
              <select
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                name="type"
                value={form.type}
                onChange={handleFormChange}
              >
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {labelize(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">Capacity</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                type="number"
                min="1"
                name="capacity"
                value={form.capacity}
                onChange={handleFormChange}
                placeholder="40"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Location</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                name="location"
                value={form.location}
                onChange={handleFormChange}
                placeholder="Engineering Block - 2nd Floor"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Status</label>
              <select
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                name="status"
                value={form.status}
                onChange={handleFormChange}
              >
                {RESOURCE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {labelize(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-300">Available From</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  type="time"
                  name="availableFrom"
                  value={form.availableFrom}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Available To</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  type="time"
                  name="availableTo"
                  value={form.availableTo}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">Description</label>
              <textarea
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows="3"
                placeholder="Projector with seating for 40 students"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-cyan-400 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Adding..." : "Add Resource"}
              </button>
            </div>
          </form>
        </section>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/30">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-white">Search &amp; Filter</h2>
            <p className="text-sm text-slate-400">Filter by type, location, or capacity.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm text-slate-300">Type</label>
              <select
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {labelize(type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300">Location</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Engineering Block"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Capacity</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                type="number"
                min="1"
                name="capacity"
                value={filters.capacity}
                onChange={handleFilterChange}
                placeholder="40"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleSearch}
                className="w-full rounded-xl border border-cyan-400 bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/30">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-white">Resource Catalogue</h2>
            <p className="text-sm text-slate-400">Manage the facilities list.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-6 text-sm text-slate-300">
              Loading resources...
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-6 text-sm text-slate-300">
              No resources found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Capacity</th>
                    <th className="py-3 pr-4">Location</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Available Time</th>
                    <th className="py-3 pr-4">Description</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-slate-950/50">
                      <td className="py-3 pr-4 font-medium text-white">
                        {resource.name || "-"}
                      </td>
                      <td className="py-3 pr-4">{labelize(resource.type)}</td>
                      <td className="py-3 pr-4">{resource.capacity ?? "-"}</td>
                      <td className="py-3 pr-4">{resource.location || "-"}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            resource.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {labelize(resource.status)}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {formatTimeRange(resource.availableFrom, resource.availableTo)}
                      </td>
                      <td className="py-3 pr-4 text-slate-300">
                        {resource.description || "-"}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(resource.id)}
                            className="rounded-lg border border-rose-500/60 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function labelize(value) {
  return String(value ?? "-")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTimeRange(start, end) {
  if (!start && !end) {
    return "-";
  }

  const from = start || "-";
  const to = end || "-";
  return `${from} - ${to}`;
}

function readError(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}