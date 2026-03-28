import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Square, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import type { TradingZones } from "../hooks/useQueries";

interface TradingZonesPanelProps {
  zones: TradingZones | null;
  isLoading?: boolean;
}

function Section({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 bg-muted/40 hover:bg-muted/70 transition-colors"
        data-ocid="zones.toggle"
      >
        <div className="flex items-center gap-2">
          <span className="text-gold">{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="p-2 flex flex-col gap-1.5">{children}</div>}
    </div>
  );
}

export function TradingZonesPanel({
  zones,
  isLoading,
}: TradingZonesPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" data-ocid="zones.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full bg-accent" />
        ))}
      </div>
    );
  }

  const liquiditySweeps = zones?.liquiditySweeps ?? [];
  const orderBlocks = zones?.orderBlocks ?? [];
  const fvgs = zones?.fvgs ?? [];

  return (
    <div className="flex flex-col gap-3" data-ocid="zones.panel">
      {/* Liquidity Sweeps */}
      <Section title="Liquidity Sweeps" icon={<Zap className="h-3.5 w-3.5" />}>
        {liquiditySweeps.length === 0 ? (
          <p
            className="text-xs text-muted-foreground px-1"
            data-ocid="zones.sweeps.empty_state"
          >
            No sweeps detected
          </p>
        ) : (
          liquiditySweeps.map((ls, i) => {
            const isBuy = ls.sweepType.toLowerCase().includes("buy");
            return (
              <div
                key={Number(ls.id)}
                className="flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-muted/30"
                data-ocid={`zones.sweep.item.${i + 1}`}
              >
                <Badge
                  className={`text-xs px-2 py-0.5 font-mono ${
                    isBuy
                      ? "bg-bullish/20 text-bullish border-bullish/30"
                      : "bg-bearish/20 text-bearish border-bearish/30"
                  }`}
                  variant="outline"
                >
                  {ls.sweepType}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground">
                    {ls.price.toFixed(2)}
                  </span>
                  {ls.swept && (
                    <span className="text-[10px] text-muted-foreground">
                      (swept)
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-1 rounded ${
                      Number(ls.strength) >= 3
                        ? "bg-gold/20 text-gold"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    S{Number(ls.strength)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </Section>

      {/* Order Blocks */}
      <Section
        title="Order Blocks (OB)"
        icon={<Square className="h-3.5 w-3.5" />}
      >
        {orderBlocks.length === 0 ? (
          <p
            className="text-xs text-muted-foreground px-1"
            data-ocid="zones.obs.empty_state"
          >
            No order blocks detected
          </p>
        ) : (
          orderBlocks.map((ob, i) => {
            const isBull = ob.blockType.toLowerCase().includes("bull");
            return (
              <div
                key={Number(ob.id)}
                className="flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-muted/30"
                data-ocid={`zones.ob.item.${i + 1}`}
              >
                <Badge
                  className={`text-xs px-2 py-0.5 font-mono ${
                    isBull
                      ? "bg-bullish/20 text-bullish border-bullish/30"
                      : "bg-bearish/20 text-bearish border-bearish/30"
                  }`}
                  variant="outline"
                >
                  {ob.blockType}
                </Badge>
                <div className="text-right">
                  <div className="text-xs font-mono text-foreground">
                    {ob.priceLow.toFixed(2)} – {ob.priceHigh.toFixed(2)}
                  </div>
                  {!ob.active && (
                    <div className="text-[10px] text-muted-foreground">
                      mitigated
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Section>

      {/* Fair Value Gaps */}
      <Section
        title="Fair Value Gaps (FVG)"
        icon={<TrendingUp className="h-3.5 w-3.5" />}
      >
        {fvgs.length === 0 ? (
          <p
            className="text-xs text-muted-foreground px-1"
            data-ocid="zones.fvgs.empty_state"
          >
            No FVGs detected
          </p>
        ) : (
          fvgs.map((fvg, i) => {
            const isBull = fvg.gapType.toLowerCase().includes("bull");
            return (
              <div
                key={Number(fvg.id)}
                className="flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-muted/30"
                data-ocid={`zones.fvg.item.${i + 1}`}
              >
                <Badge
                  className={`text-xs px-2 py-0.5 font-mono ${
                    isBull
                      ? "bg-bullish/20 text-bullish border-bullish/30"
                      : "bg-bearish/20 text-bearish border-bearish/30"
                  }`}
                  variant="outline"
                >
                  {fvg.gapType}
                </Badge>
                <div className="text-right">
                  <div className="text-xs font-mono text-foreground">
                    {fvg.priceLow.toFixed(2)} – {fvg.priceHigh.toFixed(2)}
                  </div>
                  {fvg.filled && (
                    <div className="text-[10px] text-muted-foreground">
                      filled
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Section>
    </div>
  );
}
