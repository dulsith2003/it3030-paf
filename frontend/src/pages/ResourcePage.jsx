import { useEffect, useState } from "react";
import {
  createResource,
  deleteResource,
  getAllResources,
  searchResources
} from "../services/resourceService";

const typeOptions = ["LAB", "LECTURE_HALL", "MEETING_ROOM", "EQUIPMENT"];
const statusOptions = ["ACTIVE", "OUT_OF_SERVICE"];

const initialForm = {
  name: "",
  type: "LAB",
  capacity: "",
  location: "",
  status: "ACTIVE",
  availableFrom: "",
  availableTo: "",
  description: ""
};

function ResourcePage() {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [searchType, setSearchType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await getAllResources();
      setResources(data);
    } catch (error) {
      console.log(error);
      alert("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity)
      };

      await createResource(payload);
      setFormData(initialForm);
      await loadResources();
      alert("Resource created successfully.");
    } catch (error) {
      console.log(error);
      alert("Failed to create resource.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this resource?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteResource(id);
      await loadResources();
      alert("Resource deleted.");
    } catch (error) {
      console.log(error);
      alert("Failed to delete resource.");
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchResources({ type: searchType });
      setResources(data);
    } catch (error) {
      console.log(error);
      alert("Failed to search resources.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setSearchType("");
    await loadResources();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
        <header className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold">Module A - Facilities & Assets Catalogue</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create, view, search, and delete campus resources.
          </p>
        </header>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold">Add Resource</h2>
          <form
            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
            onSubmit={handleCreate}
          >
            <input
              className="rounded-lg border border-slate-300 p-2"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <select
              className="rounded-lg border border-slate-300 p-2"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              className="rounded-lg border border-slate-300 p-2"
              name="capacity"
              type="number"
              min="1"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              required
            />

            <input
              className="rounded-lg border border-slate-300 p-2"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />

            <select
              className="rounded-lg border border-slate-300 p-2"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <input
              className="rounded-lg border border-slate-300 p-2"
              name="availableFrom"
              type="time"
              value={formData.availableFrom}
              onChange={handleInputChange}
              required
            />

            <input
              className="rounded-lg border border-slate-300 p-2"
              name="availableTo"
              type="time"
              value={formData.availableTo}
              onChange={handleInputChange}
              required
            />

            <input
              className="rounded-lg border border-slate-300 p-2 md:col-span-2"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />

            <button
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              type="submit"
            >
              Add Resource
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold">Search by Type</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              className="w-full rounded-lg border border-slate-300 p-2 sm:w-64"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="">Select type</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <button
              className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
              type="button"
              onClick={handleSearch}
            >
              Search
            </button>

            <button
              className="rounded-lg bg-slate-500 px-4 py-2 font-medium text-white hover:bg-slate-600"
              type="button"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Resources</h2>
            {loading && <span className="text-sm text-slate-500">Loading...</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left text-sm">
                  <th className="p-3">Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => (
                  <tr key={resource.id} className="border-b border-slate-200 text-sm">
                    <td className="p-3">{resource.name}</td>
                    <td className="p-3">{resource.type}</td>
                    <td className="p-3">{resource.capacity}</td>
                    <td className="p-3">{resource.location}</td>
                    <td className="p-3">{resource.status}</td>
                    <td className="p-3">
                      {resource.availableFrom} - {resource.availableTo}
                    </td>
                    <td className="p-3">{resource.description}</td>
                    <td className="p-3">
                      <button
                        className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        type="button"
                        onClick={() => handleDelete(resource.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {resources.length === 0 && !loading && (
                  <tr>
                    <td className="p-4 text-center text-slate-500" colSpan={8}>
                      No resources found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResourcePage;
