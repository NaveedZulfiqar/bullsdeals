"use client";

import React, { useState } from "react";
import {
  Users,
  TrendingUp,
  RefreshCw,
  FileText,
  Handshake,
  Calendar,
  ArrowUpRight,
  BarChart3,
  Gift,
  AlertTriangle,
  Wallet,
  Star,
  Check,
  ChevronDown,
} from "lucide-react";

export default function DashboardPage() {
  const [isPerformerDropdownOpen, setIsPerformerDropdownOpen] = useState(false);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date());

  return (
    <main className="flex-1 w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2C2C2C]">Good Evening</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">{formattedDate}</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Gross Commission Received (YTD)", value: "$0.00", color: "#5b67f1", icon: <RefreshCw className="w-5 h-5" /> },
          { label: "Pending Receipts", value: "-", color: "#0dcaf0", icon: <FileText className="w-5 h-5" /> },
          { label: "Last Reconciliation Done", value: "-", color: "#d63384", icon: <Handshake className="w-5 h-5" /> },
          { label: "Number of Active Agent", value: "48", color: "#dc3545", icon: <Users className="w-5 h-5" /> },
          { label: "Trades Open", value: "0", color: "#3f51b5", icon: <ArrowUpRight className="w-5 h-5" /> },
          { label: "Trades Closing This Month", value: "0", color: "#28a745", icon: <Calendar className="w-5 h-5" /> },
          { label: "Trades Closing Today", value: "0", color: "#ffc107", icon: <TrendingUp className="w-5 h-5" /> },
          { label: "Trades Closed (YTD)", value: "0", color: "#fd7e14", icon: <BarChart3 className="w-5 h-5" /> },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between transition-all hover:shadow-md"
            style={{ borderLeft: `4px solid ${card.color}` }}
          >
            <div className="space-y-1 min-w-0 pr-2">
              <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block leading-tight">{card.label}</span>
              <span className="text-xl sm:text-2xl font-bold text-[#2C2C2C]">{card.value}</span>
            </div>
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: card.color }}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section: Commission Received + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Commission Received (3/4) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-3 flex flex-col min-h-[300px] sm:h-[340px]">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4 flex-shrink-0">
            <div className="w-7 h-7 rounded bg-orange-100 flex items-center justify-center text-[#fd7e14]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#2C2C2C]">Commission Received</h2>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 overflow-hidden">
            <div className="flex flex-col pr-0 sm:pr-4 pb-4 sm:pb-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Monthly Trend</span>
              <div className="flex-1 flex flex-col justify-between text-[10px] text-gray-300 font-mono py-1 pr-2 select-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center w-full gap-2">
                    <span className="w-8 text-right">$0k</span>
                    <div className="flex-1 border-b border-dashed border-gray-100" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col px-0 sm:px-4 py-4 sm:py-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">By Trade Type</span>
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2.5">
                  <Check className="w-5 h-5 text-gray-300" />
                </div>
                <span className="text-xs text-gray-400 font-medium">No data available</span>
              </div>
            </div>

            <div className="flex flex-col pl-0 sm:pl-4 pt-4 sm:pt-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">By We Are</span>
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2.5">
                  <Check className="w-5 h-5 text-gray-300" />
                </div>
                <span className="text-xs text-gray-400 font-medium">No data available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar (1/4) */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:col-span-1">
          {[
            {
              color: "#28a745",
              icon: <Gift className="w-3.5 h-3.5" />,
              bgColor: "bg-green-50",
              textColor: "text-[#28a745]",
              title: "Birthdays This Month",
              count: "0 agent(s)",
              empty: "No birthdays this month",
            },
            {
              color: "#fd7e14",
              icon: <AlertTriangle className="w-3.5 h-3.5" />,
              bgColor: "bg-orange-50",
              textColor: "text-[#fd7e14]",
              title: "RECO License Expiring",
              count: "0 agent(s)",
              empty: "No expiries coming up",
            },
            {
              color: "#3f51b5",
              icon: <Wallet className="w-3.5 h-3.5" />,
              bgColor: "bg-indigo-50",
              textColor: "text-[#3f51b5]",
              title: "Employee Payroll",
              count: "0 employee(s)",
              empty: "No payroll due",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between"
              style={{ borderTop: `4px solid ${card.color}` }}
            >
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded ${card.bgColor} flex items-center justify-center ${card.textColor}`}>
                    {card.icon}
                  </div>
                  <h3 className="text-xs font-bold text-[#2C2C2C]">{card.title}</h3>
                </div>
                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">{card.count}</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-gray-300" />
                </div>
                <span className="text-[11px] text-gray-400 font-medium">{card.empty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: Performer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-[260px] sm:h-[280px]">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-yellow-50 flex items-center justify-center text-[#ffc107]">
                <Star className="w-4 h-4 fill-[#ffc107]" />
              </div>
              <h2 className="text-sm font-bold text-[#2C2C2C]">Top Performer (YTD)</h2>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsPerformerDropdownOpen(!isPerformerDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F0EDE8] border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 transition-all cursor-pointer"
              >
                <span>Commission</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {isPerformerDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-gray-200 rounded-lg shadow-md py-1 z-40">
                  <button className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FAF8F5] text-gray-700 font-medium">Commission</button>
                  <button className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FAF8F5] text-gray-700 font-medium">Deals Closed</button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end text-[10px] text-gray-300 font-mono select-none overflow-hidden">
            <div className="flex-1 flex h-full w-full pb-3 border-b border-gray-100 relative">
              <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="w-full border-b border-dashed border-gray-100" />
                ))}
              </div>
            </div>
            <div className="flex justify-between w-full pt-2 px-1">
              {[...Array(6)].map((_, idx) => (
                <span key={idx} className="text-center">$0k</span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-[260px] sm:h-[280px]">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center text-[#28a745]">
                <Calendar className="w-4 h-4 text-[#28a745]" />
              </div>
              <h2 className="text-sm font-bold text-[#2C2C2C]">Monthly Performer</h2>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end text-[10px] text-gray-300 font-mono select-none overflow-hidden">
            <div className="flex-1 flex h-full w-full pb-3 border-b border-gray-100 relative">
              <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="w-full border-b border-dashed border-gray-100" />
                ))}
              </div>
            </div>
            <div className="flex justify-between w-full pt-2 px-1">
              {[...Array(6)].map((_, idx) => (
                <span key={idx} className="text-center">$0k</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
