import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 24px",
        background: "radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.08) 0%, #141615 70%)",
        color: "#FAF8F5",
        fontFamily: "'Manrope', -apple-system, sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(212, 175, 55, 0.1)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            padding: "6px 16px",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#D4AF37",
            marginBottom: "24px",
          }}
        >
          <span>✦</span>
          <span>ERROR 404 · PAGE NOT FOUND</span>
        </div>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 400,
            lineHeight: 1.15,
            color: "#FAF8F5",
            margin: "0 0 20px",
            letterSpacing: "-0.02em",
          }}
        >
          A quiet detour.
          <em style={{ display: "block", fontStyle: "italic", color: "#C5A880" }}>
            You seem to have drifted off the path.
          </em>
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
            lineHeight: 1.6,
            color: "rgba(250, 248, 245, 0.75)",
            marginBottom: "36px",
          }}
        >
          The page you are seeking does not exist or may have been moved. Let us guide you back to our private pool sanctuary in Karapitiya, Galle.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #C5A880 0%, #A88352 100%)",
              color: "#141615",
              padding: "14px 28px",
              borderRadius: "999px",
              fontSize: "0.88rem",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(168, 131, 82, 0.25)",
            }}
          >
            Return to Sanctuary
          </Link>

          <Link
            href="/villas.html"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              color: "#FAF8F5",
              padding: "14px 28px",
              borderRadius: "999px",
              fontSize: "0.88rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Explore Our Villas &rarr;
          </Link>

          <a
            href="https://wa.me/94770682366?text=Hello%20Tranquil%20Terrace%20Galle%2C%20I%20need%20assistance"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(37, 211, 102, 0.08)",
              border: "1px solid rgba(37, 211, 102, 0.35)",
              color: "#FAF8F5",
              padding: "14px 24px",
              borderRadius: "999px",
              fontSize: "0.88rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            WhatsApp Concierge
          </a>
        </div>
      </div>
    </main>
  );
}
