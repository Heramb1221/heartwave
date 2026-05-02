import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-green-500 rounded-full p-4 animate-bounce">
            <Check size={48} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-black mb-2">
          Welcome to Premium! 🎉
        </h1>
        <p className="text-xl text-slate-300 mb-4">
          Your payment was successful
        </p>

        <p className="text-slate-400 text-sm mb-8">
          Redirecting to dashboard in a few seconds...
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl transition"
        >
          Go to Dashboard
        </button>

        {sessionId && (
          <p className="text-xs text-slate-500 mt-8">
            Session ID: {sessionId}
          </p>
        )}
      </div>
    </div>
  );
};

export default Success;