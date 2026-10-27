import { getDb } from "@/db";
import { bookings } from "@/db/schema";

export type VillaKey = "Araliya" | "Olu";
export type ChannelKey = "booking" | "airbnb" | "agoda";

export type ChannelFeedConfig = {
  bookingUrl: string;
  airbnbUrl: string;
  agodaUrl: string;
};

export type CalendarFeedsState = {
  Araliya: ChannelFeedConfig;
  Olu: ChannelFeedConfig;
};

export type BlockedRange = {
  id?: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  source: string; // 'Booking.com' | 'Airbnb' | 'Agoda' | 'Website' | 'Direct'
  summary: string;
  status?: string;
};

export type ChannelSyncStatus = {
  channel: ChannelKey;
  name: string;
  configured: boolean;
  url: string;
  lastSync: string | null;
  eventCount: number;
  error?: string | null;
};

export type AvailabilityResponse = {
  villa: VillaKey;
  blockedDates: string[];
  bookedRanges: BlockedRange[];
  channels: Record<ChannelKey, ChannelSyncStatus>;
  lastUpdated: string;
};

// Global in-memory feeds config for serverless lifespan
declare global {
  // eslint-disable-next-line no-var
  var __tranquil_calendar_feeds: CalendarFeedsState | undefined;
  // eslint-disable-next-line no-var
  var __tranquil_ical_cache: Map<string, { timestamp: number; ranges: BlockedRange[] }> | undefined;
}

const DEFAULT_FEEDS: CalendarFeedsState = {
  Araliya: {
    bookingUrl: process.env.BOOKING_ICAL_ARALIYA || "",
    airbnbUrl: process.env.AIRBNB_ICAL_ARALIYA || "",
    agodaUrl: process.env.AGODA_ICAL_ARALIYA || "",
  },
  Olu: {
    bookingUrl: process.env.BOOKING_ICAL_OLU || "",
    airbnbUrl: process.env.AIRBNB_ICAL_OLU || "",
    agodaUrl: process.env.AGODA_ICAL_OLU || "",
  },
};

export function getCalendarFeeds(): CalendarFeedsState {
  if (!globalThis.__tranquil_calendar_feeds) {
    globalThis.__tranquil_calendar_feeds = JSON.parse(JSON.stringify(DEFAULT_FEEDS));
  }
  return globalThis.__tranquil_calendar_feeds!;
}

export function updateCalendarFeeds(updates: Partial<CalendarFeedsState>): CalendarFeedsState {
  const current = getCalendarFeeds();
  if (updates.Araliya) {
    current.Araliya = { ...current.Araliya, ...updates.Araliya };
  }
  if (updates.Olu) {
    current.Olu = { ...current.Olu, ...updates.Olu };
  }
  // Clear cache when feeds are updated
  if (globalThis.__tranquil_ical_cache) {
    globalThis.__tranquil_ical_cache.clear();
  }
  return current;
}

function getCache() {
  if (!globalThis.__tranquil_ical_cache) {
    globalThis.__tranquil_ical_cache = new Map();
  }
  return globalThis.__tranquil_ical_cache;
}

/**
 * Normalizes a date string or timestamp into YYYY-MM-DD
 */
export function toIsoDate(val: string): string | null {
  const clean = val.trim();
  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  // YYYYMMDD
  if (/^\d{8}$/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
  }
  // YYYYMMDDTHHMMSS
  const match = clean.match(/^(\d{4})(\d{2})(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  const parsed = new Date(clean);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

/**
 * Calculates all individual date strings between start (inclusive) and end (exclusive - checkout day)
 */
export function getDatesBetween(start: string, end: string): string[] {
  const dates: string[] = [];
  try {
    const curr = new Date(`${start}T12:00:00Z`);
    const stop = new Date(`${end}T12:00:00Z`);
    while (curr < stop) {
      dates.push(curr.toISOString().slice(0, 10));
      curr.setUTCDate(curr.getUTCDate() + 1);
    }
  } catch {
    // If parsing fails, fall back to start
    dates.push(start);
  }
  return dates;
}

/**
 * Robust RFC 5545 iCalendar Parser
 * Supports unfolding lines, DTSTART, DTEND, SUMMARY, STATUS, UID
 */
export function parseIcsContent(icsContent: string, channelName: string): BlockedRange[] {
  const ranges: BlockedRange[] = [];
  // RFC 5545 line unfolding: CRLF + whitespace or LF + whitespace
  const unfolded = icsContent.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  
  // Extract all VEVENT blocks
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/gi;
  let match: RegExpExecArray | null;

  while ((match = eventRegex.exec(unfolded)) !== null) {
    const block = match[1];
    
    // Check status
    const statusMatch = block.match(/STATUS:\s*([A-Z]+)/i);
    if (statusMatch && statusMatch[1].toUpperCase() === "CANCELLED") {
      continue;
    }

    // Extract DTSTART
    // Formats:
    // DTSTART;VALUE=DATE:20261129
    // DTSTART:20261129T140000Z
    // DTSTART;TZID=...:20261129T140000
    const startMatch = block.match(/DTSTART(?:;[^:]*)?:([^\r\n]+)/i);
    // Extract DTEND
    const endMatch = block.match(/DTEND(?:;[^:]*)?:([^\r\n]+)/i);
    // Extract SUMMARY
    const summaryMatch = block.match(/SUMMARY:([^\r\n]+)/i);
    // Extract UID
    const uidMatch = block.match(/UID:([^\r\n]+)/i);

    if (!startMatch) continue;

    const startDate = toIsoDate(startMatch[1]);
    if (!startDate) continue;

    let endDate = endMatch ? toIsoDate(endMatch[1]) : null;

    // If no DTEND or invalid, treat as 1-day reservation
    if (!endDate || endDate <= startDate) {
      const nextDay = new Date(`${startDate}T12:00:00Z`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      endDate = nextDay.toISOString().slice(0, 10);
    }

    const summary = summaryMatch ? summaryMatch[1].trim() : `Reserved (${channelName})`;
    const uid = uidMatch ? uidMatch[1].trim() : `${channelName}-${startDate}-${endDate}`;

    ranges.push({
      id: uid,
      start: startDate,
      end: endDate,
      source: channelName,
      summary,
    });
  }

  return ranges;
}

/**
 * Fetches an external iCal feed with caching & timeout
 */
export async function fetchChannelIcs(
  url: string,
  channelName: string,
  forceRefresh = false
): Promise<{ ranges: BlockedRange[]; error?: string }> {
  if (!url || !url.startsWith("http")) {
    return { ranges: [] };
  }

  const cache = getCache();
  const cached = cache.get(url);
  const now = Date.now();
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
    return { ranges: cached.ranges };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8-second timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "TranquilTerraceSync/1.0 (Hospitality iCal Sync; Galle, Sri Lanka)",
        Accept: "text/calendar, text/plain, */*",
      },
      next: { revalidate: 300 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    const ranges = parseIcsContent(text, channelName);
    cache.set(url, { timestamp: now, ranges });
    return { ranges };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch iCal feed";
    // If cache exists even though expired, use as fallback
    if (cached) {
      return { ranges: cached.ranges, error: `Warning: Using cached data (${msg})` };
    }
    return { ranges: [], error: msg };
  }
}

/**
 * Generates an RFC 5545 iCalendar string for exporting to Airbnb, Booking.com, and Agoda
 */
export async function generateVillaIcs(villa: VillaKey, origin = "https://tranquilterracevilla.com"): Promise<string> {
  const allBookings = await getDb().select().from(bookings);
  
  // Active bookings for this villa (excluding cancelled or checked_out if old)
  const activeBookings = (allBookings as any[]).filter(
    (b) =>
      b.villaName?.toLowerCase() === villa.toLowerCase() &&
      b.status !== "cancelled" &&
      b.checkin &&
      b.checkout
  );

  const nowIso = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tranquil Terrace Galle//Hospitality Sync 2.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Tranquil Terrace - Villa ${villa}`,
    "X-WR-TIMEZONE:Asia/Colombo",
    `X-WR-CALDESC:Live reservation calendar for Villa ${villa} at Tranquil Terrace Galle`,
  ];

  for (const b of activeBookings) {
    const startClean = b.checkin.replaceAll("-", "");
    const endClean = b.checkout.replaceAll("-", "");
    const uid = `${b.reference || b.id || crypto.randomUUID()}@tranquilterrace.com`;
    const summary = `Reserved - Villa ${villa} (${b.source || "Direct"})`;
    const description = `Reservation Reference: ${b.reference || b.id} | Guests: ${b.guests || 2}`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowIso}`);
    lines.push(`DTSTART;VALUE=DATE:${startClean}`);
    lines.push(`DTEND;VALUE=DATE:${endClean}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("TRANSP:OPAQUE");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Aggregates all reservations (internal DB + external OTA feeds) for a villa
 */
export async function getVillaAvailability(
  villa: VillaKey,
  forceRefresh = false
): Promise<AvailabilityResponse> {
  const feeds = getCalendarFeeds()[villa] || { bookingUrl: "", airbnbUrl: "", agodaUrl: "" };
  
  // 1. Fetch internal DB confirmed/pending reservations
  const allDbBookings = await getDb().select().from(bookings);
  const internalRanges: BlockedRange[] = (allDbBookings as any[])
    .filter(
      (b) =>
        b.villaName?.toLowerCase() === villa.toLowerCase() &&
        b.status !== "cancelled" &&
        b.checkin &&
        b.checkout
    )
    .map((b) => ({
      id: b.id || b.reference,
      start: b.checkin,
      end: b.checkout,
      source: b.source || "Website",
      summary: `Villa ${villa} Direct Reservation`,
      status: b.status,
    }));

  // 2. Fetch external OTA feeds in parallel
  const channelDefs: { key: ChannelKey; name: string; url: string }[] = [
    { key: "booking", name: "Booking.com", url: feeds.bookingUrl },
    { key: "airbnb", name: "Airbnb", url: feeds.airbnbUrl },
    { key: "agoda", name: "Agoda", url: feeds.agodaUrl },
  ];

  const channelResults = await Promise.all(
    channelDefs.map(async (def) => {
      if (!def.url) {
        return {
          key: def.key,
          name: def.name,
          configured: false,
          url: "",
          ranges: [] as BlockedRange[],
          error: null,
        };
      }
      const res = await fetchChannelIcs(def.url, def.name, forceRefresh);
      return {
        key: def.key,
        name: def.name,
        configured: true,
        url: def.url,
        ranges: res.ranges,
        error: res.error || null,
      };
    })
  );

  const channels: Record<ChannelKey, ChannelSyncStatus> = {
    booking: {
      channel: "booking",
      name: "Booking.com",
      configured: false,
      url: "",
      lastSync: null,
      eventCount: 0,
      error: null,
    },
    airbnb: {
      channel: "airbnb",
      name: "Airbnb",
      configured: false,
      url: "",
      lastSync: null,
      eventCount: 0,
      error: null,
    },
    agoda: {
      channel: "agoda",
      name: "Agoda",
      configured: false,
      url: "",
      lastSync: null,
      eventCount: 0,
      error: null,
    },
  };

  const externalRanges: BlockedRange[] = [];
  const nowStamp = new Date().toISOString();

  for (const res of channelResults) {
    channels[res.key] = {
      channel: res.key,
      name: res.name,
      configured: res.configured,
      url: res.url,
      lastSync: res.configured ? nowStamp : null,
      eventCount: res.ranges.length,
      error: res.error,
    };
    externalRanges.push(...res.ranges);
  }

  // Combine internal and external ranges
  const allRanges = [...internalRanges, ...externalRanges];

  // Calculate unique blocked dates (nights)
  const blockedDatesSet = new Set<string>();
  for (const r of allRanges) {
    const dates = getDatesBetween(r.start, r.end);
    for (const d of dates) {
      blockedDatesSet.add(d);
    }
  }

  const blockedDates = Array.from(blockedDatesSet).sort();

  return {
    villa,
    blockedDates,
    bookedRanges: allRanges,
    channels,
    lastUpdated: nowStamp,
  };
}
