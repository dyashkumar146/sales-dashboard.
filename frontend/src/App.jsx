import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function App() {
  const [data, setData] = useState(null);
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [category, region]);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://sales-dashboard-1-0jyj.onrender.com";
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard`, {
        params: { category, region },
      });
      setData(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#cbd5e1" } },
    },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
    },
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            Executive Sales Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time Analytics • React + Node.js (200k Dataset)
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="bg-[#161e2e] p-2 rounded-xl border border-slate-700/60">
            <label className="block text-xs font-semibold text-slate-400 mb-1 px-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#1e293b] text-white text-sm rounded-lg px-3 py-2 outline-none border border-slate-600 focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Home & Furniture">Home & Furniture</option>
              <option value="Clothing & Apparel">Clothing & Apparel</option>
            </select>
          </div>

          <div className="bg-[#161e2e] p-2 rounded-xl border border-slate-700/60">
            <label className="block text-xs font-semibold text-slate-400 mb-1 px-1">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-[#1e293b] text-white text-sm rounded-lg px-3 py-2 outline-none border border-slate-600 focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Regions</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia Pacific">Asia Pacific</option>
              <option value="Latin America">Latin America</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-400 text-lg">
          Loading Analytics...
        </div>
      ) : (
        <>
          {/* KPI Cards Without $ Symbol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#161e2e] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Sales</p>
              <p className="text-4xl font-extrabold text-blue-400 mt-3">
                {data?.kpis?.totalSales || "0.00"}
              </p>
            </div>

            <div className="bg-[#161e2e] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Profit</p>
              <p className="text-4xl font-extrabold text-emerald-400 mt-3">
                {data?.kpis?.totalProfit || "0.00"}
              </p>
            </div>

            <div className="bg-[#161e2e] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Profit Margin</p>
              <p className="text-4xl font-extrabold text-cyan-400 mt-3">
                {data?.kpis?.profitMargin || "0"}%
              </p>
            </div>

            <div className="bg-[#161e2e] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Orders</p>
              <p className="text-4xl font-extrabold text-amber-400 mt-3">
                {data?.kpis?.totalOrders || "0"}
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-[#161e2e] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-slate-200 mb-4">Category Sales Breakdown</h2>
              <div className="h-72">
                {data?.categorySales && Object.keys(data.categorySales).length > 0 ? (
                  <Bar
                    data={{
                      labels: Object.keys(data.categorySales),
                      datasets: [
                        {
                          label: "Sales",
                          data: Object.values(data.categorySales),
                          backgroundColor: "#3b82f6",
                          borderRadius: 8,
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    No data available
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#161e2e] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-slate-200 mb-4">Regional Distribution</h2>
              <div className="h-72 flex justify-center items-center">
                {data?.regionSales && Object.keys(data.regionSales).length > 0 ? (
                  <Doughnut
                    data={{
                      labels: Object.keys(data.regionSales),
                      datasets: [
                        {
                          data: Object.values(data.regionSales),
                          backgroundColor: ["#3b82f6", "#10b981", "#06b6d4", "#f59e0b"],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom", labels: { color: "#cbd5e1" } } },
                    }}
                  />
                ) : (
                  <div className="text-slate-500">No regional data</div>
                )}
              </div>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-[#161e2e] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-200 mb-4">Top Performing Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#1e293b] text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Total Sales</th>
                    <th className="p-4">Total Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.topProducts?.length > 0 ? (
                    data.topProducts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-semibold text-slate-100">{p.name}</td>
                        <td className="p-4 text-blue-400 font-bold">{p.sales}</td>
                        <td className="p-4 text-emerald-400 font-bold">{p.profit}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-slate-500">
                        No product data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}