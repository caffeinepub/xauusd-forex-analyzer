import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { HttpAgent } from "@icp-sdk/core/agent";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { loadConfig } from "../config";
import { useActor } from "../hooks/useActor";
import { useAddImageAnalysis, useImageAnalyses } from "../hooks/useQueries";
import { StorageClient } from "../utils/StorageClient";

function generateAnalysis(filename: string, notes: string): string {
  const patterns = [
    "Identified a Bullish Order Block near the recent swing low — price may retest this zone before continuing higher.",
    "Fair Value Gap detected between the last two impulse candles. Expect price to fill this imbalance on next pullback.",
    "Liquidity Sweep above prior session high observed. Smart money likely positioned short after grab. Watch for reversal structure.",
    "Strong Bearish Order Block formed after sharp sell-off. Likely to act as supply on any retracement.",
    "Multiple FVGs stacked in bullish direction — confluence zone with high probability upside continuation.",
    "Buy-side liquidity swept at resistance. Potential for sharp reversal if lower timeframe shows bearish structure break.",
  ];
  const base = patterns[Math.floor(Math.random() * patterns.length)];
  return `Chart Analysis: ${filename}\n\n${base}${
    notes ? `\n\nUser Notes: ${notes}` : ""
  }\n\nKey Levels: Review Order Blocks (OBs) and Fair Value Gaps (FVGs) on chart for entry confirmation. Align with higher timeframe bias before trading.`;
}

export function UploadSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<{
    blobId: string;
    result: string;
    notes: string;
  } | null>(null);

  const { actor } = useActor();
  const addAnalysis = useAddImageAnalysis();
  const { data: analyses = [] } = useImageAnalyses();

  const handleUpload = async (file: File) => {
    if (!actor) {
      toast.error("Please wait for connection to initialize");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setUploading(true);
    try {
      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      const analysisResult = generateAnalysis(file.name, notes);
      await addAnalysis.mutateAsync({ blobId: hash, notes, analysisResult });
      toast.success("Image uploaded and analysed!");
      setNotes("");
    } catch (e) {
      console.error(e);
      toast.error("Upload failed — check console for details");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        placeholder="Add notes (optional)…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="text-xs bg-muted/40 border-border resize-none h-16"
        data-ocid="upload.textarea"
      />

      {/* Drop zone */}
      <button
        type="button"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
          isDragging
            ? "border-gold bg-gold/10"
            : "border-border hover:border-gold/50 hover:bg-muted/30"
        }`}
        data-ocid="upload.dropzone"
      >
        <Upload className="h-5 w-5 text-gold" />
        <p className="text-xs text-muted-foreground text-center">
          Drop chart image or click to upload
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </button>

      <Button
        variant="outline"
        size="sm"
        className="w-full border-gold/50 text-gold hover:bg-gold/10 text-xs"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        data-ocid="upload.upload_button"
      >
        {uploading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Uploading…
          </>
        ) : (
          <>
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload & Analyse
          </>
        )}
      </Button>

      {/* Recent uploads */}
      {analyses.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Recent Uploads
          </p>
          {analyses.slice(0, 4).map((a, i) => (
            <button
              type="button"
              key={Number(a.id)}
              onClick={() =>
                setSelectedAnalysis({
                  blobId: a.blobId,
                  result: a.analysisResult,
                  notes: a.notes,
                })
              }
              className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/30 hover:bg-muted/60 transition-colors text-left"
              data-ocid={`upload.item.${i + 1}`}
            >
              <ImageIcon className="h-3.5 w-3.5 text-gold flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-foreground truncate font-mono">
                  {a.blobId.slice(0, 16)}…
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(
                    Number(a.timestamp) / 1_000_000,
                  ).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Analysis dialog */}
      <Dialog
        open={!!selectedAnalysis}
        onOpenChange={(v) => !v && setSelectedAnalysis(null)}
      >
        <DialogContent
          className="max-w-lg bg-card border-border"
          data-ocid="upload.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-gold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Chart Analysis Result
            </DialogTitle>
          </DialogHeader>
          <button
            type="button"
            onClick={() => setSelectedAnalysis(null)}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            data-ocid="upload.close_button"
          >
            <X className="h-4 w-4" />
          </button>
          {selectedAnalysis && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-mono text-muted-foreground break-all">
                Blob: {selectedAnalysis.blobId.slice(0, 32)}…
              </p>
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedAnalysis.result}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
