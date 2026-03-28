import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export interface Candle {
  timestamp: bigint;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface LivePrice {
  price: number;
  change: number;
  changePercent: number;
  timestamp: bigint;
}

export interface LiquiditySweep {
  id: bigint;
  price: number;
  sweepType: string;
  timestamp: bigint;
  swept: boolean;
  strength: bigint;
}

export interface OrderBlock {
  id: bigint;
  priceHigh: number;
  priceLow: number;
  blockType: string;
  timestamp: bigint;
  active: boolean;
}

export interface FairValueGap {
  id: bigint;
  priceHigh: number;
  priceLow: number;
  gapType: string;
  timestamp: bigint;
  filled: boolean;
}

export interface TradingZones {
  liquiditySweeps: LiquiditySweep[];
  orderBlocks: OrderBlock[];
  fvgs: FairValueGap[];
}

export interface ImageAnalysis {
  id: bigint;
  blobId: string;
  timestamp: bigint;
  notes: string;
  analysisResult: string;
}

export function useCandles(limit = 50) {
  const { actor, isFetching } = useActor();
  return useQuery<Candle[]>({
    queryKey: ["candles", limit],
    queryFn: async () => {
      if (!actor) return [];
      const a = actor as any;
      const result = await a.getCandles(BigInt(limit));
      return result as Candle[];
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useLivePrice() {
  const { actor, isFetching } = useActor();
  return useQuery<LivePrice | null>({
    queryKey: ["livePrice"],
    queryFn: async () => {
      if (!actor) return null;
      const a = actor as any;
      try {
        const result = await a.getCachedPrice();
        return result as LivePrice;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useTradingZones() {
  const { actor, isFetching } = useActor();
  return useQuery<TradingZones | null>({
    queryKey: ["tradingZones"],
    queryFn: async () => {
      if (!actor) return null;
      const a = actor as any;
      const result = await a.getTradingZones();
      return result as TradingZones;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useImageAnalyses() {
  const { actor, isFetching } = useActor();
  return useQuery<ImageAnalysis[]>({
    queryKey: ["imageAnalyses"],
    queryFn: async () => {
      if (!actor) return [];
      const a = actor as any;
      const result = await a.getImageAnalyses();
      return result as ImageAnalysis[];
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAddImageAnalysis() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      blobId,
      notes,
      analysisResult,
    }: {
      blobId: string;
      notes: string;
      analysisResult: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const a = actor as any;
      return a.addImageAnalysis(blobId, notes, analysisResult);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imageAnalyses"] });
    },
  });
}
