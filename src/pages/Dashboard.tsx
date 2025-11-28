import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StarField from "@/components/StarField";
import { toast } from "sonner";
import {
  Shield,
  Clock,
  User,
  Mail,
  MapPin,
  LogOut,
  Edit,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface User {
  authMethod: "email" | "otp";
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: string;
  name: string;
  email: string;
  id: string;
}

interface AccessToken {
  token: string;
  expires: string; // ISO string
}

const Dashboard = () => {
  const navigate = useNavigate();

  // Read user & token from localStorage
  const storedUser = localStorage.getItem("user");
  const storedAccess = localStorage.getItem("access");

  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );
  const [accessToken, setAccessToken] = useState<AccessToken | null>(
    storedAccess ? JSON.parse(storedAccess) : null
  );

  const [tokenExpiry, setTokenExpiry] = useState<number>(0); // seconds
  const [tokenLogs, setTokenLogs] = useState<string[]>([]);

  const dummyUsers = [
    { id: 1, username: "admin_user", role: "admin" },
    { id: 2, username: "john_doe", role: "user" },
    { id: 3, username: "jane_smith", role: "user" },
  ];

  const [currentRole] = useState("user"); // Simulated role

  // Calculate initial token expiry
  useEffect(() => {
    if (!user || !accessToken) {
      navigate("/"); // redirect if not logged in
      return;
    }

    const expiresAt = new Date(accessToken.expires).getTime();
    const now = Date.now();
    const diffSeconds = Math.floor((expiresAt - now) / 1000);

    setTokenExpiry(diffSeconds > 0 ? diffSeconds : 0);
    setTokenLogs([
      `Token initialized at ${new Date().toLocaleTimeString()}`,
    ]);
  }, [navigate, user, accessToken]);

  // Countdown token expiry
  useEffect(() => {
    if (!tokenExpiry) return;

    const interval = setInterval(() => {
      setTokenExpiry((prev) => {
        if (prev <= 1) {
          toast.error("Session expired!");
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, tokenExpiry]);

  const handleExtendSession = () => {
    if (!accessToken) return;

    // extend by 5 minutes
    setTokenExpiry(300);
    const logEntry = `Session extended at ${new Date().toLocaleTimeString()}`;
    setTokenLogs((prev) => [...prev, logEntry]);
    toast.success("Session extended by 5 minutes!");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    toast.success("Logged out successfully!");
    navigate("/");
  };

  const handleEditAttempt = () => {
    if (currentRole !== "admin") {
      toast.error("Access Denied: Admin privileges required", {
        description: "Unauthorized edit attempt blocked",
      });
    } else {
      toast.success("Edit mode enabled");
    }
  };

  if (!user || !accessToken) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#191970]">


      <StarField />

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-cinzel text-gradient-gold">
              Security Monitoring Dashboard
            </h1>
            <p className="text-foreground/70 text-lg font-inter">
              Arabian Night Cyber Defense Console
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Session & Token Console */}
            <Card className="border-primary/30 bg-card/80 backdrop-blur-lg p-6 glow-teal">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-accent" size={24} />
                <h2 className="text-xl font-cinzel text-gradient-gold">
                  Session & Token Console
                </h2>
              </div>

              <div className="space-y-4">
                <div className="bg-background/50 p-4 rounded-lg border border-primary/20">
                  <p className="text-foreground/80 text-sm mb-2">
                    Access Token expires in:
                  </p>
                  <p className="text-3xl font-bold text-accent font-mono">
                    {Math.floor(tokenExpiry / 60)}:
                    {(tokenExpiry % 60).toString().padStart(2, "0")}
                  </p>
                </div>

                <Button
                  onClick={handleExtendSession}
                  className="w-full bg-primary hover:bg-primary/90 glow-teal"
                >
                  Extend Session
                </Button>

                <div className="bg-background/50 p-4 rounded-lg border border-primary/20 max-h-40 overflow-y-auto">
                  <p className="text-xs text-foreground/60 mb-2 uppercase tracking-wider">
                    Token Refresh Log
                  </p>
                  {tokenLogs.map((log, idx) => (
                    <p
                      key={idx}
                      className="text-xs text-foreground/80 font-mono mb-1"
                    >
                      → {log}
                    </p>
                  ))}
                </div>
              </div>
            </Card>

            {/* Authentication Info */}
            <Card className="border-primary/30 bg-card/80 backdrop-blur-lg p-6 glow-teal">
              <div className="flex items-center gap-2 mb-4">
                <User className="text-accent" size={24} />
                <h2 className="text-xl font-cinzel text-gradient-gold">
                  Authentication Info
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-background/50 p-3 rounded-lg border border-primary/20">
                  <Mail className="text-primary mt-1" size={18} />
                  <div>
                    <p className="text-xs text-foreground/60 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-foreground font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-background/50 p-3 rounded-lg border border-primary/20">
                  <Shield className="text-accent mt-1" size={18} />
                  <div>
                    <p className="text-xs text-foreground/60 uppercase tracking-wider">
                      Login Method
                    </p>
                    <p className="text-foreground font-medium">
                      {user.authMethod === "email" ? "Email/Password" : "OTP"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-background/50 p-3 rounded-lg border border-primary/20">
                  <MapPin className="text-primary mt-1" size={18} />
                  <div>
                    <p className="text-xs text-foreground/60 uppercase tracking-wider">
                      IP Location
                    </p>
                    <p className="text-foreground font-medium">
                      Dubai, UAE (placeholder)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Security Defense Radar */}
            <Card className="border-primary/30 bg-card/80 backdrop-blur-lg p-6 glow-teal">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="text-accent" size={24} />
                <h2 className="text-xl font-cinzel text-gradient-gold">
                  Security Defense Radar
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  { name: "CORS", status: "ACTIVE", icon: CheckCircle2 },
                  { name: "Helmet", status: "ACTIVE", icon: CheckCircle2 },
                  { name: "Injection Protection", status: "ACTIVE", icon: CheckCircle2 },
                  { name: "Brute Force Lockout", status: "ENABLED", icon: AlertTriangle },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between bg-background/50 p-3 rounded-lg border border-primary/20 hover:border-accent/50 transition-all"
                  >
                    <span className="text-foreground font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <item.icon
                        className={item.status === "ACTIVE" ? "text-accent" : "text-primary"}
                        size={18}
                      />
                      <span className="text-xs uppercase tracking-wider text-accent font-bold">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Users Table */}
            <Card className="border-primary/30 bg-card/80 backdrop-blur-lg p-6 glow-teal">
              <div className="flex items-center gap-2 mb-4">
                <User className="text-accent" size={24} />
                <h2 className="text-xl font-cinzel text-gradient-gold">Users Table</h2>
              </div>

              <div className="space-y-2">
                {dummyUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-background/50 p-3 rounded-lg border border-primary/20 hover:border-accent/50 transition-all"
                  >
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{user.username}</p>
                      <p className="text-xs text-foreground/60">
                        ID: {user.id} • Role: {user.role}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditAttempt}
                      className="ml-2"
                    >
                      <Edit size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Logout Button */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2 glow-gold"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
