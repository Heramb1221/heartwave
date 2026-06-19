import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Music2 } from "lucide-react";
import "./Success.css";

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const timer = setTimeout(() => navigate("/dashboard"), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-root">
      <div className="success-glow" />

      <div className="success-card">
        {/* Check icon */}
        <div className="success-icon">
          <Check size={40} color="#fff" />
        </div>

        {/* Text */}
        <h1 className="success-title">Welcome to Premium! 🎉</h1>
        <p className="success-desc">
          Your payment was successful. Enjoy unlimited Melodies.
        </p>
        <p className="success-redirect">Redirecting to dashboard in a few seconds…</p>

        {/* Auto-progress bar */}
        <div className="success-progress-track">
          <div className="success-progress-fill" />
        </div>

        {/* CTA */}
        <button
          className="success-cta-btn"
          onClick={() => navigate("/dashboard")}
        >
          <Music2 size={17} /> Go to Dashboard
        </button>

        {sessionId && (
          <p className="success-session">Session: {sessionId}</p>
        )}
      </div>
    </div>
  );
};

export default Success;