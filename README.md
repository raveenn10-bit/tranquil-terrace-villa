# Tranquil Terrace Galle

## Current property facts
Two separate private villas named Araliya and Olu. Each villa has one king bedroom, one private bathroom, a private plunge pool and capacity for up to two guests. This owner-supplied setup is the final source of truth.

## Pages
Home (`/`), The Villas (`/villas.html`), Experiences, Gallery, Explore Galle and Contact & Enquiry retain the original premium design. `/admin` is the separate booking dashboard. The project now uses the Sites Vinext runtime because bookings require server-side storage.

## Booking dashboard
Website enquiries are saved to a D1 database before the WhatsApp compose step and receive a unique `TTG-...` reference. The dashboard supports search, status filters, manual bookings, booking edits, check-in/check-out/cancellation states, payment status and amounts, internal notes, source tracking, CSV export and summary cards.

Confirmed and checked-in bookings cannot overlap another confirmed or checked-in stay for the same villa. The dashboard API is protected by the authenticated Site owner ID. Non-owner visitors to `/admin` see read-only sample data only; real guest records and write controls are never returned to them.

Booking statuses: inquiry, pending, confirmed, checked in, checked out and cancelled. Payment statuses: unpaid, partial, paid and refunded.

## Reservations and calendar
Visible two-month calendar on Home, The Villa and Contact supports a choice of Araliya or Olu, arrival/departure selection, 1–2 guests, month navigation, past-date blocking, reset and direct enquiry. The calendar is a date selector; no dates are represented as confirmed available or sold out. There is no live iCal or channel-manager connection. Live inventory needs an owner-supplied feed or authenticated integration.

Booking.com: https://www.booking.com/hotel/lk/tranquil-terrace-galle-galle1.html
Agoda: https://www.agoda.com/tranquil-terrace-galle-h79594102/hotel/galle-lk.html
Airbnb: https://www.airbnb.com/rooms/1493263628966005427

These public listings were found in search and checked for matching property identity on 22 October 2026. Booking.com content access was limited by a JavaScript verification page. Selected dates and guest count are appended to outgoing links; users must confirm the dates, the selected villa, availability and prices on the destination. Destination query-parameter acceptance has not been independently verified.

Direct requests are first saved in the booking dashboard, then open a WhatsApp message preview to +94 77 068 2366 with the booking reference. Visitors must still press send in WhatsApp. A saved request is not a confirmed reservation. There is no automatic payment gateway or live third-party inventory sync.

## Google reviews and photographs
Source: https://maps.app.goo.gl/RJAmGePoCYyHsJYX8
Observed 22 October 2026: 4.6 out of 5 from 49 reviews. Selected short excerpts from real 5/5 reviews by Upeksha Waragoda, Duminda Kumara and Sudesh Madushanka are attributed and link to the original review panel. The page labels the rating snapshot and notes that it does not update automatically. Five real property photographs were selected from the user-supplied Google Maps listing and saved as WebP assets. Original coordinates: 6.0750215, 80.2264243.

## Design and accessibility
Premium light theme, split hero, responsive navigation and the supplied Tranquil Terrace logo in the header, footer and browser icon. Every page section has a staggered scroll entrance, typography motion, image masks and subtle desktop parallax. The shared villa footer retains its animated palms, pool, birds and lamp. Reduced-motion preference is respected. Fonts: Cormorant Garamond and Manrope with system fallbacks.

## Validation
Generated and inspected the D1 migration, applied it to local preview storage, and completed a production build. Browser QA verified the dashboard preview, API access protection, mobile layout, the added phone field and a complete locally saved booking request with a generated reference. No WhatsApp message was sent.

Mobile dashboard verified at 390px iframe width with no horizontal overflow. The villa site calendar and review section remain in place.

## Cinematic 3D redesign — 27 October 2026
The public pages now use an editorial hospitality layout inspired by the user-supplied Taru Villas reference and screenshot: a utility-led desktop header, sculpted split hero, layered image planes, perspective depth, cursor light, subtle tilt, premium calendar treatment and spatial footer styling. Existing real property photography, copy, booking APIs, OTA links, reviews and the owner dashboard remain connected. Motion is simplified on small screens and disabled when reduced-motion is requested.

Google Maps verified on 27 October 2026: Bogahawella Road, Galle 80000; phone +94 77 068 2366; package check-in/out: Day Package 10:00 AM – 3:00 PM, Night Package 5:00 PM – 9:00 AM; rating 4.9/5 from 49 reviews; 82 public photos. The existing five villa WebP assets were selected from this same property listing.

## Final villa names and capacity — owner update, 27 October 2026
Tranquil Terrace has two separate private villas: **Araliya** and **Olu**. Each has one king bedroom, one private bathroom, one private plunge pool and capacity for up to two guests. Website enquiries and admin bookings store the selected villa. Confirmed-date overlap protection is applied per villa, allowing Araliya and Olu to be reserved independently on the same dates.
