import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../API/API";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import "./dashboard.css";

const COLORS = ["#2563eb", "#22c55e", "#f97316", "#ef4444"];

const StatCard = ({ title, value, change }) => {
  const positive = change >= 0;

  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${positive ? "pos" : "neg"}`}>
          {title === "Income" && <FiTrendingUp />}
          {title === "Expenses" && <FiTrendingDown />}
          {title === "Remaining" && <FiDollarSign />}
        </div>
      </div>

      <h2>₹{value.toLocaleString()}</h2>

      <p className={positive ? "positive" : "negative"}>
        {positive ? "+" : ""}
        {change.toFixed(1)}% from last period
      </p>
    </div>
  );
};

const getPreviousRange = ({ from, to }) => {
  const start = new Date(from);
  const end = new Date(to);

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (days - 1));

  return {
    from: prevStart.toISOString().split("T")[0],
    to: prevEnd.toISOString().split("T")[0],
  };
};

const calcChange = (current, previous) =>
  previous === 0 ? 0 : ((current - previous) / previous) * 100;

const Dashboard = () => {
  const { dateRange } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("area");

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return;

    setLoading(true);

    const prevRange = getPreviousRange(dateRange);

    Promise.all([
      api.get("/analytics/stats", { params: dateRange }),
      api.get("/analytics/stats", { params: prevRange }),
    ])
      .then(([currentRes, previousRes]) => {
        setStats({
          current: currentRes.data,
          previous: previousRes.data,
        });
      })
      .finally(() => setLoading(false));
  }, [dateRange]);

  const changes = useMemo(() => {
    if (!stats?.previous) return {};
    return {
      balance: calcChange(stats.current.balance, stats.previous.balance),
      income: calcChange(stats.current.totalIncome, stats.previous.totalIncome),
      expense: calcChange(
        stats.current.totalExpense,
        stats.previous.totalExpense
      ),
    };
  }, [stats]);

  if (loading) return <div className="dashboard-loading">Loading...</div>;
  if (!stats) return null;

  const pieData = Object.entries(stats.current.categorySummary).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <section className="dashboard">
      {/* ===== KPI ===== */}
      <div className="kpi-grid">
        <StatCard
          title="Remaining"
          value={stats.current.balance}
          change={changes.balance || 0}
        />

        <StatCard
          title="Income"
          value={stats.current.totalIncome}
          change={changes.income || 0}
        />

        <StatCard
          title="Expenses"
          value={stats.current.totalExpense}
          change={changes.expense || 0}
        />
      </div>

      {/* ===== CHARTS ===== */}
      <div className="charts-grid">
        <div className="chart-card wide">
          <div className="card-header">
            <h3>Transactions</h3>

            <select
              className="chart-select"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="area">Area chart</option>
              <option value="bar">Bar chart</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            {chartType === "area" ? (
              <AreaChart data={stats.current.monthly}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  dataKey="income"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.15}
                />
                <Area
                  dataKey="expense"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.15}
                />
              </AreaChart>
            ) : (
              <BarChart data={stats.current.monthly}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* ===== PIE ===== */}
        <div className="chart-card">
          <div className="card-header">
            <h3>Categories</h3>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={65}
                outerRadius={100}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <ul className="legend">
            {pieData.map((c, i) => (
              <li key={c.name}>
                <span
                  className="dot"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
