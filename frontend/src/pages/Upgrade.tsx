import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { Check, ArrowLeft } from "lucide-react";

const Upgrade = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // ========================
  // HANDLE UPGRADE
  // ========================
  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        "http://localhost:5000/api/payment/create-checkout-session",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to upgrade. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ========================
  // FEATURES
  // ========================
  const features = [
    "🎵 Unlimited song requests",
    "👥 Host shared listening rooms",
    "🎚️ Advanced equalizer",
    "📊 Listening analytics",
    "🔊 High-quality audio",
    "📱 Mobile app access",
    "🎤 Voice chat with friends",
    "💾 Save playlists",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-300 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-4">
            Go Premium
          </h1>
          <p className="text-xl text-slate-300">
            Unlock the full HeartWave experience
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg w-full">
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-md border border-pink-500/50 rounded-2xl p-8 mb-8">
            {/* Price */}
            <div className="text-center mb-8">
              <div className="text-6xl font-black text-white mb-2">
                $9.99
              </div>
              <p className="text-slate-300">/month</p>
              <p className="text-sm text-slate-400 mt-2">
                Cancel anytime, no hidden fees
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check size={20} className="text-green-400 flex-shrink-0" />
                  <span className="text-slate-200">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition transform hover:scale-105 shadow-lg"
            >
              {isLoading ? "Processing..." : "Upgrade Now"}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="text-center space-y-2 text-slate-400 text-sm">
            <p>✅ Secure payment with Stripe</p>
            <p>✅ 24/7 customer support</p>
            <p>✅ 30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;