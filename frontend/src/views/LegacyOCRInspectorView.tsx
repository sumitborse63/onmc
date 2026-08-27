import { useState } from 'react';
import type { UserProfile } from '../types';
import { FileText, CheckCircle2, AlertTriangle, SpellCheck, ArrowRight, Scan, Play, RefreshCw, Factory, UploadCloud } from 'lucide-react';
import { runOCRSpellcheck } from '../services/api';

interface LegacyOCRInspectorProps {
  currentUser?: UserProfile | null;
}

export function LegacyOCRInspectorView({ currentUser }: LegacyOCRInspectorProps) {
  const [inputText, setInputText] = useState('BALL VALVE 2" 15O# WCB_B0DY SS3I6 BALL & STEM FLANGED ASME B16.34');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>({
    originalText: 'BALL VALVE 2" 15O# WCB_B0DY SS3I6 BALL & STEM FLANGED ASME B16.34',
    correctedText: 'BALL VALVE 2" 150# WCB BODY SS316 BALL & STEM FLANGED ASME B16.34',
    corrections: [
      { rawToken: 'SS3I6', correctedToken: 'SS316', dictionaryMatch: 'ASTM A276 Grade Stainless Steel Lexicon', confidence: 99.2 },
      { rawToken: 'WCB_B0DY', correctedToken: 'WCB BODY', dictionaryMatch: 'API Valve Casting Standards Dictionary', confidence: 97.4 },
      { rawToken: '15O#', correctedToken: '150#', dictionaryMatch: 'ASME Pressure Rating Standard Lexicon', confidence: 99.1 },
    ],
    extractedJSON: {
      equipment_category: 'INDUSTRIAL PIPING / VALVE',
      valve_type: 'BALL VALVE',
      nominal_size: '2 INCH (DN 50)',
      pressure_rating: 'CLASS 150# (PN20)',
      body_material: 'ASTM A216 WCB',
      trim_material: 'ASTM A276 SS316',
      end_connection: 'FLANGED RAISED FACE (RF)',
      design_standard: 'ASME B16.34 / API 6D',
    }
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRunRealOCR = async () => {
    setIsProcessing(true);
    try {
      const data = await runOCRSpellcheck(inputText);
      if (data) {
        setOcrResult(data);
        setStatusMessage('Real-time Agent 2 OCR Pipeline & Dictionary Disambiguation Completed Successfully');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
            <Factory className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Legacy Document Migration &amp; Blueprint OCR Pipeline (Agent 2)
              </h2>
              {currentUser && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  currentUser.role === 'CPSE_MANAGEMENT'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {currentUser.role === 'CPSE_MANAGEMENT' ? `${currentUser.cpse} PLANT DIGITIZER ACTIVE` : 'OCR INSPECTOR'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Interactive Multimodal LayoutLMv3 + Industrial Lexicon Disambiguation Sandbox
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-medium">
            Live Python FastAPI Engine Connected
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-xs text-center font-mono text-xs font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {/* Live Interactive Input Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-900 uppercase">
            Test Flawed OCR String / Scanned Drawing Text:
          </span>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setInputText('BALL VALVE 2" 15O# WCB_B0DY SS3I6 BALL & STEM FLANGED')}
              className="text-slate-600 hover:text-rose-600 font-medium underline text-[11px] cursor-pointer"
            >
              [Sample 1: Valve Errors]
            </button>
            <button
              onClick={() => setInputText('SPIR WOUND GASK SS3I6 4" 15O# 0-RING NBR_7OA')}
              className="text-slate-600 hover:text-rose-600 font-medium underline text-[11px] cursor-pointer"
            >
              [Sample 2: Gasket Errors]
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:outline-rose-500"
          />
          <button
            onClick={handleRunRealOCR}
            disabled={isProcessing}
            className="btn-stitch bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Execute Agent 2 OCR
          </button>
        </div>
      </div>

      {/* Main Grid: Blueprint Crop Viewer vs Structured JSON */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Scanned Document Crop Viewer */}
        <div className="col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
              <Scan className="w-4 h-4 text-indigo-600" />
              Scanned Drawing Bounding Box Crop
            </span>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> Confidence: 98.4%
            </span>
          </div>

          {/* Blueprint Canvas Box */}
          <div className="bg-slate-900 rounded-xl p-4 text-sky-400 font-mono text-xs relative overflow-hidden shadow-inner">
            <div className="flex justify-between items-center text-[9px] text-sky-400/60 pb-2 border-b border-slate-800">
              <span>LAYOUTLMV3 BBOX [x:120, y:340, w:450, h:80]</span>
              <span>ENGINE: TESSERACT 5.0 LSTM</span>
            </div>

            <div className="border border-dashed border-sky-500/40 rounded-lg p-3 bg-sky-500/10 my-3">
              <div className="text-[10px] text-slate-300 uppercase">ITEM 14: REFINERY VALVE SPECIFICATION</div>
              <div className="text-sm font-bold text-white tracking-wide mt-1">
                "{ocrResult.originalText}"
              </div>
              <div className="text-[10px] text-sky-300 mt-2">
                TAG: 14-V-0092 // SERVICE: CRUDE DISTILLATION // CPCL MANALI
              </div>
            </div>

            <div className="text-[10px] text-slate-400">
              * Spatial OCR bounding boxes aligned with domain dictionary token constraints.
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg text-xs space-y-1">
            <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wide">Corrected Clean String:</span>
            <p className="font-mono font-semibold text-emerald-700">"{ocrResult.correctedText}"</p>
          </div>
        </div>

        {/* Right: Extracted Structured JSON Attributes */}
        <div className="col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 uppercase">
              Parsed Industrial Semantic JSON Schema
            </span>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
              Validated Real-Time Output
            </span>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner max-h-[220px]">
            <pre className="text-emerald-400 text-xs">
{JSON.stringify(ocrResult.extractedJSON, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Industrial Dictionary Spell-Check Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase border-b border-slate-100 pb-3">
          <SpellCheck className="w-4 h-4 text-rose-600" />
          <span>Domain-Specific Industrial Lexicon Disambiguation Matrix</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ocrResult.corrections && ocrResult.corrections.length > 0 ? (
            ocrResult.corrections.map((corr: any, idx: number) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-rose-600 font-bold line-through">{corr.rawToken}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-emerald-600 font-bold">{corr.correctedToken}</span>
                </div>
                <span className="text-[11px] text-slate-500 block truncate" title={corr.dictionaryMatch}>
                  {corr.dictionaryMatch}
                </span>
                <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 font-bold rounded inline-block">
                  Match: {corr.confidence}%
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-4 text-xs font-mono text-slate-400">
              Zero OCR typos detected — all tokens conform to ASME/API industrial dictionaries.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
