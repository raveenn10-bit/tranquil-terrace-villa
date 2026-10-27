import { getVillaAvailability, VillaKey } from "@/lib/calendar-sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawVilla = searchParams.get("villa") || "Araliya";
    const force = searchParams.get("force") === "true";
    const villa: VillaKey = rawVilla.toLowerCase().includes("olu") ? "Olu" : "Araliya";

    const availability = await getVillaAvailability(villa, force);

    return Response.json(availability, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error checking availability";
    return Response.json({ error: message }, { status: 500 });
  }
}
