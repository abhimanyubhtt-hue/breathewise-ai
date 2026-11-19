import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Wind,
  Sun,
  CloudSun,
  Droplets,
  RefreshCw,
  ShieldCheck,
  Users,
  House,
  Leaf,
  Clock,
  Activity,
  Info,
  Check,
  Send,
  Plus,
  TrainFront,
  Bike,
  Car,
  Footprints,
  CalendarDays,
  Loader2,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useBreathe } from "./context";
import { aqiStatus, bestWindow, emissions, factors, type Message } from "./domain";
import { askAssistant } from "./data.functions";
export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function Source() {
  const { environment, t } = useBreathe();
  return (
    <div className="data-source">
      <span className="source-dot" />
      {t(
        "Open-Meteo · CAMS model forecast, not a monitoring station",
        "Open-Meteo · CAMS मॉडल पूर्वानुमान, निगरानी स्टेशन नहीं",
      )}
      <span>
        {environment.data &&
          t("Retrieved ", "प्राप्त ") +
            new Date(environment.data.updated).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Kolkata",
            }) +
            " IST"}
      </span>
    </div>
  );
}
export function Overview() {
  const { city, user, t, environment } = useBreathe();
  return (
    <>
      <PageHeading
        title={t(`A little awareness. A healthier day.`, `थोड़ी जागरूकता। एक स्वस्थ दिन।`)}
        subtitle={t(
          `Welcome ${user?.email?.split("@")[0] ?? "to BreatheWise"}. Here’s the air around you today.`,
          `BreatheWise में स्वागत है। आज आपके आसपास की हवा।`,
        )}
        action={
          <div className="date-label">
            <CalendarDays size={16} />
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            })}
          </div>
        }
      />
      <div className="overview-top">
        <AirCard />
        <WeatherCard />
      </div>
      <Source />
      {environment.data?.error && (
        <div className="error-banner">
          {environment.data.error}
          <Button variant="outline" onClick={() => void environment.refetch()}>
            <RefreshCw />
            {t("Retry", "फिर प्रयास करें")}
          </Button>
        </div>
      )}
      <div className="overview-middle">
        <Forecast />
        <Recommendations />
      </div>
      <div className="section-heading">
        <h2>{t("A healthier home starts here", "स्वस्थ घर की शुरुआत यहां से")}</h2>
        <span>{t("Little choices, lasting change", "छोटे विकल्प, स्थायी बदलाव")}</span>
      </div>
      <div className="quick-grid">
        {[
          {
            to: "/family",
            icon: Users,
            title: t("Your family, protected", "आपका परिवार, सुरक्षित"),
            desc: t("A daily plan for the people you love.", "अपनों के लिए दैनिक योजना।"),
            link: t("Plan your day", "अपना दिन योजनाबद्ध करें"),
            tone: "sage",
          },
          {
            to: "/indoor",
            icon: House,
            title: t("Better air, indoors", "घर के अंदर बेहतर हवा"),
            desc: t("Make every room a safer space.", "हर कमरे को सुरक्षित बनाएं।"),
            link: t("Protect your home", "अपने घर की रक्षा करें"),
            tone: "blue",
          },
          {
            to: "/impact",
            icon: Leaf,
            title: t("Your greener tomorrow", "आपका हरित कल"),
            desc: t("Small switches. A lighter footprint.", "छोटे बदलाव। कम उत्सर्जन।"),
            link: t("See your impact", "अपना प्रभाव देखें"),
            tone: "peach",
          },
        ].map((c) => (
          <Link key={c.to} to={c.to} className={`quick-card ${c.tone}`}>
            <div className="quick-icon">
              <c.icon />
            </div>
            <ArrowUpRight className="quick-arrow" size={18} />
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
            <span>
              {c.link}
              <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
      <div className="wellness-note">
        <Info size={15} />
        {t(
          "Your wellbeing comes first. If you experience breathing difficulty, seek medical care promptly.",
          "आपका स्वास्थ्य पहले। सांस लेने में कठिनाई हो तो तुरंत चिकित्सा सहायता लें।",
        )}
        <span>{city.name}</span>
      </div>
    </>
  );
}
function AirCard() {
  const { environment, city, t } = useBreathe();
  const h = environment.data?.hours[0];
  const value = h?.aqi ?? null;
  const status = aqiStatus(value);
  return (
    <section className="air-card">
      <div className="card-topline">
        <span>
          <span className="live-dot" />
          {t("AIR QUALITY NOW", "अभी की वायु गुणवत्ता")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Refresh forecast"
          onClick={() => void environment.refetch()}
        >
          <RefreshCw className={environment.isFetching ? "spin" : ""} />
        </Button>
      </div>
      <div className="air-main">
        <div className="aqi-reading">
          <div className="aqi-value">
            {environment.isPending ? (
              <Loader2 className="spin" />
            ) : value === null ? (
              "—"
            ) : (
              Math.round(value)
            )}
            <span>US AQI</span>
          </div>
          <div>
            <span className={`status-pill ${status.tone}`}>{status.label}</span>
            <p>
              <MapPinSmall />
              {city.name}, India
            </p>
            <span className="model-label">
              {t("Current-hour forecast", "वर्तमान घंटे का पूर्वानुमान")}
            </span>
          </div>
        </div>
        <div className="pollutants">
          <div>
            <span>PM2.5</span>
            <strong>
              {h?.pm25?.toFixed(1) ?? "—"}
              <small> µg/m³</small>
            </strong>
            <span>{t("Fine particles", "सूक्ष्म कण")}</span>
          </div>
          <div>
            <span>PM10</span>
            <strong>
              {h?.pm10?.toFixed(1) ?? "—"}
              <small> µg/m³</small>
            </strong>
            <span>{t("Coarse particles", "बड़े कण")}</span>
          </div>
        </div>
      </div>
      <div className="aqi-scale">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="scale-labels">
        <span>0–50</span>
        <span>51–100</span>
        <span>101–150</span>
        <span>151–200</span>
        <span>201–300</span>
        <span>301+</span>
      </div>
      <div className="air-advice">
        <ShieldCheck size={18} />
        <p>{status.advice}</p>
        <Button asChild variant="link">
          <Link to="/air-quality">
            <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
function MapPinSmall() {
  return <span className="mini-pin">⌖</span>;
}
function WeatherCard() {
  const { environment, t } = useBreathe();
  const w = environment.data?.weather;
  return (
    <section className="weather-card">
      <div className="card-topline">
        <span>{t("WEATHER & CONDITIONS", "मौसम और स्थितियां")}</span>
        <Sun size={17} />
      </div>
      <div className="weather-main">
        <div>
          <strong>
            {w ? Math.round(w.temperature_2m) : "—"}
            <span>°C</span>
          </strong>
          <p>
            {w
              ? w.weather_code <= 1
                ? t("Mostly clear", "मुख्यतः साफ")
                : t("Cloudy conditions", "बादल")
              : t("Weather unavailable", "मौसम उपलब्ध नहीं")}
          </p>
        </div>
        <CloudSun size={65} strokeWidth={1.2} />
      </div>
      <div className="weather-bottom">
        <div>
          <Wind />
          <span>
            {t("Wind speed", "हवा की गति")}
            <strong>
              {w?.wind_speed_10m ?? "—"} <small>km/h</small>
            </strong>
          </span>
        </div>
        <div>
          <Droplets />
          <span>
            {t("Humidity", "नमी")}
            <strong>
              {w?.relative_humidity_2m ?? "—"}
              <small>%</small>
            </strong>
          </span>
        </div>
      </div>
    </section>
  );
}
function Forecast({ full = false }: { full?: boolean }) {
  const { environment, t } = useBreathe();
  const [range, setRange] = useState(24);
  const [metric, setMetric] = useState("aqi");
  const hours = environment.data?.hours.slice(0, range) ?? [];
  return (
    <section className={`forecast-card ${full ? "full-forecast" : ""}`}>
      <div className="section-heading">
        <div>
          <h2>{t("Your air, hour by hour", "हर घंटे की वायु")}</h2>
          <p>
            {t("Plan ahead with the pollution forecast", "प्रदूषण पूर्वानुमान के साथ योजना बनाएं")}
          </p>
        </div>
        <div className="segmented">
          {[24, 48].map((v) => (
            <Button
              key={v}
              variant="ghost"
              className={range === v ? "selected" : ""}
              onClick={() => setRange(v)}
            >
              {v}h
            </Button>
          ))}
        </div>
      </div>
      <div className="chart-legend">
        <span>
          <i />
          {metric === "aqi" ? "US AQI" : metric === "pm25" ? "PM2.5 (µg/m³)" : "PM10 (µg/m³)"}
        </span>
        {full && (
          <select
            aria-label="Forecast metric"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            <option value="aqi">US AQI</option>
            <option value="pm25">PM2.5</option>
            <option value="pm10">PM10</option>
          </select>
        )}
        <span>{t("Model forecast", "मॉडल पूर्वानुमान")}</span>
      </div>
      <div className="chart-container">
        {hours.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hours} margin={{ top: 12, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="air-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={(v) => v.slice(11, 16)}
                minTickGap={40}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: 8,
                }}
                labelFormatter={(v) => String(v).replace("T", " ")}
                formatter={(v) => [
                  typeof v === "number" ? v.toFixed(1) : "Unavailable",
                  metric === "aqi" ? "US AQI" : "µg/m³",
                ]}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="var(--primary)"
                fill="url(#air-fill)"
                strokeWidth={2.5}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-chart">
            <Activity />
            {environment.isPending
              ? t("Loading forecast…", "पूर्वानुमान लोड हो रहा है…")
              : t("Forecast unavailable", "पूर्वानुमान उपलब्ध नहीं")}
          </div>
        )}
      </div>
      <div className="chart-foot">
        <Clock size={14} />
        {t("Times shown in Indian Standard Time (IST)", "समय भारतीय मानक समय (IST) में")}
        <Button asChild variant="link">
          <Link to="/air-quality">
            {t("Full forecast", "पूरा पूर्वानुमान")}
            <ArrowRight size={13} />
          </Link>
        </Button>
      </div>
    </section>
  );
}
function Recommendations() {
  const { environment, t } = useBreathe();
  const high = (environment.data?.hours[0]?.aqi ?? 151) > 100;
  return (
    <section className="recommendations">
      <div className="section-heading">
        <h2>
          <Sparkles size={17} />
          {t("Today’s wise moves", "आज के समझदार कदम")}
        </h2>
        <span className="small-tag">{t("FOR YOU", "आपके लिए")}</span>
      </div>
      <p>{t("A little guidance for a better day.", "बेहतर दिन के लिए थोड़ा मार्गदर्शन।")}</p>
      {[
        {
          icon: Footprints,
          title: high
            ? t("Take your workout indoors", "घर के अंदर व्यायाम करें")
            : t("Make time for a gentle walk", "हल्की सैर के लिए समय निकालें"),
          desc: high
            ? t(
                "Limit outdoor exertion while pollution is elevated.",
                "प्रदूषण अधिक होने पर बाहर मेहनत कम करें।",
              )
            : t("Check the forecast before heading out.", "बाहर जाने से पहले पूर्वानुमान देखें।"),
        },
        {
          icon: House,
          title: t("Keep your indoor air clean", "घर की हवा साफ रखें"),
          desc: t(
            "Wet-dust surfaces and avoid incense or smoke.",
            "गीले कपड़े से धूल साफ करें, धुएं से बचें।",
          ),
        },
        {
          icon: TrainFront,
          title: t("Choose a lighter commute", "कम उत्सर्जन वाला सफर चुनें"),
          desc: t(
            "A metro ride can lower your travel emissions.",
            "मेट्रो से यात्रा उत्सर्जन घट सकता है।",
          ),
        },
      ].map((r, i) => (
        <div className="recommendation" key={i}>
          <span className="rec-icon">
            <r.icon size={18} />
          </span>
          <div>
            <h3>{r.title}</h3>
            <p>{r.desc}</p>
          </div>
        </div>
      ))}
      <Button asChild variant="secondary" className="ask-button">
        <Link to="/assistant">
          <Sparkles />
          {t("Ask BreatheWise AI", "BreatheWise AI से पूछें")}
          <ArrowRight />
        </Link>
      </Button>
    </section>
  );
}
export function AirQuality() {
  const { t, environment } = useBreathe();
  return (
    <>
      <PageHeading
        title={t("Air Quality Intelligence", "वायु गुणवत्ता जानकारी")}
        subtitle={t(
          "Know what’s in the air. Make informed choices.",
          "जानें हवा में क्या है। समझदार निर्णय लें।",
        )}
      />
      <div className="overview-top">
        <AirCard />
        <WeatherCard />
      </div>
      <Source />
      <Forecast full />
      <div className="detail-band">
        <Info />
        <div>
          <h3>{t("Understanding the scale", "पैमाना समझें")}</h3>
          <p>
            {t(
              "US AQI is supplied by Open-Meteo, not India’s CPCB AQI. Good: 0–50; Moderate: 51–100; Sensitive groups: 101–150; Unhealthy: 151–200; Very unhealthy: 201–300; Hazardous: 301+. Forecasts can differ from local station observations.",
              "यह Open-Meteo का US AQI है, भारत का CPCB AQI नहीं। अच्छा: 0–50; मध्यम: 51–100; संवेदनशील समूह: 101–150; अस्वस्थ: 151–200; बहुत अस्वस्थ: 201–300; खतरनाक: 301+।",
            )}
          </p>
        </div>
      </div>
      <div className="metric-grid">
        {[
          ["NO₂", "no2"],
          ["Ozone", "ozone"],
        ].map(([label, key]) => (
          <div className="metric-tile" key={key}>
            <span>{label}</span>
            <strong>
              {(key === "no2"
                ? environment.data?.hours[0]?.no2
                : environment.data?.hours[0]?.ozone
              )?.toFixed(1) ?? "—"}{" "}
              <small>µg/m³</small>
            </strong>
            <p>{t("Current-hour model forecast", "वर्तमान घंटे का मॉडल पूर्वानुमान")}</p>
          </div>
        ))}
      </div>
    </>
  );
}
export function Family() {
  const { household, setHousehold, persist, saving, environment, t, user } = useBreathe();
  const vulnerable = household.children + household.seniors > 0;
  const best = bestWindow(environment.data?.hours ?? [], vulnerable);
  const [generated, setGenerated] = useState(false);
  return (
    <>
      <PageHeading
        title={t("A thoughtful day for your family", "आपके परिवार के लिए बेहतर दिन")}
        subtitle={t(
          "Personal plans, with extra care for little ones and older adults.",
          "बच्चों और बुजुर्गों की अतिरिक्त देखभाल के साथ व्यक्तिगत योजना।",
        )}
      />
      <div className="two-column">
        <section className="tool-panel">
          <h2>
            <Users />
            {t("Your family profile", "आपके परिवार की जानकारी")}
          </h2>
          <div className="form-stack">
            <label>
              {t("Household name", "परिवार का नाम")}
              <Input
                value={household.name}
                maxLength={80}
                onChange={(e) => setHousehold({ ...household, name: e.target.value })}
              />
            </label>
            <div className="member-grid">
              {(["children", "adults", "seniors"] as const).map((key, i) => (
                <label key={key}>
                  {t(["Children", "Adults", "Older adults"][i] ?? "Member", ["बच्चे", "वयस्क", "बुजुर्ग"][i] ?? "सदस्य")}
                  <Input
                    type="number"
                    min={key === "adults" ? 1 : 0}
                    max={20}
                    value={household[key]}
                    onChange={(e) =>
                      setHousehold({
                        ...household,
                        [key]: Math.max(
                          key === "adults" ? 1 : 0,
                          Math.min(20, Number(e.target.value)),
                        ),
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <span className="subtle">
              {household.children + household.adults + household.seniors}{" "}
              {t("family members", "परिवार सदस्य")}
            </span>
            <label>
              {t("Daily commute", "दैनिक यात्रा")}
              <select
                value={household.commute}
                onChange={(e) => { const value=e.target.value; if(value==='car'||value==='metro'||value==='carpool'||value==='cycling') setHousehold({ ...household, commute: value }); }}
              >
                <option value="metro">
                  {t("Metro / public transport", "मेट्रो / सार्वजनिक परिवहन")}
                </option>
                <option value="car">{t("Car", "कार")}</option>
                <option value="carpool">{t("Carpool", "कारपूल")}</option>
                <option value="cycling">{t("Cycling", "साइकिल")}</option>
              </select>
            </label>
            <label>
              {t("Preferred activity", "पसंदीदा गतिविधि")}
              <select
                value={household.exercise}
                onChange={(e) => { const value=e.target.value; if(value==='walking'||value==='running'||value==='yoga') setHousehold({ ...household, exercise: value }); }}
              >
                <option value="walking">{t("Walking", "सैर")}</option>
                <option value="running">{t("Running", "दौड़ना")}</option>
                <option value="yoga">{t("Yoga", "योग")}</option>
              </select>
            </label>
            <Button
              disabled={saving || !household.name.trim()}
              onClick={() => {
                void persist(household);
                setGenerated(true);
              }}
            >
              <CalendarDays />
              {t("Save & create daily plan", "सहेजें और दैनिक योजना बनाएं")}
            </Button>
            {!user && (
              <p className="subtle">
                {t(
                  "Guest plans last for this visit. Sign in to save them.",
                  "अतिथि योजना इस यात्रा तक रहती है। सहेजने के लिए साइन इन करें।",
                )}
              </p>
            )}
          </div>
        </section>
        <section className="planner">
          <h2>{t("Your daily rhythm", "आपकी दैनिक दिनचर्या")}</h2>
          <p className="subtle">
            {generated
              ? household.name
              : t(
                  "Based on the current forecast and your preferences",
                  "वर्तमान पूर्वानुमान और आपकी पसंद पर आधारित",
                )}
          </p>
          {[
            {
              time: "07:00",
              icon: House,
              title: t("Start with clean indoor air", "साफ हवा से दिन शुरू करें"),
              text: t(
                "Run a correctly sized HEPA purifier if available; avoid incense.",
                "उपयुक्त HEPA प्यूरिफायर चलाएं; धूपबत्ती से बचें।",
              ),
            },
            {
              time: "09:00",
              icon: TrainFront,
              title: t("A lower-emission commute", "कम उत्सर्जन वाला सफर"),
              text:
                household.commute === "car"
                  ? t(
                      "Consider the metro or a three-person carpool instead of driving alone.",
                      "अकेले कार के बजाय मेट्रो या तीन लोगों के साथ कारपूल चुनें।",
                    )
                  : t(
                      "Use your chosen transport; avoid waiting beside heavy traffic.",
                      "चुने गए परिवहन का उपयोग करें; भारी ट्रैफिक के पास न रुकें।",
                    ),
            },
            {
              time: best?.time.slice(11, 16) ?? "Indoors",
              icon: Footprints,
              title: best
                ? t("Lowest-pollution daytime window", "दिन का कम प्रदूषण वाला समय")
                : t("Choose indoor exercise today", "आज घर के अंदर व्यायाम करें"),
              text: best
                ? `${t("Forecast US AQI", "पूर्वानुमान US AQI")}: ${Math.round(best.aqi ?? 0)}. ${t("Relative improvement, not a guarantee of safety.", "सापेक्ष सुधार, सुरक्षा की गारंटी नहीं।")}`
                : t(
                    "No suitable daytime window was found. Try indoor yoga or gentle movement.",
                    "उपयुक्त समय नहीं मिला। घर के अंदर योग या हल्का व्यायाम करें।",
                  ),
            },
            {
              time: "20:00",
              icon: ShieldCheck,
              title: t("Wind down, breathe easier", "आराम करें, बेहतर सांस लें"),
              text: t(
                "Wet-dust bedroom surfaces and keep smoke out of sleeping spaces.",
                "बेडरूम की धूल गीले कपड़े से साफ करें और धुआं बाहर रखें।",
              ),
            },
          ].map((p, i) => (
            <div className="plan-row" key={i}>
              <span className="plan-time">{p.time}</span>
              <span className="plan-icon">
                <p.icon size={18} />
              </span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </div>
          ))}
          {vulnerable && (
            <div className="caution-note">
              <ShieldCheck />
              {t(
                "Extra caution is applied for children and older adults. Follow individual medical guidance for existing conditions.",
                "बच्चों और बुजुर्गों के लिए अतिरिक्त सावधानी। मौजूदा रोगों के लिए डॉक्टर की सलाह लें।",
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
export function Indoor() {
  const { household, persist, environment, t } = useBreathe();
  const [room, setRoom] = useState("Living room");
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const tasks = [
    t("Wet-dust surfaces and mop floors", "गीले कपड़े से धूल और फर्श साफ करें"),
    t("Check and clean purifier pre-filters", "प्यूरिफायर प्री-फिल्टर जांचें और साफ करें"),
    t("Use an exhaust fan when cooking", "खाना बनाते समय एग्जॉस्ट चलाएं"),
    t("Avoid incense, candles and indoor smoking", "धूपबत्ती, मोमबत्ती और धूम्रपान से बचें"),
    t("Keep shoes and outdoor dust at the entrance", "जूते और बाहर की धूल प्रवेश द्वार पर रखें"),
  ];
  const completed = tasks.filter((_, i) => household.checklist[`${date}-${i}`]).length;
  const high = (environment.data?.hours[0]?.aqi ?? 151) > 100;
  return (
    <>
      <PageHeading
        title={t("A safer space, room by room", "हर कमरे में सुरक्षित हवा")}
        subtitle={t(
          "Simple habits to protect the air your family shares.",
          "परिवार की हवा की रक्षा के लिए सरल आदतें।",
        )}
      />
      <div className="room-tabs">
        {["Living room", "Bedroom", "Kitchen"].map((r, i) => (
          <Button key={r} variant={r === room ? "default" : "outline"} onClick={() => setRoom(r)}>
            {[<House key="h" />, <Wind key="w" />, <Flame key="f" />][i]}
            {t(r, ["बैठक", "बेडरूम", "रसोई"][i] ?? "कमरा")}
          </Button>
        ))}
      </div>
      <div className="two-column">
        <section className="tool-panel">
          <h2>{t(room + " protection", "कमरे की सुरक्षा")}</h2>
          <div className="guidance-item">
            <Wind />
            <div>
              <h3>{t("Ventilation, with care", "सावधानी से वेंटिलेशन")}</h3>
              <p>
                {high
                  ? t(
                      "Outdoor pollution is elevated or unknown. Keep windows closed where possible; ventilate briefly when readings improve. Maintain necessary ventilation for combustion appliances.",
                      "बाहर प्रदूषण अधिक या अज्ञात है। खिड़कियां बंद रखें; बेहतर हवा पर थोड़ी देर खोलें।",
                    )
                  : t(
                      "Outdoor air is relatively cleaner. Brief cross-ventilation can help disperse indoor pollutants.",
                      "बाहर हवा अपेक्षाकृत साफ है। थोड़ी देर क्रॉस-वेंटिलेशन करें।",
                    )}
              </p>
            </div>
          </div>
          <div className="guidance-item">
            <ShieldCheck />
            <div>
              <h3>
                {room === "Kitchen"
                  ? t("Capture cooking fumes", "खाने का धुआं बाहर निकालें")
                  : t("Choose the right HEPA purifier", "सही HEPA प्यूरिफायर चुनें")}
              </h3>
              <p>
                {room === "Kitchen"
                  ? t(
                      "Use an externally vented range hood, cook with lids, and maintain gas burners. Avoid burning food.",
                      "बाहर निकासी वाला हुड, ढक्कन और साफ बर्नर उपयोग करें।",
                    )
                  : t(
                      "Match clean-air delivery rate (CADR) to room size. Avoid ozone-generating devices. Replace filters as recommended.",
                      "CADR को कमरे के आकार से मिलाएं। ओज़ोन बनाने वाले उपकरण न चुनें। फिल्टर समय पर बदलें।",
                    )}
              </p>
            </div>
          </div>
          <div className="guidance-item">
            <Leaf />
            <div>
              <h3>{t("Less dust. Less smoke.", "कम धूल। कम धुआं।")}</h3>
              <p>
                {room === "Bedroom"
                  ? t(
                      "Wash bedding regularly; keep pets away from bedding if allergens are a concern.",
                      "बिस्तर नियमित धोएं; एलर्जी हो तो पालतू जानवर दूर रखें।",
                    )
                  : t(
                      "Use damp cleaning rather than dry sweeping. Houseplants are not a substitute for effective air filtration.",
                      "सूखी झाड़ू के बजाय गीली सफाई करें। पौधे फिल्टर का विकल्प नहीं हैं।",
                    )}
              </p>
            </div>
          </div>
        </section>
        <section className="tool-panel">
          <div className="section-heading">
            <h2>{t("Today’s protection checklist", "आज की सुरक्षा चेकलिस्ट")}</h2>
            <span className="small-tag">
              {completed}/{tasks.length}
            </span>
          </div>
          <div className="progress-track">
            <progress max={tasks.length} value={completed} />
          </div>
          {tasks.map((task, i) => (
            <label
              className={`checklist-row ${household.checklist[`${date}-${i}`] ? "done" : ""}`}
              key={i}
            >
              <Checkbox
                checked={!!household.checklist[`${date}-${i}`]}
                onCheckedChange={(value) =>
                  void persist({
                    ...household,
                    checklist: { ...household.checklist, [`${date}-${i}`]: value === true },
                  })
                }
              />
              <span>{task}</span>
            </label>
          ))}
          <div className="checklist-foot">
            <CheckCircle2 />
            {completed === tasks.length
              ? t(
                  "All done. A little cleaner, a little safer.",
                  "पूरा हुआ। थोड़ा साफ, थोड़ा सुरक्षित।",
                )
              : t(
                  "Every small habit makes your home healthier.",
                  "हर छोटी आदत घर को स्वस्थ बनाती है।",
                )}
          </div>
        </section>
      </div>
    </>
  );
}
export function Impact() {
  const { household, persist, t } = useBreathe();
  const [distance, setDistance] = useState(10);
  const [mode, setMode] = useState<keyof typeof factors>("metro");
  const comparison = (Object.keys(factors) as (keyof typeof factors)[]).map((m) => ({
    mode: m,
    kg: emissions(distance, m),
  }));
  const savings = emissions(distance, "car") - emissions(distance, mode);
  const weekly = household.trips.filter(
    (tr) => Date.now() - new Date(tr.date).getTime() < 7 * 86400000,
  );
  const total = weekly.reduce(
    (n, tr) => n + emissions(tr.distance, "car") - emissions(tr.distance, tr.mode),
    0,
  );
  const score = weekly.length
    ? Math.round((weekly.filter((tr) => tr.mode !== "car").length / weekly.length) * 100)
    : 0;
  return (
    <>
      <PageHeading
        title={t("Small choices. A lighter footprint.", "छोटे विकल्प। कम उत्सर्जन।")}
        subtitle={t(
          "See the estimated impact of a greener everyday journey.",
          "हरित यात्रा के अनुमानित प्रभाव को देखें।",
        )}
      />
      <div className="impact-summary">
        <div>
          <Leaf />
          <span>{t("Weekly CO₂ avoided", "साप्ताहिक CO₂ बचत")}</span>
          <strong>
            {total.toFixed(2)} <small>kg</small>
          </strong>
          <p>{t("Estimated from logged trips", "दर्ज यात्राओं का अनुमान")}</p>
        </div>
        <div>
          <Activity />
          <span>{t("Household eco-score", "परिवार इको-स्कोर")}</span>
          <strong>
            {score}
            <small>/100</small>
          </strong>
          <p>{t("Share of lower-emission trips", "कम उत्सर्जन यात्राओं का हिस्सा")}</p>
        </div>
        <div>
          <Users />
          <span>{t("Your participation", "आपकी भागीदारी")}</span>
          <strong>
            {weekly.length}
            <small> {t("trips", "यात्राएं")}</small>
          </strong>
          <p>{t("Your contribution this week · no public ranking", "इस सप्ताह आपका योगदान")}</p>
        </div>
      </div>
      <div className="two-column">
        <section className="tool-panel">
          <h2>
            <TrainFront />
            {t("Compare your commute", "अपनी यात्रा की तुलना करें")}
          </h2>
          <div className="form-stack">
            <label>
              {t("Journey distance (km)", "यात्रा दूरी (किमी)")}
              <Input
                type="number"
                value={distance}
                min={0}
                max={500}
                onChange={(e) => setDistance(Math.max(0, Math.min(500, Number(e.target.value))))}
              />
            </label>
            <label>
              {t("Travel choice", "यात्रा विकल्प")}
              <select
                value={mode}
                onChange={(e) => {
                  const m = e.target.value;
                  if (m === "car" || m === "metro" || m === "cycling" || m === "carpool")
                    setMode(m);
                }}
              >
                <option value="car">{t("Car (solo)", "कार (अकेले)")}</option>
                <option value="metro">
                  {t("Metro / public transport", "मेट्रो / सार्वजनिक परिवहन")}
                </option>
                <option value="cycling">{t("Cycling", "साइकिल")}</option>
                <option value="carpool">{t("Carpool (3 people)", "कारपूल (3 लोग)")}</option>
              </select>
            </label>
            <div className="savings-callout">
              <Leaf />
              <div>
                <strong>{savings.toFixed(2)} kg CO₂</strong>
                <p>
                  {t(
                    "estimated avoided vs. a solo car journey",
                    "अकेले कार की तुलना में अनुमानित बचत",
                  )}
                </p>
              </div>
            </div>
            <Button
              disabled={distance === 0}
              onClick={() =>
                void persist({
                  ...household,
                  trips: [
                    ...household.trips,
                    { date: new Date().toISOString(), distance, mode },
                  ].slice(-365),
                })
              }
            >
              <Plus />
              {t("Log this journey", "यह यात्रा दर्ज करें")}
            </Button>
          </div>
        </section>
        <section className="tool-panel">
          <h2>{t("Same distance. Different footprints.", "समान दूरी। अलग उत्सर्जन।")}</h2>
          <div className="comparison-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison} layout="vertical" margin={{ left: 15, right: 25 }}>
                <XAxis type="number" unit=" kg" axisLine={false} tickLine={false} />
                <YAxis dataKey="mode" type="category" axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [Number(v).toFixed(2) + " kg CO₂", "Estimate"]} />
                <Bar dataKey="kg" radius={[0, 4, 4, 0]} barSize={30}>
                  {comparison.map((c) => (
                    <Cell
                      key={c.mode}
                      fill={c.mode === mode ? "var(--primary)" : "var(--sage-strong)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <div className="detail-band">
        <Info />
        <div>
          <h3>{t("Estimates, not exact measurements", "अनुमान, सटीक माप नहीं")}</h3>
          <p>
            {t(
              "Assumptions: solo car 0.192 kg CO₂/km, public transport 0.041 kg/passenger-km, three-person carpool 0.064 kg/passenger-km, cycling 0 operational emissions. Illustrative factors; real emissions vary by vehicle, energy mix and occupancy. These savings do not directly change local AQI.",
              "मान्यताएं: कार 0.192, सार्वजनिक परिवहन 0.041, तीन लोगों की कारपूल 0.064 किलो CO₂/किमी; साइकिल संचालन उत्सर्जन शून्य। वास्तविक उत्सर्जन वाहन और ऊर्जा पर निर्भर है। बचत सीधे स्थानीय AQI नहीं बदलती।",
            )}
          </p>
        </div>
      </div>
      <h2 className="history-heading">{t("Your weekly journeys", "इस सप्ताह की यात्राएं")}</h2>
      {weekly.length ? (
        <div className="trip-list">
          {weekly.map((tr, i) => (
            <div key={i}>
              <span>{new Date(tr.date).toLocaleDateString("en-IN")}</span>
              <strong>{tr.mode}</strong>
              <span>{tr.distance} km</span>
              <span>
                {(emissions(tr.distance, "car") - emissions(tr.distance, tr.mode)).toFixed(2)} kg
                CO₂ {t("avoided (est.)", "बचत (अनुमान)")}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Bike />
          {t(
            "No journeys logged yet. Your first greener choice starts here.",
            "अभी कोई यात्रा नहीं। पहला हरित विकल्प यहां से।",
          )}
        </div>
      )}
    </>
  );
}
export function Assistant() {
  const { household, setHousehold, persist, city, language, environment, user, t } = useBreathe();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ask = useServerFn(askAssistant);
  const suggestions = [
    t("Is it safe to go for a walk today?", "क्या आज सैर करना सुरक्षित है?"),
    t("How can I keep my child safe from smog?", "बच्चे को स्मॉग से कैसे बचाएं?"),
    t("When should I open my windows?", "खिड़कियां कब खोलनी चाहिए?"),
  ];
  async function send(text: string) {
    if (!text.trim() || busy) return;
    if (!user) {
      setError(
        t(
          "Sign in using My account to chat securely.",
          "सुरक्षित चैट के लिए मेरा खाता से साइन इन करें।",
        ),
      );
      return;
    }
    setBusy(true);
    setError("");
    const messages: Message[] = [...household.messages, { role: "user", content: text.trim() }];
    setHousehold({ ...household, messages });
    setInput("");
    try {
      const result = await ask({
        data: {
          messages: messages.slice(-20),
          city: city.name,
          language,
          environment: JSON.stringify({
            hours: environment.data?.hours.slice(0, 24),
            family: { children: household.children, seniors: household.seniors },
            source: "Open-Meteo model forecast",
            error: environment.data?.error,
          }),
        },
      });
      if (result.error) {
        setError(result.error);
        setInput(text);
      } else if (result.text)
        await persist({
          ...household,
          messages: [...messages, { role: "assistant" as const, content: result.text }].slice(-100),
        });
    } catch {
      setError(
        t("Unable to connect. Please try again later.", "कनेक्ट नहीं हो सका। बाद में प्रयास करें।"),
      );
      setInput(text);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title={t("A little clarity. A wiser choice.", "थोड़ी स्पष्टता। समझदार विकल्प।")}
        subtitle={t(
          "Your personal guide to air, health and everyday sustainability.",
          "वायु, स्वास्थ्य और स्थिरता के लिए आपका व्यक्तिगत मार्गदर्शक।",
        )}
      />
      <section className="chat-panel">
        <div className="chat-header">
          <span className="assistant-mark">
            <Sparkles />
          </span>
          <div>
            <h2>BreatheWise AI</h2>
            <span>
              {t("Environmental wellness companion · Gemini", "पर्यावरण स्वास्थ्य साथी · Gemini")}
            </span>
          </div>
          <Button variant="ghost" onClick={() => void persist({ ...household, messages: [] })}>
            {t("New conversation", "नई बातचीत")}
          </Button>
        </div>
        <div className="chat-messages" aria-live="polite">
          {!household.messages.length && (
            <div className="chat-welcome">
              <span className="assistant-mark large">
                <Sparkles />
              </span>
              <h2>{t("Let’s make today a little healthier.", "आइए आज को थोड़ा स्वस्थ बनाएं।")}</h2>
              <p>{t("What’s on your mind?", "आप क्या जानना चाहेंगे?")}</p>
              <div className="suggestions">
                {suggestions.map((s) => (
                  <Button variant="outline" key={s} onClick={() => void send(s)}>
                    {s}
                    <ArrowUpRight />
                  </Button>
                ))}
              </div>
            </div>
          )}
          {household.messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.role}`}>
              <span>{m.role === "assistant" ? <Sparkles size={16} /> : <Users size={16} />}</span>
              <div>{m.content}</div>
            </div>
          ))}
          {busy && (
            <div className="chat-loading">
              <Loader2 className="spin" />
              {t("Considering your forecast…", "आपके पूर्वानुमान पर विचार कर रहे हैं…")}
            </div>
          )}
          {error && <div className="error-banner">{error}</div>}
        </div>
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <Input
            aria-label="Your question"
            placeholder={t(
              "Ask about your air, your family, or your next step…",
              "हवा, परिवार या अगले कदम के बारे में पूछें…",
            )}
            value={input}
            maxLength={4000}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            size="icon"
            aria-label="Send message"
            type="submit"
            disabled={busy || !input.trim()}
          >
            <Send />
          </Button>
        </form>
        <div className="chat-disclaimer">
          <ShieldCheck size={13} />
          {t(
            "General wellness guidance, not medical advice. Forecasts are model-based.",
            "सामान्य स्वास्थ्य मार्गदर्शन, चिकित्सा सलाह नहीं। पूर्वानुमान मॉडल आधारित हैं।",
          )}
        </div>
      </section>
    </>
  );
}
