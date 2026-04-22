import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";

export default function LoginPage() {
	const navigate = useNavigate();
	const { signin } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		try {
			await signin({ email, password });
			navigate("/resources");
		} catch (err) {
			setError(err.message || "Login failed");
		}
	};

	return (
		<div className="max-w-md mx-auto mt-12 p-6 border rounded">
			<h1 className="text-2xl mb-4">Login</h1>
			<form onSubmit={handleSubmit}>
				<label className="block mb-2">
					Email
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full p-2 border rounded mt-1"
					/>
				</label>

				<label className="block mb-2">
					Password
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="w-full p-2 border rounded mt-1"
					/>
				</label>

				{error && <p className="text-red-600 mb-2">{error}</p>}

				<button
					type="submit"
					className="bg-blue-600 text-white px-4 py-2 rounded"
				>
					Login
				</button>
			</form>

			<p className="mt-4">
				Don't have an account? <Link to="/signup" className="text-blue-600">Sign up</Link>
			</p>
		</div>
	);
}

