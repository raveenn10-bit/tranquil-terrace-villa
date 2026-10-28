import {
  getCalendarFeeds,
  updateCalendarFeeds,
  getVillaAvailability,
  CalendarFeedsState,
} from "@/lib/calendar-sync";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }
  try {
    const feeds = getCalendarFeeds();
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "tranquilterracevilla.com";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const origin = `${proto}://${host}`;

    // Also get quick status for both villas
    const [araliyaStatus, oluStatus] = await Promise.all([
      getVillaAvailability("Araliya", false),
      getVillaAvailability("Olu", false),
    ]);

    return Response.json({
      feeds,
      exportLinks: {
        Araliya: `${origin}/api/calendar/araliya.ics`,
        Olu: `${origin}/api/calendar/olu.ics`,
      },
      status: {
        Araliya: {
          blockedDatesCount: araliyaStatus.blockedDates.length,
          bookedRangesCount: araliyaStatus.bookedRanges.length,
          channels: araliyaStatus.channels,
          lastUpdated: araliyaStatus.lastUpdated,
        },
        Olu: {
          blockedDatesCount: oluStatus.blockedDates.length,
          bookedRangesCount: oluStatus.bookedRanges.length,
          channels: oluStatus.channels,
          lastUpdated: oluStatus.lastUpdated,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error getting calendar settings";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Owner access required." }, { status: 403 });
  }
  try {
    const body = (await request.json()) as Partial<CalendarFeedsState> & { forceSync?: boolean };
    const { forceSync, ...feedUpdates } = body;

    const updatedFeeds = updateCalendarFeeds(feedUpdates);

    // Refresh availability with force flag if requested
    const [araliyaStatus, oluStatus] = await Promise.all([
      getVillaAvailability("Araliya", Boolean(forceSync)),
      getVillaAvailability("Olu", Boolean(forceSync)),
    ]);

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "tranquilterracevilla.com";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const origin = `${proto}://${host}`;

    return Response.json({
      success: true,
      feeds: updatedFeeds,
      exportLinks: {
        Araliya: `${origin}/api/calendar/araliya.ics`,
        Olu: `${origin}/api/calendar/olu.ics`,
      },
      status: {
        Araliya: {
          blockedDatesCount: araliyaStatus.blockedDates.length,
          bookedRangesCount: araliyaStatus.bookedRanges.length,
          channels: araliyaStatus.channels,
          lastUpdated: araliyaStatus.lastUpdated,
        },
        Olu: {
          blockedDatesCount: oluStatus.blockedDates.length,
          bookedRangesCount: oluStatus.bookedRanges.length,
          channels: oluStatus.channels,
          lastUpdated: oluStatus.lastUpdated,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error updating calendar settings";
    return Response.json({ error: message }, { status: 500 });
  }
}
