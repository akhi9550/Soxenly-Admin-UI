import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/login");
  };

  const navItemClass = (path) => {
    const isActive = location.pathname === path;
    return `block px-4 py-3 border border-soxenly-beige text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
      isActive 
        ? "bg-soxenly-green text-soxenly-cream" 
        : "text-soxenly-green hover:bg-soxenly-green hover:text-soxenly-cream bg-soxenly-cream"
    }`;
  };

  return (
    <div className="min-h-screen bg-neutral-100 font-display flex">
      {/* SIDEBAR */}
      <aside className="w-64 fixed h-screen top-0 left-0 border-r-4 border-soxenly-beige bg-soxenly-cream flex flex-col hidden md:flex shrink-0 z-50">
        <div className="p-6 border-b border-soxenly-beige flex flex-col items-center">
          <img src="/logo.png" alt="Soxenly Logo" className="h-16 w-auto object-contain" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-soxenly-green text-soxenly-cream px-2 py-1 mt-2 inline-block">Admin Panel</span>
        </div>
        <nav className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <Link to="/dashboard" className={navItemClass("/dashboard")}>Overview</Link>
          <Link to="/users" className={navItemClass("/users")}>Users</Link>
          <Link to="/products" className={navItemClass("/products")}>Products</Link>
          <Link to="/orders" className={navItemClass("/orders")}>Orders</Link>
          <Link to="/categories" className={navItemClass("/categories")}>Categories</Link>
        </nav>
        <div className="p-4 border-t-4 border-soxenly-beige">
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-3 border border-soxenly-beige text-soxenly-green hover:bg-soxenly-green hover:text-soxenly-cream text-xs font-bold uppercase tracking-[0.1em] transition-colors bg-soxenly-cream"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-0 md:ml-64 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
