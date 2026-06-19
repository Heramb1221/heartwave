import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { Check, ArrowLeft, Crown, Zap, Shield } from "lucide-react";
import "./Upgrade.css";

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

const Upgrade = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"plan" | "confirm">("plan");

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/payment/create-checkout-session", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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
    <div className="upgrade-root">
      {/* Ambient blobs */}
      <div className="upgrade-blob-1" />
      <div className="upgrade-blob-2" />

      {/* Back button */}
      <button className="upgrade-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={17} /> Back
      </button>

      {/* Card */}
      <div className="upgrade-card">
        <div className="upgrade-card-accent" />
        <div className="upgrade-card-body">

          {step === "plan" ? (
            <>
              {/* Header */}
              <div className="upgrade-header">
                <div className="upgrade-header-icon">
                  <Crown size={24} color="#fff" />
                </div>
                <div>
                  <div className="upgrade-header-title">Go Premium</div>
                  <div className="upgrade-header-sub">Unlock the full Melodies experience</div>
                </div>
              </div>

              {/* Price */}
              <div className="upgrade-price-block">
                <div className="upgrade-price-num">
                  $9.99<span className="upgrade-price-per">/mo</span>
                </div>
                <div className="upgrade-price-note">Cancel anytime · No hidden fees</div>
              </div>

              {/* Features */}
              <div className="upgrade-features">
                {FEATURES.map(f => (
                  <div key={f} className="upgrade-feature-row">
                    <div className="upgrade-feature-check">
                      <Check size={11} color="var(--coral)" />
                    </div>
                    <span className="upgrade-feature-text">{f}</span>
                  </div>
                ))}
              </div>

              <button
                className="upgrade-btn-primary"
                onClick={() => setStep("confirm")}
              >
                <Zap size={17} /> Continue to Upgrade
              </button>
            </>
          ) : (
            <>
              {/* Confirm step */}
              <div className="upgrade-confirm-center">
                <div className="upgrade-confirm-icon">
                  <Shield size={30} color="var(--violet-soft)" />
                </div>
                <div className="upgrade-confirm-title">Ready to upgrade?</div>
                <p className="upgrade-confirm-desc">
                  You'll be redirected to our secure Stripe checkout. Subscription starts at{" "}
                  <strong style={{ color: "var(--text-primary)" }}>$9.99/month</strong>.
                </p>
              </div>

              <div className="upgrade-trust-box">
                {["Secure payment via Stripe", "30-day money-back guarantee", "Cancel anytime from settings"].map(item => (
                  <div key={item} className="upgrade-trust-row">
                    <Check size={13} color="var(--coral)" style={{ flexShrink: 0 }} />
                    <span className="upgrade-trust-text">{item}</span>
                  </div>
                ))}
              </div>

              <button
                className="upgrade-btn-checkout"
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><div className="upgrade-spinner" /> Processing…</>
                ) : (
                  "Proceed to Payment"
                )}
              </button>

              <button className="upgrade-btn-back" onClick={() => setStep("plan")}>
                ← Back to plan
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Upgrade;