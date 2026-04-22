import React, { useEffect, useState } from "react";

import { getAllResources, searchResources } from "../services/resourceService";

export default function ResourcePage() {
	const [resources, setResources] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filters, setFilters] = useState({
		type: "",
		location: "",
		capacity: "",
	});

	useEffect(() => {
		async function loadResources() {
			try {
				setLoading(true);
				const data = await getAllResources();
				setResources(data);
			} catch (err) {
				setError(err.message || "Failed to load resources");
			} finally {
				setLoading(false);
			}
		}

		loadResources();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	const handleSearch = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			setError("");
			const data = await searchResources({
				type: filters.type,
				location: filters.location,
				capacity: filters.capacity ? Number(filters.capacity) : undefined,
			});
			setResources(data);
		} catch (err) {
			setError(err.message || "Failed to search resources");
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="panel">
			<h2 className="mb-4 text-2xl font-semibold">Resources</h2>

			<form onSubmit={handleSearch} className="mb-4 grid gap-3 sm:grid-cols-4">
				<input
					type="text"
					name="type"
					placeholder="Type"
					value={filters.type}
					onChange={handleChange}
					className="rounded border px-3 py-2"
				/>
				<input
					type="text"
					name="location"
					placeholder="Location"
					value={filters.location}
					onChange={handleChange}
					className="rounded border px-3 py-2"
				/>
				<input
					type="number"
					name="capacity"
					placeholder="Minimum capacity"
					value={filters.capacity}
					onChange={handleChange}
					className="rounded border px-3 py-2"
				/>
				<button type="submit" className="rounded bg-blue-600 px-4 py-2 font-medium text-white">
					Search
				</button>
			</form>

			{error && <p className="mb-3 text-red-600">{error}</p>}

			{loading ? (
				<p>Loading resources...</p>
			) : resources.length === 0 ? (
				<p>No resources found.</p>
			) : (
				<ul className="space-y-3">
					{resources.map((resource) => (
						<li key={resource.id} className="rounded border p-3">
							<h3 className="font-semibold">{resource.name}</h3>
							<p>Type: {resource.type}</p>
							<p>Location: {resource.location}</p>
							<p>Capacity: {resource.capacity}</p>
							<p>Status: {resource.status}</p>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

