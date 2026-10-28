async function run() {
  // 1. Wrong login
  const wrongRes = await fetch("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "Admin", password: "wrong" }),
  });
  console.log("1. Wrong login status (expect 401):", wrongRes.status);

  // 2. Correct login
  const loginRes = await fetch("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "Admin", password: "2026" }),
  });
  console.log("2. Correct login status (expect 200):", loginRes.status);
  const cookie = loginRes.headers.get("set-cookie");
  console.log("   Set-Cookie received:", cookie ? cookie.split(";")[0] : "none");

  // 3. Test /api/bookings with cookie
  const bookingsRes = await fetch("http://localhost:3000/api/bookings", {
    headers: { cookie: cookie ? cookie.split(";")[0] : "" },
  });
  console.log("3. /api/bookings status (expect 200):", bookingsRes.status);
  const bookingsData = await bookingsRes.json();
  console.log("   Bookings count:", bookingsData.bookings ? bookingsData.bookings.length : 0);

  // 4. Test /admin SSR page without cookie
  const adminUnauth = await fetch("http://localhost:3000/admin");
  const unauthText = await adminUnauth.text();
  console.log("4. /admin unauth contains 'Staff &amp; Owner Portal':", unauthText.includes("Staff &amp; Owner Portal"));
  console.log("   /admin unauth contains username field:", unauthText.includes("admin-username"));

  // 5. Test /admin SSR page with cookie
  const adminAuth = await fetch("http://localhost:3000/admin", {
    headers: { cookie: cookie ? cookie.split(";")[0] : "" },
  });
  const authText = await adminAuth.text();
  console.log("5. /admin auth contains 'Signed in as':", authText.includes("Signed in as"));
}

run().catch(console.error);
