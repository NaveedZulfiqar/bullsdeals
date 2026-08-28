"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Check } from "lucide-react";

type Frequency = "WEEKLY" | "BIWEEKLY";
type SortKey = "weekDay" | "frequency" | "year" | "periodStartDate" | "periodEndDate" | "scheduledPayDate";

interface Setting {
  frequency: Frequency;
  startDate: string;
  dueDays: number;
}

interface ScheduleRow {
  id: string;
  weekDay: string;
  frequency: Frequency;
  year: number;
  periodStartDate: string;
  periodEndDate: string;
  scheduledPayDate: string;
}

const dateKey = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (value: string, days: number) => {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dateKey(date);
};
const displayDate = (value: string) => new Intl.DateTimeFormat("en-CA", {
  day: "2-digit", month: "short", year: "numeric",
}).format(new Date(`${value}T00:00:00`));

export default function PayrollSettingsPage() {
  const [activeFrequency, setActiveFrequency] = useState<Frequency>("WEEKLY");
  const [settings, setSettings] = useState<Record<Frequency, Setting>>({
    WEEKLY: { frequency: "WEEKLY", startDate: `${new Date().getFullYear()}-01-01`, dueDays: 0 },
    BIWEEKLY: { frequency: "BIWEEKLY", startDate: `${new Date().getFullYear()}-01-01`, dueDays: 0 },
  });
  const [sortKey, setSortKey] = useState<SortKey>("periodStartDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ message: string; ok: boolean } | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/payroll/settings");
      if (!response.ok) throw new Error("Load failed");
      const data = await response.json();
      setSettings(data.settings);
    } catch {
      setNotice({ message: "Could not load payroll settings.", ok: false });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadSettings, 0);
    return () => window.clearTimeout(timer);
  }, [loadSettings]);

  const schedule = useMemo(() => {
    const setting = settings[activeFrequency];
    const length = activeFrequency === "WEEKLY" ? 7 : 14;
    const year = Number(setting.startDate.slice(0, 4));
    const lastDay = `${year}-12-31`;
    const rows: ScheduleRow[] = [];
    let periodStart = setting.startDate;
    let index = 0;
    while (periodStart <= lastDay && index < 54) {
      const periodEnd = addDays(periodStart, length - 1);
      const scheduledPayDate = addDays(periodEnd, setting.dueDays);
      rows.push({
        id: `${activeFrequency}:${periodStart}`,
        weekDay: new Intl.DateTimeFormat("en-CA", { weekday: "long" }).format(new Date(`${scheduledPayDate}T00:00:00`)),
        frequency: activeFrequency,
        year,
        periodStartDate: periodStart,
        periodEndDate: periodEnd,
        scheduledPayDate,
      });
      periodStart = addDays(periodStart, length);
      index += 1;
    }
    return [...rows].sort((left, right) => {
      const result = String(left[sortKey]).localeCompare(String(right[sortKey]), undefined, { numeric: true });
      return sortDirection === "asc" ? result : -result;
    });
  }, [activeFrequency, settings, sortDirection, sortKey]);

  const update = async () => {
    const setting = settings[activeFrequency];
    if (!setting.startDate || setting.dueDays < 0) {
      setNotice({ message: "Payroll start date and a valid due-day value are required.", ok: false });
      return;
    }
    try {
      setSaving(true);
      const response = await fetch("/api/payroll/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setting),
      });
      if (!response.ok) throw new Error("Update failed");
      setNotice({ message: `${activeFrequency === "WEEKLY" ? "Weekly" : "Bi-Weekly"} schedule updated.`, ok: true });
    } catch {
      setNotice({ message: "Could not update the payroll schedule.", ok: false });
    } finally {
      setSaving(false);
    }
  };

  const changeSort = (field: SortKey) => {
    if (field === sortKey) setSortDirection((previous) => previous === "asc" ? "desc" : "asc");
    else { setSortKey(field); setSortDirection("asc"); }
  };

  const sortIcon = (field: SortKey) => {
    if (field !== sortKey) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDirection === "asc" ? <ArrowUp className="h-3 w-3 text-[#FD7E14]" /> : <ArrowDown className="h-3 w-3 text-[#FD7E14]" />;
  };

  const header = (field: SortKey, label: string) => (
    <button type="button" onClick={() => changeSort(field)} className="inline-flex items-center gap-1.5 whitespace-nowrap">{label}{sortIcon(field)}</button>
  );
  const activeSetting = settings[activeFrequency];

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1900px] flex-1 flex-col">
        <header className="mb-5"><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#FD7E14]">Payroll</p><h1 className="text-2xl font-bold text-[#1B2559] sm:text-3xl">Schedule Payroll</h1></header>
        <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 pt-1 sm:px-7">
            <div className="flex gap-1" role="tablist" aria-label="Payroll frequency">
              {(["WEEKLY", "BIWEEKLY"] as Frequency[]).map((frequency) => (
                <button key={frequency} type="button" role="tab" aria-selected={activeFrequency === frequency} onClick={() => { setActiveFrequency(frequency); setNotice(null); }} className={`relative px-4 py-4 text-sm font-semibold ${activeFrequency === frequency ? "text-[#1B2559] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-[#FD7E14]" : "text-gray-400"}`}>
                  {frequency === "WEEKLY" ? "Weekly" : "Bi-Weekly"}
                </button>
              ))}
            </div>
          </div>
          <div className="px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <label className="block w-full sm:w-[210px]"><span className="mb-1.5 block text-xs font-semibold text-gray-600">Payroll Start Date <span className="text-red-500">*</span></span><input type="date" value={activeSetting.startDate} onChange={(event) => setSettings((previous) => ({ ...previous, [activeFrequency]: { ...previous[activeFrequency], startDate: event.target.value } }))} className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100" /></label>
              <label className="block w-full sm:w-[210px]"><span className="mb-1.5 block text-xs font-semibold text-gray-600">Due in days <span className="text-red-500">*</span></span><input type="number" min="0" max="60" value={activeSetting.dueDays} placeholder="Due in days" onChange={(event) => setSettings((previous) => ({ ...previous, [activeFrequency]: { ...previous[activeFrequency], dueDays: Number(event.target.value) } }))} className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#FD7E14] focus:ring-2 focus:ring-orange-100" /></label>
              <button type="button" onClick={update} disabled={saving} className="h-10 rounded-lg bg-[#FD7E14] px-5 text-sm font-semibold text-white hover:bg-[#E96C08] disabled:opacity-60">{saving ? "Updating..." : "Update"}</button>
            </div>
            {notice && <div className={`mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${notice.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{notice.ok && <Check className="h-4 w-4" />}{notice.message}</div>}
          </div>
          <div className="mx-5 mb-7 overflow-hidden rounded-xl border border-gray-200 sm:mx-7">
            <div className="max-h-[620px] overflow-auto">
              <table className="w-full min-w-[900px] text-left text-xs text-[#344054]">
                <thead className="sticky top-0 border-b border-orange-200 bg-orange-50 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A4A09]"><tr><th className="px-3 py-3">{header("weekDay", "Week Day")}</th><th className="px-3 py-3">{header("frequency", "Pay Frequency")}</th><th className="px-3 py-3">{header("year", "Year")}</th><th className="px-3 py-3">{header("periodStartDate", "Period Start Date")}</th><th className="px-3 py-3">{header("periodEndDate", "Period End Date")}</th><th className="px-3 py-3">{header("scheduledPayDate", "Scheduled Pay Date")}</th></tr></thead>
                <tbody className="divide-y divide-gray-100">{schedule.map((row) => <tr key={row.id} className="hover:bg-orange-50/30"><td className="px-3 py-3">{row.weekDay}</td><td className="px-3 py-3">{row.frequency}</td><td className="px-3 py-3">{row.year}</td><td className="px-3 py-3">{displayDate(row.periodStartDate)}</td><td className="px-3 py-3">{displayDate(row.periodEndDate)}</td><td className="px-3 py-3">{displayDate(row.scheduledPayDate)}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
