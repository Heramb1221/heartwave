import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Music, Zap, Users, Headphones } from "lucide-react";

const Home = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-xl">
              <Music size={40} />
            </div>
          </div>
          <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-2">
            HeartWave
          </h1>
          <p className="text-2xl text-slate-300 font-light">
            Listen Together, Feel Together
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-2xl">
          {[
            { icon: Users, title: "Real-Time Sync", desc: "Listen in perfect harmony with friends" },
            { icon: Headphones, title: "Group Control", desc: "Share the DJ role with your crew" },
            { icon: Zap, title: "Crystal Clear", desc: "Premium audio quality, always" },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/20 transition"
            >
              <feature.icon className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-300">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <SignInButton mode="modal">
            <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl transition transform hover:scale-105 shadow-xl">
              Login
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold rounded-xl transition transform hover:scale-105">
              Sign Up
            </button>
          </SignUpButton>
        </div>

        {/* Social proof */}
        <div className="text-center text-slate-400 text-sm">
          <p>Join thousands of music lovers worldwide 🎵</p>
        </div>
      </div>

      {/* Floating elements */}
      <div className="fixed bottom-10 left-10 text-6xl animate-bounce opacity-20">
        🎵
      </div>
      <div className="fixed top-20 right-10 text-5xl animate-bounce opacity-20" style={{ animationDelay: "0.5s" }}>
        🎶
      </div>
    </div>
  );
};

export default Home;