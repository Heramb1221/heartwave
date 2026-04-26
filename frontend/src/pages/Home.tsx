import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn]);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Welcome to HeartWave 🎵</h1>

      <div className="flex gap-4">
        <SignInButton mode="modal">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Login
          </button>
        </SignInButton>

        <SignUpButton mode="modal">
          <button className="px-4 py-2 bg-green-500 text-white rounded">
            Sign Up
          </button>
        </SignUpButton>
      </div>
    </div>
  );
};

export default Home;