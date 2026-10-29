export type StayPackageId = "day-package" | "night-package" | "day-night-package";
export type TimingOptionId = "A" | "B";

export interface TimingOption {
  id: TimingOptionId;
  label: string;
  checkinTime: string;
  checkoutTime: string;
  startHour: number; // 24-hour clock (e.g. 11 for 11:00 AM, 17 for 5:00 PM)
  startMinute: number;
  endHour: number;   // 24-hour clock (e.g. 9 for 9:00 AM, 15 for 3:00 PM)
  endMinute: number;
  endNextDay: boolean;
}

export interface StayPackage {
  id: StayPackageId;
  name: string;
  priceLKR: number;
  guests: number;
  checkinTime?: string;
  checkoutTime?: string;
  startHour?: number;
  startMinute?: number;
  endHour?: number;
  endMinute?: number;
  endNextDay?: boolean;
  duration: string;
  timingOptions?: TimingOption[];
  meals: string[];
  amenities: string[];
  description: string;
}

export const STAY_PACKAGES: readonly StayPackage[] = [
  {
    id: "day-package",
    name: "Day Package",
    priceLKR: 12500,
    guests: 2,
    checkinTime: "10:00 AM",
    checkoutTime: "3:00 PM",
    startHour: 10,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
    endNextDay: false,
    duration: "Day use (5 hours)",
    meals: ["Lunch", "Welcome Drink"],
    amenities: ["Private Swimming Pool", "Private Location", "Private Car Parking"],
    description: "An unhurried day escape by your private plunge pool with lunch and refreshments.",
  },
  {
    id: "night-package",
    name: "Night Package",
    priceLKR: 14500,
    guests: 2,
    checkinTime: "5:00 PM",
    checkoutTime: "9:00 AM (Following Day)",
    startHour: 17,
    startMinute: 0,
    endHour: 9,
    endMinute: 0,
    endNextDay: true,
    duration: "Overnight (16 hours)",
    meals: ["Floating Breakfast", "Dinner", "Welcome Drink"],
    amenities: ["Private Swimming Pool", "Private Location", "Private Car Parking"],
    description: "Intimate overnight getaway featuring candlelit evening by the water and signature floating breakfast.",
  },
  {
    id: "day-night-package",
    name: "Day & Night Package",
    priceLKR: 26000,
    guests: 2,
    duration: "Overnight & day stay (Option A: 11 AM – 9 AM or Option B: 5 PM – 3 PM next day)",
    timingOptions: [
      {
        id: "A",
        label: "Option A: 11:00 AM → 9:00 AM (Next Day)",
        checkinTime: "11:00 AM",
        checkoutTime: "9:00 AM (Next Day)",
        startHour: 11,
        startMinute: 0,
        endHour: 9,
        endMinute: 0,
        endNextDay: true,
      },
      {
        id: "B",
        label: "Option B: 5:00 PM → 3:00 PM (Next Day)",
        checkinTime: "5:00 PM",
        checkoutTime: "3:00 PM (Next Day)",
        startHour: 17,
        startMinute: 0,
        endHour: 15,
        endMinute: 0,
        endNextDay: true,
      },
    ],
    meals: ["Floating Breakfast", "Dinner", "Lunch", "Welcome Drink"],
    amenities: ["Private Swimming Pool", "Private Location", "Private Car Parking"],
    description: "The complete immersion with floating breakfast, lunch, and dinner. Choose between two flexible check-in schedules.",
  },
] as const;

export const PACKAGE_IDS = STAY_PACKAGES.map((pkg) => pkg.id);

export function isValidPackageId(id: unknown): id is StayPackageId {
  return typeof id === "string" && (PACKAGE_IDS as readonly string[]).includes(id);
}

export function getPackageById(id: string | null | undefined): StayPackage | undefined {
  if (!id) return undefined;
  const normalized = id.toLowerCase().trim();
  return STAY_PACKAGES.find(
    (pkg) => pkg.id === normalized || pkg.name.toLowerCase() === normalized
  );
}

export interface StayWindowCalculation {
  packageId: StayPackageId;
  packageName: string;
  timingOption?: TimingOption;
  checkinTime: string;
  checkoutTime: string;
  checkinDate: string;  // YYYY-MM-DD
  checkoutDate: string; // YYYY-MM-DD
  checkinDateTime: string;  // "YYYY-MM-DD 10:00 AM"
  checkoutDateTime: string; // "YYYY-MM-DD 3:00 PM"
  checkinEpochMs: number;
  checkoutEpochMs: number;
  priceLKR: number;
}

/**
 * Calculates concrete stay timestamps and formatted times from an arrival date and package details.
 */
export function calculateStayWindow(
  dateStr: string,
  packageId: StayPackageId | string,
  timingOptionId?: string | null
): StayWindowCalculation {
  const pkg = getPackageById(packageId) ?? STAY_PACKAGES[0];
  
  let checkinTime = pkg.checkinTime ?? "10:00 AM";
  let checkoutTime = pkg.checkoutTime ?? "3:00 PM";
  let startHour = pkg.startHour ?? 10;
  let startMinute = pkg.startMinute ?? 0;
  let endHour = pkg.endHour ?? 15;
  let endMinute = pkg.endMinute ?? 0;
  let isNextDay = pkg.endNextDay ?? false;
  let selectedOption: TimingOption | undefined;

  if (pkg.timingOptions && pkg.timingOptions.length > 0) {
    const optMatch = pkg.timingOptions.find(
      (opt) => opt.id.toLowerCase() === (timingOptionId ?? "A").toLowerCase()
    );
    selectedOption = optMatch ?? pkg.timingOptions[0];
    checkinTime = selectedOption.checkinTime;
    checkoutTime = selectedOption.checkoutTime;
    startHour = selectedOption.startHour;
    startMinute = selectedOption.startMinute;
    endHour = selectedOption.endHour;
    endMinute = selectedOption.endMinute;
    isNextDay = selectedOption.endNextDay;
  }

  // Parse arrival date (YYYY-MM-DD)
  const [yearStr, monthStr, dayStr] = dateStr.slice(0, 10).split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const startDate = new Date(Date.UTC(year, month, day, startHour, startMinute, 0));
  const endDate = new Date(
    Date.UTC(year, month, isNextDay ? day + 1 : day, endHour, endMinute, 0)
  );

  const formatIsoDate = (d: Date) => d.toISOString().slice(0, 10);
  const checkinDate = formatIsoDate(startDate);
  const checkoutDate = formatIsoDate(endDate);

  return {
    packageId: pkg.id,
    packageName: pkg.name,
    timingOption: selectedOption,
    checkinTime,
    checkoutTime,
    checkinDate,
    checkoutDate,
    checkinDateTime: `${checkinDate} ${checkinTime}`,
    checkoutDateTime: `${checkoutDate} ${checkoutTime}`,
    checkinEpochMs: startDate.getTime(),
    checkoutEpochMs: endDate.getTime(),
    priceLKR: pkg.priceLKR,
  };
}

export interface WhatsAppBookingParams {
  villaName: string;
  packageName: string;
  checkin: string;
  checkout: string;
  guests?: number;
  priceLKR: number;
}

/**
 * Generates the standardized WhatsApp enquiry message matching exact brand requirements:
 *
 * Hello Tranquil Terrace Galle,
 *
 * I would like to enquire about a booking.
 *
 * Villa: [Selected Villa]
 * Package: [Selected Package]
 * Check-in: [Date and Time]
 * Check-out: [Date and Time]
 * Guests: 2
 * Total: LKR [Price]
 *
 * Please confirm availability.
 */
export function generateWhatsAppBookingMessage(params: WhatsAppBookingParams): string {
  const cleanVilla = params.villaName.trim().startsWith("Villa ")
    ? params.villaName.trim()
    : `Villa ${params.villaName.trim()}`;
  
  const formattedPrice = new Intl.NumberFormat("en-LK").format(Math.round(params.priceLKR));
  const guests = params.guests ?? 2;

  return [
    "Hello Tranquil Terrace Galle,",
    "",
    "I would like to enquire about a booking.",
    "",
    `Villa: ${cleanVilla}`,
    `Package: ${params.packageName}`,
    `Check-in: ${params.checkin}`,
    `Check-out: ${params.checkout}`,
    `Guests: ${guests}`,
    `Total: LKR ${formattedPrice}`,
    "",
    "Please confirm availability.",
  ].join("\n");
}

/**
 * Builds a direct wa.me link with the prefilled message encoded.
 */
export function generateWhatsAppLink(
  params: WhatsAppBookingParams,
  phoneNumber = "94770682366"
): string {
  const digitsOnly = phoneNumber.replace(/[^0-9]/g, "");
  const message = generateWhatsAppBookingMessage(params);
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
