import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed");
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-md place-items-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-black uppercase text-teal-700">Welcome back</p>
          <h1 className="text-3xl font-black">Login</h1>
        </div>
        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        </label>
        <button type="submit" className="btn-primary w-full">Login</button>
        <p className="text-center text-sm text-slate-500">
          New here? <Link to="/register" className="font-bold text-teal-700">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
