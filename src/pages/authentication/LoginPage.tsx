import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@cine.com" && password === "password") {
      setError("");
      if (remember) {
        localStorage.setItem("cine-admin-remember", "true");
      } else {
        localStorage.removeItem("cine-admin-remember");
      }
      navigate("/");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200">
      <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black border border-gray-100">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 text-center">
          Cine Admin Login
        </h2>
        <p className="mt-2 mb-4 max-w-sm text-sm text-neutral-600 dark:text-neutral-300 text-center">
          Sign in to manage movies, bookings, and more.
        </p>
        {error && (
          <div className="mb-4 rounded bg-red-100 px-4 py-2 text-red-700 text-center text-sm font-medium">
            {error}
          </div>
        )}
        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
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
              className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </LabelInputContainer>
          <LabelInputContainer className="mt-4">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-400 hover:text-blue-600"
                onClick={() => setShowPassword((v) => !v)}
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
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-blue-600 mr-2"
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm px-0 bg-transparent"
              tabIndex={-1}
            >
              Forgot password?
            </button>
          </div>
          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-blue-600 to-blue-400 font-medium text-white shadow-input mt-6"
            type="submit"
          >
            Login &rarr;
            <BottomGradient />
          </button>
          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
          <div className="flex flex-col space-y-4">
            <button
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
              type="button"
              onClick={() => alert("Google login coming soon!")}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Google
              </span>
              <BottomGradient />
            </button>
            <button
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
              type="button"
              onClick={() => alert("Facebook login coming soon!")}
            >
              <img
                src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                alt="Facebook"
                className="h-5 w-5"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Facebook
              </span>
              <BottomGradient />
            </button>
          </div>
        </form>
      </div>
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