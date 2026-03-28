import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import type {
  Candle,
  FairValueGap,
  LiquiditySweep,
  OrderBlock,
} from "../hooks/useQueries";

interface CandlestickChartProps {
  candles: Candle[];
  orderBlocks?: OrderBlock[];
  fvgs?: FairValueGap[];
  liquiditySweeps?: LiquiditySweep[];
  isLoading?: boolean;
}

const TIMEFRAMES = ["1M", "5M", "15M", "1H", "4H", "1D"];

export function CandlestickChart({
  candles,
  orderBlocks = [],
  fvgs = [],
  liquiditySweeps = [],
  isLoading = false,
}: CandlestickChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState("1H");

  const chartData = useMemo(() => {
    if (!candles.length) return null;
    const chartH = 260;
    const volH = 50;
    const padding = { top: 12, bottom: 8, left: 8, right: 60 };
    const count = candles.length;
    const candleW = 10;
    const gap = 3;
    const totalW = count * (candleW + gap) + padding.left + padding.right;
    const prices = candles.flatMap((c) => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const priceToY = (p: number) =>
      padding.top +
      ((maxPrice - p) / priceRange) * (chartH - padding.top - padding.bottom);
    const vols = candles.map((c) => c.volume);
    const maxVol = Math.max(...vols) || 1;
    const volToH = (v: number) => (v / maxVol) * (volH - 4);
    const canvasH = chartH + volH + 16;
    const gridPrices: number[] = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      gridPrices.push(minPrice + (i / steps) * priceRange);
    }
    return {
      chartH,
      volH,
      canvasH,
      totalW,
      candleW,
      gap,
      padding,
      priceToY,
      volToH,
      gridPrices,
    };
  }, [candles]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4" data-ocid="chart.loading_state">
        <Skeleton className="h-6 w-32 bg-accent" />
        <Skeleton className="h-[320px] w-full bg-accent" />
      </div>
    );
  }

  if (!chartData || !candles.length) {
    return (
      <div
        className="flex items-center justify-center h-[320px] text-muted-foreground text-sm"
        data-ocid="chart.empty_state"
      >
        No chart data available
      </div>
    );
  }

  const {
    chartH,
    volH,
    canvasH,
    totalW,
    candleW,
    gap,
    padding,
    priceToY,
    volToH,
    gridPrices,
  } = chartData;

  return (
    <div className="w-full flex flex-col gap-2" data-ocid="chart.panel">
      {/* Timeframe selector */}
      <div className="flex items-center gap-1 px-1" data-ocid="chart.tab">
        {TIMEFRAMES.map((tf) => (
          <button
            type="button"
            key={tf}
            onClick={() => setActiveTimeframe(tf)}
            data-ocid={`chart.${tf.toLowerCase()}.toggle`}
            className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
              activeTimeframe === tf
                ? "bg-gold text-background font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {tf}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground font-mono">
          XAUUSD · {activeTimeframe}
        </span>
      </div>

      {/* Chart SVG */}
      <div className="w-full overflow-x-auto">
        <svg
          role="img"
          aria-label="XAUUSD Candlestick Chart"
          width={totalW}
          height={canvasH}
          viewBox={`0 0 ${totalW} ${canvasH}`}
          className="block"
        >
          <title>XAUUSD Candlestick Chart</title>
          {/* Background */}
          <rect width={totalW} height={canvasH} fill="oklch(0.13 0.012 255)" />

          {/* Grid lines */}
          {gridPrices.map((price) => {
            const y = priceToY(price);
            return (
              <g key={`grid-${price.toFixed(0)}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={totalW - padding.right}
                  y2={y}
                  stroke="oklch(0.22 0.01 255)"
                  strokeWidth={0.5}
                  strokeDasharray="4,4"
                />
                <text
                  x={totalW - padding.right + 4}
                  y={y + 4}
                  fill="oklch(0.55 0.01 255)"
                  fontSize={9}
                  fontFamily="GeistMono"
                >
                  {price.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* FVG zones */}
          {fvgs
            .filter((f) => !f.filled)
            .map((fvg) => {
              const y1 = priceToY(fvg.priceHigh);
              const y2 = priceToY(fvg.priceLow);
              const isBullish = fvg.gapType.toLowerCase().includes("bull");
              return (
                <rect
                  key={`fvg-${Number(fvg.id)}`}
                  x={padding.left}
                  y={Math.min(y1, y2)}
                  width={totalW - padding.left - padding.right}
                  height={Math.abs(y2 - y1) || 2}
                  fill={
                    isBullish
                      ? "oklch(0.70 0.18 150 / 0.12)"
                      : "oklch(0.58 0.18 25 / 0.12)"
                  }
                  stroke={
                    isBullish
                      ? "oklch(0.70 0.18 150 / 0.4)"
                      : "oklch(0.58 0.18 25 / 0.4)"
                  }
                  strokeWidth={0.5}
                />
              );
            })}

          {/* Order block zones */}
          {orderBlocks
            .filter((ob) => ob.active)
            .map((ob) => {
              const y1 = priceToY(ob.priceHigh);
              const y2 = priceToY(ob.priceLow);
              const isBullish = ob.blockType.toLowerCase().includes("bull");
              return (
                <rect
                  key={`ob-${Number(ob.id)}`}
                  x={padding.left}
                  y={Math.min(y1, y2)}
                  width={totalW - padding.left - padding.right}
                  height={Math.abs(y2 - y1) || 3}
                  fill={
                    isBullish
                      ? "oklch(0.70 0.18 150 / 0.15)"
                      : "oklch(0.58 0.18 25 / 0.15)"
                  }
                  stroke={
                    isBullish
                      ? "oklch(0.70 0.18 150 / 0.6)"
                      : "oklch(0.58 0.18 25 / 0.6)"
                  }
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
              );
            })}

          {/* Liquidity sweep levels */}
          {liquiditySweeps.map((ls) => {
            const y = priceToY(ls.price);
            const isBuy = ls.sweepType.toLowerCase().includes("buy");
            return (
              <g key={`ls-${Number(ls.id)}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={totalW - padding.right}
                  y2={y}
                  stroke={
                    isBuy
                      ? "oklch(0.70 0.18 150 / 0.7)"
                      : "oklch(0.58 0.18 25 / 0.7)"
                  }
                  strokeWidth={1}
                  strokeDasharray="6,3"
                />
                <text
                  x={padding.left + 4}
                  y={y - 3}
                  fill={isBuy ? "oklch(0.70 0.18 150)" : "oklch(0.58 0.18 25)"}
                  fontSize={8}
                  fontFamily="GeistMono"
                >
                  {ls.sweepType} {ls.price.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Candles */}
          {candles.map((candle, i) => {
            const x = padding.left + i * (candleW + gap);
            const isBull = candle.close >= candle.open;
            const color = isBull
              ? "oklch(0.70 0.18 150)"
              : "oklch(0.58 0.18 25)";
            const openY = priceToY(candle.open);
            const closeY = priceToY(candle.close);
            const highY = priceToY(candle.high);
            const lowY = priceToY(candle.low);
            const bodyTop = Math.min(openY, closeY);
            const bodyH = Math.max(Math.abs(closeY - openY), 1);
            const wickX = x + candleW / 2;
            return (
              <g key={`candle-${Number(candle.timestamp)}-${i}`}>
                <line
                  x1={wickX}
                  y1={highY}
                  x2={wickX}
                  y2={lowY}
                  stroke={color}
                  strokeWidth={1}
                />
                <rect
                  x={x}
                  y={bodyTop}
                  width={candleW}
                  height={bodyH}
                  fill={color}
                  rx={1}
                />
              </g>
            );
          })}

          {/* Volume bars */}
          {candles.map((candle, i) => {
            const x = padding.left + i * (candleW + gap);
            const isBull = candle.close >= candle.open;
            const barH = volToH(candle.volume);
            const barY = chartH + 8 + (volH - 4 - barH);
            return (
              <rect
                key={`vol-${Number(candle.timestamp)}-${i}`}
                x={x}
                y={barY}
                width={candleW}
                height={barH}
                fill={
                  isBull
                    ? "oklch(0.70 0.18 150 / 0.5)"
                    : "oklch(0.58 0.18 25 / 0.5)"
                }
                rx={1}
              />
            );
          })}

          {/* Volume label */}
          <text
            x={padding.left}
            y={chartH + 12}
            fill="oklch(0.45 0.01 255)"
            fontSize={9}
            fontFamily="GeistMono"
          >
            VOL
          </text>
        </svg>
      </div>
    </div>
  );
}
