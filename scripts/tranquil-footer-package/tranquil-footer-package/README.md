# Tranquil Terrace Galle — Animated Luxury Footer

A responsive HTML/CSS/SVG animated footer, inspired by the approved footer concept.

## Preview
Open `index.html` in a browser (internet is optional; fonts fall back to Georgia/Arial). The intro section is demo-only.

## Integration into the existing Next.js website
1. Copy the `<footer class="tt-footer" ...> ... </footer>` element from `index.html` into the existing footer component (convert `class` to `className`, `href` as normal JSX, and SVG `class` to `className`).
2. Import `animated-footer.css` in your Next.js global CSS or root layout.
3. Replace the tiny `animated-footer.js` with an effect in the React component, or load it client-side; it only controls entrance reveals and the copyright year.
4. Remove demo intro and any existing footer to avoid duplicates.
5. Update/verify all links (some paths are proposed five-page routes and may not exist yet).

## Caution before handoff
- Contact details are deliberately **not invented**. Add only owner-approved phone, email, WhatsApp and social accounts.
- Booking.com, Agoda and Airbnb text logos are decorative badges in this demo, **not links**; link only after confirming the official listing URLs. Replace with licensed authentic SVG logos if desired.
- The custom domain spelling is `tranquilterracegalle.com` as supplied. Verify routes and SSL before launch.
- Illustrated palms, villa silhouettes and wave are inline SVG and CSS, not a flattened image.
- Test on real devices and run production build before deployment.

## Motion
Palm sway, drifting birds, sunrise entrance, staggered scroll reveals and button/social hover effects. Honours `prefers-reduced-motion`.
