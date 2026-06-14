import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", rollNumber: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await register(form);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed");
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-md place-items-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-black uppercase text-teal-700">Join the campus market</p>
          <h1 className="text-3xl font-black">Create account</h1>
        </div>
        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        </label>
        <label>
          Roll Number
          <input value={form.rollNumber} onChange={(event) => setForm({ ...form, rollNumber: event.target.value })} />
        </label>
        <button type="submit" className="btn-primary w-full">Register</button>
        <p className="text-center text-sm text-slate-500">
          Already registered? <Link to="/login" className="font-bold text-teal-700">Login</Link>
        </p>
      </form>
    </main>
  );
}
