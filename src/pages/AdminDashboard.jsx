import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setDashboardData(data.data);
        } else {
          setError(data.message || "Failed to load dashboard");
          if (response.status === 401) {
            localStorage.removeItem("admin_token");
            navigate("/login");
          }
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  return (
    <>
      <header className="flex justify-between items-end mb-8 border-b border-soxenly-beige pb-4">
        <div>
          <h2 className="text-sm font-medium tracking-[0.2em] text-neutral-500 mb-1">System Status</h2>
          <h1 className="font-serif text-4xl lg:text-5xl text-soxenly-green">Overview</h1>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium tracking-[0.1em]">Welcome, Admin</p>
          <p className="text-[10px] text-neutral-500">{new Date().toLocaleDateString()}</p>
        </div>
      </header>

      {loading ? (
        <div className="p-8 border border-soxenly-beige border-dashed text-center font-medium tracking-[0.2em] text-sm animate-pulse">
          Syncing data...
        </div>
      ) : error ? (
        <div className="p-8 border border-red-100 bg-red-50 text-red-600 font-bold tracking-[0.2em] text-sm rounded-2xl">
          ERROR: {error}
        </div>
      ) : dashboardData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* USERS CARD */}
          <div className="border border-neutral-200 bg-white p-6 rounded-xl">
            <h3 className="text-xs font-medium tracking-[0.2em] text-neutral-500 mb-4 border-b border-soxenly-beige pb-2">Users</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-display">{dashboardData.DashboardUser?.Totaluser || 0}</span>
              <span className="text-xs uppercase tracking-wider font-bold">Total</span>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-neutral-300 flex justify-between text-xs">
              <span>Blocked:</span>
              <span className="font-bold text-red-600">{dashboardData.DashboardUser?.Blockuser || 0}</span>
            </div>
          </div>
 
          {/* REVENUE CARD */}
          <div className="border border-neutral-200 bg-white p-6 rounded-xl">
            <h3 className="text-xs font-medium tracking-[0.2em] text-neutral-500 mb-4 border-b border-soxenly-beige pb-2">Revenue (Year)</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-display">₹{dashboardData.DashboardRevenue?.YearRevenue || 0}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-neutral-300 flex justify-between text-xs">
              <span>Month:</span>
              <span className="font-bold text-soxenly-green">₹{dashboardData.DashboardRevenue?.MonthRevenue || 0}</span>
            </div>
          </div>
 
          {/* ORDERS CARD */}
          <div className="border border-neutral-200 bg-white p-6 rounded-xl">
            <h3 className="text-xs font-medium tracking-[0.2em] text-neutral-500 mb-4 border-b border-soxenly-beige pb-2">Orders</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-display">{dashboardData.DashboardOrder?.TotalOrder || 0}</span>
              <span className="text-xs uppercase tracking-wider font-bold">Total</span>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-neutral-300 flex justify-between text-xs">
              <span>Pending:</span>
              <span className="font-bold">{dashboardData.DashboardOrder?.PendingOrder || 0}</span>
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span>Completed:</span>
              <span className="font-bold text-green-600">{dashboardData.DashboardOrder?.CompletedOrder || 0}</span>
            </div>
          </div>
 
          {/* PRODUCTS CARD */}
          <div className="border border-neutral-200 bg-white p-6 rounded-xl">
            <h3 className="text-xs font-medium tracking-[0.2em] text-neutral-500 mb-4 border-b border-soxenly-beige pb-2">Products</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-display">{dashboardData.DashboardProduct?.Totalproduct || 0}</span>
              <span className="text-xs uppercase tracking-wider font-bold">Active</span>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-neutral-300 flex justify-between text-xs">
              <span>Out of Stock:</span>
              <span className="font-bold text-red-600">{dashboardData.DashboardProduct?.Outofstock || 0}</span>
            </div>
          </div>

        </div>
      ) : null}
    </>
  );
}
