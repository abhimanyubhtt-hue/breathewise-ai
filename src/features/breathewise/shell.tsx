import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Wind,
  LayoutDashboard,
  Activity,
  Sparkles,
  Users,
  House,
  Leaf,
  MapPin,
  ChevronDown,
  Bell,
  Menu,
  X,
  ArrowUpRight,
  LogOut,
  LocateFixed,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { toast } from "sonner";
import { useBreathe } from "./context";
import { cities } from "./domain";
import fern from "@/assets/fern.asset.json";
const nav = [
  { to: "/", en: "Overview", hi: "अवलोकन", icon: LayoutDashboard },
  { to: "/air-quality", en: "Air Quality", hi: "वायु गुणवत्ता", icon: Activity },
  { to: "/assistant", en: "AI Assistant", hi: "AI सहायक", icon: Sparkles },
  { to: "/family", en: "Family Planner", hi: "परिवार योजनाकार", icon: Users },
  { to: "/indoor", en: "Indoor Protection", hi: "घर की सुरक्षा", icon: House },
  { to: "/impact", en: "Green Impact", hi: "हरित प्रभाव", icon: Leaf },
] as const;
export function AppShell({ children }: { children: React.ReactNode }) {
  const { city, setCity, language, setLanguage, user, t, environment } = useBreathe();
  const pathname = useLocation({ select: (l) => l.pathname });
  const [menu, setMenu] = useState(false);
  const [location, setLocation] = useState(false);
  const [account, setAccount] = useState(false);
  const [notice, setNotice] = useState(false);
  function locate() {
    if (!navigator.geolocation) {
      toast.error("Location is unavailable in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCity({
          name: t("Your location", "आपका स्थान"),
          lat: p.coords.latitude,
          lon: p.coords.longitude,
        });
        setLocation(false);
      },
      () => toast.error("Location permission was denied. Please select a city."),
    );
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${menu ? "is-open" : ""}`}>
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Wind />
          </span>
          <span>
            BreatheWise<span className="brand-ai">AI</span>
          </span>
        </Link>
        <Button
          className="mobile-close"
          variant="ghost"
          size="icon"
          aria-label="Close menu"
          onClick={() => setMenu(false)}
        >
          <X />
        </Button>
        <div className="nav-label">{t("YOUR WELLNESS SPACE", "आपका स्वास्थ्य केंद्र")}</div>
        <nav>
          {nav.map((n) => (
            <Button
              key={n.to}
              asChild
              variant="nav"
              className={pathname === n.to ? "nav-active" : ""}
            >
              <Link to={n.to} onClick={() => setMenu(false)}>
                <n.icon />
                {t(n.en, n.hi)}
                {n.to === "/assistant" && <span className="ai-tag">AI</span>}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="nature-card">
            <img src={fern.url} alt="Fresh green fern leaves" />
            <div>
              <Leaf size={20} />
              <h3>
                {t("Small steps.", "छोटे कदम।")}
                <br />
                {t("Cleaner tomorrow.", "स्वच्छ कल।")}
              </h3>
              <p>{t("A healthier you. A healthier planet.", "स्वस्थ आप। स्वस्थ पृथ्वी।")}</p>
              <Link to="/impact">
                {t("Explore your impact", "अपना प्रभाव देखें")} <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
          <div className="sidebar-foot">
            <ShieldCheck size={15} />
            {t("Made for your family & our planet", "आपके परिवार और पृथ्वी के लिए")}
          </div>
        </div>
      </aside>
      {menu && <div className="mobile-backdrop" onClick={() => setMenu(false)} />}
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <Button
              className="mobile-trigger"
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </Button>
            <span className="page-crumb">
              {t(
                nav.find((n) => n.to === pathname)?.en ?? "Overview",
                nav.find((n) => n.to === pathname)?.hi ?? "अवलोकन",
              )}
            </span>
            <span className="crumb-divider">/</span>
            <span className="topbar-subtitle">
              {t("Your everyday air companion", "आपका दैनिक वायु साथी")}
            </span>
          </div>
          <div className="topbar-actions">
            <Button variant="ghost" className="location-button" onClick={() => setLocation(true)}>
              <MapPin />
              {city.name}
              <ChevronDown />
            </Button>
            <select
              aria-label="Language"
              className="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value === "hi" ? "hi" : "en")}
            >
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
            </select>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => setNotice(true)}
            >
              <Bell />
            </Button>
            <span className="topbar-separator" />
            <Button variant="ghost" className="profile-button" onClick={() => setAccount(true)}>
              <span className="avatar">{user?.email?.slice(0, 2).toUpperCase() ?? "BW"}</span>
              <span>{user ? user.email?.split("@")[0] : t("My account", "मेरा खाता")}</span>
              <ChevronDown />
            </Button>
          </div>
        </header>
        <main className="main-content">
          {children}
          <footer className="main-footer">
            <span>© 2026 BreatheWise AI</span>
            <span>
              <ShieldCheck size={13} />
              {t(
                "General wellness guidance. Not medical advice.",
                "सामान्य स्वास्थ्य मार्गदर्शन। चिकित्सा सलाह नहीं।",
              )}
            </span>
          </footer>
        </main>
      </div>
      <Dialog open={location} onOpenChange={setLocation}>
        <DialogContent>
          <DialogTitle>{t("Choose your location", "अपना स्थान चुनें")}</DialogTitle>
          <DialogDescription>
            {t(
              "Forecasts are based on your selected coordinates.",
              "पूर्वानुमान चुने गए स्थान पर आधारित हैं।",
            )}
          </DialogDescription>
          <div className="city-grid">
            {cities.map((c) => (
              <Button
                variant={c.name === city.name ? "default" : "outline"}
                key={c.name}
                onClick={() => {
                  setCity(c);
                  setLocation(false);
                }}
              >
                <MapPin />
                {c.name}
              </Button>
            ))}
          </div>
          <Button variant="secondary" onClick={locate}>
            <LocateFixed />
            {t("Use my current location", "मेरा वर्तमान स्थान")}
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={notice} onOpenChange={setNotice}>
        <DialogContent>
          <DialogTitle>{t("Your air update", "आपकी वायु जानकारी")}</DialogTitle>
          <DialogDescription>
            {environment.data?.error ??
              t(
                "Forecasts have been refreshed for your selected location. Review Air Quality before planning outdoor activities.",
                "आपके स्थान के पूर्वानुमान अपडेट हैं। बाहर जाने से पहले वायु गुणवत्ता देखें।",
              )}
          </DialogDescription>
          <Button asChild onClick={() => setNotice(false)}>
            <Link to="/air-quality">{t("View air quality", "वायु गुणवत्ता देखें")}</Link>
          </Button>
        </DialogContent>
      </Dialog>
      <AccountDialog open={account} setOpen={setAccount} />
    </div>
  );
}
function AccountDialog({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const { user, t } = useBreathe();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result =
        mode === "signup"
          ? await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin },
            })
          : mode === "reset"
            ? await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
              })
            : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) toast.error(result.error.message);
      else if (mode === "login") setOpen(false);
      else
        toast.success(
          mode === "signup"
            ? "Check your email to confirm your account."
            : "Check your email for a reset link.",
        );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>
          {user
            ? t("Your account", "आपका खाता")
            : t("Welcome to BreatheWise", "BreatheWise में स्वागत है")}
        </DialogTitle>
        <DialogDescription>
          {user
            ? user.email
            : t(
                "Sign in to privately save your family, checklist and conversations.",
                "परिवार, चेकलिस्ट और बातचीत सुरक्षित सहेजने के लिए साइन इन करें।",
              )}
        </DialogDescription>
        {user ? (
          <Button
            onClick={async () => {
              await supabase.auth.signOut();
              setOpen(false);
            }}
          >
            <LogOut />
            {t("Sign out", "साइन आउट")}
          </Button>
        ) : (
          <>
            <form onSubmit={submit} className="form-stack">
              <label>
                {t("Email", "ईमेल")}
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              {mode !== "reset" && (
                <label>
                  {t("Password", "पासवर्ड")}
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              )}
              <Button disabled={busy} type="submit">
                {busy
                  ? t("Please wait…", "कृपया प्रतीक्षा करें…")
                  : mode === "signup"
                    ? t("Create account", "खाता बनाएं")
                    : mode === "reset"
                      ? t("Send reset link", "रीसेट लिंक भेजें")
                      : t("Sign in", "साइन इन")}
              </Button>
            </form>
            <div className="account-options">
              <Button
                variant="link"
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              >
                {mode === "signup"
                  ? t("Already have an account?", "पहले से खाता है?")
                  : t("Create an account", "खाता बनाएं")}
              </Button>
              <Button variant="link" onClick={() => setMode("reset")}>
                {t("Forgot password?", "पासवर्ड भूल गए?")}
              </Button>
            </div>
            <div className="provider-buttons">
              <Button
                variant="outline"
                onClick={async () => {
                  const r = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (r.error) toast.error(r.error.message);
                }}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
                {t("Continue with Google", "Google के साथ जारी रखें")}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const r = await lovable.auth.signInWithOAuth("lovable", {
                    redirect_uri: window.location.origin,
                  });
                  if (r.error) toast.error(r.error.message);
                }}
              >
                <LovableMark />
                {t("Continue with Lovable", "Lovable के साथ जारी रखें")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
