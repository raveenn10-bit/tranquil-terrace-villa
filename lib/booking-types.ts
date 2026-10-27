export const bookingStatuses = [
  "inquiry",
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
] as const;

export const paymentStatuses = ["unpaid", "partial", "paid", "refunded"] as const;
export const villaNames = ["Araliya", "Olu"] as const;

export type BookingStatus = (typeof bookingStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type VillaName = (typeof villaNames)[number];

export type BookingRecord = {
  id: string;
  reference: string;
  guestName: string;
  email: string;
  phone: string;
  villaName: VillaName;
  checkin: string;
  checkout: string;
  guests: number;
  source: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paidAmount: number;
  specialRequest: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
};
