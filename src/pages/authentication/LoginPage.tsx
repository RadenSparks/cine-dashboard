import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Boxes } from "../../components/BoxesBackground";
import { post } from "../../client/axiosCilent";
import { type AuthenticationRequestDTO, type AuthenticationResponseDTO } from "../../dto/dto";
import { type ApiResponse } from "../../entities/type";
import { LogoutLoader } from "../../components/UI/LogoutLoader";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginLoader, setShowLoginLoader] = useState(false);
  const navigate = useNavigate();

  const loginSteps = [
    { text: "Verifying credentials" },
    { text: "Authenticating user" },
    { text: "Loading dashboard" },
  ];

  async function login(email: string, password: string) {
    const loginRequest: AuthenticationRequestDTO = { email, password };
    const response = await post<ApiResponse<AuthenticationResponseDTO>>("/authenticate/token", loginRequest);
    if (response.status == 200) {
      console.log("Login successful:", response.data.data);
      return response.data.data;
    } else {
      console.error("Login failed:", response.statusText);
      throw new Error("Login failed");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submit
    if (loading || showLoginLoader) return;
    
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      // Save token and remember flag
      // const token = (data as { token: string }).token;
      localStorage.setItem("cine-user-details", JSON.stringify(data));
      localStorage.setItem("cine-admin-remember", remember ? "true" : "false");
      
      // Clear any previous authentication errors
      setError("");
      
      // Show loader before navigation
      setShowLoginLoader(true);
    } catch (err: unknown) {
      setError((err as Error).message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 overflow-hidden">
      {/* Large background image */}
      <img
        src="/how-to-train-your-dragon-movie-2025-wallpapers.jpg"
        alt="Cinema background"
        className="absolute inset-0 w-full h-full object-cover z-0 brightness-75"
      />
      {/* Full screen interactive boxes background */}
      <Boxes className="absolute inset-0 w-full h-full z-10" />
      <div className="relative z-20 shadow-input mx-auto w-full max-w-md rounded-none bg-white/90 p-4 md:rounded-2xl md:p-8 dark:bg-black/80 border border-gray-100 backdrop-blur-lg">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 text-center font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
          Cine Admin Login
        </h2>
        <p className="mt-2 mb-4 max-w-sm text-sm text-neutral-600 dark:text-neutral-300 text-center font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>
          Sign in to manage movies, bookings, and more.
        </p>
        {error && (
          <div className="mb-4 rounded bg-red-100 px-4 py-2 text-red-700 text-center text-sm font-medium font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>
            {error}
          </div>
        )}
        <form className="my-8 font-farro" style={{ fontFamily: 'Farro, sans-serif' }} onSubmit={handleSubmit}>
          <LabelInputContainer>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cine.com"
              disabled={showLoginLoader}
              className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </LabelInputContainer>
          <LabelInputContainer className="mt-4">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}
            >
              Password
            </label>
            <div className="relative w-full">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={showLoginLoader}
                className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full shadow-sm pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowPassword((v) => !v)}
                disabled={showLoginLoader}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </LabelInputContainer>
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={showLoginLoader}
                className="accent-blue-600 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm px-0 bg-transparent font-farro disabled:opacity-50 disabled:cursor-not-allowed" style={{ fontFamily: 'Farro, sans-serif' }}
              disabled={showLoginLoader}
              tabIndex={-1}
            >
              Forgot password?
            </button>
          </div>
          <button
            className="group/btn relative block h-10 w-full rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 font-medium text-white shadow-input mt-6 overflow-hidden font-red-rose disabled:opacity-60 disabled:cursor-not-allowed" style={{ fontFamily: 'Red Rose, sans-serif' }}
            type="submit"
            disabled={loading || showLoginLoader}
          >
            {showLoginLoader ? "Authenticating..." : loading ? "Logging in..." : "Login →"}
            <BottomGradient />
          </button>
          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
          <div className="flex flex-col space-y-4">
            <button
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-lg bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] overflow-hidden font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}
              type="button"
              onClick={() => alert("Google login coming soon!")}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}>
                Google
              </span>
              <BottomGradient />
            </button>
            <button
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-lg bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] overflow-hidden font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}
              type="button"
              onClick={() => alert("Facebook login coming soon!")}
            >
              <img
                src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                alt="Facebook"
                className="h-5 w-5"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}>
                Facebook
              </span>
              <BottomGradient />
            </button>
          </div>
        </form>
      </div>
      <LogoutLoader
        show={showLoginLoader}
        steps={loginSteps}
        duration={800}
        title="Logging in..."
        onComplete={() => {
          console.log("[LoginPage] LogoutLoader onComplete called");
          setShowLoginLoader(false);
          console.log("[LoginPage] Navigating to /");
          navigate("/");
        }}
      />
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex w-full flex-col space-y-2", className)}>
    {children}
  </div>
);
