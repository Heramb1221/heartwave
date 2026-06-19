import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { X, Check, Zap, Crown, Shield, ArrowRight } from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const FEATURES = [
  "Unlimited song requests",
  "Host shared listening rooms",
  "Advanced equalizer controls",
  "Listening analytics dashboard",
  "High-quality audio streaming",
  "Mobile app priority access",
  "Voice chat with friends",
  "Save & export playlists",
];

interface UpgradeModalProps {
  onClose: () => void;
}

export const UpgradeModal = ({ onClose }: UpgradeModalProps) => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"plan" | "confirm">("plan");

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/payment/create-checkout-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout session");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to upgrade. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        animation: "fade-in 0.25s var(--ease) both",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%", maxWidth: 440, position: "relative",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-2xl)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), var(--shadow-violet)",
          animation: "scale-in 0.3s var(--ease) both",
          overflow: "hidden",
        }}
      >
        {/* Top accent line */}
        <div style={{
          height: 2,
          background: "linear-gradient(90deg, var(--violet), var(--coral), var(--violet-soft))",
        }} />

        <div style={{ padding: 28 }}>
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16,
              width: 32, height: 32, borderRadius: "var(--r-sm)",
              background: "var(--bg-input)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", display: "flex",
              alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all var(--t-base)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
          >
            <X size={16} />
          </button>

          {step === "plan" ? (
            <>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--r-md)",
                  background: "linear-gradient(135deg, var(--violet), var(--coral))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(108,63,255,0.3)",
                }}>
                  <Crown size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.3rem" }}>Go Premium</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Unlock the full Melodies experience</div>
                </div>
              </div>

              {/* Price */}
              <div style={{
                textAlign: "center", padding: "20px 16px", marginBottom: 20,
                background: "var(--violet-dim)", border: "1px solid var(--border-accent)",
                borderRadius: "var(--r-lg)",
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "3rem", lineHeight: 1 }}>
                  $9.99
                  <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--text-secondary)" }}>/mo</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 6 }}>
                  Cancel anytime · No hidden fees
                </div>
              </div>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {FEATURES.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      background: "var(--coral-dim)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Check size={11} color="var(--coral)" />
                    </div>
                    <span style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-violet"
                style={{ width: "100%", padding: "13px", justifyContent: "center", borderRadius: "var(--r-lg)", fontSize: "0.9rem" }}
                onClick={() => setStep("confirm")}
              >
                <Zap size={16} /> Continue to Upgrade
              </button>
              <button
                onClick={onClose}
                style={{
                  width: "100%", padding: "12px", marginTop: 8,
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: "0.84rem",
                  transition: "color var(--t-base)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
              >
                Maybe later
              </button>
            </>
          ) : (
            <>
              {/* Confirm */}
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{
                  width: 60, height: 60, margin: "0 auto 16px",
                  borderRadius: "var(--r-lg)",
                  background: "var(--violet-dim)", border: "1px solid var(--border-accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Shield size={26} color="var(--violet-soft)" />
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", marginBottom: 10 }}>
                  Ready to upgrade?
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  You'll be taken to our secure Stripe checkout.
                  Subscription starts at <strong style={{ color: "var(--text-primary)" }}>$9.99/month</strong>.
                </p>
              </div>

              <div style={{
                padding: 16, borderRadius: "var(--r-lg)", marginBottom: 24,
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
              }}>
                {["Secure payment via Stripe", "30-day money-back guarantee", "Cancel anytime from your account"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Check size={13} color="var(--coral)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item}</span>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: "13px", justifyContent: "center", borderRadius: "var(--r-lg)", fontSize: "0.9rem" }}
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span style={{
                      width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite",
                      flexShrink: 0,
                    }} />
                    Processing…
                  </>
                ) : (
                  <><ArrowRight size={16} /> Proceed to Payment</>
                )}
              </button>
              <button
                onClick={() => setStep("plan")}
                style={{
                  width: "100%", padding: "12px", marginTop: 8,
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: "0.84rem",
                  transition: "color var(--t-base)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
