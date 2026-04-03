import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { TrendingUp, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Finance Dashboard</h1>
              <p className="text-sm text-white/60">Data Processing & Analytics</p>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Take control of your
            <br />
            <span className="text-white/90">financial data</span>
          </h2>
          <p className="text-lg text-white/70 max-w-md leading-relaxed">
            Manage records, analyze trends, and gain insights into your
            financial operations with role-based access and real-time analytics.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: "Records", value: "Unlimited" },
              { label: "Analytics", value: "Real-time" },
              { label: "Security", value: "JWT + RBAC" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Finance Dashboard</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isRegister ? "Create an account" : "Welcome back"}
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              {isRegister
                ? "Sign up to start managing your finances"
                : "Sign in to your account to continue"}
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {isRegister && (
              <div>
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isRegister ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {isRegister
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Demo credentials hint */}
          {!isRegister && (
            <div className="mt-8 p-4 rounded-xl bg-primary-50/50 border border-primary-100">
              <p className="text-xs font-semibold text-primary-800 mb-2">Demo Credentials</p>
              <div className="space-y-1 text-xs text-primary-700">
                <p><span className="font-medium">Admin:</span> admin@finance.com</p>
                <p><span className="font-medium">Analyst:</span> analyst@finance.com</p>
                <p><span className="font-medium">Viewer:</span> viewer@finance.com</p>
                <p className="text-primary-500 mt-1.5">Password: <span className="font-mono">Password123</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
