import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-neutral-100 font-display flex flex-col md:flex-row">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-soxenly-cream border-b-4 border-soxenly-beige sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Soxenly Logo" className="h-8 w-auto object-contain" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-soxenly-green text-soxenly-cream px-2 py-1">Admin</span>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 border border-soxenly-beige text-soxenly-green bg-white font-bold transition-colors hover:bg-soxenly-beige/50"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* OVERLAY FOR MOBILE */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`w-64 fixed h-screen top-0 left-0 border-r-4 border-soxenly-beige bg-soxenly-cream flex flex-col z-50 transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shrink-0`}>
        <div className="p-6 border-b border-soxenly-beige flex flex-col items-center">
          <img src="/logo.png" alt="Soxenly Logo" className="h-16 w-auto object-contain" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-soxenly-green text-soxenly-cream px-2 py-1 mt-2 inline-block">Admin Panel</span>
        </div>
        <nav className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className={navItemClass("/dashboard")}>Overview</Link>
          <Link to="/users" onClick={() => setIsMenuOpen(false)} className={navItemClass("/users")}>Users</Link>
          <Link to="/products" onClick={() => setIsMenuOpen(false)} className={navItemClass("/products")}>Products</Link>
          <Link to="/orders" onClick={() => setIsMenuOpen(false)} className={navItemClass("/orders")}>Orders</Link>
          <Link to="/categories" onClick={() => setIsMenuOpen(false)} className={navItemClass("/categories")}>Categories</Link>
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
