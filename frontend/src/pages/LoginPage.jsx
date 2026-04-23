import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function LoginPage() {
	const navigate = useNavigate();
	const { signin } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			await signin({ email, password });
			navigate("/resources");
		} catch (err) {
			setError(err.message || "Login failed. Please check your credentials.");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = () => {
		window.location.href = "http://localhost:8080/oauth2/authorization/google";
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#eaf0ff] to-[#f0ebff] flex items-center justify-center font-sans overflow-hidden p-4">
			
			{/* Wrapper to hold both card and decorative floating circles in relative space */}
			<div className="relative w-full max-w-[880px] mx-auto">
				
				{/* Decorative Floating Circles */}
				<div className="absolute -top-10 -left-6 sm:-top-8 sm:-left-16 w-16 h-16 sm:w-20 sm:h-20 bg-[#6d5dfc] rounded-full shadow-lg z-0 pointer-events-none"></div>
				<div className="absolute -bottom-10 -right-6 sm:-bottom-12 sm:-right-16 w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-0 pointer-events-none"></div>

				{/* Main Container Card */}
				<div className="relative z-10 flex flex-col md:flex-row bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full min-h-[520px] overflow-hidden">
				
				{/* Left Column (Form) */}
				<div className="w-full md:w-[55%] p-10 flex flex-col justify-center items-center bg-white rounded-l-3xl">
					<div className="w-full max-w-[300px]">
						
						{/* Header */}
						<div className="text-center mb-8">
							<h1 className="text-3xl font-[900] text-[#111827] uppercase tracking-[0.05em] mb-2">Login</h1>
							<p className="text-[#64748b] text-[13px] leading-snug">
								Sign in to continue to your Smart<br/>Campus workspace
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="relative">
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									placeholder="bookingadmin@gmail.com"
									className="w-full pl-5 pr-4 py-3 bg-[#f2f4fc] border border-transparent rounded-[0.6rem] text-[14px] font-[600] text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#6d5dfc] focus:bg-white transition-all"
								/>
							</div>

							<div className="relative">
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									placeholder="••••••••"
									className="w-full pl-5 pr-4 py-3 bg-[#f2f4fc] border border-transparent rounded-[0.6rem] text-[14px] font-[600] text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#6d5dfc] focus:bg-white transition-all tracking-widest"
								/>
							</div>

							{error && (
								<div className="text-rose-500 text-[12px] font-bold text-center">
									{error}
								</div>
							)}

							<div className="pt-2 flex justify-center">
								<button
									type="submit"
									disabled={loading}
									className="bg-[#6d5dfc] hover:bg-[#5b4df0] text-white px-10 py-2.5 rounded-full shadow-[0_8px_15px_rgba(109,93,252,0.3)] hover:shadow-[0_12px_20px_rgba(109,93,252,0.4)] hover:-translate-y-0.5 font-[600] text-[14px] transition-all disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
								>
									{loading ? "Signing in..." : "Login Now"}
								</button>
							</div>
						</form>

						{/* Divider */}
						<div className="flex items-center my-7">
							<div className="flex-1 border-t border-[#e2e8f0]"></div>
							<span className="px-3 text-[10px] font-bold text-[#cbd5e1] uppercase tracking-wider">
								Login with Others
							</span>
							<div className="flex-1 border-t border-[#e2e8f0]"></div>
						</div>

						{/* Google Login */}
						<button
							onClick={handleGoogleLogin}
							type="button"
							className="w-full flex items-center justify-center gap-3 bg-white border border-[#e2e8f0] rounded-[0.6rem] py-2.5 text-[13px] font-[700] text-[#475569] hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
						>
							<svg className="w-4 h-4" viewBox="0 0 24 24">
								<path fill="#EA4335" d="M12 4.8c2 0 3.7.7 5.1 2l3.8-3.9C18.6 1.1 15.6 0 12 0 7.4 0 3.4 2.6 1.5 6.6L6 10.1C7 7 9.3 4.8 12 4.8z" />
								<path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.2 2.8-2.6 3.7l4.1 3.2c2.4-2.2 3.5-5.6 3.5-9.2z" />
								<path fill="#FBBC05" d="M6 10.1l-4.5-3.5C.5 8.4 0 10.2 0 12s.5 3.6 1.5 5.4l4.5-3.5C5.1 12.8 5 12.4 5 12s.1-.8.2-1.1z" />
								<path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-4.1-3.2c-1.1.7-2.5 1.1-3.8 1.1-2.7 0-5-1.8-5.9-4.3L1.5 18C3.4 21.4 7.4 24 12 24z" />
							</svg>
							Login with Google
						</button>

						<p className="mt-6 text-center text-[12px] font-[500] text-[#64748b]">
							New here?{" "}
							<Link to="/signup" className="text-[#3b82f6] hover:text-[#2563eb] font-[700] underline decoration-1 underline-offset-2">
								Create an account
							</Link>
						</p>
					</div>
				</div>

				{/* Right Column (Visual) */}
				<div className="w-full md:w-[45%] bg-[#6d5dfc] rounded-r-3xl hidden md:flex items-center justify-center relative overflow-hidden shrink-0">
					
					{/* Abstract Diagonal Lines */}
					<div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
						<div className="absolute top-[30%] left-[-20%] w-[150%] h-[1px] bg-white/30 rotate-[-55deg] transform origin-top-left"></div>
						<div className="absolute top-[60%] left-[-20%] w-[150%] h-[1px] bg-white/30 rotate-[-55deg] transform origin-top-left"></div>
						<div className="absolute top-[90%] left-[-20%] w-[150%] h-[1px] bg-white/30 rotate-[-55deg] transform origin-top-left"></div>
					</div>

					{/* Frosted Glass Card Container */}
					<div className="relative z-10 w-[70%] max-w-[260px] aspect-[4/4.5] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] p-7 flex flex-col justify-end shadow-[0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden text-left">
						<h2 className="text-white text-[20px] font-bold mb-1 tracking-wide leading-tight">Smart Campus</h2>
						<p className="text-white/80 text-[12px] font-[400] leading-relaxed">
							Secure access for students, admins, and technicians.
						</p>
					</div>
				</div>
				
			</div>
		</div>
		</div>
	);
}
