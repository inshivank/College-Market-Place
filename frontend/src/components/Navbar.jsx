import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMessaging } from "../context/MessagingContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, role, user, logout } = useAuth();
  const { unreadCount } = useMessaging();
  const [search, setSearch] = useState("");

  function handleSearch(event) {
    event.preventDefault();
    navigate(search.trim() ? `/?search=${encodeURIComponent(search.trim())}` : "/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-cream/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-3xl bg-ocean text-lg font-black text-white shadow-soft">
              CM
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Campus marketplace</p>
              <p className="text-lg font-black text-slate-950">College Market</p>
            </div>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="w-full lg:max-w-2xl">
          <label htmlFor="global-search" className="sr-only">Search campus listings</label>
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-ocean focus-within:ring-2 focus-within:ring-ocean/20">
            <span className="text-slate-400">🔍</span>
            <input
              id="global-search"
              className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
              placeholder="Search laptops, textbooks, hostel essentials..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search campus listings"
            />
            <button type="submit" className="rounded-2xl bg-ocean px-4 py-2 text-sm font-black text-white transition hover:bg-ocean-dark">
              Search
            </button>
          </div>
        </form>

        <nav className="flex flex-wrap items-center justify-end gap-2">
          <NavLink to="/items/new" className="btn-primary">
            List item
          </NavLink>
          <NavLink to="/inbox" className="relative rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
            Inbox
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className="btn-secondary">
                {user?.name || "Profile"}
              </NavLink>
              {role === "admin" && (
                <NavLink to="/admin" className="btn-secondary">
                  Admin
                </NavLink>
              )}
              {role === "manager" && (
                <NavLink to="/manager" className="btn-secondary">
                  Manager
                </NavLink>
              )}
              <button type="button" onClick={logout} className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-secondary">
                Login
              </NavLink>
              <NavLink to="/register" className="btn-primary">
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
