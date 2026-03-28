# XAUUSD Forex Analyzer

## Current State
New project — no existing application logic.

## Requested Changes (Diff)

### Add
- Live XAUUSD price feed via HTTP outcalls from backend (fetching from a public forex API like frankfurter or exchangerate-api)
- Candlestick chart component displaying XAUUSD OHLC data with timeframe selector
- Analysis panels for:
  - Liquidity Sweeps: detect swing high/low wicks that swept liquidity zones
  - Order Blocks: identify last bearish/bullish candle before significant move
  - Fair Value Gaps (FVG): find 3-candle imbalance gaps (inefficiencies)
- Image upload feature: user uploads a chart screenshot, backend stores it, frontend displays with analysis overlay panel
- Backend stores uploaded image analysis notes and price history
- Key trading zones panel (right sidebar) showing detected zones with price levels
- Recent analysis log

### Modify
N/A (new project)

### Remove
N/A

## Implementation Plan
1. Backend (Motoko):
   - HTTP outcall to fetch live XAUUSD price (USD per troy oz) from public API
   - Store uploaded image blob IDs and associated analysis notes
   - Return OHLC mock/derived data for charting
   - Detect and return liquidity sweep, order block, FVG zones from stored price data

2. Frontend:
   - Dark premium dashboard layout matching design preview
   - TradingView Lightweight Charts for candlestick display
   - Sidebar with tools navigation
   - Right panel: Key Trading Zones (liquidity sweeps, order blocks, FVGs) with bullish/bearish pills
   - Image upload widget (drag & drop) using blob-storage component
   - Real-time price ticker at top
   - Analysis algorithm runs client-side on fetched OHLC data
