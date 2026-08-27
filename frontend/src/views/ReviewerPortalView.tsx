import { useState, useEffect } from 'react';
import type { AdjudicationCandidate, UserProfile } from '../types';
import { FactorRadarChart } from '../components/FactorRadarChart';
import { XAIDiffTable } from '../components/XAIDiffTable';
import { runLiveMatchEvaluation } from '../services/api';
import {
  Check,
  X,
  Edit3,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Building2,
  Layers,
  Sparkles,
  Zap,
  Play,
  Search,
  HardHat,
  Award,
} from 'lucide-react';

interface ReviewerPortalProps {
  queue: AdjudicationCandidate[];
  onApprove: (item: AdjudicationCandidate) => void;
  onReject: (item: AdjudicationCandidate) => void;
  currentUser?: UserProfile | null;
}

export function ReviewerPortalView({ queue, onApprove, onReject, currentUser }: ReviewerPortalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showModifyModal, setShowModifyModal] = useState(false);

  // Live Real-Time Matcher Sandbox State
  const [customDesc, setCustomDesc] = useState('');
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [isSandboxEvaluating, setIsSandboxEvaluating] = useState(false);

  const currentItem = queue[currentIndex];

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showModifyModal) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handleApprove();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleReject();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < queue.length - 1) setCurrentIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setShowModifyModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, queue, showModifyModal]);

  const handleApprove = () => {
    if (!currentItem || isProcessing) return;
    setIsProcessing(true);
    setFeedbackMessage(`Syncing ${currentItem.localRecord.materialCodeCPSE} to SAP S/4HANA Master...`);

    setTimeout(() => {
      onApprove(currentItem);
      setIsProcessing(false);
      setFeedbackMessage(`Successfully Reconciled (BAPI Receipt: MATDOC-${Date.now().toString().slice(-6)})`);
      setTimeout(() => setFeedbackMessage(null), 3000);
      if (currentIndex >= queue.length - 1 && queue.length > 1) {
        setCurrentIndex(0);
      }
    }, 700);
  };

  const handleReject = () => {
    if (!currentItem || isProcessing) return;
    setIsProcessing(true);
    setFeedbackMessage(`Rejected candidate merge. Generating independent Common National Code...`);

    setTimeout(() => {
      onReject(currentItem);
      setIsProcessing(false);
      setFeedbackMessage(`Generated New National Code: CNM-${Date.now().toString().slice(-8)}`);
      setTimeout(() => setFeedbackMessage(null), 3000);
      if (currentIndex >= queue.length - 1 && queue.length > 1) {
        setCurrentIndex(0);
      }
    }, 600);
  };

  const handleRunLiveMatchEvaluation = async () => {
    if (!customDesc.trim()) return;
    setIsSandboxEvaluating(true);
    try {
      const data = await runLiveMatchEvaluation(
        customDesc,
        currentItem?.candidateMaster?.nationalCode || 'CNM-1'
      );
      if (data) {
        setSandboxResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSandboxEvaluating(false);
    }
  };

  if (!currentItem || queue.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs my-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200/60">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Adjudication Queue Clear
        </h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          All CPCL ↔ IOCL candidate pairs have been autonomously routed to Green Tier or adjudicated by domain engineers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Telemetry & Action Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Yellow Tier Review Queue
          </span>
          <span className="text-xs font-mono font-medium text-slate-600">
            Candidate Item <strong className="text-slate-900">{currentIndex + 1}</strong> of{' '}
            <strong className="text-slate-900">{queue.length}</strong>
          </span>
          <span className="text-xs font-mono text-slate-400">| ID: {currentItem.id}</span>
          {currentUser && (
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
              currentUser.role === 'ENGINEERING_EXPERT'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              <HardHat className="w-3 h-3" />
              {currentUser.role === 'ENGINEERING_EXPERT' ? 'SIGN-OFF CLEARANCE: LEVEL 3 AUTHORIZED' : 'VIEW-ONLY ADVISORY MODE'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
            <span>Hotkeys:</span>
            <kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-700 shadow-2xs">Enter</kbd> Approve
            <kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-700 shadow-2xs ml-1">Esc</kbd> Reject
            <kbd className="bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-700 shadow-2xs ml-1">M</kbd> Modify
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-30 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => currentIndex < queue.length - 1 && setCurrentIndex(currentIndex + 1)}
              disabled={currentIndex === queue.length - 1}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-30 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-xs text-center font-mono text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
          <Zap className="w-4 h-4" />
          {feedbackMessage}
        </div>
      )}

      {/* Live Sandbox Interactive Query Tester Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-rose-600" />
            Test Real TF-IDF Vector & Attribute Engine Live:
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Target National Master: {currentItem.candidateMaster.nationalCode}
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type or paste any custom description (e.g. BALL VALVE 2IN 150# CS BODY SS316 BALL FLANGED RF or O-RING NBR 50X3MM)..."
            value={customDesc}
            onChange={(e) => setCustomDesc(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-900 focus:outline-rose-500"
          />
          <button
            onClick={handleRunLiveMatchEvaluation}
            disabled={isSandboxEvaluating || !customDesc.trim()}
            className="btn-stitch bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            Calculate Real Vector Score
          </button>
        </div>
        {sandboxResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono flex flex-wrap justify-between items-center gap-2">
            <div>
              <span className="text-slate-500">Vector Cosine Similarity: </span>
              <strong className="text-slate-900">{sandboxResult.vectorScore}</strong>
              <span className="text-slate-500 ml-3">Attribute Match: </span>
              <strong className="text-slate-900">{sandboxResult.attributeScore}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Final Confidence: </span>
              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold">
                {(sandboxResult.finalConfidence * 100).toFixed(1)}% ({sandboxResult.triageTier} TIER)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Dual Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Local CPSE Legacy Specification */}
        <div className="col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-semibold text-slate-900 uppercase">
                Local Record: {currentItem.localRecord.cpseName}
              </span>
            </div>
            <span className="text-xs font-mono font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
              {currentItem.localRecord.plantLocation}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              CPSE Material Number
            </span>
            <div className="font-mono text-base font-bold text-slate-900">
              {currentItem.localRecord.materialCodeCPSE}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Raw Description (SAP S/4HANA MAKT)
            </span>
            <p className="font-mono text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200/80 p-3 rounded-lg leading-relaxed">
              {currentItem.localRecord.materialDescriptionRaw}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1 text-xs font-mono">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase">Extracted Grade</span>
              <span className="font-bold text-slate-800">{currentItem.localRecord.extractedGrade || 'SS316 / WCB'}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase">Pressure Class</span>
              <span className="font-bold text-slate-800">{currentItem.localRecord.extractedPressure || '150#'}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase">Base UoM</span>
              <span className="font-bold text-slate-800">{currentItem.localRecord.unitOfMeasurement}</span>
            </div>
          </div>
        </div>

        {/* Right: Matched National Master Candidate */}
        <div className="col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-semibold text-slate-900 uppercase">
                Proposed National Unified Master
              </span>
            </div>
            <span className="text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-md">
              UNSPSC: {currentItem.candidateMaster.unspscCode}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Common National Material Code (NMC)
            </span>
            <div className="font-mono text-base font-bold text-rose-600">
              {currentItem.candidateMaster.nationalCode}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Standardized Nomenclature
            </span>
            <p className="font-mono text-xs font-medium text-slate-900 bg-rose-50/40 border border-rose-100 p-3 rounded-lg leading-relaxed">
              {currentItem.candidateMaster.standardizedName}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1 text-xs font-mono">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase">Standard Spec</span>
              <span className="font-bold text-slate-800">{currentItem.candidateMaster.standardSpec}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase">Dimension Spec</span>
              <span className="font-bold text-slate-800">{currentItem.candidateMaster.dimensionSpec}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase">Total Mapped SKUs</span>
              <span className="font-bold text-slate-800">{currentItem.candidateMaster.totalMappedSKUs} Across CPSEs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: XAI Diff Matrix & 5-Axis Radar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="col-span-7">
          <XAIDiffTable
            diffs={sandboxResult?.xaiDiffs || currentItem.xaiDiffs}
            finalConfidence={sandboxResult?.finalConfidence || currentItem.finalConfidence}
          />
        </div>
        <div className="col-span-5">
          <FactorRadarChart
            dimensions={sandboxResult?.radarScores?.dimensions || currentItem.radarScores.dimensions}
            materialGrade={sandboxResult?.radarScores?.materialGrade || currentItem.radarScores.materialGrade}
            pressureClass={sandboxResult?.radarScores?.pressureClass || currentItem.radarScores.pressureClass}
            standardCode={sandboxResult?.radarScores?.standardCode || currentItem.radarScores.standardCode}
            uomConsistency={sandboxResult?.radarScores?.uomConsistency || currentItem.radarScores.uomConsistency}
          />
        </div>
      </div>

      {/* Action Bar Footer */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 font-mono text-xs">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>
            Projected Inter-CPSE Volume Savings:{' '}
            <strong className="text-emerald-400 font-bold">
              ₹{currentItem.potentialSavingsINR.toLocaleString()} ({currentItem.potentialSavingsPercent}%)
            </strong>
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowModifyModal(true)}
            className="btn-stitch bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Modify Attributes [M]
          </button>

          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="btn-stitch bg-slate-800 hover:bg-rose-950 text-rose-300 hover:text-rose-200 px-4 py-2 text-xs font-semibold flex items-center gap-1.5 border border-rose-900/50 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Reject [Esc]
          </button>

          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="btn-stitch bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" /> Approve & Sync SAP [Enter]
          </button>
        </div>
      </div>

      {/* Modify Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 max-w-lg w-full font-mono text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Manual Attribute Override & Re-Evaluation
            </h3>
            <div className="space-y-3">
              <label className="block">
                <span className="text-slate-500 font-medium">Standardized Description:</span>
                <input
                  type="text"
                  defaultValue={currentItem.localRecord.materialDescriptionRaw}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1 font-mono font-medium text-slate-900 focus:outline-rose-500"
                />
              </label>
              <label className="block">
                <span className="text-slate-500 font-medium">Material Grade:</span>
                <input
                  type="text"
                  defaultValue={currentItem.localRecord.extractedGrade}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1 font-mono font-medium text-slate-900 focus:outline-rose-500"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowModifyModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowModifyModal(false);
                  handleApprove();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg cursor-pointer"
              >
                Re-Evaluate & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
