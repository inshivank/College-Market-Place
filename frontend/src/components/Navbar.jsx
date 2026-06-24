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
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-700 font-black text-white">
              CM
            </span>
            <span className="text-lg font-black text-slate-950">College Marketplace</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="w-full lg:max-w-md">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search books, laptops, hoodies..."
          />
        </form>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">
            Browse
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/items/new" className="btn-primary">
                List Item
              </NavLink>
              <NavLink to="/inbox" className="relative rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">
                Inbox
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
              </NavLink>
              {role === "admin" && (
                <NavLink to="/admin" className="btn-secondary">
                  Admin Panel
                </NavLink>
              )}
              {role === "manager" && (
                <NavLink to="/manager" className="btn-secondary">
                  Manager Panel
                </NavLink>
              )}
              <NavLink to="/profile" className="btn-secondary">
                {user?.name || "Profile"}
              </NavLink>
              <button type="button" onClick={logout} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">
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
