import { generateVillaIcs, VillaKey } from "@/lib/calendar-sync";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawVilla = searchParams.get("villa") || "Araliya";
    const villa: VillaKey = rawVilla.toLowerCase().includes("olu") ? "Olu" : "Araliya";

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "tranquilterracevilla.com";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const origin = `${proto}://${host}`;

    const icsContent = await generateVillaIcs(villa, origin);

    return new Response(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="tranquil-terrace-${villa.toLowerCase()}.ics"`,
        "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error generating calendar feed";
    return new Response(message, { status: 500, headers: { "Content-Type": "text/plain" } });
  }
}
