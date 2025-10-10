import React, { useState } from "react";
import API from "../utils/api";

export default function Register({ onSwitch }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    try {
      await API.post("/api/auth/register", form);
      setDone(true);
      setTimeout(() => onSwitch(), 1200);
    } catch (error) {
      setErr(error?.response?.data?.message || "Registration failed");
    }
  }

  if (done) return <div className="h-screen flex items-center justify-center">Registered! Redirecting to login...</div>;

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-96 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">Register</h2>
        {err && <div className="text-red-600 mb-3">{err}</div>}
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input placeholder="Username" className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Password" type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="w-full bg-green-600 text-white py-2 rounded">Register</button>
        </form>
        <div className="text-sm text-center mt-4">
          Already have an account?{" "}
          <button className="text-blue-600 underline" onClick={onSwitch}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
