import React, { useState, useContext } from "react";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";

export default function Login({ onSwitch }) {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await API.post("/api/auth/login", form);
      login(res.data.token);
    } catch (error) {
      setErr(error?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-96 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">Sign in</h2>
        {err && <div className="text-red-600 mb-3">{err}</div>}
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            placeholder="Email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
        </form>
        <div className="text-sm text-center mt-4">
          Don't have an account?{" "}
          <button className="text-blue-600 underline" onClick={onSwitch}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
