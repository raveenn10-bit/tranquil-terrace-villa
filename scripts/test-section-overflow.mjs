import fs from "fs";

let css = fs.readFileSync("public/meta-redesign.css", "utf-8");

const sectionOverflowFix = `
/* Section and Container Level Containment for Mobile Carousels */
@media (max-width: 768px) {
  main, #main,
  section, .section,
  .meta-amenities-section,
  .meta-packages-section,
  .meta-reviews-section,
  .meta-villas-section,
  .dual-villas,
  .villas.section,
  .guest-reviews.section,
  .galle-guide.section,
  .location.section,
  .stay-details.section,
  .stay-calendar.section,
  .faq.section,
  .contact.section,
  .meta-location-section,
  .meta-calendar-section {
    overflow-x: hidden !important;
    max-width: 100vw !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .meta-amenities-grid,
  .meta-packages-list,
  .meta-reviews-grid,
  .meta-villas-grid,
  .dual-villas-carousel {
    max-width: 100% !important;
    width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 16px !important;
    padding-right: 16px !important;
    box-sizing: border-box !important;
  }
}
`;

css += "\n" + sectionOverflowFix;
fs.writeFileSync("public/meta-redesign.css", css, "utf-8");

let cinCss = fs.readFileSync("public/cinematic-3d.css", "utf-8");
cinCss += "\n" + sectionOverflowFix;
fs.writeFileSync("public/cinematic-3d.css", cinCss, "utf-8");

console.log("Applied section-level overflow containment");
