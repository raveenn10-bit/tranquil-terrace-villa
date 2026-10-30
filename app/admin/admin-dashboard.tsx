"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import React, { FormEvent, useEffect, useMemo, useState, useRef } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  BedDouble,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Copy,
  CreditCard,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileDown,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  HelpCircle,
  Info,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import type { BookingRecord, BookingStatus, PaymentStatus, VillaName } from "@/lib/booking-types";
import { bookingStatuses, paymentStatuses, villaNames } from "@/lib/booking-types";
import {
  getAllBookings,
  saveBooking as dbSaveBooking,
  deleteBooking as dbDeleteBooking,
  getAllGuests,
  saveGuest as dbSaveGuest,
  deleteGuest as dbDeleteGuest,
  getStorageCounts,
  clearAllData,
  purgeLegacyDemoData,
  initialDemoBookings,
  initialDemoGuests,
  type GuestRecord,
} from "@/lib/admin-db";
import {
  formatDateDisplay,
  formatDateTimeDisplay,
  calculateNights,
  parseSafeDate,
  toIsoDateString,
  getTodayIsoDate,
  addDaysToDate,
  isRangeOverlapping,
  detectConflicts,
} from "@/lib/admin-date-utils";
import {
  parseIcsContent,
  generateIcsCalendar,
  downloadIcsFile,
} from "@/lib/admin-ics";
import {
  exportBackupJson,
  validateBackupJson,
  exportBookingsCsv,
  downloadFile,
  calculateFinancialSummary,
} from "@/lib/admin-backup";

type Props = { live: boolean; displayName: string; authHref: string };

type DashboardTab =
  | "reservations"
  | "calendar"
  | "ics-sync"
  | "financials"
  | "guests"
  | "analytics"
  | "backup";

type Currency = "LKR" | "USD";

const USD_EXCHANGE_RATE = 300; // 1 USD = 300 LKR

const blankBookingForm = {
  guestName: "",
  email: "",
  phone: "",
  villaName: "Araliya" as VillaName,
  checkin: "",
  checkout: "",
  guests: 2,
  source: "direct",
  status: "confirmed" as BookingStatus,
  paymentStatus: "unpaid" as PaymentStatus,
  totalAmount: 35000,
  paidAmount: 0,
  specialRequest: "",
  adminNotes: "",
  packageId: "night-package",
  timingOption: "",
};

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());

export function getBookingPackageTimings(packageId?: string, timingOption?: string) {
  if (packageId === "day-package") {
    return { checkin: "10:00 AM", checkout: "3:00 PM" };
  }
  if (packageId === "night-package") {
    return { checkin: "5:00 PM", checkout: "9:00 AM (Next Day)" };
  }
  if (packageId === "day-night-package") {
    if (timingOption === "B") {
      return { checkin: "5:00 PM", checkout: "3:00 PM (Next Day)" };
    }
    return { checkin: "11:00 AM", checkout: "9:00 AM (Next Day)" };
  }
  return { checkin: "10:00 AM / 5:00 PM", checkout: "3:00 PM / 9:00 AM" };
}

export default function AdminDashboard({ live, displayName, authHref }: Props) {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<DashboardTab>("reservations");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>("LKR");

  // Core Data state
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Dismissible Notice Banner
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  // Filter & Search state (Reservations Tab)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [villaFilter, setVillaFilter] = useState<"all" | "Araliya" | "Olu">("all");

  // Booking Modal (Add / Edit)
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null);
  const [bookingForm, setBookingForm] = useState({ ...blankBookingForm });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quick Payment Modal
  const [paymentModalBooking, setPaymentModalBooking] = useState<BookingRecord | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(0);
  const [paymentStatusInput, setPaymentStatusInput] = useState<PaymentStatus>("paid");

  // Invoice Modal
  const [invoiceModalBooking, setInvoiceModalBooking] = useState<BookingRecord | null>(null);

  // Message Generator Modal (WhatsApp & Email)
  const [messageModalBooking, setMessageModalBooking] = useState<BookingRecord | null>(null);
  const [messageTemplateType, setMessageTemplateType] = useState<"confirmation" | "reminder" | "arrival">("confirmation");
  const [customMessageBody, setCustomMessageBody] = useState("");
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Calendar View State
  const [calendarVilla, setCalendarVilla] = useState<"All" | "Araliya" | "Olu">("All");
  const todayDate = useMemo(() => new Date(), []);
  const [calendarYear, setCalendarYear] = useState<number>(todayDate.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(todayDate.getMonth()); // 0-indexed
  const [selectedDayBookings, setSelectedDayBookings] = useState<{ date: string; bookings: BookingRecord[] } | null>(null);

  // ICS Module State
  const [icsImportVilla, setIcsImportVilla] = useState<VillaName>("Araliya");
  const [icsImportSource, setIcsImportSource] = useState("Booking.com");
  const [icsRawText, setIcsRawText] = useState("");
  const [icsParsedEvents, setIcsParsedEvents] = useState<{ event: BookingRecord; conflicts: BookingRecord[]; selected: boolean }[]>([]);
  const [icsParsing, setIcsParsing] = useState(false);

  // Backup & Storage State
  const [backupRestoreFile, setBackupRestoreFile] = useState<File | null>(null);
  const [backupValidation, setBackupValidation] = useState<any>(null);
  const [backupRestoreMode, setBackupRestoreMode] = useState<"merge" | "replace">("merge");
  const [storageStats, setStorageStats] = useState<{ bookings: number; guests: number }>({ bookings: 0, guests: 0 });

  // Guest Directory State
  const [guestSearchQuery, setGuestSearchQuery] = useState("");
  const [selectedGuestForHistory, setSelectedGuestForHistory] = useState<GuestRecord | null>(null);
  const [editingGuestNotes, setEditingGuestNotes] = useState<GuestRecord | null>(null);
  const [guestNotesInput, setGuestNotesInput] = useState("");

  // ---------------------------------------------------------------------------
  // Database Data Loading
  // ---------------------------------------------------------------------------
  async function loadDataFromStorage() {
    try {
      await purgeLegacyDemoData();
    } catch {}
    setLoading(true);
    setError("");
    try {
      const storedBookings = await getAllBookings();
      setBookings(storedBookings);

      const storedGuests = await getAllGuests();
      setGuests(storedGuests);

      const counts = await getStorageCounts();
      setStorageStats(counts);
    } catch (err) {
      console.error("Storage error:", err);
      setError("Failed to load records from database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDataFromStorage();
  }, []);

  function showToast(msg: string) {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(""), 3500);
  }

  // Currency Formatter
  function formatMoney(amountLkr: number, curr = currency): string {
    const safeAmount = Number(amountLkr) || 0;
    if (curr === "USD") {
      const usd = safeAmount / USD_EXCHANGE_RATE;
      return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `Rs. ${new Intl.NumberFormat("en-LK").format(Math.round(safeAmount))}`;
  }

  // ---------------------------------------------------------------------------
  // Global Conflict Detection
  // ---------------------------------------------------------------------------
  const systemConflicts = useMemo(() => {
    const list: { villa: string; a: BookingRecord; b: BookingRecord }[] = [];
    const active = bookings.filter((b) => b.status !== "cancelled");
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const b1 = active[i];
        const b2 = active[j];
        if (b1.villaName.toLowerCase() === b2.villaName.toLowerCase()) {
          if (isRangeOverlapping(b1.checkin, b1.checkout, b2.checkin, b2.checkout)) {
            list.push({ villa: b1.villaName, a: b1, b: b2 });
          }
        }
      }
    }
    return list;
  }, [bookings]);

  // Real-time conflict checking in active Booking modal
  const formConflicts = useMemo(() => {
    if (!bookingForm.checkin || !bookingForm.checkout) return [];
    return detectConflicts(
      bookings,
      bookingForm.villaName,
      bookingForm.checkin,
      bookingForm.checkout,
      editingBooking?.id
    );
  }, [bookings, bookingForm.villaName, bookingForm.checkin, bookingForm.checkout, editingBooking?.id]);

  // ---------------------------------------------------------------------------
  // Financial Summary Aggregations
  // ---------------------------------------------------------------------------
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(bookings);
  }, [bookings]);

  // Filtered reservations
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      const matchesVilla = villaFilter === "all" || b.villaName === villaFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        b.guestName.toLowerCase().includes(query) ||
        b.reference.toLowerCase().includes(query) ||
        b.email.toLowerCase().includes(query) ||
        b.phone.toLowerCase().includes(query) ||
        b.villaName.toLowerCase().includes(query);
      return matchesStatus && matchesVilla && matchesSearch;
    });
  }, [bookings, statusFilter, villaFilter, searchQuery]);

  // Aggregated Guests list (syncing database guests with bookings)
  const aggregatedGuests = useMemo(() => {
    const guestMap = new Map<string, GuestRecord>();

    // Seed from stored guests
    for (const g of guests) {
      guestMap.set(g.id, { ...g });
    }

    // Accumulate from bookings
    for (const b of bookings) {
      const key = (b.email || b.phone || b.guestName).toLowerCase().trim();
      const existing = guestMap.get(key) || {
        id: `guest-${key.replace(/[^a-z0-9]/g, "-")}`,
        name: b.guestName,
        email: b.email,
        phone: b.phone,
        totalBookings: 0,
        totalSpentLKR: 0,
        lastStay: b.checkin,
        notes: "",
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };

      if (b.status !== "cancelled") {
        existing.totalBookings += 1;
        existing.totalSpentLKR += b.totalAmount || 0;
      }
      if (!existing.lastStay || b.checkin > existing.lastStay) {
        existing.lastStay = b.checkin;
      }
      if (!existing.email && b.email) existing.email = b.email;
      if (!existing.phone && b.phone) existing.phone = b.phone;

      guestMap.set(key, existing);
    }

    const result = Array.from(guestMap.values());
    if (!guestSearchQuery) return result;

    const q = guestSearchQuery.toLowerCase();
    return result.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.toLowerCase().includes(q)
    );
  }, [guests, bookings, guestSearchQuery]);

  // ---------------------------------------------------------------------------
  // Booking CRUD Handlers (Database)
  // ---------------------------------------------------------------------------
  function openNewBookingModal(defaultDate?: string) {
    setEditingBooking(null);
    const inDate = defaultDate || getTodayIsoDate();
    const outDate = addDaysToDate(inDate, 2);
    setBookingForm({
      ...blankBookingForm,
      checkin: inDate,
      checkout: outDate,
      totalAmount: 70000,
    });
    setBookingModalOpen(true);
  }

  function openEditBookingModal(booking: BookingRecord) {
    setEditingBooking(booking);
    setBookingForm({
      guestName: booking.guestName,
      email: booking.email,
      phone: booking.phone,
      villaName: booking.villaName,
      checkin: booking.checkin,
      checkout: booking.checkout,
      guests: booking.guests,
      source: booking.source,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalAmount: booking.totalAmount,
      paidAmount: booking.paidAmount,
      specialRequest: booking.specialRequest,
      adminNotes: booking.adminNotes,
      packageId: booking.packageId || "night-package",
      timingOption: booking.timingOption || "",
    });
    setBookingModalOpen(true);
  }

  async function handleSaveBooking(e: FormEvent) {
    e.preventDefault();
    if (!bookingForm.checkin || !bookingForm.checkout) {
      setError("Please select both check-in and check-out dates.");
      return;
    }
    if (bookingForm.checkout <= bookingForm.checkin) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const nowIso = new Date().toISOString();
      const reference =
        editingBooking?.reference ||
        `TTG-${Date.now().toString(36).toUpperCase().slice(-5)}`;

      const recordToSave: BookingRecord = {
        id: editingBooking?.id || `booking-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        reference,
        guestName: bookingForm.guestName.trim(),
        email: bookingForm.email.trim(),
        phone: bookingForm.phone.trim(),
        villaName: bookingForm.villaName,
        checkin: toIsoDateString(bookingForm.checkin),
        checkout: toIsoDateString(bookingForm.checkout),
        guests: Number(bookingForm.guests) || 2,
        source: bookingForm.source,
        status: bookingForm.status,
        paymentStatus: bookingForm.paymentStatus,
        totalAmount: Math.max(0, Number(bookingForm.totalAmount) || 0),
        paidAmount: Math.max(0, Number(bookingForm.paidAmount) || 0),
        specialRequest: bookingForm.specialRequest.trim(),
        adminNotes: bookingForm.adminNotes.trim(),
        packageId: bookingForm.packageId,
        timingOption: bookingForm.timingOption,
        createdAt: editingBooking?.createdAt || nowIso,
        updatedAt: nowIso,
      };

      await dbSaveBooking(recordToSave);

      // Auto update guest record in DB
      const guestKey = (recordToSave.email || recordToSave.phone || recordToSave.guestName).toLowerCase().trim();
      if (guestKey) {
        const guestId = `guest-${guestKey.replace(/[^a-z0-9]/g, "-")}`;
        await dbSaveGuest({
          id: guestId,
          name: recordToSave.guestName,
          email: recordToSave.email,
          phone: recordToSave.phone,
          totalBookings: 1,
          totalSpentLKR: recordToSave.totalAmount,
          lastStay: recordToSave.checkin,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }

      await loadDataFromStorage();
      setBookingModalOpen(false);
      showToast(editingBooking ? "Reservation updated successfully." : "New reservation created.");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save booking to database.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBooking(id: string) {
    try {
      await dbDeleteBooking(id);
      await loadDataFromStorage();
      setDeleteConfirmId(null);
      showToast("Reservation deleted.");
    } catch (err) {
      setError("Failed to delete booking.");
    }
  }

  async function handleQuickStatusChange(booking: BookingRecord, newStatus: BookingStatus) {
    try {
      const updated = { ...booking, status: newStatus, updatedAt: new Date().toISOString() };
      await dbSaveBooking(updated);
      await loadDataFromStorage();
      showToast(`Status updated to ${label(newStatus)}.`);
    } catch {
      setError("Failed to update status.");
    }
  }

  // Quick Payment Modal Handlers
  function openPaymentModal(b: BookingRecord) {
    setPaymentModalBooking(b);
    setPaymentAmountInput(b.paidAmount);
    setPaymentStatusInput(b.paymentStatus);
  }

  async function handleSavePayment() {
    if (!paymentModalBooking) return;
    try {
      const updated: BookingRecord = {
        ...paymentModalBooking,
        paidAmount: Math.max(0, Number(paymentAmountInput) || 0),
        paymentStatus: paymentStatusInput,
        updatedAt: new Date().toISOString(),
      };
      await dbSaveBooking(updated);
      await loadDataFromStorage();
      setPaymentModalBooking(null);
      showToast("Payment record updated successfully.");
    } catch {
      setError("Failed to update payment.");
    }
  }

  // ---------------------------------------------------------------------------
  // WhatsApp & Email Message Generator
  // ---------------------------------------------------------------------------
  function openMessageGenerator(b: BookingRecord) {
    setMessageModalBooking(b);
    setMessageTemplateType("confirmation");
    buildTemplateText(b, "confirmation");
    setCopiedNotice(false);
  }

  function buildTemplateText(b: BookingRecord, type: "confirmation" | "reminder" | "arrival") {
    const nightsCount = calculateNights(b.checkin, b.checkout);
    const balanceLkr = Math.max(0, b.totalAmount - b.paidAmount);
    const balanceFormatted = formatMoney(balanceLkr);
    const totalFormatted = formatMoney(b.totalAmount);
    const paidFormatted = formatMoney(b.paidAmount);
    const inDateDisplay = formatDateDisplay(b.checkin, { monthFormat: "short", showDayOfWeek: true });
    const outDateDisplay = formatDateDisplay(b.checkout, { monthFormat: "short", showDayOfWeek: true });

    const bTimings = getBookingPackageTimings(b.packageId, b.timingOption);

    let text = "";
    if (type === "confirmation") {
      text =
`Dear ${b.guestName},

Warm greetings from Tranquil Terrace Galle!
We are pleased to confirm your reservation.

✦ RESERVATION DETAILS:
• Booking Reference: ${b.reference}
• Villa: Villa ${b.villaName}
• Check-in: ${inDateDisplay} (${bTimings.checkin})
• Check-out: ${outDateDisplay} (${bTimings.checkout})
• Stay Duration: ${nightsCount} night(s)
• Guests: ${b.guests}

✦ PAYMENT SUMMARY:
• Total Amount: ${totalFormatted}
• Advance Received: ${paidFormatted}
• Balance Due on Arrival: ${balanceFormatted}

✦ LOCATION & ARRIVAL:
Tranquil Terrace, Galle, Southern Province, Sri Lanka
Google Maps Location: https://maps.app.goo.gl/RJAmGePoCYyHsJYX8

Should you require airport transfers or special dining arrangements, please do not hesitate to contact us.

Warm regards,
Tranquil Terrace Galle Concierge
+94 77 068 2366`;
    } else if (type === "reminder") {
      text =
`Dear ${b.guestName},

Greetings from Tranquil Terrace Galle!
This is a gentle reminder regarding your upcoming stay at Villa ${b.villaName} (Ref: ${b.reference}) from ${inDateDisplay} to ${outDateDisplay}.

✦ OUTSTANDING BALANCE:
• Total Amount: ${totalFormatted}
• Paid to Date: ${paidFormatted}
• Outstanding Balance: ${balanceFormatted}

Payment can be completed via bank transfer or settled in cash (LKR or USD) upon your arrival.

Bank Transfer Details:
Bank: Commercial Bank of Ceylon
Account Name: Tranquil Terrace Galle (Pvt) Ltd
Account No: 1000 8923 4410
Branch: Galle Fort

Please share the payment receipt once processed. Thank you!

Warm regards,
Tranquil Terrace Galle`;
    } else {
      text =
`Dear ${b.guestName},

We are excited to welcome you to Tranquil Terrace Galle!

✦ ARRIVAL INFORMATION:
• Check-in Time: ${bTimings.checkin}
• Villa: Villa ${b.villaName}
• Wi-Fi Network: TranquilTerrace_Guest
• Wi-Fi Password: GalleLuxury2026

✦ DIRECTIONS:
Our sanctuary is located just 10 minutes inland from the historic Galle Fort:
Google Maps: https://maps.app.goo.gl/RJAmGePoCYyHsJYX8

Our Villa Host will greet you with a chilled king coconut welcome drink upon your arrival. If you need any assistance on the way, call us directly at +94 77 068 2366.

Safe travels!
Tranquil Terrace Galle Team`;
    }

    setCustomMessageBody(text);
  }

  function handleCopyMessage() {
    navigator.clipboard.writeText(customMessageBody);
    setCopiedNotice(true);
    showToast("Message copied to clipboard!");
    window.setTimeout(() => setCopiedNotice(false), 2500);
  }

  function handleSendWhatsApp(phone: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessageBody)}`;
    window.open(url, "_blank");
  }

  function handleSendEmail(email: string, ref: string) {
    const subject = `Tranquil Terrace Galle - Reservation ${ref}`;
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(customMessageBody)}`;
    window.location.href = url;
  }

  // ---------------------------------------------------------------------------
  // ICS Parser & Import Handlers
  // ---------------------------------------------------------------------------
  function handleParseIcs() {
    if (!icsRawText.trim()) {
      setError("Please paste ICS calendar content or upload a .ics file.");
      return;
    }
    setIcsParsing(true);
    setError("");

    try {
      const parsed = parseIcsContent(icsRawText, icsImportVilla, icsImportSource);
      if (parsed.length === 0) {
        setError("No valid VEVENT blocks found in the provided ICS content.");
        setIcsParsedEvents([]);
        return;
      }

      const eventsWithConflicts = parsed.map((item) => {
        const conflicts = detectConflicts(bookings, icsImportVilla, item.checkin, item.checkout);
        return {
          event: item,
          conflicts,
          selected: true,
        };
      });

      setIcsParsedEvents(eventsWithConflicts);
      showToast(`Parsed ${parsed.length} reservations from calendar.`);
    } catch (err) {
      setError("Failed to parse ICS file. Please check RFC 5545 format.");
    } finally {
      setIcsParsing(false);
    }
  }

  async function handleImportSelectedIcsEvents() {
    const toImport = icsParsedEvents.filter((item) => item.selected);
    if (toImport.length === 0) {
      setError("Please select at least one event to import.");
      return;
    }

    setSaving(true);
    try {
      for (const item of toImport) {
        await dbSaveBooking(item.event);
      }
      await loadDataFromStorage();
      setIcsParsedEvents([]);
      setIcsRawText("");
      showToast(`Successfully imported ${toImport.length} reservations into Villa ${icsImportVilla}!`);
    } catch {
      setError("Failed to save imported reservations into database.");
    } finally {
      setSaving(false);
    }
  }

  function handleFileUploadIcs(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setIcsRawText(content);
      showToast(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  }

  // ---------------------------------------------------------------------------
  // Backup & Restore Handlers
  // ---------------------------------------------------------------------------
  function handleExportJsonBackup() {
    exportBackupJson(bookings, guests, [], true);
    showToast("JSON backup downloaded successfully.");
  }

  function handleExportCsv() {
    exportBookingsCsv(bookings, true);
    showToast("Bookings CSV downloaded successfully.");
  }

  function handleSelectBackupFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupRestoreFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateBackupJson(content);
      setBackupValidation(validation);
      if (!validation.valid) {
        setError(`Backup validation failed: ${validation.error}`);
      } else {
        showToast(`Backup verified: ${validation.data?.bookings.length} bookings ready to restore.`);
      }
    };
    reader.readAsText(file);
  }

  async function handleConfirmRestoreBackup() {
    if (!backupValidation?.valid || !backupValidation.data) {
      setError("Cannot restore an invalid backup payload.");
      return;
    }

    setSaving(true);
    try {
      if (backupRestoreMode === "replace") {
        await clearAllData();
      }

      for (const b of backupValidation.data.bookings) {
        await dbSaveBooking(b);
      }
      for (const g of backupValidation.data.guests) {
        await dbSaveGuest(g);
      }

      await loadDataFromStorage();
      setBackupRestoreFile(null);
      setBackupValidation(null);
      showToast("Database restored successfully from backup.");
    } catch {
      setError("Failed to restore backup into database.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetToDemoData() {
    if (!confirm("Are you sure you want to clear all reservation and guest records? All bookings and guest entries will be permanently erased for a completely clean database.")) return;
    setSaving(true);
    try {
      await clearAllData();
      await purgeLegacyDemoData();
      await loadDataFromStorage();
      showToast("All reservation and guest records cleared.");
    } catch {
      setError("Failed to clear database.");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Calendar Grid Computations
  // ---------------------------------------------------------------------------
  const calendarDaysMatrix = useMemo(() => {
    const firstDayDate = new Date(calendarYear, calendarMonth, 1);
    // Convert Sunday=0 to Monday=0
    const startDayIndex = (firstDayDate.getDay() + 6) % 7;
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Leading days from previous month
    const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(calendarYear, calendarMonth - 1, d);
      days.push({
        dateStr: toIsoDateString(prevDate),
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(calendarYear, calendarMonth, d);
      days.push({
        dateStr: toIsoDateString(currDate),
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Trailing days to complete weeks (multiples of 7)
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextDate = new Date(calendarYear, calendarMonth + 1, d);
        days.push({
          dateStr: toIsoDateString(nextDate),
          dayNum: d,
          isCurrentMonth: false,
        });
      }
    }

    return days;
  }, [calendarYear, calendarMonth]);

  function prevMonth() {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  }

  function goToToday() {
    const now = new Date();
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth());
  }

  // ---------------------------------------------------------------------------
  // Analytics Dashboard Calculations
  // ---------------------------------------------------------------------------
  const analyticsData = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => ["confirmed", "checked_in"].includes(b.status)).length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const cancelRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : "0.0";

    const totalNights = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + calculateNights(b.checkin, b.checkout), 0);

    const avgStay = confirmed > 0 ? (totalNights / confirmed).toFixed(1) : "0.0";
    const adrLkr = totalNights > 0 ? Math.round(financialSummary.totalRevenueLKR / totalNights) : 0;

    // Villa comparison
    const araliyaBookings = bookings.filter((b) => b.villaName === "Araliya" && b.status !== "cancelled");
    const oluBookings = bookings.filter((b) => b.villaName === "Olu" && b.status !== "cancelled");

    const araliyaNights = araliyaBookings.reduce((sum, b) => sum + calculateNights(b.checkin, b.checkout), 0);
    const oluNights = oluBookings.reduce((sum, b) => sum + calculateNights(b.checkin, b.checkout), 0);
    const araliyaRevenue = araliyaBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const oluRevenue = oluBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    // Monthly revenue distribution (last 6 months)
    const monthBuckets: Record<string, { label: string; revenue: number; nights: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(calendarYear, calendarMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const labelStr = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthBuckets[key] = { label: labelStr, revenue: 0, nights: 0 };
    }

    for (const b of bookings) {
      if (b.status === "cancelled") continue;
      const ym = b.checkin.slice(0, 7);
      if (monthBuckets[ym]) {
        monthBuckets[ym].revenue += b.totalAmount;
        monthBuckets[ym].nights += calculateNights(b.checkin, b.checkout);
      }
    }

    const monthlyTrends = Object.values(monthBuckets);
    const maxMonthlyRevenue = Math.max(...monthlyTrends.map((m) => m.revenue), 100000);

    // Sources breakdown
    const sourceCounts: Record<string, number> = {};
    for (const b of bookings) {
      const src = b.source ? label(b.source) : "Direct";
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    }

    return {
      total,
      confirmed,
      cancelled,
      cancelRate,
      totalNights,
      avgStay,
      adrLkr,
      araliyaNights,
      oluNights,
      araliyaRevenue,
      oluRevenue,
      monthlyTrends,
      maxMonthlyRevenue,
      sourceCounts,
    };
  }, [bookings, financialSummary, calendarYear, calendarMonth]);

  // ---------------------------------------------------------------------------
  // Luxury Print-Ready Invoice Styles
  // ---------------------------------------------------------------------------
  function triggerPrintInvoice() {
    window.print();
  }

  // ---------------------------------------------------------------------------
  // RENDER MAIN COMPONENT
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#183D32] antialiased selection:bg-[#C8A45D]/30 selection:text-[#183D32]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed right-6 top-6 z-[100] flex items-center gap-3 rounded-xl border border-[#C8A45D]/40 bg-[#FFFFFF] px-5 py-3.5 text-sm text-[#183D32] shadow-[0_12px_40px_rgba(24,61,50,0.12)] backdrop-blur-md transition-all">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#183D32] text-white">
            <Check size={13} strokeWidth={3} />
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Print Styling for Invoice Modal */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #111111 !important;
          }
          .no-print {
            display: none !important;
          }
          .invoice-printable {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 15mm 20mm !important;
            background: #ffffff !important;
            color: #111111 !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 999999 !important;
            display: block !important;
          }
          .invoice-printable * {
            color: #111111 !important;
          }
          .invoice-gold-text {
            color: #93712d !important;
          }
          .invoice-gold-bg {
            background-color: #f7f3ea !important;
            border-color: #d1b578 !important;
          }
        }
      `}</style>

      {/* ----------------------------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION (Desktop & Mobile Drawer)                           */}
      {/* ----------------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col justify-between border-r border-[#E5DFD3] bg-[#FFFFFF] p-6 text-[#183D32] transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo / Header */}
          <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-5">
            <a href="/" className="group block">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C8A45D]/40 bg-[#C8A45D]/10 font-serif text-lg font-bold text-[#C8A45D]">
                  TT
                </span>
                <div>
                  <span className="block font-serif text-base tracking-wide text-[#183D32]">
                    Tranquil Terrace
                  </span>
                  <span className="block text-[10px] uppercase tracking-[0.25em] text-[#C8A45D]">
                    Galle · Sri Lanka
                  </span>
                </div>
              </div>
            </a>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1.5 text-[#5A6660] hover:bg-[#F8F6F0] lg:hidden"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Local Storage Engine Badge */}
          <div className="mt-5 rounded-xl border border-[#C8A45D]/20 bg-[#FFFFFF] p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[11px] font-medium text-[#C8A45D]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C8A45D] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C8A45D]"></span>
                </span>
                Supabase Cloud Engine
              </span>
              <span className="text-[10px] text-[#5A6660]">Cloud Active</span>
            </div>
            <p className="mt-1.5 text-[10px] text-[#5A6660]">
              {bookings.length} reservations · {aggregatedGuests.length} guests stored
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {[
              { id: "reservations", name: "Reservations", icon: LayoutDashboard },
              { id: "calendar", name: "Multi-View Calendar", icon: CalendarDays },
              { id: "ics-sync", name: "OTA & ICS Sync", icon: RefreshCw },
              { id: "financials", name: "Payment & Revenue", icon: CircleDollarSign },
              { id: "guests", name: "Guest Directory", icon: Users },
              { id: "analytics", name: "Villa Analytics", icon: TrendingUp },
              { id: "backup", name: "Backup & Data", icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as DashboardTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "border border-[#183D32]/25 bg-[#183D32]/10 text-[#183D32] font-semibold shadow-xs"
                      : "text-[#5A6660] hover:bg-[#F8F6F0] hover:text-[#183D32]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? "text-[#183D32]" : "text-[#7A8882]"} />
                    {tab.name}
                  </span>
                  {tab.id === "calendar" && systemConflicts.length > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-400">
                      !
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-6 border-t border-[#E5DFD3]">
          <button
            onClick={() => openNewBookingModal()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C8A45D] to-[#DFBF7A] py-3 text-xs font-semibold text-[#131514] shadow-lg transition-transform hover:opacity-95 active:scale-95"
          >
            <Plus size={16} /> New Reservation
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#E5DFD3] py-2.5 text-xs text-[#5A6660] hover:bg-[#F8F6F0] hover:text-[#183D32] transition-colors"
          >
            <Eye size={15} /> View Guest Website
          </a>

          <div className="flex items-center justify-between pt-2 text-xs text-[#7A8882]">
            <span className="truncate">Host: {displayName}</span>
            <a
              href={authHref}
              className="flex items-center gap-1.5 text-xs text-[#C8A45D] hover:underline"
            >
              <LogOut size={13} /> Sign Out
            </a>
          </div>
        </div>
      </aside>

      {/* ----------------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA                                                      */}
      {/* ----------------------------------------------------------------------- */}
      <main className="min-h-screen lg:ml-[280px]">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#E5DFD3] bg-[#FDFBF7]/90 px-6 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-[#E5DFD3] p-2 text-[#183D32] hover:bg-[#F8F6F0] lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C8A45D]">
                Tranquil Terrace Admin
              </p>
              <h1 className="font-serif text-xl sm:text-2xl text-[#183D32]">
                {activeTab === "reservations" && "Reservation Management"}
                {activeTab === "calendar" && "Multi-View Calendar"}
                {activeTab === "ics-sync" && "OTA & iCalendar Synchronization"}
                {activeTab === "financials" && "Financial Overview & Balance"}
                {activeTab === "guests" && "Guest Directory & CRM"}
                {activeTab === "analytics" && "Villa Performance Analytics"}
                {activeTab === "backup" && "Database Backup & Restore"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Toggle */}
            <div className="flex items-center rounded-xl border border-[#E5DFD3] bg-[#F8F6F0] p-1">
              <button
                onClick={() => setCurrency("LKR")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  currency === "LKR"
                    ? "bg-[#C8A45D] text-[#131514] shadow"
                    : "text-[#5A6660] hover:text-[#183D32]"
                }`}
              >
                LKR
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  currency === "USD"
                    ? "bg-[#C8A45D] text-[#131514] shadow"
                    : "text-[#5A6660] hover:text-[#183D32]"
                }`}
              >
                USD
              </button>
            </div>

            {/* Quick Actions */}
            <button
              onClick={handleExportJsonBackup}
              title="Download JSON Backup"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#E5DFD3] bg-[#FFFFFF] px-3 py-2 text-xs text-[#183D32] hover:border-[#C8A45D]/40 hover:text-[#183D32] transition-colors"
            >
              <Download size={15} /> Backup
            </button>

            <button
              onClick={() => openNewBookingModal()}
              className="flex items-center gap-2 rounded-xl bg-[#C8A45D] px-4 py-2 text-xs font-semibold text-[#131514] hover:bg-[#DFBF7A] transition-colors"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Add Booking</span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="mx-auto max-w-7xl p-5 sm:p-8">
          {/* Module 11/10: Prominent Local Browser Storage Disclosure Banner */}
          {!noticeDismissed && (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#C8A45D]/30 bg-[#FFFFFF] p-5 sm:flex-row sm:items-center sm:justify-between shadow-lg">
              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#C8A45D]/15 text-[#C8A45D]">
                  <ShieldAlert size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-[#183D32]">
                    ✦ CLOUD DATABASE STORAGE:
                  </p>
                  <p className="mt-0.5 text-xs text-[#5A6660]">
                    Bookings and records are securely synchronized with Supabase Cloud Database. You can export JSON backups anytime for archival safety.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                <button
                  onClick={handleExportJsonBackup}
                  className="rounded-xl border border-[#C8A45D]/40 bg-[#C8A45D]/10 px-3.5 py-1.5 text-xs font-medium text-[#C8A45D] hover:bg-[#C8A45D]/20 transition-colors"
                >
                  Export Backup
                </button>
                <button
                  onClick={() => setNoticeDismissed(true)}
                  className="rounded-lg p-1.5 text-[#5A6660] hover:bg-[#F8F6F0] hover:text-[#183D32]"
                  aria-label="Dismiss notice"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Conflict Alert Banner if any detected */}
          {systemConflicts.length > 0 && (
            <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                    <AlertTriangle size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-rose-300">
                      ⚠️ Overlapping Reservation Conflicts Detected ({systemConflicts.length})
                    </h3>
                    <p className="mt-1 text-xs text-rose-200/80">
                      Two or more reservations overlap on the same villa dates. Please review and resolve.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {systemConflicts.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 rounded-lg bg-rose-900/40 px-3 py-1 text-xs text-rose-200 border border-rose-700/40"
                        >
                          Villa {item.villa}: Ref {item.a.reference} ↔ {item.b.reference}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("calendar")}
                  className="rounded-xl bg-rose-500/20 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 transition-colors"
                >
                  View on Calendar
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-200">
                <X size={16} />
              </button>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 1: RESERVATIONS MODULE                                         */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === "reservations" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5 shadow-sm">
                  <div className="flex items-center justify-between text-[#5A6660]">
                    <span className="text-xs uppercase tracking-wider">Total Bookings</span>
                    <CalendarDays size={18} className="text-[#C8A45D]" />
                  </div>
                  <div className="mt-3 font-serif text-3xl font-medium text-[#183D32]">
                    {bookings.length}
                  </div>
                  <p className="mt-2 text-[11px] text-[#7A8882]">All registered stays</p>
                </div>

                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5 shadow-sm">
                  <div className="flex items-center justify-between text-[#5A6660]">
                    <span className="text-xs uppercase tracking-wider">Active Bookings</span>
                    <BedDouble size={18} className="text-emerald-400" />
                  </div>
                  <div className="mt-3 font-serif text-3xl font-medium text-emerald-400">
                    {bookings.filter((b) => ["confirmed", "checked_in"].includes(b.status)).length}
                  </div>
                  <p className="mt-2 text-[11px] text-[#7A8882]">Confirmed & Checked-in</p>
                </div>

                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5 shadow-sm">
                  <div className="flex items-center justify-between text-[#5A6660]">
                    <span className="text-xs uppercase tracking-wider">Pending Balances</span>
                    <CreditCard size={18} className="text-amber-400" />
                  </div>
                  <div className="mt-3 font-serif text-3xl font-medium text-amber-400">
                    {formatMoney(financialSummary.pendingRevenueLKR)}
                  </div>
                  <p className="mt-2 text-[11px] text-[#7A8882]">Awaiting guest settlement</p>
                </div>

                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5 shadow-sm">
                  <div className="flex items-center justify-between text-[#5A6660]">
                    <span className="text-xs uppercase tracking-wider">Total Collected</span>
                    <CircleDollarSign size={18} className="text-[#C8A45D]" />
                  </div>
                  <div className="mt-3 font-serif text-3xl font-medium text-[#C8A45D]">
                    {formatMoney(financialSummary.paidRevenueLKR)}
                  </div>
                  <p className="mt-2 text-[11px] text-[#7A8882]">Gross advance payments</p>
                </div>
              </div>

              {/* Reservations Table Box */}
              <div className="overflow-hidden rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] shadow-xl">
                {/* Search & Filter Header */}
                <div className="flex flex-col gap-4 border-b border-[#E5DFD3] p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="font-serif text-xl text-[#183D32]">Reservation Records</h2>
                    <p className="text-xs text-[#5A6660]">
                      Showing {filteredBookings.length} of {bookings.length} reservations
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search */}
                    <div className="flex items-center gap-2 rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3 py-1.5">
                      <Search size={15} className="text-[#5A6660]" />
                      <input
                        type="text"
                        placeholder="Search guest, phone, ref..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48 bg-transparent text-xs text-[#183D32] placeholder-zinc-500 outline-none"
                      />
                    </div>

                    {/* Villa Filter */}
                    <select
                      value={villaFilter}
                      onChange={(e) => setVillaFilter(e.target.value as any)}
                      className="rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3 py-2 text-xs text-[#183D32] outline-none"
                    >
                      <option value="all">All Villas</option>
                      <option value="Araliya">Villa Araliya</option>
                      <option value="Olu">Villa Olu</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3 py-2 text-xs text-[#183D32] outline-none"
                    >
                      <option value="all">All Statuses</option>
                      {bookingStatuses.map((s) => (
                        <option key={s} value={s}>
                          {label(s)}
                        </option>
                      ))}
                    </select>

                    {/* CSV Export */}
                    <button
                      onClick={handleExportCsv}
                      className="flex items-center gap-1.5 rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs font-semibold text-[#183D32] hover:text-[#183D32] transition-colors"
                    >
                      <Download size={14} /> CSV
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left text-xs">
                    <thead className="border-b border-[#E5DFD3] bg-[#FDFBF7]/60 text-[10px] uppercase tracking-wider text-[#5A6660]">
                      <tr>
                        <th className="px-5 py-4">Guest & Ref</th>
                        <th className="px-4 py-4">Villa</th>
                        <th className="px-4 py-4">Stay Dates</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Payment</th>
                        <th className="px-4 py-4">Total / Balance</th>
                        <th className="px-4 py-4">Source</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2F2C]/60 text-[#183D32]">
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="p-16 text-center text-[#5A6660]">
                            <LoaderCircle className="mx-auto animate-spin" size={24} />
                            <p className="mt-2 text-xs">Loading database records...</p>
                          </td>
                        </tr>
                      ) : filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-16 text-center text-[#7A8882]">
                            <Calendar className="mx-auto text-zinc-600 mb-2" size={28} />
                            <p className="text-sm font-semibold text-[#183D32]">No reservations in database.</p>
                            <p className="text-xs text-[#7A8882] mt-1">
                              Your database is clean and ready. Click "+ New Reservation" or import a calendar to add bookings.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => {
                          const nightsCount = calculateNights(b.checkin, b.checkout);
                          const balanceDue = Math.max(0, b.totalAmount - b.paidAmount);

                          // Check if this booking has an overlap conflict
                          const hasConflict = detectConflicts(
                            bookings,
                            b.villaName,
                            b.checkin,
                            b.checkout,
                            b.id
                          ).length > 0;

                          return (
                            <tr
                              key={b.id}
                              className={`hover:bg-[#FAF8F5] transition-colors ${
                                hasConflict ? "bg-rose-950/10" : ""
                              }`}
                            >
                              {/* Guest info */}
                              <td className="px-5 py-4">
                                <button
                                  onClick={() => openEditBookingModal(b)}
                                  className="text-left group"
                                >
                                  <span className="block font-medium text-[#183D32] group-hover:text-[#C8A45D] transition-colors">
                                    {b.guestName}
                                  </span>
                                  <span className="block text-[11px] text-[#7A8882]">
                                    Ref: {b.reference} · {b.phone || b.email || "No contact"}
                                  </span>
                                </button>
                                {hasConflict && (
                                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400">
                                    <AlertTriangle size={11} /> Overlapping Stay
                                  </span>
                                )}
                              </td>

                              {/* Villa */}
                              <td className="px-4 py-4">
                                <span className="inline-flex rounded-lg border border-[#C8A45D]/30 bg-[#C8A45D]/10 px-2.5 py-1 text-[11px] font-medium text-[#C8A45D]">
                                  Villa {b.villaName}
                                </span>
                              </td>

                              {/* Stay Dates */}
                              <td className="px-4 py-4">
                                <span className="block text-[#183D32]">
                                  {formatDateDisplay(b.checkin)} → {formatDateDisplay(b.checkout)}
                                </span>
                                <span className="block text-[11px] text-[#7A8882]">
                                  {nightsCount} night{nightsCount === 1 ? "" : "s"} · {b.guests} guest{b.guests === 1 ? "" : "s"}
                                </span>
                              </td>

                              {/* Status Dropdown */}
                              <td className="px-4 py-4">
                                <select
                                  value={b.status}
                                  onChange={(e) =>
                                    handleQuickStatusChange(b, e.target.value as BookingStatus)
                                  }
                                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium outline-none ${
                                    b.status === "confirmed"
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                      : b.status === "checked_in"
                                      ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                                      : b.status === "cancelled"
                                      ? "border-rose-200 bg-rose-50 text-rose-800"
                                      : b.status === "inquiry"
                                      ? "border-sky-200 bg-sky-50 text-sky-800"
                                      : "border-amber-200 bg-amber-50 text-amber-800"
                                  }`}
                                >
                                  {bookingStatuses.map((s) => (
                                    <option key={s} value={s} className="bg-[#FFFFFF] text-white">
                                      {label(s)}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Payment Status */}
                              <td className="px-4 py-4">
                                <button
                                  onClick={() => openPaymentModal(b)}
                                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                                    b.paymentStatus === "paid"
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                      : b.paymentStatus === "partial"
                                      ? "border-amber-200 bg-amber-50 text-amber-800"
                                      : b.paymentStatus === "refunded"
                                      ? "border-zinc-700 bg-zinc-800 text-[#5A6660]"
                                      : "border-rose-500/30 bg-rose-950/50 text-rose-300"
                                  }`}
                                >
                                  {label(b.paymentStatus)}
                                </button>
                              </td>

                              {/* Total & Balance */}
                              <td className="px-4 py-4">
                                <span className="block font-medium text-[#183D32]">
                                  {formatMoney(b.totalAmount)}
                                </span>
                                <span
                                  className={`block text-[11px] ${
                                    balanceDue > 0 ? "text-amber-400" : "text-[#7A8882]"
                                  }`}
                                >
                                  {balanceDue > 0 ? `Due: ${formatMoney(balanceDue)}` : "Fully Paid"}
                                </span>
                              </td>

                              {/* Source */}
                              <td className="px-4 py-4">
                                <span className="capitalize text-[#5A6660]">{b.source}</span>
                              </td>

                              {/* Actions */}
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* WhatsApp / Email Generator */}
                                  <button
                                    onClick={() => openMessageGenerator(b)}
                                    title="Open WhatsApp & Email Generator"
                                    className="rounded-lg border border-[#E5DFD3] p-1.5 text-[#5A6660] hover:border-[#C8A45D]/40 hover:text-[#C8A45D] transition-colors"
                                  >
                                    <MessageSquare size={14} />
                                  </button>

                                  {/* Branded PDF Invoice */}
                                  <button
                                    onClick={() => setInvoiceModalBooking(b)}
                                    title="Generate 5-Star PDF Invoice"
                                    className="rounded-lg border border-[#E5DFD3] p-1.5 text-[#5A6660] hover:border-[#C8A45D]/40 hover:text-[#C8A45D] transition-colors"
                                  >
                                    <Printer size={14} />
                                  </button>

                                  {/* Edit Booking */}
                                  <button
                                    onClick={() => openEditBookingModal(b)}
                                    title="Edit Reservation"
                                    className="rounded-lg border border-[#E5DFD3] p-1.5 text-[#5A6660] hover:border-[#C8A45D]/40 hover:text-[#183D32] transition-colors"
                                  >
                                    <ChevronRight size={14} />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={() => setDeleteConfirmId(b.id)}
                                    title="Delete Reservation"
                                    className="rounded-lg border border-[#E5DFD3] p-1.5 text-[#5A6660] hover:border-rose-500/40 hover:text-rose-400 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 2: ADVANCED MULTI-VIEW CALENDAR MODULE                         */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              {/* Calendar Controls Bar */}
              <div className="flex flex-col gap-4 rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5 sm:flex-row sm:items-center sm:justify-between shadow-lg">
                {/* Villa Filter Tabs */}
                <div className="flex items-center rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-1">
                  {(["All", "Araliya", "Olu"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setCalendarVilla(v)}
                      className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                        calendarVilla === v
                          ? "bg-[#C8A45D] text-[#131514] shadow"
                          : "text-[#5A6660] hover:text-[#183D32]"
                      }`}
                    >
                      {v === "All" ? "All Villas" : `Villa ${v}`}
                    </button>
                  ))}
                </div>

                {/* Month Navigation */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={prevMonth}
                    className="rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-2 text-[#183D32] hover:border-[#C8A45D]/40 hover:text-[#183D32] transition-colors"
                    aria-label="Previous Month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-serif text-lg font-medium text-[#183D32] min-w-44 text-center">
                    {new Date(calendarYear, calendarMonth, 1).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-2 text-[#183D32] hover:border-[#C8A45D]/40 hover:text-[#183D32] transition-colors"
                    aria-label="Next Month"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={goToToday}
                    className="rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3 py-2 text-xs font-semibold text-[#183D32] hover:border-[#C8A45D]/40 hover:text-[#183D32] transition-colors"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Status Color Legend */}
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#5A6660]">
                <span className="font-semibold text-[#7A8882] uppercase tracking-wider text-[10px]">
                  Status Guide:
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Confirmed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Pending
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span> Checked-in
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span> Inquiry
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Conflict Warning
                </span>
              </div>

              {/* Calendar Month Grid */}
              <div className="overflow-hidden rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] shadow-xl">
                {/* Day Headers (Mon to Sun) */}
                <div className="grid grid-cols-7 border-b border-[#E5DFD3] bg-[#FDFBF7]/70 text-center text-xs font-semibold uppercase tracking-wider text-[#5A6660] py-3">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#2A2F2C]/60 bg-[#FFFFFF]">
                  {calendarDaysMatrix.map((cell, idx) => {
                    const isToday = cell.dateStr === getTodayIsoDate();

                    // Find bookings occupying this date
                    const dayBookings = bookings.filter((b) => {
                      if (b.status === "cancelled") return false;
                      if (calendarVilla !== "All" && b.villaName !== calendarVilla) return false;
                      // Occupied if checkin <= dateStr < checkout
                      return b.checkin <= cell.dateStr && b.checkout > cell.dateStr;
                    });

                    // Detect if multiple active bookings exist for same villa on this date
                    const araliyaCount = dayBookings.filter((b) => b.villaName === "Araliya").length;
                    const oluCount = dayBookings.filter((b) => b.villaName === "Olu").length;
                    const hasDayConflict = araliyaCount > 1 || oluCount > 1;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (dayBookings.length > 0) {
                            setSelectedDayBookings({ date: cell.dateStr, bookings: dayBookings });
                          } else {
                            openNewBookingModal(cell.dateStr);
                          }
                        }}
                        className={`group relative min-h-[110px] p-2 transition-colors cursor-pointer ${
                          !cell.isCurrentMonth
                            ? "bg-[#FDFBF7]/40 text-zinc-600"
                            : "hover:bg-[#F8F6F0]/40"
                        } ${isToday ? "ring-1 ring-[#C8A45D]/60 bg-[#C8A45D]/5" : ""}`}
                      >
                        {/* Day Number Header */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                              isToday
                                ? "bg-[#C8A45D] font-bold text-[#131514]"
                                : cell.isCurrentMonth
                                ? "text-[#183D32]"
                                : "text-zinc-600"
                            }`}
                          >
                            {cell.dayNum}
                          </span>

                          {hasDayConflict && (
                            <span
                              title="Double Booking Conflict on this date!"
                              className="flex items-center gap-1 rounded bg-rose-500/20 px-1 py-0.5 text-[9px] font-bold text-rose-400 border border-rose-500/30"
                            >
                              <AlertTriangle size={10} /> Conflict
                            </span>
                          )}
                        </div>

                        {/* Booking Badges */}
                        <div className="mt-1.5 space-y-1">
                          {dayBookings.map((b) => (
                            <div
                              key={b.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditBookingModal(b);
                              }}
                              className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium border transition-transform hover:scale-[1.02] ${
                                b.status === "confirmed"
                                  ? "border-emerald-500/40 bg-emerald-950/80 text-emerald-200"
                                  : b.status === "checked_in"
                                  ? "border-indigo-500/40 bg-indigo-950/80 text-indigo-200"
                                  : b.status === "inquiry"
                                  ? "border-sky-500/40 bg-sky-950/80 text-sky-200"
                                  : "border-amber-500/40 bg-amber-950/80 text-amber-200"
                              }`}
                            >
                              <span className="font-semibold text-[#C8A45D] mr-1">
                                {b.villaName[0]}:
                              </span>
                              {b.guestName}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day Click Popover Modal */}
              {selectedDayBookings && (
                <div
                  className="fixed inset-0 z-[70] grid place-items-center bg-[#070908]/75 p-4 backdrop-blur-sm"
                  onMouseDown={(e) => {
                    if (e.target === e.currentTarget) setSelectedDayBookings(null);
                  }}
                >
                  <div className="w-full max-w-lg rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#C8A45D]">
                          Daily Schedule
                        </span>
                        <h3 className="font-serif text-xl text-[#183D32]">
                          {formatDateDisplay(selectedDayBookings.date, {
                            monthFormat: "long",
                            showDayOfWeek: true,
                          })}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedDayBookings(null)}
                        className="rounded-lg p-1.5 text-[#5A6660] hover:bg-[#F8F6F0]"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {selectedDayBookings.bookings.map((b) => (
                        <div
                          key={b.id}
                          className="rounded-xl border border-[#E5DFD3] bg-[#FFFFFF] p-4 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-base text-[#183D32]">
                              {b.guestName}
                            </span>
                            <span className="rounded-md border border-[#C8A45D]/30 bg-[#C8A45D]/10 px-2 py-0.5 text-xs text-[#C8A45D]">
                              Villa {b.villaName}
                            </span>
                          </div>
                          <p className="text-xs text-[#5A6660]">
                            Stay: {formatDateDisplay(b.checkin)} → {formatDateDisplay(b.checkout)} (
                            {calculateNights(b.checkin, b.checkout)} nights)
                          </p>
                          <div className="flex items-center justify-between text-xs text-[#5A6660] pt-2 border-t border-[#E5DFD3]">
                            <span>
                              Total: {formatMoney(b.totalAmount)} · {b.paymentStatus}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedDayBookings(null);
                                  openMessageGenerator(b);
                                }}
                                className="text-xs text-[#C8A45D] hover:underline"
                              >
                                WhatsApp
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDayBookings(null);
                                  openEditBookingModal(b);
                                }}
                                className="text-xs text-[#183D32] hover:underline"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          const dt = selectedDayBookings.date;
                          setSelectedDayBookings(null);
                          openNewBookingModal(dt);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-[#C8A45D] px-4 py-2 text-xs font-semibold text-[#131514]"
                      >
                        <Plus size={14} /> Add Another Booking
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 3: BOOKING.COM / AGODA / AIRBNB (ICS INTEGRATION) MODULE        */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === "ics-sync" && (
            <div className="space-y-6">
              {/* Manual RFC 5545 Sync Notice Banner */}
              <div className="rounded-2xl border border-[#C8A45D]/30 bg-[#FFFFFF] p-6 shadow-xl">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C8A45D]/15 text-[#C8A45D]">
                    <RefreshCw size={22} />
                  </span>
                  <div>
                    <h2 className="font-serif text-xl text-[#183D32]">
                      Manual RFC 5545 iCalendar Synchronization
                    </h2>
                    <p className="mt-1 text-xs text-[#5A6660] leading-relaxed">
                      Manual RFC 5545 ICS sync. No external backend required. Tranquil Terrace enables universal calendar importing and exporting compatible with Booking.com, Airbnb, and Agoda right from your browser.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2-Column: Inbound Import & Outbound Export */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left: Inbound ICS Import */}
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-xl space-y-4">
                  <div className="border-b border-[#E5DFD3] pb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C8A45D]">
                      Inbound Channel Sync
                    </span>
                    <h3 className="font-serif text-lg text-[#183D32]">
                      Import Calendar (.ics file or text)
                    </h3>
                    <p className="text-xs text-[#5A6660] mt-1">
                      Upload an exported .ics feed from Airbnb, Booking.com, or Agoda to import reservations into Supabase.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                        Target Villa
                      </label>
                      <select
                        value={icsImportVilla}
                        onChange={(e) => setIcsImportVilla(e.target.value as VillaName)}
                        className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3 py-2 text-xs text-[#183D32] outline-none"
                      >
                        <option value="Araliya">Villa Araliya</option>
                        <option value="Olu">Villa Olu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                        Channel Source
                      </label>
                      <select
                        value={icsImportSource}
                        onChange={(e) => setIcsImportSource(e.target.value)}
                        className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3 py-2 text-xs text-[#183D32] outline-none"
                      >
                        <option value="Booking.com">Booking.com</option>
                        <option value="Airbnb">Airbnb</option>
                        <option value="Agoda">Agoda</option>
                        <option value="Direct / iCal">Other / Direct iCal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                      Upload .ics File
                    </label>
                    <input
                      type="file"
                      accept=".ics,text/calendar"
                      onChange={handleFileUploadIcs}
                      className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-2 text-xs text-[#5A6660] file:mr-3 file:rounded-lg file:border-0 file:bg-[#C8A45D]/15 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#C8A45D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                      Or Paste Raw ICS Content
                    </label>
                    <textarea
                      rows={5}
                      placeholder="BEGIN:VCALENDAR&#10;VERSION:2.0&#10;BEGIN:VEVENT&#10;DTSTART;VALUE=DATE:20261110&#10;DTEND;VALUE=DATE:20261114&#10;SUMMARY:Reserved...&#10;END:VEVENT&#10;END:VCALENDAR"
                      value={icsRawText}
                      onChange={(e) => setIcsRawText(e.target.value)}
                      className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-3 text-xs font-mono text-[#183D32] placeholder-zinc-600 outline-none"
                    />
                  </div>

                  <button
                    onClick={handleParseIcs}
                    disabled={icsParsing || !icsRawText.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8A45D] py-2.5 text-xs font-semibold text-[#131514] disabled:opacity-50 hover:bg-[#DFBF7A] transition-colors"
                  >
                    {icsParsing && <LoaderCircle size={14} className="animate-spin" />}
                    Parse & Check Conflicts
                  </button>
                </div>

                {/* Right: Outbound ICS Export */}
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-xl space-y-5 flex flex-col justify-between">
                  <div>
                    <div className="border-b border-[#E5DFD3] pb-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C8A45D]">
                        Outbound Channel Sync
                      </span>
                      <h3 className="font-serif text-lg text-[#183D32]">
                        Export RFC 5545 iCalendar Feeds
                      </h3>
                      <p className="text-xs text-[#5A6660] mt-1">
                        Generate and download standardized .ics calendar files containing all active reservations to import into your OTA accounts.
                      </p>
                    </div>

                    <div className="mt-5 space-y-4">
                      {/* Villa Araliya Export */}
                      <div className="rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#183D32]">Villa Araliya</p>
                          <p className="text-xs text-[#5A6660]">
                            {bookings.filter((b) => b.villaName === "Araliya" && b.status !== "cancelled").length} active reservations
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const content = generateIcsCalendar("Araliya", bookings);
                            downloadIcsFile("tranquil-terrace-araliya.ics", content);
                            showToast("Downloaded tranquil-terrace-araliya.ics");
                          }}
                          className="flex items-center gap-1.5 rounded-xl border border-[#C8A45D]/40 bg-[#C8A45D]/10 px-3.5 py-2 text-xs font-medium text-[#C8A45D] hover:bg-[#C8A45D]/20 transition-colors"
                        >
                          <Download size={14} /> Export Araliya .ics
                        </button>
                      </div>

                      {/* Villa Olu Export */}
                      <div className="rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#183D32]">Villa Olu</p>
                          <p className="text-xs text-[#5A6660]">
                            {bookings.filter((b) => b.villaName === "Olu" && b.status !== "cancelled").length} active reservations
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const content = generateIcsCalendar("Olu", bookings);
                            downloadIcsFile("tranquil-terrace-olu.ics", content);
                            showToast("Downloaded tranquil-terrace-olu.ics");
                          }}
                          className="flex items-center gap-1.5 rounded-xl border border-[#C8A45D]/40 bg-[#C8A45D]/10 px-3.5 py-2 text-xs font-medium text-[#C8A45D] hover:bg-[#C8A45D]/20 transition-colors"
                        >
                          <Download size={14} /> Export Olu .ics
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Channel instructions */}
                  <div className="rounded-xl border border-[#E5DFD3] bg-[#FFFFFF] p-4 text-xs text-[#5A6660] space-y-2">
                    <p className="font-semibold text-[#183D32]">How to sync with OTAs:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-[11px] text-[#5A6660]">
                      <li>Export the .ics file for each villa using the buttons above.</li>
                      <li>In Airbnb / Booking.com / Agoda portal, navigate to &quot;Sync Calendar&quot;.</li>
                      <li>Import the respective villa .ics file to block occupied dates immediately.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Parsed Events Preview Table */}
              {icsParsedEvents.length > 0 && (
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
                    <div>
                      <h3 className="font-serif text-lg text-[#183D32]">
                        Parsed Calendar Events ({icsParsedEvents.length})
                      </h3>
                      <p className="text-xs text-[#5A6660]">
                        Review parsed dates and conflict analysis before committing to database.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setIcsParsedEvents((list) => list.map((item) => ({ ...item, selected: true })))
                        }
                        className="text-xs text-[#5A6660] hover:text-[#183D32]"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() =>
                          setIcsParsedEvents((list) => list.map((item) => ({ ...item, selected: false })))
                        }
                        className="text-xs text-[#5A6660] hover:text-[#183D32]"
                      >
                        Deselect All
                      </button>
                      <button
                        onClick={handleImportSelectedIcsEvents}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-[#C8A45D] px-4 py-2 text-xs font-semibold text-[#131514] hover:bg-[#DFBF7A]"
                      >
                        {saving && <LoaderCircle size={14} className="animate-spin" />}
                        Import Selected to Database
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#E5DFD3] bg-[#FDFBF7] text-[10px] uppercase tracking-wider text-[#5A6660]">
                        <tr>
                          <th className="px-4 py-3">Import</th>
                          <th className="px-4 py-3">Guest / Summary</th>
                          <th className="px-4 py-3">Stay Dates</th>
                          <th className="px-4 py-3">Nights</th>
                          <th className="px-4 py-3">Conflict Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2A2F2C]/60 text-[#183D32]">
                        {icsParsedEvents.map((item, idx) => {
                          const nights = calculateNights(item.event.checkin, item.event.checkout);
                          const hasConflicts = item.conflicts.length > 0;

                          return (
                            <tr key={idx} className="hover:bg-[#FAF8F5]">
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={item.selected}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setIcsParsedEvents((list) =>
                                      list.map((it, i) => (i === idx ? { ...it, selected: checked } : it))
                                    );
                                  }}
                                  className="rounded border-[#E5DFD3] bg-[#FDFBF7] text-[#C8A45D]"
                                />
                              </td>
                              <td className="px-4 py-3 font-medium text-[#183D32]">
                                {item.event.guestName}
                                <span className="block text-[11px] text-[#7A8882]">
                                  UID: {item.event.reference}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {formatDateDisplay(item.event.checkin)} → {formatDateDisplay(item.event.checkout)}
                              </td>
                              <td className="px-4 py-3">{nights} nights</td>
                              <td className="px-4 py-3">
                                {hasConflicts ? (
                                  <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-300 border border-rose-500/30">
                                    <AlertTriangle size={12} /> Conflict with {item.conflicts.map((c) => c.reference).join(", ")}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                                    <Check size={12} /> Conflict Free
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 4: PAYMENT MANAGEMENT MODULE                                   */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === "financials" && (
            <div className="space-y-6">
              {/* Financial Summary KPI Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5">
                  <span className="text-xs uppercase tracking-wider text-[#5A6660]">Total Gross Revenue</span>
                  <div className="mt-2 font-serif text-3xl font-medium text-[#183D32]">
                    {formatMoney(financialSummary.totalRevenueLKR)}
                  </div>
                  <p className="mt-2 text-[11px] text-[#7A8882]">All non-cancelled reservations</p>
                </div>

                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5">
                  <span className="text-xs uppercase tracking-wider text-[#5A6660]">Total Collected</span>
                  <div className="mt-2 font-serif text-3xl font-medium text-emerald-400">
                    {formatMoney(financialSummary.paidRevenueLKR)}
                  </div>
                  <p className="mt-2 text-[11px] text-[#7A8882]">Advance payments in hand</p>
                </div>

                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5">
                  <span className="text-xs uppercase tracking-wider text-[#5A6660]">Outstanding Balances</span>
                  <div className="mt-2 font-serif text-3xl font-medium text-amber-400">
                    {formatMoney(financialSummary.pendingRevenueLKR)}
                  </div>
                  <p className="mt-2 text-[11px] text-[#7A8882]">Due upon guest check-in</p>
                </div>

                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5">
                  <span className="text-xs uppercase tracking-wider text-[#5A6660]">Exchange Rate Active</span>
                  <div className="mt-2 font-serif text-2xl font-medium text-[#C8A45D]">
                    1 USD = {USD_EXCHANGE_RATE} LKR
                  </div>
                  <p className="mt-2 text-[11px] text-[#7A8882]">Standard hospitality conversion</p>
                </div>
              </div>

              {/* Pending Balances Settlement Table */}
              <div className="overflow-hidden rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] shadow-xl">
                <div className="border-b border-[#E5DFD3] p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl text-[#183D32]">Guest Balance & Payment Ledger</h3>
                    <p className="text-xs text-[#5A6660]">
                      Track advance deposits, unpaid bookings, and balance settlement.
                    </p>
                  </div>
                  <div className="text-xs text-[#5A6660]">
                    Showing {bookings.filter((b) => b.status !== "cancelled").length} active bookings
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#E5DFD3] bg-[#FDFBF7] text-[10px] uppercase tracking-wider text-[#5A6660]">
                      <tr>
                        <th className="px-5 py-3">Guest & Ref</th>
                        <th className="px-4 py-3">Stay Dates</th>
                        <th className="px-4 py-3">Payment Status</th>
                        <th className="px-4 py-3">Total Invoiced</th>
                        <th className="px-4 py-3">Paid / Collected</th>
                        <th className="px-4 py-3">Balance Due</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2F2C]/60 text-[#183D32]">
                      {bookings
                        .filter((b) => b.status !== "cancelled")
                        .map((b) => {
                          const balanceDue = Math.max(0, b.totalAmount - b.paidAmount);
                          return (
                            <tr key={b.id} className="hover:bg-[#FAF8F5]">
                              <td className="px-5 py-3 font-medium text-[#183D32]">
                                {b.guestName}
                                <span className="block text-[11px] text-[#7A8882]">
                                  Ref: {b.reference} · Villa {b.villaName}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {formatDateDisplay(b.checkin)} → {formatDateDisplay(b.checkout)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold ${
                                    b.paymentStatus === "paid"
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                      : b.paymentStatus === "partial"
                                      ? "border-amber-200 bg-amber-50 text-amber-800"
                                      : b.paymentStatus === "refunded"
                                      ? "border-zinc-700 bg-zinc-800 text-[#5A6660]"
                                      : "border-rose-200 bg-rose-50 text-rose-800"
                                  }`}
                                >
                                  {label(b.paymentStatus)}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-[#183D32]">
                                {formatMoney(b.totalAmount)}
                              </td>
                              <td className="px-4 py-3 text-emerald-400 font-medium">
                                {formatMoney(b.paidAmount)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`font-semibold ${
                                    balanceDue > 0 ? "text-amber-400" : "text-[#7A8882]"
                                  }`}
                                >
                                  {balanceDue > 0 ? formatMoney(balanceDue) : "Cleared"}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <button
                                  onClick={() => openPaymentModal(b)}
                                  className="rounded-xl border border-[#C8A45D]/40 bg-[#C8A45D]/10 px-3 py-1.5 text-xs font-semibold text-[#C8A45D] hover:bg-[#C8A45D]/20 transition-colors"
                                >
                                  Record Payment
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 5: GUEST MANAGEMENT DIRECTORY MODULE                            */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === "guests" && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] shadow-xl">
                {/* Search Bar Header */}
                <div className="flex flex-col gap-4 border-b border-[#E5DFD3] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-serif text-xl text-[#183D32]">Guest Directory & CRM</h2>
                    <p className="text-xs text-[#5A6660]">
                      Aggregated guest records with WhatsApp and Email quick actions.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2">
                    <Search size={15} className="text-[#5A6660]" />
                    <input
                      type="text"
                      placeholder="Search name, phone, email..."
                      value={guestSearchQuery}
                      onChange={(e) => setGuestSearchQuery(e.target.value)}
                      className="w-56 bg-transparent text-xs text-[#183D32] placeholder-zinc-500 outline-none"
                    />
                  </div>
                </div>

                {/* Guests Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left text-xs">
                    <thead className="border-b border-[#E5DFD3] bg-[#FDFBF7] text-[10px] uppercase tracking-wider text-[#5A6660]">
                      <tr>
                        <th className="px-5 py-4">Guest Name</th>
                        <th className="px-4 py-4">Phone / WhatsApp</th>
                        <th className="px-4 py-4">Email Address</th>
                        <th className="px-4 py-4">Total Stays</th>
                        <th className="px-4 py-4">Total Spent</th>
                        <th className="px-4 py-4">Last Stay</th>
                        <th className="px-5 py-4 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2F2C]/60 text-[#183D32]">
                      {aggregatedGuests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-16 text-center text-[#7A8882]">
                            <Users className="mx-auto text-zinc-600 mb-2" size={28} />
                            <p className="text-sm font-medium">No guests registered yet.</p>
                          </td>
                        </tr>
                      ) : (
                        aggregatedGuests.map((g) => {
                          const cleanPhone = (g.phone || "").replace(/[^0-9]/g, "");
                          return (
                            <tr key={g.id} className="hover:bg-[#FAF8F5]">
                              <td className="px-5 py-4 font-semibold text-[#183D32]">
                                {g.name}
                                {g.notes && (
                                  <span className="block text-[11px] font-normal text-[#5A6660] mt-0.5">
                                    &ldquo;{g.notes}&rdquo;
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4 font-mono text-[#183D32]">
                                {g.phone || "—"}
                              </td>
                              <td className="px-4 py-4 text-[#183D32]">
                                {g.email || "—"}
                              </td>
                              <td className="px-4 py-4 font-medium">
                                <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs">
                                  {g.totalBookings} stay{g.totalBookings === 1 ? "" : "s"}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-serif text-sm font-medium text-[#C8A45D]">
                                {formatMoney(g.totalSpentLKR)}
                              </td>
                              <td className="px-4 py-4 text-[#5A6660]">
                                {g.lastStay ? formatDateDisplay(g.lastStay) : "—"}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* WhatsApp wa.me */}
                                  {cleanPhone ? (
                                    <a
                                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                        `Dear ${g.name}, warm greetings from Tranquil Terrace Galle!`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1.5 text-xs text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                                    >
                                      <MessageCircle size={13} /> WhatsApp
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-zinc-600">No phone</span>
                                  )}

                                  {/* Mailto link */}
                                  {g.email ? (
                                    <a
                                      href={`mailto:${g.email}?subject=${encodeURIComponent(
                                        "Tranquil Terrace Galle - Guest Inquiry"
                                      )}`}
                                      className="flex items-center gap-1 rounded-lg border border-[#C8A45D]/40 bg-[#C8A45D]/10 px-2.5 py-1.5 text-xs text-[#C8A45D] hover:bg-[#C8A45D]/20 transition-colors"
                                    >
                                      <Mail size={13} /> Email
                                    </a>
                                  ) : null}

                                  {/* Edit notes */}
                                  <button
                                    onClick={() => {
                                      setEditingGuestNotes(g);
                                      setGuestNotesInput(g.notes || "");
                                    }}
                                    className="rounded-lg border border-[#E5DFD3] p-1.5 text-[#5A6660] hover:text-[#183D32]"
                                    title="Add or edit notes"
                                  >
                                    <FileText size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 6: ANALYTICS DASHBOARD MODULE                                  */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Analytics Metric Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5">
                  <span className="text-xs uppercase tracking-wider text-[#5A6660]">Total Bookings</span>
                  <div className="mt-2 font-serif text-3xl font-medium text-[#183D32]">
                    {analyticsData.total}
                  </div>
                  <p className="mt-2 text-[11px] text-[#7A8882]">
                    {analyticsData.confirmed} confirmed stays
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5">
                  <span className="text-xs uppercase tracking-wider text-[#5A6660]">Cancellation Rate</span>
                  <div className="mt-2 font-serif text-3xl font-medium text-rose-400">
                    {analyticsData.cancelRate}%
                  </div>
                  <p className="mt-2 text-[11px] text-[#7A8882]">
                    {analyticsData.cancelled} cancelled of {analyticsData.total}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5">
                  <span className="text-xs uppercase tracking-wider text-[#5A6660]">Average Daily Rate (ADR)</span>
                  <div className="mt-2 font-serif text-3xl font-medium text-[#C8A45D]">
                    {formatMoney(analyticsData.adrLkr)}
                  </div>
                  <p className="mt-2 text-[11px] text-[#7A8882]">Per occupied villa night</p>
                </div>

                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-5">
                  <span className="text-xs uppercase tracking-wider text-[#5A6660]">Avg. Length of Stay</span>
                  <div className="mt-2 font-serif text-3xl font-medium text-indigo-400">
                    {analyticsData.avgStay} nights
                  </div>
                  <p className="mt-2 text-[11px] text-[#7A8882]">Total {analyticsData.totalNights} nights</p>
                </div>
              </div>

              {/* Monthly Revenue Bar Chart (Custom Luxury Visualization) */}
              <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-xl">
                <div className="border-b border-[#E5DFD3] pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl text-[#183D32]">Monthly Revenue Performance</h3>
                    <p className="text-xs text-[#5A6660]">
                      Revenue and booked nights breakdown over the last 6 months.
                    </p>
                  </div>
                  <span className="text-xs text-[#C8A45D] font-medium">Currency: {currency}</span>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {analyticsData.monthlyTrends.map((m, idx) => {
                    const heightPercent = Math.max(12, Math.round((m.revenue / analyticsData.maxMonthlyRevenue) * 100));
                    return (
                      <div key={idx} className="flex flex-col items-center justify-end h-64 p-3 rounded-xl bg-[#FDFBF7] border border-[#E5DFD3]">
                        <span className="text-[11px] font-semibold text-[#C8A45D] mb-1">
                          {formatMoney(m.revenue)}
                        </span>
                        <div className="w-full flex items-end justify-center h-40">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-12 rounded-t-lg bg-gradient-to-t from-[#B38F46] to-[#DFBF7A] transition-all duration-500 shadow-md"
                          />
                        </div>
                        <span className="mt-3 text-xs font-medium text-[#183D32]">{m.label}</span>
                        <span className="text-[10px] text-[#7A8882]">{m.nights} nights</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2-Column: Villa Occupancy & Booking Sources */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Villa Comparison */}
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-xl space-y-4">
                  <h3 className="font-serif text-lg text-[#183D32]">Villa Occupancy Comparison</h3>
                  <p className="text-xs text-[#5A6660]">
                    Comparative booked nights and revenue split between properties.
                  </p>

                  <div className="space-y-4 pt-2">
                    {/* Araliya */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-[#183D32]">Villa Araliya</span>
                        <span className="text-[#5A6660]">
                          {analyticsData.araliyaNights} nights · {formatMoney(analyticsData.araliyaRevenue)}
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          style={{
                            width: `${
                              analyticsData.totalNights > 0
                                ? (analyticsData.araliyaNights / analyticsData.totalNights) * 100
                                : 50
                            }%`,
                          }}
                          className="h-full rounded-full bg-[#C8A45D]"
                        />
                      </div>
                    </div>

                    {/* Olu */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-[#183D32]">Villa Olu</span>
                        <span className="text-[#5A6660]">
                          {analyticsData.oluNights} nights · {formatMoney(analyticsData.oluRevenue)}
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          style={{
                            width: `${
                              analyticsData.totalNights > 0
                                ? (analyticsData.oluNights / analyticsData.totalNights) * 100
                                : 50
                            }%`,
                          }}
                          className="h-full rounded-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Sources */}
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-xl space-y-4">
                  <h3 className="font-serif text-lg text-[#183D32]">Booking Channel Distribution</h3>
                  <p className="text-xs text-[#5A6660]">
                    Distribution of reservations across websites, OTAs, and direct channels.
                  </p>

                  <div className="space-y-3 pt-2">
                    {Object.entries(analyticsData.sourceCounts).map(([src, count]) => {
                      const pct = analyticsData.total > 0 ? Math.round((count / analyticsData.total) * 100) : 0;
                      return (
                        <div key={src}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[#183D32] font-medium">{src}</span>
                            <span className="text-[#5A6660]">
                              {count} bookings ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-[#B38F46] to-[#C8A45D]"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 7: DATA BACKUP & RESTORE MODULE                                */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              {/* Storage Diagnostic Card */}
              <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C8A45D]">
                      Database Health
                    </span>
                    <h3 className="font-serif text-xl text-[#183D32]">Supabase Database Diagnostics</h3>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Cloud Database Connected
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-4">
                    <p className="text-xs text-[#5A6660]">Stored Reservations</p>
                    <p className="mt-1 font-serif text-2xl font-medium text-[#183D32]">{bookings.length}</p>
                  </div>
                  <div className="rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-4">
                    <p className="text-xs text-[#5A6660]">Stored Guests</p>
                    <p className="mt-1 font-serif text-2xl font-medium text-[#183D32]">{aggregatedGuests.length}</p>
                  </div>
                  <div className="rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-4">
                    <p className="text-xs text-[#5A6660]">Active Conflicts</p>
                    <p className={`mt-1 font-serif text-2xl font-medium ${systemConflicts.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {systemConflicts.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Backup Actions Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Export Card */}
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-xl space-y-4">
                  <div className="border-b border-[#E5DFD3] pb-4">
                    <h3 className="font-serif text-lg text-[#183D32]">Export Complete Data Backup</h3>
                    <p className="text-xs text-[#5A6660] mt-1">
                      Download full database state into JSON format for secure offline safekeeping or CSV for spreadsheet accounting.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleExportJsonBackup}
                      className="flex w-full items-center justify-between rounded-xl border border-[#C8A45D]/40 bg-[#C8A45D]/10 px-4 py-3 text-xs font-semibold text-[#C8A45D] hover:bg-[#C8A45D]/20 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileDown size={16} /> Download Full JSON Backup (.json)
                      </span>
                      <span>{bookings.length} records</span>
                    </button>

                    <button
                      onClick={handleExportCsv}
                      className="flex w-full items-center justify-between rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-4 py-3 text-xs font-semibold text-[#183D32] hover:text-[#183D32] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet size={16} /> Export Bookings CSV (.csv)
                      </span>
                      <span>RFC 4180</span>
                    </button>
                  </div>
                </div>

                {/* Restore Card */}
                <div className="rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-xl space-y-4">
                  <div className="border-b border-[#E5DFD3] pb-4">
                    <h3 className="font-serif text-lg text-[#183D32]">Restore Database from JSON</h3>
                    <p className="text-xs text-[#5A6660] mt-1">
                      Load a previously exported Tranquil Terrace JSON backup with full schema validation.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleSelectBackupFile}
                      className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-2 text-xs text-[#5A6660] file:mr-3 file:rounded-lg file:border-0 file:bg-[#C8A45D]/15 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#C8A45D]"
                    />

                    {backupValidation && (
                      <div className={`rounded-xl p-3 text-xs border ${
                        backupValidation.valid
                          ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                          : "border-rose-500/30 bg-rose-950/20 text-rose-200"
                      }`}>
                        {backupValidation.valid ? (
                          <div className="space-y-2">
                            <p className="font-semibold text-emerald-300">✓ Valid Tranquil Terrace Backup</p>
                            <p className="text-[11px] text-[#5A6660]">
                              Contains {backupValidation.data.bookings.length} reservations and {backupValidation.data.guests.length} guest records.
                            </p>
                            <div className="flex gap-4 pt-1">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="restoreMode"
                                  checked={backupRestoreMode === "merge"}
                                  onChange={() => setBackupRestoreMode("merge")}
                                  className="text-[#C8A45D]"
                                />
                                <span>Merge with existing</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="restoreMode"
                                  checked={backupRestoreMode === "replace"}
                                  onChange={() => setBackupRestoreMode("replace")}
                                  className="text-[#C8A45D]"
                                />
                                <span className="text-rose-400">Replace entire DB</span>
                              </label>
                            </div>
                            <button
                              onClick={handleConfirmRestoreBackup}
                              disabled={saving}
                              className="mt-2 w-full rounded-lg bg-[#C8A45D] py-2 text-xs font-semibold text-[#131514]"
                            >
                              Confirm Restore Now
                            </button>
                          </div>
                        ) : (
                          <p>Error: {backupValidation.error}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Danger Zone: Reset to Factory Demo */}
              <div className="rounded-2xl border border-rose-900/30 bg-rose-950/10 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-rose-300">Clear All Reservation & Guest Records</h4>
                  <p className="text-xs text-rose-200/70 mt-0.5">
                    Permanently wipe all demo and test bookings to start with a fresh, empty production database.
                  </p>
                </div>
                <button
                  onClick={handleResetToDemoData}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
                >
                  Reset Demo Data
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ----------------------------------------------------------------------- */}
      {/* MODAL 1: ADD / EDIT BOOKING                                            */}
      {/* ----------------------------------------------------------------------- */}
      {bookingModalOpen && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setBookingModalOpen(false);
          }}
        >
          <form
            onSubmit={handleSaveBooking}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-2xl space-y-5"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C8A45D]">
                  {editingBooking ? `Reference: ${editingBooking.reference}` : "New Reservation"}
                </span>
                <h3 className="font-serif text-2xl text-[#183D32]">
                  {editingBooking ? "Edit Reservation" : "Add Villa Reservation"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="rounded-lg p-1.5 text-[#5A6660] hover:bg-[#F8F6F0]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Real-time Conflict Alert in Form */}
            {formConflicts.length > 0 && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3.5 text-xs text-rose-200">
                <p className="font-semibold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle size={15} /> Warning: Date Conflict Detected!
                </p>
                <p className="mt-1 text-[11px] text-rose-200/80">
                  Villa {bookingForm.villaName} already has overlapping reservations:
                </p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px]">
                  {formConflicts.map((c) => (
                    <li key={c.id}>
                      {c.guestName} ({c.reference}) from {formatDateDisplay(c.checkin)} to {formatDateDisplay(c.checkout)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Guest Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sarah & Daniel"
                  value={bookingForm.guestName}
                  onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none focus:border-[#C8A45D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  required
                  type="text"
                  placeholder="+44 7700 900123"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none focus:border-[#C8A45D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="guest@example.com"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none focus:border-[#C8A45D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Target Villa *
                </label>
                <select
                  value={bookingForm.villaName}
                  onChange={(e) => setBookingForm({ ...bookingForm, villaName: e.target.value as VillaName })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none"
                >
                  <option value="Araliya">Villa Araliya (Courtyard & Pool)</option>
                  <option value="Olu">Villa Olu (Tropical Veranda)</option>
                </select>
              </div>

              {/* Checkin & Checkout */}
              <div>
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Check-in Date *
                </label>
                <input
                  required
                  type="date"
                  value={bookingForm.checkin}
                  onChange={(e) => {
                    const newIn = e.target.value;
                    let newOut = bookingForm.checkout;
                    if (!newOut || newOut <= newIn) {
                      newOut = addDaysToDate(newIn, 1);
                    }
                    setBookingForm({ ...bookingForm, checkin: newIn, checkout: newOut });
                  }}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none focus:border-[#C8A45D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Check-out Date *
                </label>
                <input
                  required
                  type="date"
                  min={bookingForm.checkin ? addDaysToDate(bookingForm.checkin, 1) : undefined}
                  value={bookingForm.checkout}
                  onChange={(e) => setBookingForm({ ...bookingForm, checkout: e.target.value })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none focus:border-[#C8A45D]"
                />
              </div>

              {/* Calculated Nights Display */}
              <div className="sm:col-span-2 text-xs text-[#5A6660] bg-[#FDFBF7] p-3 rounded-xl border border-[#E5DFD3] flex items-center justify-between">
                <span>
                  Stay Duration:{" "}
                  <strong className="text-[#C8A45D]">
                    {calculateNights(bookingForm.checkin, bookingForm.checkout)} night(s)
                  </strong>
                </span>
                <span>
                  {formatDateDisplay(bookingForm.checkin)} → {formatDateDisplay(bookingForm.checkout)}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Number of Guests
                </label>
                <select
                  value={bookingForm.guests}
                  onChange={(e) => setBookingForm({ ...bookingForm, guests: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests (Standard)</option>
                  <option value={3}>3 Guests (Extra bed)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Booking Source
                </label>
                <select
                  value={bookingForm.source}
                  onChange={(e) => setBookingForm({ ...bookingForm, source: e.target.value })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none"
                >
                  <option value="website">Website Direct</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="Agoda">Agoda</option>
                  <option value="manual">Direct / Phone</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Reservation Status
                </label>
                <select
                  value={bookingForm.status}
                  onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value as BookingStatus })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none"
                >
                  {bookingStatuses.map((s) => (
                    <option key={s} value={s}>
                      {label(s)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Payment Status
                </label>
                <select
                  value={bookingForm.paymentStatus}
                  onChange={(e) => setBookingForm({ ...bookingForm, paymentStatus: e.target.value as PaymentStatus })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none"
                >
                  {paymentStatuses.map((s) => (
                    <option key={s} value={s}>
                      {label(s)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Financials in Form */}
              <div>
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Total Amount (LKR) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={bookingForm.totalAmount}
                  onChange={(e) => setBookingForm({ ...bookingForm, totalAmount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Advance Paid Amount (LKR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={bookingForm.paidAmount}
                  onChange={(e) => setBookingForm({ ...bookingForm, paidAmount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none"
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Special Guest Requests
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Airport pickup, anniversary cake, floating breakfast"
                  value={bookingForm.specialRequest}
                  onChange={(e) => setBookingForm({ ...bookingForm, specialRequest: e.target.value })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-3 text-xs text-[#183D32] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                  Private Admin Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Staff instructions or internal notes"
                  value={bookingForm.adminNotes}
                  onChange={(e) => setBookingForm({ ...bookingForm, adminNotes: e.target.value })}
                  className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-3 text-xs text-[#183D32] outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DFD3]">
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="rounded-xl border border-[#E5DFD3] px-4 py-2.5 text-xs font-semibold text-[#5A6660] hover:text-[#183D32]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#C8A45D] px-5 py-2.5 text-xs font-semibold text-[#131514] hover:bg-[#DFBF7A]"
              >
                {saving && <LoaderCircle size={14} className="animate-spin" />}
                {editingBooking ? "Update Reservation" : "Confirm & Save Reservation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------------------------- */}
      {/* MODAL 2: 5-STAR BRANDED PRINTABLE PDF INVOICE                           */}
      {/* ----------------------------------------------------------------------- */}
      {invoiceModalBooking && (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-[#070908]/85 p-4 backdrop-blur-md overflow-y-auto"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setInvoiceModalBooking(null);
          }}
        >
          <div className="my-8 w-full max-w-3xl rounded-2xl border border-[#E5DFD3] bg-white text-zinc-900 shadow-2xl p-8 sm:p-10 invoice-printable">
            {/* Modal Top Actions (Hidden in Print) */}
            <div className="no-print mb-6 flex items-center justify-between border-b border-zinc-200 pb-4">
              <span className="text-xs font-semibold text-[#7A8882] uppercase tracking-wider">
                Luxury Printable Invoice
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={triggerPrintInvoice}
                  className="flex items-center gap-1.5 rounded-xl bg-[#93712d] px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-90 transition-opacity"
                >
                  <Printer size={15} /> Print / Save as PDF
                </button>
                <button
                  onClick={() => setInvoiceModalBooking(null)}
                  className="rounded-lg p-2 text-[#7A8882] hover:bg-zinc-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Invoice Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between border-b-2 border-[#93712d] pb-6 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#93712d] font-serif text-xl font-bold text-white shadow-sm">
                    TT
                  </span>
                  <div>
                    <h1 className="font-serif text-2xl font-bold tracking-tight text-zinc-900">
                      Tranquil Terrace
                    </h1>
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#93712d]">
                      Galle · Sri Lanka
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-600 leading-relaxed max-w-xs">
                  Luxury Private Villas & Hospitality Sanctuary<br />
                  Galle Fort Environs, Southern Province, Sri Lanka<br />
                  Phone: +94 77 123 4567 · info@tranquilterracevilla.com
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block rounded-md bg-[#f7f3ea] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#93712d]">
                  Official Tax Invoice
                </span>
                <p className="mt-2 font-mono text-sm font-semibold text-zinc-900">
                  INV-{invoiceModalBooking.reference}
                </p>
                <p className="text-xs text-[#7A8882]">
                  Date: {formatDateDisplay(getTodayIsoDate(), { monthFormat: "short" })}
                </p>
                <p className="text-xs text-[#7A8882]">
                  Status: <strong className="uppercase text-emerald-800">{invoiceModalBooking.paymentStatus}</strong>
                </p>
              </div>
            </div>

            {/* Bill To & Stay Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-zinc-200 text-xs">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#5A6660]">
                  Billed To (Guest)
                </h4>
                <p className="mt-1 font-serif text-lg font-bold text-zinc-900">
                  {invoiceModalBooking.guestName}
                </p>
                <p className="text-zinc-600 mt-0.5">{invoiceModalBooking.phone || "No phone provided"}</p>
                <p className="text-zinc-600">{invoiceModalBooking.email || "No email provided"}</p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#5A6660]">
                  Reservation Details
                </h4>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  Villa {invoiceModalBooking.villaName} (Whole Villa)
                </p>
                {(() => {
                  const invTiming = getBookingPackageTimings(invoiceModalBooking.packageId, invoiceModalBooking.timingOption);
                  return (
                    <>
                      <p className="text-zinc-600 mt-0.5">
                        Check-in: {formatDateDisplay(invoiceModalBooking.checkin, { monthFormat: "short", showDayOfWeek: true })} ({invTiming.checkin})
                      </p>
                      <p className="text-zinc-600">
                        Check-out: {formatDateDisplay(invoiceModalBooking.checkout, { monthFormat: "short", showDayOfWeek: true })} ({invTiming.checkout})
                      </p>
                    </>
                  );
                })()}
                <p className="text-zinc-600 font-medium text-[#93712d]">
                  Duration: {calculateNights(invoiceModalBooking.checkin, invoiceModalBooking.checkout)} Nights · {invoiceModalBooking.guests} Guests
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-300 text-[#7A8882] uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Description</th>
                    <th className="py-2.5 text-center">Nights</th>
                    <th className="py-2.5 text-right">Rate</th>
                    <th className="py-2.5 text-right">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  <tr>
                    <td className="py-4">
                      <p className="font-semibold text-zinc-900">
                        Villa {invoiceModalBooking.villaName} - Exclusive Stay
                      </p>
                      <p className="text-[11px] text-[#7A8882]">
                        Includes complimentary welcome refreshment, Wi-Fi, housekeeping, and pool access.
                      </p>
                    </td>
                    <td className="py-4 text-center font-medium text-zinc-800">
                      {calculateNights(invoiceModalBooking.checkin, invoiceModalBooking.checkout)}
                    </td>
                    <td className="py-4 text-right text-zinc-700">
                      Rs. {Math.round(invoiceModalBooking.totalAmount / Math.max(1, calculateNights(invoiceModalBooking.checkin, invoiceModalBooking.checkout))).toLocaleString()}
                    </td>
                    <td className="py-4 text-right font-semibold text-zinc-900">
                      Rs. {invoiceModalBooking.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total Calculation Breakdown */}
              <div className="mt-4 border-t border-zinc-200 pt-4 flex justify-end">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal:</span>
                    <span>Rs. {invoiceModalBooking.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>Advance Payment Received:</span>
                    <span>- Rs. {invoiceModalBooking.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-zinc-900 pt-2 font-serif text-base font-bold text-zinc-900">
                    <span>Balance Due on Arrival:</span>
                    <span className="text-[#93712d]">
                      Rs. {Math.max(0, invoiceModalBooking.totalAmount - invoiceModalBooking.paidAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Transfer Details & Policies */}
            <div className="mt-6 rounded-xl border border-zinc-200 bg-[#faf8f4] p-5 text-xs text-zinc-700 space-y-2 invoice-gold-bg">
              <h5 className="font-semibold uppercase tracking-wider text-[10px] text-[#93712d]">
                Bank Transfer Instructions & Settlement
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <p><strong>Bank:</strong> Commercial Bank of Ceylon</p>
                <p><strong>Account Name:</strong> Tranquil Terrace Galle (Pvt) Ltd</p>
                <p><strong>Account Number:</strong> 1000 8923 4410</p>
                <p><strong>Branch / SWIFT:</strong> Galle Fort (CCEYLKLX)</p>
              </div>
              <p className="text-[10px] text-[#7A8882] pt-2 border-t border-zinc-200">
                Please quote reference <strong>{invoiceModalBooking.reference}</strong> when completing payments. Thank you for choosing Tranquil Terrace Galle!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------- */}
      {/* MODAL 3: WHATSAPP & EMAIL MESSAGE GENERATOR                             */}
      {/* ----------------------------------------------------------------------- */}
      {messageModalBooking && (
        <div
          className="fixed inset-0 z-[85] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMessageModalBooking(null);
          }}
        >
          <div className="w-full max-w-xl rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C8A45D]">
                  Message Generator
                </span>
                <h3 className="font-serif text-xl text-[#183D32]">
                  WhatsApp & Email Templates
                </h3>
              </div>
              <button
                onClick={() => setMessageModalBooking(null)}
                className="rounded-lg p-1.5 text-[#5A6660] hover:bg-[#F8F6F0]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Template Selector Tabs */}
            <div className="flex items-center rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-1">
              {[
                { id: "confirmation", label: "Booking Confirmation" },
                { id: "reminder", label: "Payment Reminder" },
                { id: "arrival", label: "Arrival Guide" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setMessageTemplateType(t.id as any);
                    buildTemplateText(messageModalBooking, t.id as any);
                  }}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    messageTemplateType === t.id
                      ? "bg-[#C8A45D] text-[#131514] shadow"
                      : "text-[#5A6660] hover:text-[#183D32]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Live Message Preview / Editor */}
            <div>
              <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                Editable Message Content
              </label>
              <textarea
                rows={12}
                value={customMessageBody}
                onChange={(e) => setCustomMessageBody(e.target.value)}
                className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-3.5 text-xs text-[#183D32] font-mono leading-relaxed outline-none"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E5DFD3]">
              <button
                onClick={handleCopyMessage}
                className="flex items-center gap-1.5 rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-4 py-2.5 text-xs font-semibold text-[#183D32] hover:text-[#183D32]"
              >
                {copiedNotice ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedNotice ? "Copied!" : "Copy Text"}
              </button>

              <div className="flex items-center gap-2">
                {messageModalBooking.email && (
                  <button
                    onClick={() => handleSendEmail(messageModalBooking.email, messageModalBooking.reference)}
                    className="flex items-center gap-1.5 rounded-xl border border-[#C8A45D]/40 bg-[#C8A45D]/10 px-3.5 py-2.5 text-xs font-semibold text-[#C8A45D] hover:bg-[#C8A45D]/20 transition-colors"
                  >
                    <Mail size={14} /> Open Email
                  </button>
                )}

                {messageModalBooking.phone && (
                  <button
                    onClick={() => handleSendWhatsApp(messageModalBooking.phone)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    <MessageCircle size={14} /> Open WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------- */}
      {/* MODAL 4: RECORD PAYMENT MODAL                                          */}
      {/* ----------------------------------------------------------------------- */}
      {paymentModalBooking && (
        <div
          className="fixed inset-0 z-[85] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPaymentModalBooking(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C8A45D]">
                  Payment Ledger
                </span>
                <h3 className="font-serif text-xl text-[#183D32]">Record Guest Payment</h3>
              </div>
              <button
                onClick={() => setPaymentModalBooking(null)}
                className="rounded-lg p-1.5 text-[#5A6660] hover:bg-[#F8F6F0]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl bg-[#FDFBF7] p-3 text-xs text-[#5A6660] space-y-1">
              <p>
                Guest: <strong className="text-white">{paymentModalBooking.guestName}</strong>
              </p>
              <p>
                Reference: <strong className="text-white">{paymentModalBooking.reference}</strong>
              </p>
              <p>
                Total Invoiced: <strong className="text-[#C8A45D]">{formatMoney(paymentModalBooking.totalAmount)}</strong>
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                Paid Amount to Date (LKR)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={paymentAmountInput}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPaymentAmountInput(val);
                  if (val >= paymentModalBooking.totalAmount) {
                    setPaymentStatusInput("paid");
                  } else if (val > 0) {
                    setPaymentStatusInput("partial");
                  } else {
                    setPaymentStatusInput("unpaid");
                  }
                }}
                className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none"
              />
              <p className="mt-1 text-[11px] text-[#7A8882]">
                Remaining Balance: {formatMoney(Math.max(0, paymentModalBooking.totalAmount - paymentAmountInput))}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatusInput}
                onChange={(e) => setPaymentStatusInput(e.target.value as PaymentStatus)}
                className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] px-3.5 py-2 text-xs text-[#183D32] outline-none"
              >
                {paymentStatuses.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5DFD3]">
              <button
                onClick={() => setPaymentModalBooking(null)}
                className="rounded-xl border border-[#E5DFD3] px-4 py-2 text-xs text-[#5A6660]"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayment}
                className="rounded-xl bg-[#C8A45D] px-4 py-2 text-xs font-semibold text-[#131514]"
              >
                Save Payment Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------- */}
      {/* MODAL 5: EDIT GUEST NOTES                                              */}
      {/* ----------------------------------------------------------------------- */}
      {editingGuestNotes && (
        <div
          className="fixed inset-0 z-[85] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditingGuestNotes(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#E5DFD3] bg-[#FFFFFF] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C8A45D]">
                  Guest Preferences
                </span>
                <h3 className="font-serif text-xl text-[#183D32]">{editingGuestNotes.name}</h3>
              </div>
              <button
                onClick={() => setEditingGuestNotes(null)}
                className="rounded-lg p-1.5 text-[#5A6660] hover:bg-[#F8F6F0]"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5A6660] mb-1">
                Guest Notes & VIP Preferences
              </label>
              <textarea
                rows={4}
                value={guestNotesInput}
                onChange={(e) => setGuestNotesInput(e.target.value)}
                placeholder="e.g. Likes extra towels, vegetarian breakfast, quiet suite"
                className="w-full rounded-xl border border-[#E5DFD3] bg-[#FDFBF7] p-3 text-xs text-[#183D32] outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DFD3]">
              <button
                onClick={() => setEditingGuestNotes(null)}
                className="rounded-xl border border-[#E5DFD3] px-4 py-2 text-xs text-[#5A6660]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const updated = {
                      ...editingGuestNotes,
                      notes: guestNotesInput.trim(),
                      updatedAt: new Date().toISOString(),
                    };
                    await dbSaveGuest(updated);
                    await loadDataFromStorage();
                    setEditingGuestNotes(null);
                    showToast("Guest notes saved.");
                  } catch {
                    setError("Failed to save guest notes.");
                  }
                }}
                className="rounded-xl bg-[#C8A45D] px-4 py-2 text-xs font-semibold text-[#131514]"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------- */}
      {/* MODAL 6: DELETE RESERVATION CONFIRMATION                                */}
      {/* ----------------------------------------------------------------------- */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-[95] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmId(null);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-rose-900/40 bg-[#FFFFFF] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle size={24} />
              <h3 className="font-serif text-lg font-bold">Delete Reservation?</h3>
            </div>
            <p className="text-xs text-[#183D32]">
              Are you sure you want to delete this reservation from local storage? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-[#E5DFD3] px-4 py-2 text-xs text-[#5A6660] hover:text-[#183D32]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBooking(deleteConfirmId)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
