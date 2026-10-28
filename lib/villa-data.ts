import type { VillaName } from "./booking-types.ts";

export type VillaId = "araliya" | "olu";

export interface VillaDefinition {
  id: VillaId;
  name: string; // "Villa Araliya" | "Villa Olu"
  canonicalName: VillaName; // "Araliya" | "Olu"
  subtitle: string;
  capacity: string;
  bedroom: string;
  bathroom: string;
  pool: string;
  image: string;
  fallbackImage: string;
  description: string;
  maxGuests: number;
}

export const VILLAS: readonly VillaDefinition[] = [
  {
    id: "araliya",
    name: "Villa Araliya",
    canonicalName: "Araliya",
    subtitle: "Original Sanctuary",
    capacity: "Up to 2 Guests",
    bedroom: "1 King Bedroom",
    bathroom: "1 Private Bathroom",
    pool: "Private Plunge Pool",
    image: "/images/villas/araliya/araliya-pool-day.jpg",
    fallbackImage: "/assets/villa-0.webp",
    description:
      "The original courtyard villa framed by whitewashed walls, wooden glass doors, tropical frangipani greenery, and an illuminated arch alcove.",
    maxGuests: 2,
  },
  {
    id: "olu",
    name: "Villa Olu",
    canonicalName: "Olu",
    subtitle: "Newly Built Villa",
    capacity: "Up to 2 Guests",
    bedroom: "1 King Bedroom",
    bathroom: "1 Private Bathroom",
    pool: "Private Plunge Pool",
    image: "/images/villas/olu/olu-pool-night.jpg",
    fallbackImage: "/assets/villa-1.webp",
    description:
      "The newly built contemporary retreat featuring a vibrant illuminated night pool, overhead patio umbrella, woven rattan lounge chairs, and ambient string lights.",
    maxGuests: 2,
  },
] as const;

export const VILLA_IDS: readonly VillaId[] = ["araliya", "olu"];

export function isValidVillaId(id: unknown): id is VillaId {
  return typeof id === "string" && (VILLA_IDS as readonly string[]).includes(id.toLowerCase() as VillaId);
}

export function getVillaById(id: string | null | undefined): VillaDefinition | undefined {
  if (!id) return undefined;
  const target = id.toLowerCase().trim();
  return VILLAS.find(
    (v) =>
      v.id === target ||
      v.canonicalName.toLowerCase() === target ||
      v.name.toLowerCase() === target
  );
}

export function getVillaByName(name: string | null | undefined): VillaDefinition | undefined {
  return getVillaById(name);
}

/**
 * Normalizes user/API input to the canonical database string ("Araliya" or "Olu").
 */
export function normalizeVillaName(input: unknown): VillaName {
  if (typeof input !== "string") return "Araliya";
  const str = input.toLowerCase().trim();
  if (str.includes("olu")) return "Olu";
  return "Araliya";
}

/**
 * Returns formatted villa title with "Villa " prefix (e.g. "Villa Araliya").
 */
export function formatVillaDisplayName(input: unknown): string {
  const canonical = normalizeVillaName(input);
  return `Villa ${canonical}`;
}
