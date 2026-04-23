import React, { useEffect, useMemo, useState } from "react";
import {
	createResource,
	deleteResource,
	getAllResources,
	searchResources,
	updateResource,
} from "../services/resourceService";
import {
	Boxes,
	CheckCircle2,
	AlertCircle,
	Microscope,
	Filter,
	Building2,
	Trash2,
	Edit,
	Check,
	XCircle,
	RefreshCw,
	Save
} from "lucide-react";

const emptyForm = {
	name: "",
	type: "",
	capacity: "",
	location: "",
	status: "ACTIVE",
	availableFrom: "",
	availableTo: "",
	description: "",
};

const emptyFilters = {
	type: "",
	location: "",
	capacity: "",
};

export default function ResourcePage() {
	const [resources, setResources] = useState([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [filters, setFilters] = useState(emptyFilters);
	const [form, setForm] = useState(emptyForm);
	const [formErrors, setFormErrors] = useState({});

	const [isEditing, setIsEditing] = useState(false);
	const [editId, setEditId] = useState(null);

	// Stats Calculation for Dashboard Cards
	const stats = useMemo(() => {
		const total = resources.length;
		const active = resources.filter((item) => item.status === "ACTIVE").length;
		const outOfService = resources.filter((item) => item.status === "OUT_OF_SERVICE").length;
		const labsRooms = resources.filter((item) =>
			["LAB", "LABORATORY", "ROOM", "CLASSROOM", "LECTURE_HALL"].includes(
				String(item.type || "").toUpperCase()
			)
		).length;
		return { total, active, outOfService, labsRooms };
	}, [resources]);

	async function loadResources() {
		try {
			setLoading(true);
			setError("");
			const data = await getAllResources();
			setResources(data);
		} catch (err) {
			setError("Failed to synchronize with campus database.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadResources();
	}, []);

	const handleFilterChange = (e) => setFilters(p => ({ ...p, [e.target.name]: e.target.value }));
	
	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setForm(p => ({ ...p, [name]: value }));
		// Clear specific field error when user starts typing
		if (formErrors[name]) {
			setFormErrors(p => ({ ...p, [name]: undefined }));
		}
	};

	const handleSearch = async (e) => {
		e.preventDefault();
		setLoading(true);
		clearStatus();
		try {
			const data = await searchResources({
				...filters,
				capacity: filters.capacity ? Number(filters.capacity) : undefined
			});
			setResources(data);
		} catch (err) {
			setError("Search failed due to a network disruption.");
		} finally {
			setLoading(false);
		}
	};

	const handleReset = async () => {
		setFilters(emptyFilters);
		clearStatus();
		await loadResources();
	};

	const validateForm = () => {
		const errors = {};
		if (!form.name || form.name.trim() === "") errors.name = "Name is required.";
		if (!form.type) errors.type = "Category is required.";
		if (!form.capacity || Number(form.capacity) <= 0) errors.capacity = "Capacity must be greater than 0.";
		if (!form.location || form.location.trim() === "") errors.location = "Location is required.";
		if (!form.status) errors.status = "Status is required.";
		
		if (!form.availableFrom) {
			errors.availableFrom = "Start time is required.";
		}
		if (!form.availableTo) {
			errors.availableTo = "End time is required.";
		}
		
		if (form.availableFrom && form.availableTo && form.availableFrom >= form.availableTo) {
			errors.availableTo = "End time must be after start time.";
		}

		if (!form.description || form.description.trim().length < 5) {
			errors.description = "Description must be at least 5 characters.";
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setSubmitting(true);
		clearStatus();
		try {
			const payload = { ...form, capacity: Number(form.capacity) || 0 };
			if (isEditing) {
				await updateResource(editId, payload);
				setSuccess("Resource profile updated successfully.");
				cancelEdit();
			} else {
				await createResource(payload);
				setSuccess("New resource registered to the campus catalogue.");
				setForm(emptyForm);
				setFormErrors({});
			}
			await loadResources();
			setTimeout(() => setSuccess(""), 5000);
		} catch (err) {
			setError("Operation failed. Please verify resource details.");
		} finally {
			setSubmitting(false);
		}
	};

	const startEdit = (res) => {
		clearStatus();
		setFormErrors({});
		setIsEditing(true);
		setEditId(res.id);
		setForm({ ...res });
		window.scrollTo({ top: 300, behavior: 'smooth' });
	};

	const cancelEdit = () => {
		setIsEditing(false);
		setEditId(null);
		setForm(emptyForm);
		setFormErrors({});
		clearStatus();
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to decommission this resource?")) return;
		clearStatus();
		try {
			await deleteResource(id);
			setSuccess("Resource successfully removed from catalogue.");
			await loadResources();
			setTimeout(() => setSuccess(""), 5000);
		} catch (err) {
			setError("Unable to process deletion at this time.");
		}
	};

	const clearStatus = () => {
		setError("");
		setSuccess("");
	};

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 space-y-8 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen font-sans">
			
			{/* 1. Header Section */}
			<header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
						<div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
							<Building2 size={24} />
						</div>
						Facilities & Assets Catalogue
					</h1>
					<p className="text-base text-slate-500 font-medium max-w-2xl">
						Manage lecture halls, laboratories, meeting rooms, and campus equipment from a centralized terminal.
					</p>
				</div>
				<div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
					<span className="relative flex h-2.5 w-2.5">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
						<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
					</span>
					System Active
				</div>
			</header>

			{/* 2. Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<SummaryCard title="Total Resources" value={stats.total} icon={<Boxes className="w-6 h-6" />} color="indigo" />
				<SummaryCard title="Active Status" value={stats.active} icon={<CheckCircle2 className="w-6 h-6" />} color="emerald" />
				<StatSummaryCard title="Maintenance / Out" value={stats.outOfService} icon={<AlertCircle className="w-6 h-6" />} color="rose" />
				<StatSummaryCard title="Learning Spaces" value={stats.labsRooms} icon={<Microscope className="w-6 h-6" />} color="amber" />
			</div>

			{/* 3. Search / Filter Card */}
			<section className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200 overflow-hidden relative transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50">
				<div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
				<div className="p-8">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2 bg-indigo-50/80 rounded-xl text-indigo-600 border border-indigo-100">
							<Filter size={20} />
						</div>
						<h2 className="text-xl font-bold text-slate-800">Advanced Search Filters</h2>
					</div>
					<form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-6 items-end">
						<InputGroup label="Resource Type">
							<select name="type" value={filters.type} onChange={handleFilterChange} className="form-input-custom appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394A3B8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7rem_auto] bg-[right_1rem_center] bg-no-repeat">
								<option value="">All Categories</option>
								<option value="LAB">Science / Tech Lab</option>
								<option value="LECTURE_HALL">Lecture Hall</option>
								<option value="MEETING_ROOM">Meeting Room</option>
								<option value="EQUIPMENT">Technical Equipment</option>
							</select>
						</InputGroup>
						<InputGroup label="Location">
							<input name="location" value={filters.location} onChange={handleFilterChange} placeholder="e.g. Block C" className="form-input-custom" />
						</InputGroup>
						<InputGroup label="Min Capacity">
							<input type="number" name="capacity" value={filters.capacity} onChange={handleFilterChange} placeholder="Min seats" className="form-input-custom" min="0" />
						</InputGroup>
						<div className="xl:col-span-2 flex gap-3">
							<button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all active:scale-95">
								<Filter size={18} /> Apply Filters
							</button>
							<button type="button" onClick={handleReset} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all active:scale-95">
								<RefreshCw size={18} /> Reset
							</button>
						</div>
					</form>
				</div>
			</section>

			{/* Feedback Alerts */}
			<div className="space-y-4">
				{success && (
					<div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-300">
						<div className="bg-emerald-100 text-emerald-600 p-2 rounded-full"><Check size={20} className="stroke-[3]" /></div>
						<p className="text-emerald-800 font-bold text-sm">{success}</p>
					</div>
				)}
				{error && (
					<div className="flex items-center gap-4 bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-sm animate-in shake duration-500">
						<div className="bg-rose-100 text-rose-600 p-2 rounded-full"><AlertCircle size={20} className="stroke-[3]" /></div>
						<p className="text-rose-800 font-bold text-sm">{error}</p>
					</div>
				)}
			</div>

			{/* 4. Form Section (Add / Edit) */}
			<section className={`bg-white rounded-2xl shadow-xl transition-all duration-500 overflow-hidden ${isEditing ? 'border-2 border-indigo-400 ring-4 ring-indigo-50 shadow-indigo-200/50' : 'border border-slate-200 shadow-slate-200/40'}`}>
				<div className={`px-8 py-6 border-b transition-colors ${isEditing ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className={`p-2.5 rounded-xl text-white shadow-md ${isEditing ? 'bg-indigo-500 shadow-indigo-200' : 'bg-slate-800 shadow-slate-300'}`}>
								{isEditing ? <Edit size={22} /> : <Save size={22} />}
							</div>
							<div>
								<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
									{isEditing ? "Update Resource Profile" : "Register New Facility"}
								</h2>
								<p className="text-slate-500 font-medium text-xs mt-0.5 uppercase tracking-wide">
									{isEditing ? "Modify technical specifications." : "Input facility specifications below."}
								</p>
							</div>
						</div>
						{isEditing && (
							<button onClick={cancelEdit} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm active:scale-95 text-sm">
								<XCircle size={18} /> Cancel Update
							</button>
						)}
					</div>
				</div>

				<div className="p-8">
					<form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
						<InputGroup label="Official Name" required error={formErrors.name}>
							<input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Einstein Laboratory v2" className={`form-input-custom ${formErrors.name ? 'form-input-error' : ''}`} />
						</InputGroup>
						<InputGroup label="Facility Category" required error={formErrors.type}>
							<select name="type" value={form.type} onChange={handleFormChange} className={`form-input-custom appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394A3B8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7rem_auto] bg-[right_1rem_center] bg-no-repeat ${formErrors.type ? 'form-input-error' : ''}`}>
								<option value="">Select Category</option>
								<option value="LAB">Technical Lab</option>
								<option value="LECTURE_HALL">Lecture Theater</option>
								<option value="MEETING_ROOM">Discussion Room</option>
								<option value="EQUIPMENT">Mobile Equipment</option>
							</select>
						</InputGroup>
						<InputGroup label="Seating / Usage Capacity" required error={formErrors.capacity}>
							<input type="number" name="capacity" value={form.capacity} onChange={handleFormChange} placeholder="e.g. 60" min="0" className={`form-input-custom ${formErrors.capacity ? 'form-input-error' : ''}`} />
						</InputGroup>
						<InputGroup label="Physical Location" required error={formErrors.location}>
							<input name="location" value={form.location} onChange={handleFormChange} placeholder="Block/Floor/Room Number" className={`form-input-custom ${formErrors.location ? 'form-input-error' : ''}`} />
						</InputGroup>
						<InputGroup label="Operational Status" required error={formErrors.status}>
							<select name="status" value={form.status} onChange={handleFormChange} className={`form-input-custom appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394A3B8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7rem_auto] bg-[right_1rem_center] bg-no-repeat ${formErrors.status ? 'form-input-error' : ''}`}>
								<option value="ACTIVE">ACTIVE - Available for Use</option>
								<option value="OUT_OF_SERVICE">OUT OF SERVICE - Maintenance</option>
							</select>
						</InputGroup>
						<div className="grid grid-cols-2 gap-4">
							<InputGroup label="Available From" required error={formErrors.availableFrom}>
								<input type="time" name="availableFrom" value={form.availableFrom} onChange={handleFormChange} className={`form-input-custom ${formErrors.availableFrom ? 'form-input-error' : ''}`} />
							</InputGroup>
							<InputGroup label="Available To" required error={formErrors.availableTo}>
								<input type="time" name="availableTo" value={form.availableTo} onChange={handleFormChange} className={`form-input-custom ${formErrors.availableTo ? 'form-input-error' : ''}`} />
							</InputGroup>
						</div>
						<div className="md:col-span-2">
							<InputGroup label="Technical Description & Access Rules" required error={formErrors.description}>
								<textarea name="description" value={form.description} onChange={handleFormChange} rows="3" placeholder="Enter equipment details, booking policies, or safety warnings..." className={`form-input-custom resize-y ${formErrors.description ? 'form-input-error' : ''}`} />
							</InputGroup>
						</div>
						<div className="md:col-span-2 pt-2 border-t border-slate-100 flex justify-end">
							<button type="submit" disabled={submitting} className={`w-full md:w-auto px-10 py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 ${isEditing ? 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300' : 'bg-slate-900 shadow-slate-300 hover:bg-slate-800 hover:shadow-slate-400'}`}>
								{submitting ? (
									<> <RefreshCw size={20} className="animate-spin" /> Processing... </>
								) : isEditing ? (
									<> <Save size={20} /> Update Resource Profile </>
								) : (
									<> <Boxes size={20} /> Register to Catalogue </>
								)}
							</button>
						</div>
					</form>
				</div>
			</section>

			{/* 5. Resource Table Section */}
			<section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
				<div className="px-8 py-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
					<div className="flex items-center gap-3">
						<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Catalogue</h2>
					</div>
					<div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">
						<Boxes size={14} className="text-slate-500" />
						{resources.length} {resources.length === 1 ? 'Resource' : 'Resources'}
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 border-b border-slate-200">
							<tr>
								<th className="px-8 py-4">Resource Identifier</th>
								<th className="px-8 py-4">Metrics</th>
								<th className="px-8 py-4">Location</th>
								<th className="px-8 py-4">Status</th>
								<th className="px-8 py-4">Availability</th>
								<th className="px-8 py-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 bg-white">
							{loading ? (
								<tr>
									<td colSpan="6" className="px-8 py-24 text-center">
										<div className="flex flex-col items-center justify-center gap-3 text-slate-500">
											<RefreshCw size={32} className="animate-spin text-indigo-500" />
											<p className="font-bold text-sm uppercase tracking-widest mt-2">Synchronizing catalogue...</p>
										</div>
									</td>
								</tr>
							) : resources.length === 0 ? (
								<tr>
									<td colSpan="6" className="px-8 py-24 text-center bg-slate-50/50">
										<div className="flex flex-col items-center justify-center max-w-sm mx-auto">
											<div className="bg-slate-100 p-4 rounded-full text-slate-400 mb-4 border border-slate-200">
												<AlertCircle size={48} strokeWidth={1.5} />
											</div>
											<p className="text-slate-800 font-extrabold text-xl tracking-tight">No Resources Found</p>
											<p className="text-slate-500 text-sm mt-2 font-medium leading-relaxed">
												There are currently no resources matching your criteria. Reset your filters or register a new facility above.
											</p>
										</div>
									</td>
								</tr>
							) : (
								resources.map(res => (
									<tr key={res.id} className="group hover:bg-indigo-50/30 transition-colors duration-200">
										<td className="px-8 py-5">
											<div className="flex flex-col">
												<span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{res.name}</span>
												<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md self-start mt-1.5 uppercase tracking-wider border border-slate-200">{res.type}</span>
												{res.description && (
													<p className="text-[11px] text-slate-500 mt-2 line-clamp-1 max-w-xs">{res.description}</p>
												)}
											</div>
										</td>
										<td className="px-8 py-5">
											<div className="flex items-baseline gap-1">
												<span className="text-sm font-black text-slate-800">{res.capacity}</span>
												<span className="text-[10px] font-bold text-slate-400 tracking-wider">SEATS</span>
											</div>
										</td>
										<td className="px-8 py-5">
											<div className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 w-fit">
												<Building2 size={14} className="text-slate-400" />
												{res.location}
											</div>
										</td>
										<td className="px-8 py-5">
											{res.status === 'ACTIVE' ? (
												<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
													<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ACTIVE
												</span>
											) : (
												<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-200">
													<span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> OUT OF SERVICE
												</span>
											)}
										</td>
										<td className="px-8 py-5">
											<div className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md inline-block border border-slate-200 whitespace-nowrap">
												{res.availableFrom || '00:00'} — {res.availableTo || '23:59'}
											</div>
										</td>
										<td className="px-8 py-5">
											<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
												<button onClick={() => startEdit(res)} className="flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100" title="Edit Profile">
													<Edit size={16} />
												</button>
												<button onClick={() => handleDelete(res.id)} className="flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-100" title="Decommission Resource">
													<Trash2 size={16} />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</section>

			{/* Inline CSS for form inputs to keep JSX clean */}
			<style dangerouslySetInnerHTML={{ __html: `
				.form-input-custom {
					@apply mt-1.5 block w-full rounded-xl bg-slate-50 text-slate-800 text-sm font-semibold transition-all duration-200;
					border: 1px solid #e2e8f0;
					padding: 0.875rem 1rem;
				}
				.form-input-custom:hover:not(.form-input-error) {
					border-color: #cbd5e1;
					background-color: #ffffff;
				}
				.form-input-custom:focus:not(.form-input-error) {
					background-color: #ffffff;
					border-color: #6366f1;
					outline: none;
					box-shadow: 0 0 0 4px #e0e7ff;
				}
				.form-input-custom::placeholder {
					color: #94a3b8;
					font-weight: 500;
				}
				.form-input-error {
					border-color: #f43f5e !important;
					background-color: #fff1f2 !important;
					color: #9f1239 !important;
				}
				.form-input-error:focus {
					box-shadow: 0 0 0 4px #ffe4e6 !important;
					border-color: #e11d48 !important;
					outline: none;
				}
			`}} />
		</div>
	);
}

// Internal Styled Components
function SummaryCard({ title, value, icon, color }) {
	const colorThemes = {
		indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 group-hover:border-indigo-300",
		emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 group-hover:border-emerald-300",
		rose: "text-rose-600 bg-rose-50 border-rose-100 group-hover:border-rose-300",
		amber: "text-amber-600 bg-amber-50 border-amber-100 group-hover:border-amber-300"
	};
	
	const bgThemes = {
		indigo: "bg-gradient-to-br from-indigo-500 to-blue-600",
		emerald: "bg-gradient-to-br from-emerald-500 to-teal-600",
		rose: "bg-gradient-to-br from-rose-500 to-pink-600",
		amber: "bg-gradient-to-br from-amber-400 to-orange-500"
	};

	return (
		<div className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-lg shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
			<div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${bgThemes[color]}`}></div>
			<div className="relative z-10 flex flex-col h-full justify-between">
				<div className="flex items-center justify-between mb-4">
					<div className={`p-2.5 rounded-xl border transition-colors ${colorThemes[color]}`}>
						{icon}
					</div>
				</div>
				<div className="space-y-1">
					<p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
					<p className="text-4xl font-black text-slate-900 tracking-tight">{value}</p>
				</div>
			</div>
		</div>
	);
}

// Reusing SummaryCard for consistency
function StatSummaryCard(props) { return <SummaryCard {...props} />; }

function InputGroup({ label, children, required, error }) {
	return (
		<div className="flex flex-col">
			<label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1 flex items-center">
				{label} {required && <span className="text-rose-500 text-sm ml-1 leading-none">*</span>}
			</label>
			{children}
			{error && (
				<span className="text-[11px] font-bold text-rose-500 mt-1.5 ml-1 animate-in fade-in flex items-center gap-1">
					<AlertCircle size={12} /> {error}
				</span>
			)}
		</div>
	);
}
