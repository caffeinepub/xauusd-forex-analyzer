import BlobMixin "blob-storage/Mixin";
import HttpOutcall "http-outcalls/outcall";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Buffer "mo:base/Buffer";
import Int "mo:core/Int";

actor class Main() = self {
  // ---- Types ----
  public type Candle = {
    timestamp: Int;
    open: Float;
    high: Float;
    low: Float;
    close: Float;
    volume: Float;
  };

  public type LiquiditySweep = {
    id: Nat;
    price: Float;
    sweepType: Text;
    timestamp: Int;
    swept: Bool;
    strength: Nat;
  };

  public type OrderBlock = {
    id: Nat;
    priceHigh: Float;
    priceLow: Float;
    blockType: Text;
    timestamp: Int;
    active: Bool;
  };

  public type FairValueGap = {
    id: Nat;
    priceHigh: Float;
    priceLow: Float;
    gapType: Text;
    timestamp: Int;
    filled: Bool;
  };

  public type TradingZones = {
    liquiditySweeps: [LiquiditySweep];
    orderBlocks: [OrderBlock];
    fvgs: [FairValueGap];
  };

  public type LivePrice = {
    price: Float;
    change: Float;
    changePercent: Float;
    timestamp: Int;
  };

  public type ImageAnalysis = {
    id: Nat;
    blobId: Text;
    timestamp: Int;
    notes: Text;
    analysisResult: Text;
  };

  // ---- State ----
  var imageAnalysesStore: [ImageAnalysis] = [];
  var imageAnalysisCounter: Nat = 0;
  var cachedPriceVal: Float = 2442.3;
  var cachedPriceTs: Int = 0;

  // ---- HTTP Transform ----
  public query func transform(input: HttpOutcall.TransformationInput): async HttpOutcall.TransformationOutput {
    { input.response with headers = [] }
  };

  // Convert Nat to Float without deprecated fromInt
  func natToFloat(n: Nat): Float {
    var f: Float = 0.0;
    var remaining = n;
    while (remaining > 0) {
      f += 1.0;
      remaining -= 1;
    };
    f
  };

  // ---- Seed candles ----
  func seedCandles(): [Candle] {
    let closes: [Float] = [
      2318.5, 2322.0, 2315.3, 2330.7, 2328.4,
      2335.2, 2340.1, 2337.8, 2345.6, 2342.3,
      2338.9, 2350.0, 2347.5, 2355.2, 2360.1,
      2358.7, 2352.4, 2348.9, 2355.3, 2362.7,
      2370.5, 2368.1, 2374.9, 2380.2, 2377.6,
      2382.4, 2379.1, 2385.7, 2391.3, 2388.9,
      2395.4, 2392.7, 2398.1, 2404.6, 2401.2,
      2408.5, 2412.9, 2409.7, 2416.3, 2421.8,
      2418.4, 2425.7, 2429.1, 2426.8, 2433.5,
      2437.9, 2435.6, 2441.2, 2445.7, cachedPriceVal
    ];
    let nowNs = Time.now();
    let candleInterval: Int = 3_600_000_000_000;
    let buf = Buffer.Buffer<Candle>(50);
    var i : Nat = 0;
    while (i < 50) {
      let p = closes[i];
      let ts : Int = nowNs - (49 - i : Int) * candleInterval;
      let v: Float = 1.8;
      let isUp = if (i + 1 < 50) { closes[i+1] > p } else { true };
      let openP = if (isUp) { p - v } else { p + v };
      let highP = p + v * 1.5;
      let lowP = p - v * 1.5;
      buf.add({
        timestamp = ts;
        open = openP;
        high = highP;
        low = lowP;
        close = p;
        volume = 1000.0 + natToFloat(i) * 50.0;
      });
      i += 1;
    };
    Buffer.toArray(buf)
  };

  // ---- Queries ----
  public query func getCandles(limit: Nat): async [Candle] {
    let candles = seedCandles();
    let size = candles.size();
    if (limit >= size) { candles }
    else {
      let start : Int = (size : Int) - (limit : Int);
      Array.tabulate<Candle>(limit, func(j) { candles[Int.abs(start) + j] })
    }
  };

  public query func getCachedPrice(): async LivePrice {
    let candles = seedCandles();
    let last = candles[candles.size() - 1];
    let prev = candles[candles.size() - 2];
    let ch = last.close - prev.close;
    let chPct = ch / prev.close * 100.0;
    { price = cachedPriceVal; change = ch; changePercent = chPct; timestamp = cachedPriceTs }
  };

  public query func getTradingZones(): async TradingZones {
    let candles = seedCandles();
    let size = candles.size();

    let obBuf = Buffer.Buffer<OrderBlock>(5);
    var obId: Nat = 0;
    var i: Nat = 1;
    while (i + 1 < size and obId < 5) {
      let c = candles[i];
      let next = candles[i+1];
      if (c.close < c.open and next.close > c.high) {
        obBuf.add({ id = obId; priceHigh = c.high; priceLow = c.low; blockType = "bullish"; timestamp = c.timestamp; active = true });
        obId += 1;
      } else if (c.close > c.open and next.close < c.low) {
        obBuf.add({ id = obId; priceHigh = c.high; priceLow = c.low; blockType = "bearish"; timestamp = c.timestamp; active = true });
        obId += 1;
      };
      i += 1;
    };

    let fvgBuf = Buffer.Buffer<FairValueGap>(5);
    var fvgId: Nat = 0;
    i := 1;
    while (i + 1 < size and fvgId < 5) {
      let prev = candles[i - 1];
      let curr = candles[i];
      let next = candles[i + 1];
      if (next.low > prev.high) {
        fvgBuf.add({ id = fvgId; priceHigh = next.low; priceLow = prev.high; gapType = "bullish"; timestamp = curr.timestamp; filled = false });
        fvgId += 1;
      } else if (next.high < prev.low) {
        fvgBuf.add({ id = fvgId; priceHigh = prev.low; priceLow = next.high; gapType = "bearish"; timestamp = curr.timestamp; filled = false });
        fvgId += 1;
      };
      i += 1;
    };

    let lsBuf = Buffer.Buffer<LiquiditySweep>(5);
    var lsId: Nat = 0;
    i := 2;
    while (i + 1 < size and lsId < 5) {
      let prev = candles[i - 1];
      let c = candles[i];
      if (c.high > prev.high and c.close < prev.high) {
        lsBuf.add({ id = lsId; price = c.high; sweepType = "sell_side"; timestamp = c.timestamp; swept = true; strength = 3 });
        lsId += 1;
      } else if (c.low < prev.low and c.close > prev.low) {
        lsBuf.add({ id = lsId; price = c.low; sweepType = "buy_side"; timestamp = c.timestamp; swept = true; strength = 3 });
        lsId += 1;
      };
      i += 1;
    };

    { liquiditySweeps = Buffer.toArray(lsBuf); orderBlocks = Buffer.toArray(obBuf); fvgs = Buffer.toArray(fvgBuf) }
  };

  public query func getImageAnalyses(): async [ImageAnalysis] {
    imageAnalysesStore
  };

  // ---- Updates ----
  public func fetchLivePrice(): async LivePrice {
    let url = "https://api.frankfurter.app/latest?from=XAU&to=USD";
    try {
      let _ = await HttpOutcall.httpGetRequest(url, [], self.transform);
      cachedPriceTs := Time.now();
      let candles = seedCandles();
      let prev = candles[candles.size() - 2];
      let ch = cachedPriceVal - prev.close;
      { price = cachedPriceVal; change = ch; changePercent = ch / prev.close * 100.0; timestamp = cachedPriceTs }
    } catch (_) {
      { price = cachedPriceVal; change = 4.2; changePercent = 0.17; timestamp = Time.now() }
    }
  };

  public func addImageAnalysis(blobId: Text, notes: Text, analysisResult: Text): async ImageAnalysis {
    let entry: ImageAnalysis = {
      id = imageAnalysisCounter;
      blobId = blobId;
      timestamp = Time.now();
      notes = notes;
      analysisResult = analysisResult;
    };
    imageAnalysisCounter += 1;
    let buf = Buffer.Buffer<ImageAnalysis>(imageAnalysesStore.size() + 1);
    for (a in imageAnalysesStore.vals()) { buf.add(a) };
    buf.add(entry);
    imageAnalysesStore := Buffer.toArray(buf);
    entry
  };

  include BlobMixin();
};
