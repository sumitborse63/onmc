import { useState, useEffect } from 'react';
import type { MaterialRecord, NationalMaterialMaster, AdjudicationCandidate } from './types';
import { ReviewerPortalView } from './views/ReviewerPortalView';
import { RegistryExplorerView } from './views/RegistryExplorerView';
import { DuplicateClusterView } from './views/DuplicateClusterView';
import { SourcingSimulatorView } from './views/SourcingSimulatorView';
import { LegacyOCRInspectorView } from './views/LegacyOCRInspectorView';
import { VigilanceDashboardView } from './views/VigilanceDashboardView';
import {
  fetchAllRecords,
  fetchAllMasters,
  fetchAdjudicationQueue,
  submitAdjudication,
  fetchHealthStatus,
} from './services/api';
import {
  Layers,
  CheckSquare,
  Copy,
  TrendingUp,
  FileText,
  ShieldAlert,
  Boxes,
  Activity,
  RefreshCw,
} from 'lucide-react';

type ActiveTab = 'REVIEWER' | 'REGISTRY' | 'DUPLICATES' | 'SIMULATOR' | 'OCR' | 'VIGILANCE';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('REVIEWER');
  const [queue, setQueue] = useState<AdjudicationCandidate[]>([]);
  const [masters, setMasters] = useState<NationalMaterialMaster[]>([]);
  const [records, setRecords] = useState<MaterialRecord[]>([]);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ingest from FastAPI Backend on Mount
  useEffect(() => {
    async function loadBackendData() {
      setIsLoading(true);
      try {
        const health = await fetchHealthStatus();
        if (health && health.status === 'HEALTHY') {
          setBackendConnected(true);
          const [recs, msts, q] = await Promise.all([
            fetchAllRecords(),
            fetchAllMasters(),
            fetchAdjudicationQueue(),
          ]);
          if (recs) setRecords(recs);
          if (msts) setMasters(msts);
          if (q) setQueue(q);
        }
      } catch (err) {
        console.error('Failed to connect to FastAPI backend:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBackendData();
  }, []);

  const handleApproveCandidate = async (item: AdjudicationCandidate) => {
    if (backendConnected) {
      await submitAdjudication(item.id, 'APPROVE');
    }

    setQueue((prev) => prev.filter((q) => q.id !== item.id));

    setMasters((prev) =>
      prev.map((m) =>
        m.nationalCode === item.candidateMaster.nationalCode
          ? { ...m, totalMappedSKUs: m.totalMappedSKUs + 1 }
          : m
      )
    );

    setRecords((prev) =>
      prev.map((r) =>
        r.materialCodeCPSE === item.localRecord.materialCodeCPSE
          ? { ...r, status: 'SYNCED', groundTruthNationalCode: item.candidateMaster.nationalCode }
          : r
      )
    );
  };

  const handleRejectCandidate = async (item: AdjudicationCandidate) => {
    let newNationalCode = `CNM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    if (backendConnected) {
      const res = await submitAdjudication(item.id, 'REJECT');
      if (res && res.newNationalCode) {
        newNationalCode = res.newNationalCode;
      }
    }

    setQueue((prev) => prev.filter((q) => q.id !== item.id));

    const newMaster: NationalMaterialMaster = {
      nationalCode: newNationalCode,
      standardizedName: item.localRecord.groundTruthStandardName || item.localRecord.materialDescriptionRaw,
      unspscCode: item.candidateMaster.unspscCode,
      unspscCategory: item.candidateMaster.unspscCategory,
      materialGrade: item.localRecord.extractedGrade || 'Industrial Grade',
      dimensionSpec: item.localRecord.extractedDimension || 'Standard',
      pressureRating: item.localRecord.extractedPressure || 'Standard',
      standardSpec: item.localRecord.extractedStandard || 'IS/ASME Standard',
      baseUoM: item.localRecord.unitOfMeasurement,
      totalMappedSKUs: 1,
      participatingCPSEs: [item.localRecord.cpseName],
      lowestUnitPriceINR: item.localRecord.avgUnitPriceINR,
      highestUnitPriceINR: item.localRecord.avgUnitPriceINR,
      medianUnitPriceINR: item.localRecord.avgUnitPriceINR,
      annualTotalVolume: item.localRecord.annualProcuredQty,
      sha256Proof: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };

    setMasters((prev) => [newMaster, ...prev]);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-rose-600 selection:text-white">
      {/* Top Telemetry & 6-Agent AI Status Bar (Full Width) */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3 text-xs font-mono sticky top-0 z-40 shadow-xs w-full">
        <div className="w-full flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-xs">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2 font-sans tracking-tight">
                National Unified Material Master Platform
                <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-semibold">
                  CPCL ↔ IOCL Pilot
                </span>
                {backendConnected ? (
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Activity className="w-3 h-3" /> FASTAPI LIVE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> CONNECTING
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Ministry of Petroleum & Natural Gas (MoPNG) // Inter-CPSE DPI
              </div>
            </div>
          </div>

          {/* 6 Autonomous AI Agent Telemetry Status Indicators */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              A1: MATCHING
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              A2: OCR
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              A3: SOURCING
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              A4: SAP MM
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              A5: DRIFT
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              A6: PRIVACY
            </div>
          </div>
        </div>
      </header>

      {/* Main Container - Full Bleed Width */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col space-y-4">
        {/* Navigation Tabs (Full Width Segmented Bar) */}
        <nav className="flex flex-wrap gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-xs text-xs font-semibold w-full">
          <button
            onClick={() => setActiveTab('REVIEWER')}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'REVIEWER'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            [1] Reviewer Portal
            {queue.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'REVIEWER'
                    ? 'bg-white text-rose-600'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {queue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('REGISTRY')}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'REGISTRY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            [2] National Registry (1:N Explorer)
          </button>

          <button
            onClick={() => setActiveTab('DUPLICATES')}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'DUPLICATES'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <Copy className="w-4 h-4 text-rose-500" />
            [3] Duplicate & Cluster Analytics
          </button>

          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'SIMULATOR'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            [4] Strategic Sourcing Simulator
          </button>

          <button
            onClick={() => setActiveTab('OCR')}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'OCR'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            [5] Legacy OCR Inspector (Agent 2)
          </button>

          <button
            onClick={() => setActiveTab('VIGILANCE')}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'VIGILANCE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            [6] Vigilance & Drift Monitor (Agent 5)
          </button>
        </nav>

        {/* View Routing */}
        <section className="flex-1 w-full">
          {isLoading ? (
            <div className="p-16 text-center bg-white border border-slate-200 rounded-2xl shadow-xs my-6 font-mono text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-600" />
              <span>Ingesting Live Material Master Records from FastAPI Engine...</span>
            </div>
          ) : (
            <>
              {activeTab === 'REVIEWER' && (
                <ReviewerPortalView
                  queue={queue}
                  onApprove={handleApproveCandidate}
                  onReject={handleRejectCandidate}
                />
              )}

              {activeTab === 'REGISTRY' && (
                <RegistryExplorerView masters={masters} records={records} />
              )}

              {activeTab === 'DUPLICATES' && <DuplicateClusterView />}

              {activeTab === 'SIMULATOR' && <SourcingSimulatorView />}

              {activeTab === 'OCR' && <LegacyOCRInspectorView />}

              {activeTab === 'VIGILANCE' && <VigilanceDashboardView />}
            </>
          )}
        </section>
      </main>

      {/* Footer Telemetry (Full Width) */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-3 font-mono text-xs text-slate-500 mt-auto w-full">
        <div className="w-full flex flex-wrap justify-between items-center gap-3">
          <span className="font-semibold text-slate-700">
            Digital Public Infrastructure (DPI) // One Nation – One Material Code
          </span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>IEEE 830 / ISO 29148 Standard</span>
            <span>Authors: Kasturi Shinde, Sumit Borse</span>
            <span>MoPNG / CPCL / IOCL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
