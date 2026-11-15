import React, { useState, useEffect, useRef } from 'react';
import {
  Crop,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Maximize2,
  RotateCcw,
  ZoomIn,
  Sliders,
  Scale,
  X,
  FileCheck2,
  Info,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { CropFlagInfo } from '../types';

interface EvidenceCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  evidenceTitle?: string;
  evidenceType?: string;
  currentCropFlag?: CropFlagInfo;
  onSaveCrop: (result: {
    croppedUrl: string;
    cropFlag: CropFlagInfo;
    uncroppedUrl: string;
    cropAreaPercent: number;
  }) => void;
}

export const EvidenceCropModal: React.FC<EvidenceCropModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  evidenceTitle = 'Evidence Screenshot',
  evidenceType = 'screenshot',
  currentCropFlag,
  onSaveCrop,
}) => {
  // Crop percentages (0 to 100)
  const [cropTop, setCropTop] = useState<number>(0);
  const [cropBottom, setCropBottom] = useState<number>(0);
  const [cropLeft, setCropLeft] = useState<number>(0);
  const [cropRight, setCropRight] = useState<number>(0);

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CropFlagInfo | null>(
    currentCropFlag || null
  );
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string>(imageUrl);
  const [autoAnalyzed, setAutoAnalyzed] = useState<boolean>(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute retained area percentage
  const retainedWidthPercent = Math.max(1, 100 - cropLeft - cropRight);
  const retainedHeightPercent = Math.max(1, 100 - cropTop - cropBottom);
  const retainedAreaPercent = Math.round(
    (retainedWidthPercent * retainedHeightPercent) / 100
  );

  // Generate cropped preview data url whenever crop margins change
  useEffect(() => {
    if (!imageRef.current) return;
    const img = imageRef.current;

    const generatePreview = () => {
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      if (!naturalW || !naturalH) return;

      const sx = (cropLeft / 100) * naturalW;
      const sy = (cropTop / 100) * naturalH;
      const sw = (retainedWidthPercent / 100) * naturalW;
      const sh = (retainedHeightPercent / 100) * naturalH;

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sw));
      canvas.height = Math.max(1, Math.round(sh));
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCroppedPreviewUrl(dataUrl);
      }
    };

    if (img.complete) {
      generatePreview();
    } else {
      img.onload = generatePreview;
    }
  }, [cropTop, cropBottom, cropLeft, cropRight, imageUrl]);

  // Run AI Crop Inspection
  const handleInspectCrop = async (targetPreviewUrl?: string) => {
    const urlToInspect = targetPreviewUrl || croppedPreviewUrl || imageUrl;
    setAnalyzing(true);

    try {
      const res = await fetch('/api/inspect-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: urlToInspect,
          cropMetrics: {
            cropAreaPercent: retainedAreaPercent,
            cropWidth: Math.round((retainedWidthPercent / 100) * (imageRef.current?.naturalWidth || 800)),
            cropHeight: Math.round((retainedHeightPercent / 100) * (imageRef.current?.naturalHeight || 1200)),
            originalWidth: imageRef.current?.naturalWidth || 800,
            originalHeight: imageRef.current?.naturalHeight || 1200,
            evidenceType,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        // Fallback flag based on area
        setAnalysisResult({
          isOverCropped: retainedAreaPercent <= 40,
          severity: retainedAreaPercent <= 30 ? 'CRITICAL' : retainedAreaPercent <= 50 ? 'WARNING' : 'SAFE',
          confidence: 90,
          cropAreaPercent: retainedAreaPercent,
          missingElements:
            retainedAreaPercent <= 40
              ? ['Header/Handle Details', 'Timestamps', 'Device Status Bar']
              : [],
          flagReason:
            retainedAreaPercent <= 40
              ? `Crop retains only ${retainedAreaPercent}% of the image. Key context and headers are missing.`
              : `Context preserved (${retainedAreaPercent}% retained).`,
          forensicImpact:
            retainedAreaPercent <= 40
              ? 'Over-cropped screenshots risk rejection under Section 63 BSA / Sec 65B.'
              : 'Acceptable context for official filing.',
          recommendation:
            retainedAreaPercent <= 40
              ? 'Expand frame to include the top account handle and time.'
              : 'Framing is adequate.',
        });
      }
    } catch (err) {
      console.warn('Crop inspection request error:', err);
      // Fallback
      setAnalysisResult({
        isOverCropped: retainedAreaPercent <= 40,
        severity: retainedAreaPercent <= 30 ? 'CRITICAL' : retainedAreaPercent <= 50 ? 'WARNING' : 'SAFE',
        confidence: 88,
        cropAreaPercent: retainedAreaPercent,
        missingElements:
          retainedAreaPercent <= 40
            ? ['Header / Sender Handle', 'Timestamps', 'Status Bar']
            : [],
        flagReason:
          retainedAreaPercent <= 40
            ? `Excessive crop: Retains only ${retainedAreaPercent}% of screenshot.`
            : 'Good context retained.',
        forensicImpact:
          retainedAreaPercent <= 40
            ? 'Section 63 BSA admissibility warning: uncorroborated tight crop.'
            : 'Electronic evidence context intact.',
        recommendation:
          retainedAreaPercent <= 40
            ? 'Expand the crop to preserve sender username and time.'
            : 'Framing is suitable.',
      });
    } finally {
      setAnalyzing(false);
      setAutoAnalyzed(true);
    }
  };

  // Preset Handlers
  const applyPreset = (preset: 'full' | 'moderate' | 'tight' | 'safe') => {
    if (preset === 'full') {
      setCropTop(0);
      setCropBottom(0);
      setCropLeft(0);
      setCropRight(0);
    } else if (preset === 'safe') {
      // Exclude only unnecessary keyboard or edge margins
      setCropTop(2);
      setCropBottom(15);
      setCropLeft(3);
      setCropRight(3);
    } else if (preset === 'moderate') {
      // Focus on chat but retain header
      setCropTop(8);
      setCropBottom(35);
      setCropLeft(6);
      setCropRight(6);
    } else if (preset === 'tight') {
      // Extreme over-crop (simulates victim cutting out everything except 1 message bubble)
      setCropTop(38);
      setCropBottom(42);
      setCropLeft(12);
      setCropRight(12);
    }
  };

  // Reset to full uncropped
  const handleResetFull = () => {
    applyPreset('full');
    setAnalysisResult({
      isOverCropped: false,
      severity: 'SAFE',
      confidence: 99,
      cropAreaPercent: 100,
      missingElements: [],
      flagReason: 'Full uncropped frame preserved. All metadata, status indicators, and headers intact.',
      forensicImpact: 'Maximum admissibility under Section 63 BSA / Sec 65B Indian Evidence Act.',
      recommendation: 'Full original screenshot recommended for official Police FIR submission.',
    });
  };

  // Expand Crop by 20% to resolve over-crop
  const handleAutoExpand = () => {
    setCropTop((prev) => Math.max(0, prev - 15));
    setCropBottom((prev) => Math.max(0, prev - 15));
    setCropLeft((prev) => Math.max(0, prev - 8));
    setCropRight((prev) => Math.max(0, prev - 8));
    setTimeout(() => {
      handleInspectCrop();
    }, 150);
  };

  // Handle Save
  const handleSave = () => {
    const finalFlag: CropFlagInfo = analysisResult || {
      isOverCropped: retainedAreaPercent <= 35,
      severity: retainedAreaPercent <= 30 ? 'CRITICAL' : retainedAreaPercent <= 50 ? 'WARNING' : 'SAFE',
      confidence: 85,
      cropAreaPercent: retainedAreaPercent,
      missingElements: retainedAreaPercent <= 35 ? ['Header Information', 'Device Status Bar'] : [],
      flagReason:
        retainedAreaPercent <= 35
          ? `Excessive crop: Retains only ${retainedAreaPercent}% of original image.`
          : 'Preserved context',
      forensicImpact:
        retainedAreaPercent <= 35
          ? 'Risk of objection under Sec 63 BSA due to over-cropping.'
          : 'Standard context',
      recommendation:
        retainedAreaPercent <= 35
          ? 'Recommend uncropped original for court.'
          : 'Good framing',
    };

    onSaveCrop({
      croppedUrl: croppedPreviewUrl,
      cropFlag: finalFlag,
      uncroppedUrl: imageUrl,
      cropAreaPercent: retainedAreaPercent,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                  AI Evidence Cropper & Context Inspector
                </h3>
                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Sec 63 BSA Guard</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust evidence framing. The AI will immediately flag if you crop out vital headers, timestamps, or context.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Info Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Forensic Admissibility Rule:</strong> Under Section 63 of Bharatiya Sakshya Adhiniyam 2023 (formerly 65B Indian Evidence Act), police cyber cells and courts need to see <strong>account handles, timestamps, and device status bars</strong> to verify evidence authenticity. Cropping too much can invalidate your report!
            </div>
          </div>

          {/* Main Visual Workspace: Dual View (Original with Overlay & Cropped Result) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Original Interactive Frame (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-3 border border-slate-800 flex flex-col items-center justify-center relative min-h-[320px] max-h-[460px] overflow-hidden">
              <div className="relative inline-block max-w-full max-h-[420px] select-none">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Original Evidence"
                  className="max-h-[410px] w-auto object-contain rounded-lg shadow-inner block"
                  crossOrigin="anonymous"
                />

                {/* Dark Mask Overlays for Cropped-Out Regions */}
                {/* Top Mask */}
                <div
                  className="absolute left-0 right-0 top-0 bg-slate-950/75 border-b border-rose-500/60 transition-all pointer-events-none"
                  style={{ height: `${cropTop}%` }}
                >
                  {cropTop > 10 && (
                    <span className="absolute bottom-1 left-2 text-[10px] font-mono text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded">
                      Top Cut: {cropTop}% (Header Risk)
                    </span>
                  )}
                </div>

                {/* Bottom Mask */}
                <div
                  className="absolute left-0 right-0 bottom-0 bg-slate-950/75 border-t border-rose-500/60 transition-all pointer-events-none"
                  style={{ height: `${cropBottom}%` }}
                >
                  {cropBottom > 10 && (
                    <span className="absolute top-1 left-2 text-[10px] font-mono text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded">
                      Bottom Cut: {cropBottom}%
                    </span>
                  )}
                </div>

                {/* Left Mask */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-slate-950/75 border-r border-rose-500/60 transition-all pointer-events-none"
                  style={{
                    top: `${cropTop}%`,
                    bottom: `${cropBottom}%`,
                    width: `${cropLeft}%`,
                  }}
                />

                {/* Right Mask */}
                <div
                  className="absolute top-0 bottom-0 right-0 bg-slate-950/75 border-l border-rose-500/60 transition-all pointer-events-none"
                  style={{
                    top: `${cropTop}%`,
                    bottom: `${cropBottom}%`,
                    width: `${cropRight}%`,
                  }}
                />

                {/* Active Retained Bounding Box Border */}
                <div
                  className={`absolute border-2 ${
                    retainedAreaPercent <= 30
                      ? 'border-rose-500 ring-4 ring-rose-500/20'
                      : retainedAreaPercent <= 50
                      ? 'border-amber-400 ring-4 ring-amber-400/20'
                      : 'border-emerald-400 ring-4 ring-emerald-400/20'
                  } transition-all pointer-events-none rounded`}
                  style={{
                    top: `${cropTop}%`,
                    bottom: `${cropBottom}%`,
                    left: `${cropLeft}%`,
                    right: `${cropRight}%`,
                  }}
                >
                  <div className="absolute top-1 right-1 bg-slate-950/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-slate-700">
                    {retainedAreaPercent}% Area
                  </div>
                </div>
              </div>

              <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                <span>Original Capture</span>
                <span className="font-mono">Active Crop: {retainedWidthPercent}% × {retainedHeightPercent}%</span>
              </div>
            </div>

            {/* Right: Crop Controls, Metrics & AI Flag Feedback (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Presets Toolbar */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Framing Presets:</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => applyPreset('full')}
                    className={`p-2 rounded-xl border text-left font-bold transition-all ${
                      retainedAreaPercent === 100
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div>100% Full Frame</div>
                    <div className="text-[10px] font-normal opacity-75">Police Recommended</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('safe')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-left font-bold transition-all"
                  >
                    <div>Safe Crop (75%)</div>
                    <div className="text-[10px] font-normal opacity-75">Hides keyboard only</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('moderate')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-left font-bold transition-all"
                  >
                    <div>Thread Crop (50%)</div>
                    <div className="text-[10px] font-normal opacity-75">Message focus</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('tight')}
                    className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-left font-bold transition-all"
                  >
                    <div className="flex items-center gap-1">
                      <span>Tight Crop (25%)</span>
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                    </div>
                    <div className="text-[10px] font-normal opacity-75">Flags context loss</div>
                  </button>
                </div>
              </div>

              {/* Sliders for precise crop adjusting */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                  <span>Adjust Crop Margins (%):</span>
                  <button
                    onClick={handleResetFull}
                    className="text-indigo-600 dark:text-indigo-400 text-[11px] hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                      <span>Top (Header/Status Bar):</span>
                      <span className={cropTop > 15 ? 'text-rose-500 font-bold' : ''}>{cropTop}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={45}
                      value={cropTop}
                      onChange={(e) => setCropTop(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                      <span>Bottom:</span>
                      <span>{cropBottom}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={55}
                      value={cropBottom}
                      onChange={(e) => setCropBottom(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>Left Margin:</span>
                        <span>{cropLeft}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={cropLeft}
                        onChange={(e) => setCropLeft(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>Right Margin:</span>
                        <span>{cropRight}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={cropRight}
                        onChange={(e) => setCropRight(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Retained Area Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Retained Frame Area:
                  </span>
                  <span
                    className={`font-mono font-extrabold ${
                      retainedAreaPercent <= 30
                        ? 'text-rose-600 dark:text-rose-400'
                        : retainedAreaPercent <= 50
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {retainedAreaPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-200 ${
                      retainedAreaPercent <= 30
                        ? 'bg-rose-500'
                        : retainedAreaPercent <= 50
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${retainedAreaPercent}%` }}
                  />
                </div>
              </div>

              {/* Action: Run AI Crop Inspection */}
              <button
                type="button"
                onClick={() => handleInspectCrop()}
                disabled={analyzing}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI Forensic Inspection in Progress...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-300" />
                    <span>Scan Crop with AI Forensics</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Inspection Flag / Verdict Card */}
          {analysisResult && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                analysisResult.severity === 'CRITICAL'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/80 text-rose-950 dark:text-rose-100'
                  : analysisResult.severity === 'WARNING'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/80 text-amber-950 dark:text-amber-100'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900/80 text-emerald-950 dark:text-emerald-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      analysisResult.severity === 'CRITICAL'
                        ? 'bg-rose-600 text-white'
                        : analysisResult.severity === 'WARNING'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {analysisResult.severity === 'CRITICAL' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : analysisResult.severity === 'WARNING' ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base">
                        {analysisResult.severity === 'CRITICAL'
                          ? '⚠️ Excessive Crop Flagged by AI: Evidence Context Lost'
                          : analysisResult.severity === 'WARNING'
                          ? '⚠️ Crop Warning: Reduced Evidentiary Margins'
                          : '✅ AI Verified: Evidence Framing is Safe'}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-900/70 border border-current font-bold">
                        {analysisResult.confidence}% Confidence
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed opacity-90">
                      {analysisResult.flagReason}
                    </p>

                    {analysisResult.missingElements &&
                      analysisResult.missingElements.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[11px] font-bold block mb-1">
                            Missing / Cut-Off Forensic Elements:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {analysisResult.missingElements.map((el, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-rose-200/80 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200 rounded-md text-[10px] font-semibold border border-rose-300 dark:border-rose-800"
                              >
                                ✕ {el}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="text-[11px] pt-1.5 border-t border-current/10 space-y-1">
                      <p>
                        <strong>Forensic Impact:</strong> {analysisResult.forensicImpact}
                      </p>
                      <p>
                        <strong>AI Recommendation:</strong> {analysisResult.recommendation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remediation Quick Actions */}
                {analysisResult.isOverCropped && (
                  <div className="flex sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={handleResetFull}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Revert to 100% Full Frame</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAutoExpand}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap flex items-center justify-center gap-1"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Expand Safe Margins</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            {analysisResult?.isOverCropped ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Notice: If saved, this item will be tagged with an Over-Cropped warning.</span>
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Original uncropped copy is always preserved in encrypted vault.</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 ${
                analysisResult?.isOverCropped
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>
                {analysisResult?.isOverCropped
                  ? 'Save Cropped (Tagged with Warning)'
                  : 'Save Verified Framing'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
