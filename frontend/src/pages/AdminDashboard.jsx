import { useEffect, useMemo, useState } from "react";
import api from "../api";

const tabs = ["Overview", "Users", "All Items"];
const roles = ["user", "manager", "admin"];

function StatusBadge({ status }) {
  const styles = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    sold: "bg-slate-100 text-slate-700 ring-slate-200"
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ring-1 ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  const statCards = useMemo(
    () => [
      ["Total Users", stats?.totalUsers ?? 0],
      ["Total Items", stats?.totalItems ?? 0],
      ["Active Items", stats?.activeItems ?? 0],
      ["Pending Items", stats?.pendingItems ?? 0]
    ],
    [stats]
  );

  async function loadDashboard() {
    const [statsResponse, usersResponse, itemsResponse] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users", { params: { limit: 50 } }),
      api.get("/admin/items")
    ]);

    setStats(statsResponse.data.stats);
    setUsers(usersResponse.data.users);
    setItems(itemsResponse.data.items);
  }

  useEffect(() => {
    loadDashboard().catch((error) => {
      setMessage(error.response?.data?.message || "Could not load admin dashboard");
    });
  }, []);

  async function updateRole(userId, role) {
    const { data } = await api.put(`/admin/users/${userId}/role`, { role });
    setUsers((current) => current.map((user) => (user._id === userId ? data.user : user)));
  }

  async function deleteUser(userId) {
    await api.delete(`/admin/users/${userId}`);
    setUsers((current) => current.filter((user) => user._id !== userId));
    setStats((current) => ({ ...current, totalUsers: Math.max((current?.totalUsers || 1) - 1, 0) }));
  }

  async function deleteItem(itemId) {
    await api.delete(`/admin/items/${itemId}`);
    setItems((current) => current.filter((item) => item._id !== itemId));
    setStats((current) => ({ ...current, totalItems: Math.max((current?.totalItems || 1) - 1, 0) }));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-slate-950 p-6 text-white sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase text-teal-300">Admin control center</p>
          <h1 className="text-4xl font-black">Admin Dashboard</h1>
        </div>
        <p className="text-sm font-semibold text-slate-300">{stats?.totalViews ?? 0} total marketplace views</p>
      </section>

      {message && <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{message}</p>}

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-black ${activeTab === tab ? "bg-teal-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <section className="grid gap-4 md:grid-cols-4">
          {statCards.map(([label, value]) => (
            <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">{label}</p>
              <p className="mt-2 text-4xl font-black text-slate-950">{value}</p>
            </article>
          ))}
        </section>
      )}

      {activeTab === "Users" && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="p-4">Name</th><th>Email</th><th>Role</th><th className="text-right pr-4">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="p-4 font-bold">{user.name}</td>
                  <td className="text-slate-600">{user.email}</td>
                  <td>
                    <select className="max-w-36" value={user.role} onChange={(event) => updateRole(user._id, event.target.value)}>
                      {roles.map((role) => <option key={role}>{role}</option>)}
                    </select>
                  </td>
                  <td className="pr-4 text-right">
                    <button type="button" onClick={() => deleteUser(user._id)} className="rounded-lg bg-rose-600 px-3 py-2 font-bold text-white">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === "All Items" && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="p-4">Title</th><th>Seller</th><th>Price</th><th>Category</th><th>Status</th><th className="text-right pr-4">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="p-4 font-bold">{item.title}</td>
                  <td className="text-slate-600">{item.seller?.name || "Deleted user"}</td>
                  <td>Rs. {Number(item.price).toLocaleString("en-IN")}</td>
                  <td>{item.category}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td className="pr-4 text-right">
                    <button type="button" onClick={() => deleteItem(item._id)} className="rounded-lg bg-rose-600 px-3 py-2 font-bold text-white">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
