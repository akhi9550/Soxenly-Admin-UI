import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, ComposedChart
} from 'recharts';
import { 
  Users, ShoppingBag, IndianRupee, Package, 
  ArrowUpRight, ArrowDownRight, TrendingUp, Clock, CheckCircle2,
  BarChart3, Activity
} from "lucide-react";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [timeframe, setTimeframe] = useState("daily");
  const [chartType, setChartType] = useState("bars"); // 'bars', 'line', 'candles'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard`, {
        headers: { "Authorization": `Bearer ${token}` }
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

  const fetchRevenueTrend = async (period) => {
    const token = localStorage.getItem("admin_token");
    setGraphLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard/revenue-trend?timeframe=${period}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setRevenueTrend(data.data || []);
      }
    } catch (err) {
      console.error("Trend fetch error:", err);
    } finally {
      setGraphLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchRevenueTrend(timeframe);
  }, [navigate]);

  useEffect(() => {
    fetchRevenueTrend(timeframe);
  }, [timeframe]);

  const orderDistribution = dashboardData ? [
    { name: 'Pending', value: dashboardData.DashboardOrder?.PendingOrder || 0, color: '#F59E0B' },
    { name: 'Completed', value: dashboardData.DashboardOrder?.CompletedOrder || 0, color: '#10B981' },
    { name: 'Others', value: (dashboardData.DashboardOrder?.TotalOrder || 0) - (dashboardData.DashboardOrder?.PendingOrder || 0) - (dashboardData.DashboardOrder?.CompletedOrder || 0), color: '#6366F1' }
  ] : [];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-soxenly-beige border-t-soxenly-green rounded-full animate-spin"></div>
      <p className="font-display text-[10px] uppercase tracking-[0.4em] font-black text-soxenly-green">Orchestrating Insights...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 bg-red-50 border border-red-100 text-red-600 rounded-3xl text-center">
      <h2 className="font-bold text-lg mb-2">Sync Interrupted</h2>
      <p className="text-sm opacity-80">{error}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-soxenly-beige pb-6">
        <div className="w-full md:w-auto break-words">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 block mb-2">System Intelligence</span>
          <h1 className="font-serif text-4xl md:text-5xl text-soxenly-green mt-1 leading-tight">Performance Overview</h1>
        </div>
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4 bg-white px-4 md:px-6 py-3 rounded-2xl border border-soxenly-beige shadow-sm">
          <div className="text-left md:text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Current Session</p>
            <p className="text-xs font-bold text-soxenly-green">Active Node: Admin Cluster</p>
          </div>
          <div className="w-10 h-10 bg-soxenly-green rounded-xl flex items-center justify-center text-white shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* REVENUE */}
        <div className="group bg-white p-6 rounded-3xl border border-soxenly-beige hover:border-soxenly-green transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-soxenly-green/10 text-soxenly-green rounded-2xl group-hover:bg-soxenly-green group-hover:text-white transition-colors duration-500">
              <IndianRupee size={24} />
            </div>
            <div className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} className="mr-1" />
              12%
            </div>
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Annual Revenue</h3>
          <p className="text-3xl font-display font-black tracking-tight">₹{dashboardData?.DashboardRevenue?.YearRevenue || 0}</p>
          <p className="text-[10px] text-neutral-400 mt-2">Current Month: <span className="text-soxenly-green font-bold">₹{dashboardData?.DashboardRevenue?.MonthRevenue || 0}</span></p>
        </div>

        {/* ORDERS */}
        <div className="group bg-white p-6 rounded-3xl border border-soxenly-beige hover:border-soxenly-green transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
              <ShoppingBag size={24} />
            </div>
            <div className="flex items-center text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-lg">
              {dashboardData?.DashboardOrder?.TotalOrder || 0} Total
            </div>
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Fulfillment</h3>
          <p className="text-3xl font-display font-black tracking-tight">{dashboardData?.DashboardOrder?.TotalOrder || 0}</p>
          <div className="flex gap-4 mt-2">
            <p className="text-[10px] text-neutral-400 flex items-center gap-1"><Clock size={10} className="text-amber-500"/> {dashboardData?.DashboardOrder?.PendingOrder || 0} Pending</p>
            <p className="text-[10px] text-neutral-400 flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500"/> {dashboardData?.DashboardOrder?.CompletedOrder || 0} Done</p>
          </div>
        </div>

        {/* USERS */}
        <div className="group bg-white p-6 rounded-3xl border border-soxenly-beige hover:border-soxenly-green transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-500">
              <Users size={24} />
            </div>
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Customer Base</h3>
          <p className="text-3xl font-display font-black tracking-tight">{dashboardData?.DashboardUser?.Totaluser || 0}</p>
          <p className="text-[10px] text-neutral-400 mt-2">Restricted: <span className="text-red-500 font-bold">{dashboardData?.DashboardUser?.Blockuser || 0}</span></p>
        </div>

        {/* PRODUCTS */}
        <div className="group bg-white p-6 rounded-3xl border border-soxenly-beige hover:border-soxenly-green transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors duration-500">
              <Package size={24} />
            </div>
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Live Catalog</h3>
          <p className="text-3xl font-display font-black tracking-tight">{dashboardData?.DashboardProduct?.Totalproduct || 0}</p>
          <p className="text-[10px] text-neutral-400 mt-2">Depleted: <span className="text-red-500 font-bold">{dashboardData?.DashboardProduct?.Outofstock || 0}</span></p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REVENUE AREA CHART */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-soxenly-beige shadow-sm relative overflow-hidden">
          {graphLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-soxenly-green/20 border-t-soxenly-green rounded-full animate-spin"></div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-bold tracking-tight text-soxenly-green mb-1">Revenue Velocity</h3>
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Trend Intelligence Index</p>
                <div className="flex gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                  {[
                    { id: 'bars', icon: <BarChart3 size={12} />, label: 'Bars' },
                    { id: 'line', icon: <Activity size={12} />, label: 'Line' },
                    { id: 'candles', icon: <TrendingUp size={12} />, label: 'Candles' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setChartType(type.id)}
                      className={`p-1.5 rounded-md transition-all duration-300 flex items-center gap-2 ${
                        chartType === type.id 
                          ? "bg-white text-soxenly-green shadow-sm" 
                          : "text-neutral-400 hover:text-neutral-600"
                      }`}
                      title={type.label}
                    >
                      {type.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1 bg-neutral-50 p-1.5 rounded-2xl border border-neutral-100 w-full sm:w-auto">
              {[
                { id: 'hourly', label: 'Hourly' },
                { id: 'daily', label: 'Daily' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' }
              ].map((btn) => (
                <button 
                  key={btn.id}
                  onClick={() => setTimeframe(btn.id)}
                  className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex-1 sm:flex-none text-center ${
                    timeframe === btn.id 
                      ? "bg-soxenly-green text-white shadow-lg shadow-soxenly-green/20 scale-100 md:scale-105" 
                      : "text-neutral-400 hover:text-soxenly-green hover:bg-white"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B4332" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#1B4332" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#E5E5E5" opacity={0.5} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#737373', fontWeight: '800'}} dy={15} interval={timeframe === 'hourly' ? 5 : 0} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#737373', fontWeight: '800'}} allowDecimals={false} />
                  <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', padding: '16px'}} />
                  <Area type="monotone" dataKey="value" stroke="#1B4332" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" animationDuration={1500} dot={false} />
                </AreaChart>
              ) : chartType === 'candles' ? (
                <ComposedChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#E5E5E5" opacity={0.5} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#737373', fontWeight: '800'}} dy={15} interval={timeframe === 'hourly' ? 5 : 0} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#737373', fontWeight: '800'}} allowDecimals={false} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 rounded-2xl shadow-xl border border-neutral-100">
                            <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">{data.label}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <p className="text-xs text-neutral-500">Open: <span className="font-bold text-soxenly-green">₹{data.open}</span></p>
                              <p className="text-xs text-neutral-500">Close: <span className="font-bold text-soxenly-green">₹{data.close}</span></p>
                              <p className="text-xs text-neutral-500">High: <span className="font-bold text-soxenly-green">₹{data.high}</span></p>
                              <p className="text-xs text-neutral-500">Low: <span className="font-bold text-soxenly-green">₹{data.low}</span></p>
                            </div>
                            <div className="mt-2 pt-2 border-t border-neutral-100">
                              <p className="text-sm font-serif text-soxenly-green">Total: ₹{data.value}</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Candlestick Wicks */}
                  <Bar dataKey="high" barSize={1} fill="#1B4332" />
                  {/* Candlestick Body */}
                  <Bar 
                    dataKey={(d) => Math.abs(d.open - d.close) || 2} 
                    fill={(d) => d.close >= d.open ? '#1B4332' : '#EF4444'}
                    radius={[2, 2, 2, 2]}
                    barSize={8}
                  />
                </ComposedChart>
              ) : (
                <BarChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#E5E5E5" opacity={0.5} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#737373', fontWeight: '800'}} dy={15} interval={timeframe === 'hourly' ? 5 : 0} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#737373', fontWeight: '800'}} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#F5F5F5', radius: 12 }} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', padding: '16px'}} />
                  <Bar dataKey="value" fill="#1B4332" radius={[12, 12, 0, 0]} barSize={timeframe === 'hourly' ? 6 : 24} animationDuration={1500} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* ORDER PIE CHART */}
        <div className="bg-white p-8 rounded-[40px] border border-soxenly-beige shadow-sm flex flex-col">
          <div className="mb-10">
            <h3 className="text-2xl font-bold tracking-tight text-soxenly-green mb-1">Status Distribution</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Order Health Matrix</p>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-6 border-t border-soxenly-beige text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Total Pipeline</p>
            <p className="text-2xl font-display font-black text-soxenly-green">{dashboardData?.DashboardOrder?.TotalOrder || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
