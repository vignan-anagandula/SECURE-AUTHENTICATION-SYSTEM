import React, { FormEvent, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StarField from "../components/StarField";

export default function Login() {
  const navigate = useNavigate();

  // Mode: overall page mode (Sign In or Sign Up)
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Login type inside each mode: password or otp
  const [loginType, setLoginType] = useState<"password" | "otp">("password");

  // Form fields
  const [name, setName] = useState(""); // used in signup (email/signup-otp)
  const [email, setEmail] = useState(""); // used for email login/signup
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); // note: lowercase 'p'
  const [otp, setOtp] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [systemMessage, setSystemMessage] = useState(
    "Welcome to Secure Auth System. Experience the mystique of Arabian nights."
  );
  const [error, setError] = useState("");

  // ---------------------------
  // Panel transition helper
  // ---------------------------
  // Active panel stays in normal flow (relative) — inactive panels are absolute and not interactable.
  const panelClass = (active: boolean) =>
    `transition-all duration-300 ${
      active
        ? "relative opacity-100 translate-x-0"
        : "absolute inset-0 opacity-0 pointer-events-none -translate-x-5"
    }`;

  // ---------------------------
  // Email / Password Login
  // ---------------------------
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:3000/v1/auth/login", {
        email,
        password,
      });

      const data = res.data;
      if (!data.access) throw new Error("Access token missing");

      localStorage.setItem("access", JSON.stringify(data.access));
      localStorage.setItem("user", JSON.stringify(data.user));
      setSystemMessage("Login successful. Redirecting...");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Login failed";
      setError(msg);
      setSystemMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Email / Password Signup
  // ---------------------------
  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:3000/v1/auth/register", {
        name,
        email,
        password,
      });

      const data = res.data;
      // If your /register responds with tokens for email signup, handle them here.
      // If not, show message that verification/email sent.
      if (data.access) {
        localStorage.setItem("access", JSON.stringify(data.access));
        localStorage.setItem("user", JSON.stringify(data.user));
        setSystemMessage("Signup successful. Redirecting...");
        navigate("/dashboard");
      } else {
        setSystemMessage(data.message || "Signup initiated. Please verify.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Signup failed";
      setError(msg);
      setSystemMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Generate OTP (used by both modes)
  // - For signup mode: POST /v1/auth/register with { name, phoneNumber } (returns otp for testing)
  // - For signin mode: POST /v1/auth/login with { phoneNumber } (returns otp for testing)
  // The endpoints used here follow the flow you described; change URLs if your backend differs.
  // ---------------------------
  const handleGenerateOtp = async () => {
    if (!phoneNumber) {
      setSystemMessage("Enter phone number before generating OTP.");
      return;
    }

    try {
      setSystemMessage("Generating OTP...");
      setLoading(true);

      if (mode === "signup") {
        // Signup OTP generation expects name + phoneNumber (your backend returns OTP in response for testing)
        const res = await axios.post("http://localhost:3000/v1/auth/register", {
          name,
          phoneNumber,
        });

        // For testing: show OTP in console & autofill
        const returnedOtp = res?.data?.otp;
        console.log("Signup OTP (testing):", returnedOtp);
        if (returnedOtp) {
          setSystemMessage("OTP received (testing) — autofilled.");
          setOtp(String(returnedOtp));
        } else {
          setSystemMessage(res?.data?.message || "OTP sent! Check your phone.");
        }
      } else {
        // Signin OTP generation — backend should send OTP to phone (and for testing may return otp)
        const res = await axios.post("http://localhost:3000/v1/auth/login", {
          phoneNumber,
        });

        const returnedOtp = res?.data?.otp;
        console.log("Signin OTP (testing):", returnedOtp);
        if (returnedOtp) {
          setSystemMessage("OTP received (testing) — autofilled.");
          setOtp(String(returnedOtp));
        } else {
          setSystemMessage(res?.data?.message || "OTP sent! Check your phone.");
        }
      }
    } catch (err: any) {
      console.error("Generate OTP error:", err);
      setSystemMessage(
        err?.response?.data?.message || "Failed to generate OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Verify OTP (used for both signup and signin)
  // - POST /v1/auth/verify-otp { phoneNumber, otp }
  // - On success backend returns user + access token
  // ---------------------------
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:3000/v1/auth/verify-otp-signup", {
        name,
        phoneNumber,
        otp,
      });

      const data = res.data;
      if (!data.access) {
        throw new Error("Access token missing after OTP verification");
      }

      localStorage.setItem("access", JSON.stringify(data.access));
      localStorage.setItem("user", JSON.stringify(data.user));
      setSystemMessage("Verification successful. Redirecting...");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "OTP verification failed";
      setError(msg);
      setSystemMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-dark">
      {/* BACKGROUND STARFIELD */}
      <StarField />

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center pt-16 text-center text-[#ffcc63]">
        <h1 className="text-5xl font-bold drop-shadow-lg">SECURE AUTH SYSTEM</h1>
        <p className="mt-2 text-lg text-gray-300">
          Enter the realm of secure authentication
        </p>
      </div>

      {/* Main panels */}
      <div className="relative z-10 flex justify-center gap-10 mt-10 px-4 pb-24">
        {/* System Message */}
        <div className="w-[420px] p-6 bg-[#001122]/40 border border-[#00ffff22] rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-[#ffcc63] font-semibold text-sm">● SYSTEM MESSAGE</p>
          <p className="mt-3 text-gray-200 leading-relaxed">{systemMessage}</p>

          {error && <p className="mt-3 text-red-400">{error}</p>}
        </div>

        {/* Auth Panel */}
        <div className="w-[480px] p-6 bg-[#001122]/40 border border-[#00ffff22] rounded-xl shadow-xl backdrop-blur-md">
          {/* Top Tabs */}
          <div className="flex gap-4 mb-5">
            <button
              onClick={() => {
                setMode("signin");
                setLoginType("password");
                setError("");
                setSystemMessage(
                  "Welcome back. Choose a sign in method (email or OTP)."
                );
              }}
              className={`w-1/2 py-2 rounded-md transition-all ${
                mode === "signin"
                  ? "bg-teal-500 text-black"
                  : "bg-[#002233] text-gray-300"
              }`}
              type="button"
            >
              Sign In
            </button>

            <button
              onClick={() => {
                setMode("signup");
                setLoginType("password");
                setError("");
                setSystemMessage(
                  "Create an account. Choose Email signup or OTP signup."
                );
              }}
              className={`w-1/2 py-2 rounded-md transition-all ${
                mode === "signup"
                  ? "bg-teal-500 text-black"
                  : "bg-[#002233] text-gray-300"
              }`}
              type="button"
            >
              Sign Up
            </button>
          </div>

          {/* Second-row toggle: only show when user is in a mode that supports OTP */}
          <div className="flex gap-4 mb-5">
            <button
              onClick={() => setLoginType("password")}
              className={`w-1/2 py-2 rounded-md transition-all ${
                loginType === "password"
                  ? "bg-teal-500 text-black"
                  : "bg-[#002233] text-gray-300"
              }`}
              type="button"
            >
              Email/Password
            </button>

            <button
              onClick={() => setLoginType("otp")}
              className={`w-1/2 py-2 rounded-md transition-all ${
                loginType === "otp"
                  ? "bg-teal-500 text-black"
                  : "bg-[#002233] text-gray-300"
              }`}
              type="button"
            >
              OTP
            </button>
          </div>

          {/* -------- SIGN-IN PANEL -------- */}
          <div className={panelClass(mode === "signin")}>
            {/* Email / Password Sign In */}
            {loginType === "password" && (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <label className="text-gray-300">Email</label>
                <input
                  type="email"
                  className="w-full p-3 rounded-md bg-[#0b1a2a] text-gray-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label className="text-gray-300">Password</label>
                <input
                  type="password"
                  className="w-full p-3 rounded-md bg-[#0b1a2a] text-gray-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="w-full py-3 mt-3 bg-teal-500 text-black rounded-md"
                >
                  {loading ? "Please wait..." : "Sign In"}
                </button>
              </form>
            )}

            {/* OTP Sign In */}
            {loginType === "otp" && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <label className="text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  className="w-full p-3 rounded-md bg-[#0b1a2a] text-gray-200"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleGenerateOtp}
                    className="px-4 py-2 bg-teal-500 text-black rounded-md shadow"
                  >
                    Generate OTP
                  </button>
                </div>

                <label className="text-gray-300">OTP</label>
                <input
                  className="w-full p-3 rounded-md bg-[#0b1a2a] text-gray-200"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="w-full py-3 mt-3 bg-teal-500 text-black rounded-md"
                >
                  {loading ? "Please wait..." : "Sign In"}
                </button>
              </form>
            )}
          </div>

          {/* -------- SIGN-UP PANEL -------- */}
          <div className={panelClass(mode === "signup")}>
            {/* Email / Password Sign Up */}
            {loginType === "password" && (
              <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <label className="text-gray-300">Name</label>
                <input
                  className="w-full p-3 rounded-md bg-[#0b1a2a] text-gray-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <label className="text-gray-300">Email</label>
                <input
                  type="email"
                  className="w-full p-3 rounded-md bg-[#0b1a2a] text-gray-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label className="text-gray-300">Password</label>
                <input
                  type="password"
                  className="w-full p-3 rounded-md bg-[#0b1a2a] text-gray-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="w-full py-3 mt-3 bg-teal-500 text-black rounded-md"
                >
                  {loading ? "Please wait..." : "Create Account"}
                </button>
              </form>
            )}

            {/* OTP Sign Up (name + phone -> generate OTP -> verify) */}
            {loginType === "otp" && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <label className="text-gray-300">Name</label>
                <input
                  className="w-full p-3 rounded-md bg-[#0b1a2a] text-gray-200"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  console.log("Name changed",e.target.value);
                  }
                  }
                  required
                />

                <label className="text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  className="w-full p-3 rounded-md bg-[#0b1a2a] text-gray-200"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleGenerateOtp}
                    className="px-4 py-2 bg-teal-500 text-black rounded-md shadow"
                  >
                    Generate OTP
                  </button>
                </div>

                <label className="text-gray-300">OTP</label>
                <input
                  className="w-full p-3 rounded-md bg-[#0b1a2a] text-gray-200"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="w-full py-3 mt-3 bg-teal-500 text-black rounded-md"
                >
                  {loading ? "Please wait..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <p className="absolute bottom-5 w-full text-center text-gray-400 text-sm z-10">
        ── Protected by Arabian Night Security ──
      </p>
    </div>
  );
}
