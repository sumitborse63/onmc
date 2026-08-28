import { useState, useEffect } from 'react';
import type { MaterialRecord, NationalMaterialMaster, AdjudicationCandidate, UserProfile, AuditLedgerBlock } from './types';
import { MoPNGGovernanceView } from './views/MoPNGGovernanceView';
import { CPSEManagementView } from './views/CPSEManagementView';
import { ProcurementCockpitView } from './views/ProcurementCockpitView';
import { ReviewerPortalView } from './views/ReviewerPortalView';
import { InventoryCockpitView } from './views/InventoryCockpitView';
import { VigilanceDashboardView } from './views/VigilanceDashboardView';
import { AuthModal } from './components/AuthModal';
import {
  fetchAllRecords,
  fetchAllMasters,
  fetchAdjudicationQueue,
  submitAdjudication,
  fetchHealthStatus,
  fetchLedgerBlocks,
} from './services/api';
import {
  RAW_BENCHMARK_RECORDS,
  NATIONAL_MASTERS_CATALOG,
  ADJUDICATION_QUEUE,
  INITIAL_AUDIT_LEDGER,
} from './data/mockData';
import {
  Boxes,
  Activity,
  ChevronDown,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(true);
  const [queue, setQueue] = useState<AdjudicationCandidate[]>(ADJUDICATION_QUEUE);
  const [masters, setMasters] = useState<NationalMaterialMaster[]>(NATIONAL_MASTERS_CATALOG);
  const [records, setRecords] = useState<MaterialRecord[]>(RAW_BENCHMARK_RECORDS);
  const [ledger, setLedger] = useState<AuditLedgerBlock[]>(INITIAL_AUDIT_LEDGER);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  // Ingest from FastAPI Backend on Mount if available
  useEffect(() => {
    async function loadBackendData() {
      try {
        const health = await fetchHealthStatus();
        if (health && health.status === 'HEALTHY') {
          setBackendConnected(true);
          const [recs, msts, q, ledgRes] = await Promise.all([
            fetchAllRecords(),
            fetchAllMasters(),
            fetchAdjudicationQueue(),
            fetchLedgerBlocks(),
          ]);
          if (recs && recs.length > 0) setRecords(recs);
          if (msts && msts.length > 0) setMasters(msts);
          if (q && q.length > 0) setQueue(q);
          if (ledgRes && ledgRes.ledgerBlocks) setLedger(ledgRes.ledgerBlocks);
        }
      } catch (err) {
        console.warn('FastAPI backend offline, running in robust standalone mode with standard benchmarks:', err);
      }
    }
    loadBackendData();
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthModalOpen(true);
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
      {/* Top Header Status Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-40 shadow-sm w-full">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center text-white shadow-md ring-2 ring-rose-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2 font-sans tracking-tight">
                National Unified Material Master Platform
                {currentUser && (
                  <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-full font-bold">
                    {currentUser.cpse} Workspace
                  </span>
                )}
                {backendConnected ? (
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Activity className="w-3 h-3" /> FASTAPI LIVE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> ACTIVE PILOT
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Ministry of Petroleum &amp; Natural Gas (MoPNG) // Inter-CPSE Federated DPI
              </div>
            </div>
          </div>

          {/* User Persona & Role Switcher */}
          {currentUser && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 px-3 py-1.5 rounded-xl text-left transition-all cursor-pointer shadow-xs group"
                title="Switch Stakeholder Role"
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
                    {currentUser.role.replace(/_/g, ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={handleLogout}
                className="text-[11px] font-mono text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                title="Sign Out to Gateway"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Role-Specific Active Remit Status Bar */}
      {currentUser && (
        <div className="bg-slate-850 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2 text-[11px] font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Active Stakeholder: <strong className="text-white">{currentUser.name}</strong> ({currentUser.cpse} — {currentUser.plantLocation})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Dedicated Operational Scope:</span>
            <span className="bg-slate-800 text-sky-300 px-2.5 py-0.5 rounded-md border border-slate-700 font-semibold">
              {currentUser.role === 'MOPNG_GOVERNMENT' && '🏛️ National Standardization & Sovereign Governance'}
              {currentUser.role === 'CPSE_MANAGEMENT' && '🏭 Plant Material Master & Blueprint Digitization'}
              {currentUser.role === 'PROCUREMENT_TEAM' && '🛒 Joint Demand Aggregation & Voice-Based Sourcing'}
              {currentUser.role === 'ENGINEERING_EXPERT' && '🔧 Technical Equivalence & Reviewer Adjudication'}
              {currentUser.role === 'INVENTORY_TEAM' && '📦 Duplicate Elimination & Safety Stock Pooling'}
              {currentUser.role === 'IT_SAP_TEAM' && '💻 SAP NetWeaver ERP Vigilance & Merkle Ledger'}
            </span>
          </div>
        </div>
      )}

      {/* Main Container: Strictly Isolated Stakeholder Workspace */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col space-y-4">
        {!currentUser ? (
          /* When logged out, render Sovereign Gateway Modal as landing experience */
          <section className="flex-1 w-full py-2">
            <AuthModal
              isOpen={true}
              isLandingMode={true}
              currentUser={null}
              onLogin={handleLogin}
            />
          </section>
        ) : (
          /* When logged in, ONLY render the dashboard tailored to this stakeholder */
          <section className="flex-1 w-full space-y-4">
            {currentUser.role === 'MOPNG_GOVERNMENT' && (
              <MoPNGGovernanceView
                masters={masters}
                records={records}
                ledger={ledger}
                currentUser={currentUser}
              />
            )}

            {currentUser.role === 'CPSE_MANAGEMENT' && (
              <CPSEManagementView
                records={records}
                currentUser={currentUser}
              />
            )}

            {currentUser.role === 'PROCUREMENT_TEAM' && (
              <ProcurementCockpitView
                records={records}
                currentUser={currentUser}
              />
            )}

            {currentUser.role === 'ENGINEERING_EXPERT' && (
              <ReviewerPortalView
                queue={queue}
                onApprove={handleApproveCandidate}
                onReject={handleRejectCandidate}
                currentUser={currentUser}
              />
            )}

            {currentUser.role === 'INVENTORY_TEAM' && (
              <InventoryCockpitView
                records={records}
                currentUser={currentUser}
              />
            )}

            {currentUser.role === 'IT_SAP_TEAM' && (
              <VigilanceDashboardView
                currentUser={currentUser}
              />
            )}
          </section>
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-3 font-mono text-xs text-slate-500 mt-auto w-full">
        <div className="w-full flex flex-wrap justify-between items-center gap-3">
          <span className="font-semibold text-slate-700">
            Digital Public Infrastructure (DPI) // Problem Statement 26099 (MoPNG)
          </span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>IEEE 830 / ISO 29148 Standard</span>
            <span>One Nation – One Material Code</span>
            <span>Federated Multi-Agent Architecture</span>
          </div>
        </div>
      </footer>

      {/* Quick Role Switcher Modal (Overlay Mode when logged in) */}
      {currentUser && isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          isLandingMode={false}
          currentUser={currentUser}
          onLogin={handleLogin}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
