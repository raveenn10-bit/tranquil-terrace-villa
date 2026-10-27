"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import {
  BedDouble,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Globe,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { BookingRecord, BookingStatus, PaymentStatus } from "@/lib/booking-types";
import { bookingStatuses, paymentStatuses, villaNames } from "@/lib/booking-types";

type Props = { live: boolean; displayName: string; authHref: string };

const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Colombo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const demoBookings: BookingRecord[] = [
  {
    id: "demo-1", reference: "TTG-2410-A18F", guestName: "Sarah & Daniel", email: "sarah@example.com",
    phone: "+44 7700 900123", villaName: "Araliya", checkin: "2026-10-24", checkout: "2026-10-27", guests: 2,
    source: "website", status: "confirmed", paymentStatus: "partial", totalAmount: 75000, paidAmount: 37500,
    specialRequest: "Airport pickup information, please.", adminNotes: "Arrival around 3.30 PM.",
    createdAt: "2026-10-18 10:30:00", updatedAt: "2026-10-21 08:15:00",
  },
  {
    id: "demo-2", reference: "TTG-2810-C92B", guestName: "Nimal Perera", email: "nimal@example.com",
    phone: "+94 77 123 4567", villaName: "Olu", checkin: "2026-10-28", checkout: "2026-10-30", guests: 2,
    source: "WhatsApp", status: "pending", paymentStatus: "unpaid", totalAmount: 50000, paidAmount: 0,
    specialRequest: "Floating breakfast availability?", adminNotes: "Follow up this evening.",
    createdAt: "2026-10-21 13:10:00", updatedAt: "2026-10-21 13:10:00",
  },
  {
    id: "demo-3", reference: "TTG-0211-F71D", guestName: "Maya Chen", email: "maya@example.com",
    phone: "+65 8123 4567", villaName: "Araliya", checkin: "2026-11-02", checkout: "2026-11-06", guests: 2,
    source: "Airbnb", status: "inquiry", paymentStatus: "unpaid", totalAmount: 100000, paidAmount: 0,
    specialRequest: "Late check-in after 8 PM.", adminNotes: "", createdAt: "2026-10-22 09:00:00", updatedAt: "2026-10-22 09:00:00",
  },
];

const blankForm = {
  guestName: "", email: "", phone: "", villaName: "Araliya", checkin: "", checkout: "", guests: 2,
  source: "manual", status: "pending" as BookingStatus, paymentStatus: "unpaid" as PaymentStatus,
  totalAmount: 0, paidAmount: 0, specialRequest: "", adminNotes: "",
};

const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());
const money = (value: number) => `Rs. ${new Intl.NumberFormat("en-LK").format(value)}`;
const shortDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const nights = (start: string, end: string) => Math.max(0, Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86400000));

export default function AdminDashboard({ live, displayName, authHref }: Props) {
  const [activeTab, setActiveTab] = useState<"reservations" | "calendar-sync">("reservations");
  const [bookings, setBookings] = useState<BookingRecord[]>(live ? [] : demoBookings);
  const [loading, setLoading] = useState(live);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<BookingRecord | null>(null);
  const [form, setForm] = useState({ ...blankForm });
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Calendar sync state
  const [syncData, setSyncData] = useState<any>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncSaving, setSyncSaving] = useState(false);
  const [feedsForm, setFeedsForm] = useState({
    Araliya: { bookingUrl: "", airbnbUrl: "", agodaUrl: "" },
    Olu: { bookingUrl: "", airbnbUrl: "", agodaUrl: "" },
  });

  async function loadBookings() {
    if (!live) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/bookings", { cache: "no-store" });
      const data = await response.json() as { bookings?: BookingRecord[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not load bookings.");
      setBookings(data.bookings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load bookings.");
    } finally { setLoading(false); }
  }

  async function loadCalendarSync(force = false) {
    setSyncLoading(true);
    try {
      const endpoint = force ? "/api/calendar/settings" : "/api/calendar/settings";
      const res = force
        ? await fetch(endpoint, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ...feedsForm, forceSync: true }),
          })
        : await fetch(endpoint, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setSyncData(data);
        if (data.feeds) {
          setFeedsForm({
            Araliya: {
              bookingUrl: data.feeds.Araliya?.bookingUrl || "",
              airbnbUrl: data.feeds.Araliya?.airbnbUrl || "",
              agodaUrl: data.feeds.Araliya?.agodaUrl || "",
            },
            Olu: {
              bookingUrl: data.feeds.Olu?.bookingUrl || "",
              airbnbUrl: data.feeds.Olu?.airbnbUrl || "",
              agodaUrl: data.feeds.Olu?.agodaUrl || "",
            },
          });
        }
        if (force) showNotice("Calendar feeds resynced successfully!");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load calendar sync.");
    } finally {
      setSyncLoading(false);
    }
  }

  async function saveCalendarFeeds(event?: FormEvent) {
    if (event) event.preventDefault();
    setSyncSaving(true);
    try {
      const res = await fetch("/api/calendar/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...feedsForm, forceSync: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save feeds.");
      setSyncData(data);
      showNotice("OTA Sync feeds saved and synchronized!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save calendar feeds.");
    } finally {
      setSyncSaving(false);
    }
  }

  useEffect(() => {
    if (!live) return;
    let active = true;
    fetch("/api/bookings", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as { bookings?: BookingRecord[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Could not load bookings.");
        if (active) setBookings(data.bookings ?? []);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load bookings.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [live]);

  useEffect(() => {
    if (activeTab === "calendar-sync") {
      void loadCalendarSync(false);
    }
  }, [activeTab]);

  const filtered = useMemo(() => bookings.filter((booking) => {
    const haystack = `${booking.reference} ${booking.guestName} ${booking.email} ${booking.phone} ${booking.villaName}`.toLowerCase();
    return (filter === "all" || booking.status === filter) && haystack.includes(query.toLowerCase());
  }), [bookings, filter, query]);

  const stats = useMemo(() => ({
    total: bookings.length,
    upcoming: bookings.filter((b) => b.checkin >= today && !["cancelled", "checked_out"].includes(b.status)).length,
    pending: bookings.filter((b) => ["inquiry", "pending"].includes(b.status)).length,
    revenue: bookings.filter((b) => b.paymentStatus !== "refunded").reduce((sum, b) => sum + b.paidAmount, 0),
  }), [bookings]);

  function showNotice(message: string) {
    setNotice(message); window.setTimeout(() => setNotice(""), 3000);
  }

  function copyText(text: string, title: string) {
    navigator.clipboard.writeText(text);
    showNotice(`${title} copied to clipboard!`);
  }

  function newBooking() {
    setEditing(null); setForm({ ...blankForm }); setError(""); setOpen(true);
  }

  function editBooking(booking: BookingRecord) {
    setEditing(booking);
    setForm({
      guestName: booking.guestName, email: booking.email, phone: booking.phone,
      villaName: booking.villaName, checkin: booking.checkin, checkout: booking.checkout, guests: booking.guests,
      source: booking.source, status: booking.status, paymentStatus: booking.paymentStatus,
      totalAmount: booking.totalAmount, paidAmount: booking.paidAmount,
      specialRequest: booking.specialRequest, adminNotes: booking.adminNotes,
    });
    setError(""); setOpen(true);
  }

  async function saveBooking(event: FormEvent) {
    event.preventDefault();
    if (!live) { showNotice("Demo preview — sign in as the owner to save changes."); setOpen(false); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch(editing ? `/api/bookings/${editing.id}` : "/api/bookings", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json() as { booking?: BookingRecord; error?: string };
      if (!response.ok || !data.booking) throw new Error(data.error || "Could not save booking.");
      setBookings((rows) => editing ? rows.map((row) => row.id === data.booking!.id ? data.booking! : row) : [data.booking!, ...rows]);
      setOpen(false); showNotice(editing ? "Booking updated." : "Manual booking added.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save booking."); }
    finally { setSaving(false); }
  }

  async function quickUpdate(booking: BookingRecord, changes: Partial<BookingRecord>) {
    if (!live) { showNotice("Demo preview — live updates are owner-only."); return; }
    const snapshot = bookings;
    setBookings((rows) => rows.map((row) => row.id === booking.id ? { ...row, ...changes } : row));
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(changes),
      });
      const data = await response.json() as { booking?: BookingRecord; error?: string };
      if (!response.ok || !data.booking) throw new Error(data.error || "Update failed.");
      setBookings((rows) => rows.map((row) => row.id === booking.id ? data.booking! : row));
      showNotice("Booking updated.");
    } catch (err) {
      setBookings(snapshot); setError(err instanceof Error ? err.message : "Update failed.");
    }
  }

  function exportCsv() {
    const header = ["Reference","Villa","Guest","Phone","Email","Check-in","Check-out","Guests","Status","Payment","Total","Paid","Source"];
    const rows = filtered.map((b) => [b.reference,b.villaName,b.guestName,b.phone,b.email,b.checkin,b.checkout,b.guests,b.status,b.paymentStatus,b.totalAmount,b.paidAmount,b.source]);
    const csv = [header,...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `tranquil-terrace-bookings-${today}.csv`; anchor.click(); URL.revokeObjectURL(url);
  }

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://tranquilterracevilla.com";
  const araliyaIcsUrl = `${originUrl}/api/calendar/araliya.ics`;
  const oluIcsUrl = `${originUrl}/api/calendar/olu.ics`;

  return (
    <div className="min-h-screen bg-[#f4f1e8] text-[#17392f]">
      {notice && <div className="fixed right-5 top-5 z-[80] flex items-center gap-2 rounded-xl bg-[#17392f] px-4 py-3 text-sm text-white shadow-2xl"><Check size={16}/>{notice}</div>}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[250px] bg-[#183b31] p-6 text-[#f4f1e8] transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button className="absolute right-4 top-4 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X/></button>
        <a href="/" className="block border-b border-white/15 pb-6"><img src="/assets/tranquil-terrace-logo.webp" alt="Tranquil Terrace Galle" width="1200" height="420" className="h-auto w-full rounded bg-[#f4f1e8] p-3"/></a>
        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[.24em] text-white/45">Management</p>
        <nav className="mt-4 space-y-2">
          <button
            onClick={() => setActiveTab("reservations")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${activeTab === "reservations" ? "bg-white/10 font-medium text-white" : "text-white/70 hover:bg-white/5"}`}
          >
            <LayoutDashboard size={18}/> Reservations
          </button>
          <button
            onClick={() => setActiveTab("calendar-sync")}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors ${activeTab === "calendar-sync" ? "bg-white/10 font-medium text-white" : "text-white/70 hover:bg-white/5"}`}
          >
            <span className="flex items-center gap-3"><CalendarDays size={18}/> Calendar Sync</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white/70 hover:bg-white/5" onClick={newBooking}><Plus size={18}/> Add booking</button>
          <a className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/5" href="/" target="_blank"><Eye size={18}/> View website</a>
        </nav>
        <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/10 p-4">
          <p className="text-xs text-white/50">Signed in as</p><p className="mt-1 truncate text-sm">{displayName}</p>
          <a href={authHref} target="_top" className="mt-3 flex items-center gap-2 text-xs text-[#dbc991]"><LogOut size={14}/>{live ? "Sign out" : "Owner sign in"}</a>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[250px]">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#17392f]/10 bg-[#f4f1e8]/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu/></button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#17392f]/45">Tranquil Terrace Galle</p>
              <h1 className="font-serif text-2xl">{activeTab === "reservations" ? "Booking dashboard" : "OTA Calendar Synchronization"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!live && <span className="hidden rounded-full bg-[#a58e56]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#806b39] sm:block">Read-only demo</span>}
            {activeTab === "reservations" ? (
              <>
                <button onClick={() => void loadBookings()} disabled={!live || loading} className="rounded-xl border border-[#17392f]/15 p-2.5 disabled:opacity-40" aria-label="Refresh bookings"><RefreshCw size={17} className={loading ? "animate-spin" : ""}/></button>
                <button onClick={newBooking} className="flex items-center gap-2 rounded-xl bg-[#17392f] px-4 py-2.5 text-xs font-semibold text-white"><Plus size={16}/> <span className="hidden sm:inline">New booking</span></button>
              </>
            ) : (
              <button onClick={() => void loadCalendarSync(true)} disabled={syncLoading} className="flex items-center gap-2 rounded-xl bg-[#17392f] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60">
                <RefreshCw size={15} className={syncLoading ? "animate-spin" : ""}/> <span>Sync OTAs Now</span>
              </button>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
          {!live && <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#a58e56]/25 bg-[#fffaf0] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-serif text-xl">Client preview mode</p><p className="mt-1 text-sm text-[#17392f]/60">Sample data is shown. Real guest information and editing controls remain owner-only.</p></div><a href={authHref} target="_top" className="text-sm font-semibold text-[#806b39]">Owner sign in <ChevronRight className="inline" size={16}/></a></div>}
          {error && <div role="alert" className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>{error}</span><button onClick={() => setError("")}><X size={17}/></button></div>}

          {activeTab === "reservations" ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Total bookings", stats.total, CalendarDays, "All records"],
                  ["Upcoming stays", stats.upcoming, BedDouble, "Active arrivals"],
                  ["Need attention", stats.pending, Users, "Inquiry + pending"],
                  ["Payments received", money(stats.revenue), CircleDollarSign, "Recorded amount"],
                ].map(([title,value,Icon,caption]) => <article key={String(title)} className="rounded-2xl border border-[#17392f]/10 bg-white/70 p-5 shadow-[0_12px_35px_rgba(23,57,47,.05)]"><div className="flex items-start justify-between"><div><p className="text-xs text-[#17392f]/55">{String(title)}</p><strong className="mt-2 block font-serif text-3xl font-medium">{String(value)}</strong></div><span className="rounded-xl bg-[#17392f]/7 p-2.5"><Icon size={19}/></span></div><p className="mt-4 text-[10px] uppercase tracking-[.15em] text-[#17392f]/35">{String(caption)}</p></article>)}
              </section>

              <section className="mt-7 overflow-hidden rounded-2xl border border-[#17392f]/10 bg-white/75 shadow-[0_16px_45px_rgba(23,57,47,.05)]">
                <div className="flex flex-col gap-4 border-b border-[#17392f]/10 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div><h2 className="font-serif text-2xl">Reservations</h2><p className="text-xs text-[#17392f]/45">{filtered.length} booking{filtered.length === 1 ? "" : "s"} shown</p></div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="flex items-center gap-2 rounded-xl border border-[#17392f]/15 bg-white px-3"><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Guest, phone or reference" className="h-10 w-full bg-transparent text-sm outline-none sm:w-56"/></label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-11 rounded-xl border border-[#17392f]/15 bg-white px-3 text-sm"><option value="all">All statuses</option>{bookingStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select>
                    <button onClick={exportCsv} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#17392f]/15 bg-white px-4 text-xs font-semibold"><Download size={16}/> Export CSV</button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] text-left text-sm">
                    <thead className="bg-[#17392f]/[.035] text-[10px] uppercase tracking-[.13em] text-[#17392f]/50"><tr><th className="px-5 py-4">Guest</th><th className="px-4 py-4">Villa</th><th className="px-4 py-4">Stay</th><th className="px-4 py-4">Guests</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Payment</th><th className="px-4 py-4">Value</th><th className="px-4 py-4">Source</th><th className="px-5 py-4 text-right">Action</th></tr></thead>
                    <tbody className="divide-y divide-[#17392f]/8">
                      {loading ? <tr><td colSpan={9} className="p-14 text-center"><LoaderCircle className="mx-auto animate-spin"/><p className="mt-3 text-xs text-[#17392f]/45">Loading bookings…</p></td></tr> : filtered.length === 0 ? <tr><td colSpan={9} className="p-14 text-center"><CalendarDays className="mx-auto text-[#17392f]/25"/><p className="mt-3 text-sm">No matching bookings yet.</p></td></tr> : filtered.map((booking) => (
                        <tr key={booking.id} className="hover:bg-[#17392f]/[.025]">
                          <td className="px-5 py-4"><button onClick={() => editBooking(booking)} className="text-left"><span className="block font-semibold">{booking.guestName}</span><span className="text-[11px] text-[#17392f]/45">{booking.reference} · {booking.phone}</span></button></td>
                          <td className="px-4 py-4"><span className="rounded-full bg-[#a58e56]/12 px-3 py-2 text-[11px] font-semibold text-[#806b39]">{booking.villaName}</span></td>
                          <td className="px-4 py-4"><span className="block">{shortDate(booking.checkin)} → {shortDate(booking.checkout)}</span><span className="text-[11px] text-[#17392f]/45">{nights(booking.checkin, booking.checkout)} nights</span></td>
                          <td className="px-4 py-4">{booking.guests}</td>
                          <td className="px-4 py-4"><select value={booking.status} onChange={(e) => void quickUpdate(booking, { status: e.target.value as BookingStatus })} className={`rounded-full border-0 px-3 py-2 text-[11px] font-semibold ${booking.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : booking.status === "cancelled" ? "bg-red-100 text-red-700" : booking.status === "checked_in" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>{bookingStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></td>
                          <td className="px-4 py-4"><select value={booking.paymentStatus} onChange={(e) => void quickUpdate(booking, { paymentStatus: e.target.value as PaymentStatus })} className="rounded-full border border-[#17392f]/10 bg-white px-3 py-2 text-[11px]">{paymentStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></td>
                          <td className="px-4 py-4"><span className="block font-medium">{money(booking.totalAmount)}</span><span className="text-[11px] text-[#17392f]/45">Paid {money(booking.paidAmount)}</span></td>
                          <td className="px-4 py-4 capitalize">{booking.source}</td>
                          <td className="px-5 py-4 text-right"><button onClick={() => editBooking(booking)} className="rounded-lg border border-[#17392f]/15 p-2" aria-label={`Open ${booking.reference}`}><ChevronRight size={16}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <div className="space-y-8">
              {/* Sync Overview Banner */}
              <div className="rounded-2xl border border-[#17392f]/10 bg-white/80 p-6 shadow-[0_12px_35px_rgba(23,57,47,.05)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      2-Way iCal Calendar Sync Active
                    </div>
                    <h2 className="mt-3 font-serif text-2xl">Connect Booking.com, Airbnb & Agoda</h2>
                    <p className="mt-1 max-w-2xl text-xs text-[#17392f]/60 leading-relaxed">
                      Prevent double-bookings effortlessly. Export your Tranquil Terrace availability to OTAs and automatically import reservations made on Booking.com, Airbnb, and Agoda.
                    </p>
                  </div>
                  <button
                    onClick={() => void loadCalendarSync(true)}
                    disabled={syncLoading}
                    className="flex items-center gap-2 rounded-xl bg-[#17392f] px-5 py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#0f2821] disabled:opacity-60"
                  >
                    <RefreshCw size={15} className={syncLoading ? "animate-spin" : ""}/>
                    <span>{syncLoading ? "Checking OTAs…" : "Sync All Channels Now"}</span>
                  </button>
                </div>
              </div>

              {/* Section 1: Outbound Feeds (Export to OTAs) */}
              <section className="rounded-2xl border border-[#17392f]/10 bg-white/85 p-6 shadow-[0_16px_45px_rgba(23,57,47,.05)]">
                <div className="border-b border-[#17392f]/10 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a58e56]">Step 1 · Outbound Export</span>
                  <h3 className="mt-1 font-serif text-xl">Export Your Tranquil Terrace Calendars to OTAs</h3>
                  <p className="text-xs text-[#17392f]/60">Copy these dedicated iCal feed URLs and paste them into your Airbnb, Booking.com Extranet, and Agoda YCS Extranets.</p>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {/* Villa Araliya Export */}
                  <div className="rounded-xl border border-[#17392f]/15 bg-[#fdfbf7] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-[#a58e56]/15 px-2.5 py-1 text-xs font-bold text-[#806b39]">Villa Araliya</span>
                        <span className="text-[11px] text-[#17392f]/50">Export Feed</span>
                      </div>
                      <a href="/api/calendar/araliya.ics" target="_blank" className="text-xs text-[#806b39] hover:underline flex items-center gap-1">
                        Download .ics <ExternalLink size={12}/>
                      </a>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#17392f]/15 bg-white p-2 text-xs">
                      <input readOnly value={araliyaIcsUrl} className="w-full bg-transparent font-mono text-[11px] text-[#17392f]/80 outline-none"/>
                      <button
                        onClick={() => copyText(araliyaIcsUrl, "Villa Araliya iCal link")}
                        className="flex items-center gap-1 rounded bg-[#17392f]/8 px-2.5 py-1.5 font-sans font-semibold text-[#17392f] hover:bg-[#17392f]/15"
                      >
                        <Copy size={13}/> Copy
                      </button>
                    </div>
                    <div className="mt-4 text-[11px] text-[#17392f]/65 space-y-1">
                      <p>✓ Blocks dates on OTAs when a booking is confirmed on your website or WhatsApp.</p>
                      <p>✓ Updates in real-time as soon as you add reservations.</p>
                    </div>
                  </div>

                  {/* Villa Olu Export */}
                  <div className="rounded-xl border border-[#17392f]/15 bg-[#fdfbf7] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-[#a58e56]/15 px-2.5 py-1 text-xs font-bold text-[#806b39]">Villa Olu</span>
                        <span className="text-[11px] text-[#17392f]/50">Export Feed</span>
                      </div>
                      <a href="/api/calendar/olu.ics" target="_blank" className="text-xs text-[#806b39] hover:underline flex items-center gap-1">
                        Download .ics <ExternalLink size={12}/>
                      </a>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#17392f]/15 bg-white p-2 text-xs">
                      <input readOnly value={oluIcsUrl} className="w-full bg-transparent font-mono text-[11px] text-[#17392f]/80 outline-none"/>
                      <button
                        onClick={() => copyText(oluIcsUrl, "Villa Olu iCal link")}
                        className="flex items-center gap-1 rounded bg-[#17392f]/8 px-2.5 py-1.5 font-sans font-semibold text-[#17392f] hover:bg-[#17392f]/15"
                      >
                        <Copy size={13}/> Copy
                      </button>
                    </div>
                    <div className="mt-4 text-[11px] text-[#17392f]/65 space-y-1">
                      <p>✓ Blocks dates on OTAs when a booking is confirmed on your website or WhatsApp.</p>
                      <p>✓ Updates in real-time as soon as you add reservations.</p>
                    </div>
                  </div>
                </div>

                {/* Setup Instructions Accordion */}
                <div className="mt-6 rounded-xl bg-[#17392f]/[0.03] p-4 text-xs text-[#17392f]/75">
                  <strong className="block font-medium text-sm text-[#17392f] mb-2">Where to paste these links in OTA extranets:</strong>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-white p-3 border border-[#17392f]/10">
                      <span className="font-bold text-[#073b80]">Booking.com Extranet</span>
                      <p className="mt-1 text-[11px] leading-relaxed">Go to <strong>Rates & Availability</strong> → <strong>Sync calendars</strong> → Click <strong>Add calendar connection</strong> → Paste export link → Name it &quot;Tranquil Terrace Direct&quot;.</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-[#17392f]/10">
                      <span className="font-bold text-[#c34d59]">Airbnb Host Calendar</span>
                      <p className="mt-1 text-[11px] leading-relaxed">Go to <strong>Listing</strong> → <strong>Pricing & availability</strong> → <strong>Calendar sync</strong> → Click <strong>Import calendar</strong> → Paste link.</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-[#17392f]/10">
                      <span className="font-bold text-[#364e76]">Agoda YCS Extranet</span>
                      <p className="mt-1 text-[11px] leading-relaxed">Go to <strong>Calendar</strong> → <strong>Calendar Sync</strong> → Click <strong>Import Calendar</strong> → Paste link and save.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Inbound Feeds (Import into Tranquil Terrace) */}
              <section className="rounded-2xl border border-[#17392f]/10 bg-white/85 p-6 shadow-[0_16px_45px_rgba(23,57,47,.05)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#17392f]/10 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a58e56]">Step 2 · Inbound Import</span>
                    <h3 className="mt-1 font-serif text-xl">Import OTA Calendars into Your Website</h3>
                    <p className="text-xs text-[#17392f]/60">Paste the iCal export URLs provided by Booking.com, Airbnb, and Agoda for each villa below.</p>
                  </div>
                  <button
                    onClick={saveCalendarFeeds}
                    disabled={syncSaving}
                    className="flex items-center gap-2 rounded-xl bg-[#17392f] px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-[#0f2821] disabled:opacity-60"
                  >
                    {syncSaving ? <LoaderCircle size={15} className="animate-spin"/> : <Check size={15}/>}
                    <span>Save & Sync Feeds</span>
                  </button>
                </div>

                <div className="mt-6 grid gap-8 lg:grid-cols-2">
                  {/* Villa Araliya Inbound Feeds */}
                  <div className="rounded-xl border border-[#17392f]/15 bg-[#fdfbf7] p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#17392f]/10 pb-3">
                      <span className="rounded-lg bg-[#a58e56]/15 px-3 py-1 text-xs font-bold text-[#806b39]">Villa Araliya Feeds</span>
                      <span className="text-[11px] text-[#17392f]/50">
                        {syncData?.status?.Araliya?.blockedDatesCount ?? 0} blocked night(s) detected
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-[#073b80]">Booking.com iCal URL</label>
                        {syncData?.status?.Araliya?.channels?.booking?.configured ? (
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">● Connected ({syncData.status.Araliya.channels.booking.eventCount} bookings)</span>
                        ) : (
                          <span className="text-[10px] text-[#17392f]/40">Not configured</span>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html?t=..."
                        value={feedsForm.Araliya.bookingUrl}
                        onChange={(e) => setFeedsForm({ ...feedsForm, Araliya: { ...feedsForm.Araliya, bookingUrl: e.target.value } })}
                        className="h-10 w-full rounded-lg border border-[#17392f]/15 bg-white px-3 text-xs outline-none focus:border-[#17392f]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-[#c34d59]">Airbnb iCal URL</label>
                        {syncData?.status?.Araliya?.channels?.airbnb?.configured ? (
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">● Connected ({syncData.status.Araliya.channels.airbnb.eventCount} bookings)</span>
                        ) : (
                          <span className="text-[10px] text-[#17392f]/40">Not configured</span>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://www.airbnb.com/calendar/ical/1493263628966005427.ics?s=..."
                        value={feedsForm.Araliya.airbnbUrl}
                        onChange={(e) => setFeedsForm({ ...feedsForm, Araliya: { ...feedsForm.Araliya, airbnbUrl: e.target.value } })}
                        className="h-10 w-full rounded-lg border border-[#17392f]/15 bg-white px-3 text-xs outline-none focus:border-[#17392f]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-[#364e76]">Agoda iCal URL</label>
                        {syncData?.status?.Araliya?.channels?.agoda?.configured ? (
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">● Connected ({syncData.status.Araliya.channels.agoda.eventCount} bookings)</span>
                        ) : (
                          <span className="text-[10px] text-[#17392f]/40">Not configured</span>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://ycs.agoda.com/api/v1/ical/..."
                        value={feedsForm.Araliya.agodaUrl}
                        onChange={(e) => setFeedsForm({ ...feedsForm, Araliya: { ...feedsForm.Araliya, agodaUrl: e.target.value } })}
                        className="h-10 w-full rounded-lg border border-[#17392f]/15 bg-white px-3 text-xs outline-none focus:border-[#17392f]"
                      />
                    </div>
                  </div>

                  {/* Villa Olu Inbound Feeds */}
                  <div className="rounded-xl border border-[#17392f]/15 bg-[#fdfbf7] p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#17392f]/10 pb-3">
                      <span className="rounded-lg bg-[#a58e56]/15 px-3 py-1 text-xs font-bold text-[#806b39]">Villa Olu Feeds</span>
                      <span className="text-[11px] text-[#17392f]/50">
                        {syncData?.status?.Olu?.blockedDatesCount ?? 0} blocked night(s) detected
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-[#073b80]">Booking.com iCal URL</label>
                        {syncData?.status?.Olu?.channels?.booking?.configured ? (
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">● Connected ({syncData.status.Olu.channels.booking.eventCount} bookings)</span>
                        ) : (
                          <span className="text-[10px] text-[#17392f]/40">Not configured</span>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html?t=..."
                        value={feedsForm.Olu.bookingUrl}
                        onChange={(e) => setFeedsForm({ ...feedsForm, Olu: { ...feedsForm.Olu, bookingUrl: e.target.value } })}
                        className="h-10 w-full rounded-lg border border-[#17392f]/15 bg-white px-3 text-xs outline-none focus:border-[#17392f]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-[#c34d59]">Airbnb iCal URL</label>
                        {syncData?.status?.Olu?.channels?.airbnb?.configured ? (
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">● Connected ({syncData.status.Olu.channels.airbnb.eventCount} bookings)</span>
                        ) : (
                          <span className="text-[10px] text-[#17392f]/40">Not configured</span>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://www.airbnb.com/calendar/ical/...ics?s=..."
                        value={feedsForm.Olu.airbnbUrl}
                        onChange={(e) => setFeedsForm({ ...feedsForm, Olu: { ...feedsForm.Olu, airbnbUrl: e.target.value } })}
                        className="h-10 w-full rounded-lg border border-[#17392f]/15 bg-white px-3 text-xs outline-none focus:border-[#17392f]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-[#364e76]">Agoda iCal URL</label>
                        {syncData?.status?.Olu?.channels?.agoda?.configured ? (
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">● Connected ({syncData.status.Olu.channels.agoda.eventCount} bookings)</span>
                        ) : (
                          <span className="text-[10px] text-[#17392f]/40">Not configured</span>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://ycs.agoda.com/api/v1/ical/..."
                        value={feedsForm.Olu.agodaUrl}
                        onChange={(e) => setFeedsForm({ ...feedsForm, Olu: { ...feedsForm.Olu, agodaUrl: e.target.value } })}
                        className="h-10 w-full rounded-lg border border-[#17392f]/15 bg-white px-3 text-xs outline-none focus:border-[#17392f]"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Live Synchronized Calendar Status */}
              <section className="rounded-2xl border border-[#17392f]/10 bg-white/85 p-6 shadow-[0_16px_45px_rgba(23,57,47,.05)]">
                <div className="flex items-center justify-between border-b border-[#17392f]/10 pb-4">
                  <div>
                    <h3 className="font-serif text-xl">Current Channel Availability Status</h3>
                    <p className="text-xs text-[#17392f]/60">Summary of blocked reservations currently protecting Tranquil Terrace from overlaps.</p>
                  </div>
                  <span className="text-[11px] text-[#17392f]/50">
                    Last sync: {syncData?.status?.Araliya?.lastUpdated ? new Date(syncData.status.Araliya.lastUpdated).toLocaleTimeString() : "Just now"}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-[#17392f]/10 bg-[#fbf9f4] p-4">
                    <p className="text-[11px] text-[#17392f]/50 font-medium">Villa Araliya Total Blocked</p>
                    <strong className="mt-1 block font-serif text-2xl">{syncData?.status?.Araliya?.blockedDatesCount ?? 0} nights</strong>
                    <span className="mt-2 text-[10px] text-[#17392f]/40 block">{syncData?.status?.Araliya?.bookedRangesCount ?? 0} active reservations</span>
                  </div>
                  <div className="rounded-xl border border-[#17392f]/10 bg-[#fbf9f4] p-4">
                    <p className="text-[11px] text-[#17392f]/50 font-medium">Villa Olu Total Blocked</p>
                    <strong className="mt-1 block font-serif text-2xl">{syncData?.status?.Olu?.blockedDatesCount ?? 0} nights</strong>
                    <span className="mt-2 text-[10px] text-[#17392f]/40 block">{syncData?.status?.Olu?.bookedRangesCount ?? 0} active reservations</span>
                  </div>
                  <div className="rounded-xl border border-[#17392f]/10 bg-[#fbf9f4] p-4">
                    <p className="text-[11px] text-[#17392f]/50 font-medium">Supported OTAs</p>
                    <strong className="mt-1 block font-serif text-2xl">3 Platforms</strong>
                    <span className="mt-2 text-[10px] text-emerald-700 font-semibold block">Booking.com, Airbnb, Agoda</span>
                  </div>
                  <div className="rounded-xl border border-[#17392f]/10 bg-[#fbf9f4] p-4">
                    <p className="text-[11px] text-[#17392f]/50 font-medium">Sync Standard</p>
                    <strong className="mt-1 block font-serif text-2xl">RFC 5545 iCal</strong>
                    <span className="mt-2 text-[10px] text-[#17392f]/40 block">Universal hospitality standard</span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {open && <div className="fixed inset-0 z-[70] grid place-items-center bg-[#071b15]/60 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
        <form onSubmit={saveBooking} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#f8f5ed] shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#17392f]/10 bg-[#f8f5ed]/95 p-5 backdrop-blur"><div><p className="text-[10px] uppercase tracking-[.2em] text-[#17392f]/45">{editing ? editing.reference : "Manual reservation"}</p><h2 className="font-serif text-2xl">{editing ? "Booking details" : "Add a booking"}</h2></div><button type="button" onClick={() => setOpen(false)} className="rounded-full border border-[#17392f]/15 p-2"><X size={18}/></button></div>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field label="Guest name"><input required minLength={2} value={form.guestName} onChange={(e) => setForm({...form,guestName:e.target.value})}/></Field>
            <Field label="Phone / WhatsApp"><input required minLength={7} value={form.phone} onChange={(e) => setForm({...form,phone:e.target.value})}/></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})}/></Field>
            <Field label="Villa"><select value={form.villaName} onChange={(e) => setForm({...form,villaName:e.target.value})}>{villaNames.map((villa) => <option key={villa} value={villa}>{villa}</option>)}</select></Field>
            <Field label="Source"><select value={form.source} onChange={(e) => setForm({...form,source:e.target.value})}><option>manual</option><option>website</option><option>WhatsApp</option><option>Booking.com</option><option>Agoda</option><option>Airbnb</option><option>phone</option></select></Field>
            <Field label="Check-in"><input required type="date" value={form.checkin} onChange={(e) => setForm({...form,checkin:e.target.value})}/></Field>
            <Field label="Check-out"><input required type="date" min={form.checkin || undefined} value={form.checkout} onChange={(e) => setForm({...form,checkout:e.target.value})}/></Field>
            <Field label="Guests"><select value={form.guests} onChange={(e) => setForm({...form,guests:Number(e.target.value)})}>{[1,2].map((n) => <option key={n} value={n}>{n} guest{n === 1 ? "" : "s"}</option>)}</select></Field>
            <Field label="Booking status"><select value={form.status} onChange={(e) => setForm({...form,status:e.target.value as BookingStatus})}>{bookingStatuses.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></Field>
            <Field label="Total amount (LKR)"><input min="0" type="number" value={form.totalAmount} onChange={(e) => setForm({...form,totalAmount:Number(e.target.value)})}/></Field>
            <Field label="Paid amount (LKR)"><input min="0" type="number" value={form.paidAmount} onChange={(e) => setForm({...form,paidAmount:Number(e.target.value)})}/></Field>
            <Field label="Payment status"><select value={form.paymentStatus} onChange={(e) => setForm({...form,paymentStatus:e.target.value as PaymentStatus})}>{paymentStatuses.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></Field>
            <div className="hidden sm:block"/>
            <Field label="Guest request" wide><textarea rows={3} value={form.specialRequest} onChange={(e) => setForm({...form,specialRequest:e.target.value})}/></Field>
            <Field label="Private admin notes" wide><textarea rows={3} value={form.adminNotes} onChange={(e) => setForm({...form,adminNotes:e.target.value})}/></Field>
          </div>
          {error && <p className="mx-5 mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#17392f]/10 bg-[#f8f5ed]/95 p-5 backdrop-blur"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-[#17392f]/15 px-5 py-3 text-xs font-semibold">Cancel</button><button disabled={saving} className="flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#17392f] px-5 py-3 text-xs font-semibold text-white disabled:opacity-60">{saving && <LoaderCircle size={15} className="animate-spin"/>}{editing ? "Save changes" : "Add booking"}</button></div>
        </form>
      </div>}
    </div>
  );
}

function Field({ label: fieldLabel, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`block text-[10px] font-bold uppercase tracking-[.14em] text-[#17392f]/55 ${wide ? "sm:col-span-2" : ""}`}><span>{fieldLabel}</span><div className="mt-2 [&_input]:h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[#17392f]/15 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-normal [&_input]:tracking-normal [&_select]:h-11 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[#17392f]/15 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-normal [&_select]:tracking-normal [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[#17392f]/15 [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:text-sm [&_textarea]:font-normal [&_textarea]:tracking-normal">{children}</div></label>;
}
