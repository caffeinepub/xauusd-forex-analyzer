import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Activity,
  BarChart3,
  Calendar,
  Droplets,
  ExternalLink,
  Github,
  LineChart,
  Search,
  TrendingDown,
  TrendingUp,
  Twitter,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { CandlestickChart } from "./components/CandlestickChart";
import { TradingZonesPanel } from "./components/TradingZonesPanel";
import { UploadSection } from "./components/UploadSection";
import { useCandles, useLivePrice, useTradingZones } from "./hooks/useQueries";

const TOOLS = [
  { icon: BarChart3, label: "Charts" },
  { icon: LineChart, label: "Analysis" },
  { icon: Droplets, label: "Liquidity" },
  { icon: Calendar, label: "Calendar" },
];

const NAV_LINKS = ["Home", "Analysis", "Indicators", "Community", "Pricing"];

const ARTICLES = [
  {
    title: "XAUUSD Breaks Key Resistance: Liquidity Grab in Play",
    snippet:
      "Smart money positioned after sweeping buy-side liquidity above 2450. Bullish order block at 2418 holds firm.",
    date: "Mar 27, 2026",
    tag: "Liquidity",
  },
  {
    title: "Major FVG Identified on 4H — Expect Retracement",
    snippet:
      "A significant fair value gap formed between 2391–2405 suggests price will return to fill imbalance before continuation.",
    date: "Mar 25, 2026",
    tag: "FVG",
  },
  {
    title: "Order Block Confluence at 2380 Offers High-Probability Long",
    snippet:
      "Three bullish OBs stack between 2378–2385 forming a strong demand zone aligned with weekly bias.",
    date: "Mar 23, 2026",
    tag: "OB",
  },
];

const FEEDBACK = [
  {
    user: "TraderJoe_SMC",
    avatar: "TJ",
    text: "The liquidity sweep alerts are incredibly accurate. Caught the 2445 sweep and rode it down 40 pips!",
    time: "2h ago",
  },
  {
    user: "GoldHunterFX",
    avatar: "GH",
    text: "Best XAUUSD analysis tool I've used. The OB & FVG overlays on the chart save so much time.",
    time: "5h ago",
  },
];

const FOOTER_HOME_LINKS = [
  "Dashboard",
  "Live Charts",
  "Analysis",
  "Indicators",
];
const FOOTER_ABOUT_LINKS = ["About Us", "Pricing", "Blog", "Contact"];

function PriceDisplay() {
  const { data: price, isLoading } = useLivePrice();
  if (isLoading) return <Skeleton className="h-6 w-28 bg-accent" />;
  if (!price) return null;
  const isUp = price.change >= 0;
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono font-bold text-gold text-base">
        ${price.price.toFixed(2)}
      </span>
      <span
        className={`flex items-center gap-0.5 text-xs font-mono ${
          isUp ? "text-bullish" : "text-bearish"
        }`}
      >
        {isUp ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {isUp ? "+" : ""}
        {price.change.toFixed(2)} ({price.changePercent.toFixed(2)}%)
      </span>
    </div>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState("Home");
  const [activeTool, setActiveTool] = useState("Charts");
  const [pricePulse, setPricePulse] = useState(false);

  const { data: candles = [], isLoading: candlesLoading } = useCandles(50);
  const { data: zones, isLoading: zonesLoading } = useTradingZones();
  const { data: price } = useLivePrice();

  useEffect(() => {
    if (price) {
      setPricePulse(true);
      const t = setTimeout(() => setPricePulse(false), 800);
      return () => clearTimeout(t);
    }
  }, [price]);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.32 0.09 70) 0%, oklch(0.18 0.06 60) 40%, oklch(0.10 0.02 255) 100%)",
      }}
    >
      <div
        className="min-h-screen mx-auto max-w-[1400px] bg-background rounded-none md:rounded-2xl md:my-4 overflow-hidden"
        style={{ boxShadow: "0 0 80px rgba(0,0,0,0.8)" }}
      >
        {/* Header */}
        <header className="flex items-center gap-4 px-4 md:px-6 py-3 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
          <div className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/assets/generated/xauusd-logo-transparent.dim_60x60.png"
              alt="XAUUSD Analytics Logo"
              className="h-8 w-8 rounded"
            />
            <div className="leading-none">
              <div className="text-gold font-display font-bold text-sm tracking-tight">
                XAUUSD
              </div>
              <div className="text-[10px] text-muted-foreground tracking-wider uppercase">
                Analytics
              </div>
            </div>
          </div>

          <nav
            className="hidden lg:flex items-center gap-1 ml-4"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <button
                type="button"
                key={link}
                onClick={() => setActiveNav(link)}
                className={`px-3 py-1.5 text-sm transition-colors relative ${
                  activeNav === link
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`nav.${link.toLowerCase()}.link`}
              >
                {link}
                {activeNav === link && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          <div
            className={`hidden md:flex ml-4 ${pricePulse ? "animate-pulse_gold" : ""}`}
          >
            <PriceDisplay />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="nav.search_input"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-border text-foreground hover:bg-muted hidden sm:flex"
              data-ocid="nav.login.button"
            >
              Log in
            </Button>
            <Button
              size="sm"
              className="text-xs bg-gold hover:bg-gold-hover text-background font-semibold hidden sm:flex"
              data-ocid="nav.signup.button"
            >
              Sign Up
            </Button>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section
            className="px-4 md:px-6 py-8 md:py-12 text-center border-b border-border relative overflow-hidden"
            data-ocid="hero.section"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 100%, oklch(0.72 0.12 70 / 0.08) 0%, transparent 70%)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <p className="text-[11px] uppercase tracking-[0.25em] text-gold mb-3 font-semibold">
                XAUUSD Analytics
              </p>
              <h1 className="font-display font-extrabold text-3xl md:text-5xl uppercase tracking-tight text-foreground mb-4 leading-none">
                Market Insights Portal
              </h1>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
                Advanced Smart Money Concepts for Gold — Liquidity Sweeps, Order
                Blocks &amp; Fair Value Gaps with live XAUUSD market data.
              </p>
              <Button
                className="bg-gold hover:bg-gold-hover text-background font-bold px-8"
                data-ocid="hero.primary_button"
              >
                Dashboard
              </Button>
            </motion.div>
          </section>

          {/* 3-column grid */}
          <section className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-0 border-b border-border">
            {/* Left sidebar */}
            <aside className="border-r border-border flex flex-col gap-0">
              <div className="p-3 border-b border-border">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-semibold">
                  Tools
                </p>
                <nav
                  className="flex flex-col gap-0.5"
                  aria-label="Analysis tools"
                >
                  {TOOLS.map((tool) => (
                    <button
                      type="button"
                      key={tool.label}
                      onClick={() => setActiveTool(tool.label)}
                      className={`flex items-center gap-2.5 px-2 py-2 rounded text-xs transition-colors ${
                        activeTool === tool.label
                          ? "bg-gold/15 text-gold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                      data-ocid={`tools.${tool.label.toLowerCase()}.button`}
                    >
                      <tool.icon className="h-3.5 w-3.5" />
                      {tool.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-3 border-b border-border">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-semibold">
                  Chart Analysis
                </p>
                <div className="flex flex-col gap-1">
                  {(["XAUUSD", "XAGUSD", "DXY"] as const).map((sym, i) => {
                    const priceMap: Record<string, string> = {
                      XAUUSD: "2442.30",
                      XAGUSD: "29.18",
                      DXY: "104.23",
                    };
                    const changeMap: Record<string, string> = {
                      XAUUSD: "+0.42%",
                      XAGUSD: "-0.18%",
                      DXY: "+0.11%",
                    };
                    const isPos = changeMap[sym].startsWith("+");
                    return (
                      <div
                        key={sym}
                        className="flex justify-between items-center px-1.5 py-1 rounded hover:bg-muted/40 transition-colors"
                        data-ocid={`price.item.${i + 1}`}
                      >
                        <span className="text-xs font-mono text-foreground">
                          {sym}
                        </span>
                        <div className="text-right">
                          <div className="text-xs font-mono text-foreground">
                            {priceMap[sym]}
                          </div>
                          <div
                            className={`text-[10px] font-mono ${
                              isPos ? "text-bullish" : "text-bearish"
                            }`}
                          >
                            {changeMap[sym]}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Upload &amp; Analyze
                </p>
                <UploadSection />
              </div>
            </aside>

            {/* Center: candlestick chart */}
            <div className="flex flex-col border-r border-border">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gold" />
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Live Interactive Candlesticks
                  </p>
                </div>
                <div className="md:hidden">
                  <PriceDisplay />
                </div>
              </div>
              <div className="p-3 flex-1">
                <CandlestickChart
                  candles={candles}
                  orderBlocks={zones?.orderBlocks}
                  fvgs={zones?.fvgs}
                  liquiditySweeps={zones?.liquiditySweeps}
                  isLoading={candlesLoading}
                />
              </div>
              <div className="px-4 pb-3 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: "oklch(0.70 0.18 150 / 0.5)" }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Bullish OB
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: "oklch(0.58 0.18 25 / 0.5)" }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Bearish OB
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-0.5 w-5"
                    style={{
                      background: "oklch(0.70 0.18 150)",
                      borderTop: "1px dashed oklch(0.70 0.18 150)",
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    FVG Zone
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-0.5 w-5"
                    style={{
                      background: "oklch(0.72 0.12 70)",
                      borderTop: "1px dashed oklch(0.72 0.12 70)",
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Liq. Sweep
                  </span>
                </div>
              </div>
            </div>

            {/* Right sidebar: trading zones */}
            <aside className="flex flex-col">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
                <TrendingUp className="h-4 w-4 text-gold" />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Key Trading Zones
                </p>
                <Badge
                  className="ml-auto text-[9px] bg-gold/20 text-gold border-gold/30 font-mono"
                  variant="outline"
                >
                  XAUUSD · 1H
                </Badge>
              </div>
              <div className="p-3 overflow-y-auto flex-1 max-h-[500px]">
                <TradingZonesPanel
                  zones={zones ?? null}
                  isLoading={zonesLoading}
                />
              </div>
            </aside>
          </section>

          {/* Lower section */}
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 border-b border-border">
            <div className="border-r border-border p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
                Recent Gold Analysis
              </p>
              <div className="flex flex-col gap-3">
                {ARTICLES.map((article, i) => (
                  <motion.article
                    key={article.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group"
                    data-ocid={`articles.item.${i + 1}`}
                  >
                    <div
                      className="w-16 h-14 rounded flex-shrink-0 flex items-center justify-center"
                      style={{
                        background:
                          i % 2 === 0
                            ? "linear-gradient(135deg, oklch(0.72 0.12 70 / 0.3), oklch(0.20 0.01 255))"
                            : "linear-gradient(135deg, oklch(0.60 0.18 150 / 0.3), oklch(0.20 0.01 255))",
                      }}
                    >
                      <BarChart3 className="h-5 w-5 text-gold/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-gold transition-colors">
                          {article.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-[9px] flex-shrink-0 border-gold/30 text-gold bg-gold/10"
                        >
                          {article.tag}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {article.snippet}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {article.date}
                      </p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            <div className="p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
                Platform Feedback
              </p>
              <div className="flex flex-col gap-3">
                {FEEDBACK.map((fb, i) => (
                  <div
                    key={fb.user}
                    className="p-3 rounded-lg bg-muted/20 border border-border"
                    data-ocid={`feedback.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">
                        {fb.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {fb.user}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {fb.time}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {fb.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-card border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 md:px-8 py-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="/assets/generated/xauusd-logo-transparent.dim_60x60.png"
                  alt=""
                  className="h-6 w-6 rounded"
                />
                <span className="font-display font-bold text-sm text-gold">
                  XAUUSD Analytics
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Professional Smart Money Concept analysis for Gold traders.
                Liquidity, OB &amp; FVG precision.
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
                Home
              </p>
              <div className="flex flex-col gap-1.5">
                {FOOTER_HOME_LINKS.map((link) => (
                  <a
                    key={link}
                    href="/"
                    className="text-xs text-muted-foreground hover:text-gold transition-colors"
                    data-ocid={`footer.${link.toLowerCase().replace(" ", "_")}.link`}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
                About
              </p>
              <div className="flex flex-col gap-1.5">
                {FOOTER_ABOUT_LINKS.map((link) => (
                  <a
                    key={link}
                    href="/"
                    className="text-xs text-muted-foreground hover:text-gold transition-colors"
                    data-ocid={`footer.${link.toLowerCase().replace(" ", "_")}.link`}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
                Social Media
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="/"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors"
                  data-ocid="footer.twitter.link"
                >
                  <Twitter className="h-3.5 w-3.5" /> Twitter / X
                </a>
                <a
                  href="/"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors"
                  data-ocid="footer.github.link"
                >
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
                <a
                  href="/"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors"
                  data-ocid="footer.website.link"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Website
                </a>
              </div>
            </div>
          </div>
          <Separator className="bg-border" />
          <div className="px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-[11px] text-muted-foreground">
              &copy; {new Date().getFullYear()} XAUUSD Analytics. All rights
              reserved.
            </p>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-muted-foreground hover:text-gold transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </div>
        </footer>
      </div>
      <Toaster />
    </div>
  );
}
