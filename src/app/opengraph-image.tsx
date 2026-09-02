import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#030405",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "70px 80px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        position: "relative",
      }}
    >
      {/* Background ambient radial glows */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          left: "-100px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(87, 230, 221, 0.18) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          right: "-100px",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(132, 108, 255, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Top bar: Brand + Status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              border: "1.5px solid rgba(87, 230, 221, 0.6)",
              backgroundColor: "rgba(10, 16, 24, 0.8)",
              color: "#57e6dd",
              fontWeight: "bold",
              fontSize: "20px",
              fontFamily: "monospace",
            }}
          >
            MZ
          </div>
          <span
            style={{
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "600",
              letterSpacing: "-0.02em",
            }}
          >
            mzelent.pl
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "20px",
            border: "1px solid rgba(87, 230, 221, 0.3)",
            backgroundColor: "rgba(3, 4, 5, 0.7)",
            color: "#57e6dd",
            fontSize: "14px",
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#57e6dd",
            }}
          />
          <span>MSCA Fellow · Horizon Europe</span>
        </div>
      </div>

      {/* Middle Hero: Title & Research Domains */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            color: "#8b92a5",
            fontSize: "16px",
            fontFamily: "monospace",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Scientific Portfolio & Computational Physics
        </div>
        <h1
          style={{
            color: "#ffffff",
            fontSize: "58px",
            fontWeight: "800",
            letterSpacing: "-0.03em",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Dr Mateusz Zelent
        </h1>
        <p
          style={{
            color: "#a0a6b8",
            fontSize: "24px",
            lineHeight: 1.4,
            margin: 0,
            maxWidth: "920px",
          }}
        >
          Topological Skyrmions, Graded Magnonics, Nonlinear Spin Waves, and GPU Continuum Simulations
        </p>

        {/* Research Chips */}
        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#57e6dd",
              fontSize: "15px",
              fontFamily: "monospace",
            }}
          >
            Chiral Skyrmions [Q = -1]
          </div>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#846cff",
              fontSize: "15px",
              fontFamily: "monospace",
            }}
          >
            Spin-Wave Optics & Caustics
          </div>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#57e6dd",
              fontSize: "15px",
              fontFamily: "monospace",
            }}
          >
            {'MSCA PF "CNMA" (RPTU & UAM)'}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Institutional Affiliations */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "24px",
        }}
      >
        <div style={{ display: "flex", gap: "24px", color: "#8b92a5", fontSize: "15px" }}>
          <span>RPTU Kaiserslautern-Landau</span>
          <span>•</span>
          <span>Adam Mickiewicz University</span>
          <span>•</span>
          <span>European Commission (MSCA)</span>
          <span>•</span>
          <span>NCN</span>
        </div>
        <div style={{ color: "#57e6dd", fontSize: "15px", fontFamily: "monospace" }}>
          ORCID: 0000-0002-3908-0118
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
