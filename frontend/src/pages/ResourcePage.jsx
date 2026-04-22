import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const RESOURCE_TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];

const INITIAL_FORM = {
  name: "",
  type: "LECTURE_HALL",
  capacity: "",
  location: "",
  status: "ACTIVE",
  availableFrom: "",
  availableTo: "",
  description: "",
};

function ResourcePage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [query, setQuery] = useState("");

  const filteredResources = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return resources;
    }

    return resources.filter((resource) => {
      const values = [
        resource.name,
        resource.location,
        resource.type,
        resource.status,
        resource.description,
      ];

      return values.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalized)
      );
    });
  }, [query, resources]);

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get("/api/resources");
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(readError(err, "Failed to load resources."));
    } finally {
      setLoading(false);
    }
  }

  function onInputChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        availableFrom: form.availableFrom || null,
        availableTo: form.availableTo || null,
      };

      await axios.post("/api/resources", payload);
      setSuccess("Resource added successfully.");
      setForm(INITIAL_FORM);
      await loadResources();
    } catch (err) {
      setError(readError(err, "Failed to create resource."));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this resource?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await axios.delete(`/api/resources/${id}`);
      setSuccess("Resource deleted successfully.");
      setResources((prev) => prev.filter((resource) => resource.id !== id));
    } catch (err) {
      setError(readError(err, "Failed to delete resource."));
    }
  }

  return (
    <main className="resource-page">
      <section className="hero">
        <h1>Smart Campus Resources</h1>
        <p>Manage rooms, labs, and equipment availability from one place.</p>
      </section>

      <section className="card">
        <h2>Add Resource</h2>
        <form className="resource-form" onSubmit={onSubmit}>
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={onInputChange}
              placeholder="Main Lab A"
              required
            />
          </label>

          <label>
            Type
            <select name="type" value={form.type} onChange={onInputChange}>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {labelize(type)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Capacity
            <input
              type="number"
              min="1"
              name="capacity"
              value={form.capacity}
              onChange={onInputChange}
              placeholder="40"
              required
            />
          </label>

          <label>
            Location
            <input
              name="location"
              value={form.location}
              onChange={onInputChange}
              placeholder="Engineering Block - 2nd Floor"
              required
            />
          </label>

          <label>
            Status
            <select name="status" value={form.status} onChange={onInputChange}>
              {RESOURCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {labelize(status)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Available From
            <input
              type="time"
              name="availableFrom"
              value={form.availableFrom}
              onChange={onInputChange}
            />
          </label>

          <label>
            Available To
            <input
              type="time"
              name="availableTo"
              value={form.availableTo}
              onChange={onInputChange}
            />
          </label>

          <label className="full-width">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={onInputChange}
              rows="3"
              placeholder="Projector with seating for 40 students"
            />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add Resource"}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="resource-header">
          <h2>Resource List</h2>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, type, location"
          />
        </div>

        {error && <p className="alert error">{error}</p>}
        {success && <p className="alert success">{success}</p>}

        {loading ? (
          <p className="info">Loading resources...</p>
        ) : filteredResources.length === 0 ? (
          <p className="info">No resources found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource) => (
                  <tr key={resource.id}>
                    <td>{resource.name || "-"}</td>
                    <td>{labelize(resource.type)}</td>
                    <td>{resource.capacity ?? "-"}</td>
                    <td>{resource.location || "-"}</td>
                    <td>{labelize(resource.status)}</td>
                    <td>{formatTimeRange(resource.availableFrom, resource.availableTo)}</td>
                    <td>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => onDelete(resource.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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

export default ResourcePage;