import { useState, useEffect } from 'react';
import type { MaterialRecord, NationalMaterialMaster, AdjudicationCandidate, UserProfile } from './types';
import { ReviewerPortalView } from './views/ReviewerPortalView';
import { RegistryExplorerView } from './views/RegistryExplorerView';
import { DuplicateClusterView } from './views/DuplicateClusterView';
import { SourcingSimulatorView } from './views/SourcingSimulatorView';
import { LegacyOCRInspectorView } from './views/LegacyOCRInspectorView';
import { VigilanceDashboardView } from './views/VigilanceDashboardView';
import { AuthModal, DEMO_PROFILES } from './components/AuthModal';
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
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

type ActiveTab = 'REVIEWER' | 'REGISTRY' | 'DUPLICATES' | 'SIMULATOR' | 'OCR' | 'VIGILANCE';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_PROFILES[0]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
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

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    // Auto-route to primary operational cockpit based on persona
    if (user.role === 'PLANT_ENGINEER') {
      setActiveTab('REVIEWER');
    } else if (user.role === 'PROCUREMENT_OFFICER') {
      setActiveTab('SIMULATOR');
    } else if (user.role === 'VIGILANCE_AUDITOR') {
      setActiveTab('VIGILANCE');
    } else if (user.role === 'MASTER_DATA_ADMIN') {
      setActiveTab('REGISTRY');
    }
  };

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
      {/* Top Telemetry & User Persona Status Bar (Full Width) */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 text-xs font-mono sticky top-0 z-40 shadow-xs w-full">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-xs">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2 font-sans tracking-tight">
                National Unified Material Master Platform
                <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-semibold">
                  {currentUser.cpse} Pilot
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
                Ministry of Petroleum &amp; Natural Gas (MoPNG) // Inter-CPSE DPI
              </div>
            </div>
          </div>

          {/* User Persona & Role-Based Quick Switcher Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 px-3 py-1.5 rounded-xl text-left transition-all cursor-pointer shadow-xs group"
              title="Click to switch persona or register new CPSE user"
            >
              <div
                className={`w-7 h-7 rounded-lg ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}
              >
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-[11px] text-slate-100 flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-slate-700 text-slate-300 uppercase font-semibold">
                    {currentUser.cpse}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {/* Role-Specific Alert Banner */}
      <div className="bg-slate-850 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-1.5 text-[11px] font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Active Enterprise Stakeholder: <strong className="text-white">{currentUser.name}</strong> ({currentUser.cpse} — {currentUser.plantLocation})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Operational Remit:</span>
          <span className="bg-slate-800 text-sky-300 px-2 py-0.5 rounded-md border border-slate-700">
            {currentUser.role === 'PLANT_ENGINEER' && 'Technical Adjudication & Blueprint Verification'}
            {currentUser.role === 'PROCUREMENT_OFFICER' && 'Joint Demand Sourcing & Price Dispersion (PDI)'}
            {currentUser.role === 'VIGILANCE_AUDITOR' && 'Real-Time SAP Table Drift & Cryptographic Merkle Ledger'}
            {currentUser.role === 'MASTER_DATA_ADMIN' && '1:N National Catalog Management & ERP Mass Export'}
          </span>
        </div>
      </div>

      {/* Main Container - Full Bleed Width */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col space-y-4">
        {/* Navigation Tabs (Full Width Segmented Bar with Role Badges) */}
        <nav className="flex flex-wrap gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-xs text-xs font-semibold w-full">
          <button
            onClick={() => setActiveTab('REVIEWER')}
            className={`px-3.5 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'REVIEWER'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>[1] Reviewer Portal</span>
            {currentUser.role === 'PLANT_ENGINEER' && (
              <span className="text-[9px] font-mono bg-white/20 text-white px-1.5 py-0.2 rounded-md font-bold">
                PRIMARY
              </span>
            )}
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
            className={`px-3.5 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'REGISTRY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>[2] National Registry (1:N Explorer)</span>
            {currentUser.role === 'MASTER_DATA_ADMIN' && (
              <span className="text-[9px] font-mono bg-white/20 text-white px-1.5 py-0.2 rounded-md font-bold">
                PRIMARY
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('DUPLICATES')}
            className={`px-3.5 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'DUPLICATES'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <Copy className="w-4 h-4 text-rose-500" />
            <span>[3] Duplicate &amp; Cluster Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={`px-3.5 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'SIMULATOR'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>[4] Strategic Sourcing Simulator</span>
            {currentUser.role === 'PROCUREMENT_OFFICER' && (
              <span className="text-[9px] font-mono bg-white/20 text-white px-1.5 py-0.2 rounded-md font-bold">
                PRIMARY
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('OCR')}
            className={`px-3.5 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'OCR'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>[5] Legacy OCR Inspector (Agent 2)</span>
          </button>

          <button
            onClick={() => setActiveTab('VIGILANCE')}
            className={`px-3.5 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'VIGILANCE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>[6] Vigilance &amp; Drift Monitor (Agent 5)</span>
            {currentUser.role === 'VIGILANCE_AUDITOR' && (
              <span className="text-[9px] font-mono bg-white/20 text-white px-1.5 py-0.2 rounded-md font-bold">
                PRIMARY
              </span>
            )}
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
            <span>Ministry of Petroleum &amp; Natural Gas (MoPNG)</span>
            <span>CPCL / IOCL Inter-CPSE Pilot</span>
          </div>
        </div>
      </footer>

      {/* Enterprise Authentication & Persona Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        currentUser={currentUser}
        onLogin={handleLogin}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;
