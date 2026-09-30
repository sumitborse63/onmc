import { useState, useEffect } from 'react';
import type {
  MaterialRecord,
  NationalMaterialMaster,
  AdjudicationCandidate,
  AuditLedgerBlock,
  UserProfile,
} from './types';
import { AuthModal, DEMO_PROFILES_EXTENDED } from './components/AuthModal';
import { ReviewerPortalView } from './views/ReviewerPortalView';
import { RegistryExplorerView } from './views/RegistryExplorerView';
import { DuplicateClusterView } from './views/DuplicateClusterView';
import { SourcingSimulatorView } from './views/SourcingSimulatorView';
import { LegacyOCRInspectorView } from './views/LegacyOCRInspectorView';
import { VigilanceDashboardView } from './views/VigilanceDashboardView';
import { LegacyMigrationView } from './views/LegacyMigrationView';
import { MoPNGGovernanceView } from './views/MoPNGGovernanceView';
import { CPSEManagementView } from './views/CPSEManagementView';
import { ProcurementCockpitView } from './views/ProcurementCockpitView';
import { AdminDashboardView } from './views/AdminDashboardView';
import {
  fetchAllRecords,
  fetchAllMasters,
  fetchAdjudicationQueue,
  submitAdjudication,
  fetchHealthStatus,
  fetchLedgerBlocks,
  setAuthUserId,
  getExportCSVUrl,
} from './services/api';
import {
  Home,
  CheckSquare,
  Globe,
  Copy,
  TrendingUp,
  FileText,
  ShieldAlert,
  UploadCloud,
  Layers,
  Search,
  Bookmark,
  Building2,
  Download,
  FileEdit,
  Bell,
  HelpCircle,
  Shield,
  User,
  ChevronDown,
  Lock,
  ArrowRight,
  ShieldCheck,
  Activity,
  KeyRound,
  LogOut,
} from 'lucide-react';

type ActiveTab =
  | 'ADMIN_PORTAL'
  | 'OVERVIEW'
  | 'REVIEWER'
  | 'REGISTRY'
  | 'DUPLICATES'
  | 'SIMULATOR'
  | 'OCR'
  | 'VIGILANCE'
  | 'LEGACY_MIGRATION';

// Dashboard Access Authority Matrix per Specification (5 Core Stakeholders + Super Admin)
const ROLE_ALLOWED_TABS: Record<string, ActiveTab[]> = {
  SUPER_ADMIN: ['ADMIN_PORTAL', 'OVERVIEW', 'REGISTRY', 'REVIEWER', 'DUPLICATES', 'SIMULATOR', 'OCR', 'VIGILANCE', 'LEGACY_MIGRATION'],
  MOPNG_GOVERNMENT: ['OVERVIEW', 'REGISTRY', 'REVIEWER', 'SIMULATOR', 'VIGILANCE'],
  CPSE_MANAGEMENT: ['OVERVIEW', 'REGISTRY', 'REVIEWER', 'DUPLICATES', 'SIMULATOR', 'OCR', 'VIGILANCE', 'LEGACY_MIGRATION'],
  PROCUREMENT_TEAM: ['SIMULATOR', 'REGISTRY', 'OVERVIEW'],
  ENGINEERING_EXPERT: ['REVIEWER', 'REGISTRY', 'OCR', 'LEGACY_MIGRATION', 'DUPLICATES', 'OVERVIEW'],
  IT_SAP_TEAM: ['VIGILANCE', 'REGISTRY', 'OVERVIEW'],
};

const DEFAULT_ROLE_TAB: Record<string, ActiveTab> = {
  SUPER_ADMIN: 'ADMIN_PORTAL',
  MOPNG_GOVERNMENT: 'REGISTRY',
  CPSE_MANAGEMENT: 'REGISTRY',
  PROCUREMENT_TEAM: 'SIMULATOR',
  ENGINEERING_EXPERT: 'REVIEWER',
  IT_SAP_TEAM: 'VIGILANCE',
};

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('onmc_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return null; // Gateway Entry Point: Direct to official Login & Sign-Up Gateway
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('REGISTRY');

  // Core Data States (100% Live FastAPI backend synchronization, zero mock data)
  const [records, setRecords] = useState<MaterialRecord[]>([]);
  const [masters, setMasters] = useState<NationalMaterialMaster[]>([]);
  const [queue, setQueue] = useState<AdjudicationCandidate[]>([]);
  const [ledger, setLedger] = useState<AuditLedgerBlock[]>([]);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Reusable loader that pulls all live backend tables
  const loadBackendData = async () => {
    try {
      setIsLoadingData(true);
      const health = await fetchHealthStatus();
      if (health && health.status === 'HEALTHY') {
        setBackendConnected(true);
      }
      const [recs, msts, q, ledgRes] = await Promise.all([
        fetchAllRecords(),
        fetchAllMasters(),
        fetchAdjudicationQueue(),
        fetchLedgerBlocks(),
      ]);
      if (recs && Array.isArray(recs) && recs.length > 0) setRecords(recs);
      if (msts && Array.isArray(msts) && msts.length > 0) setMasters(msts);
      if (q && Array.isArray(q) && q.length > 0) setQueue(q);
      if (ledgRes && ledgRes.ledgerBlocks) setLedger(ledgRes.ledgerBlocks);
    } catch (err) {
      console.warn('Backend load error:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Ingest from FastAPI Backend on Mount
  useEffect(() => {
    loadBackendData();
  }, []);

  const handleLogin = (user: UserProfile) => {
    setAuthUserId(user.id);
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('onmc_user', JSON.stringify(user));
      localStorage.setItem('onmc_user', JSON.stringify(user));
      localStorage.setItem('onmc_user_id', user.id);
    }
    setIsAuthModalOpen(false);
    const defaultTab = DEFAULT_ROLE_TAB[user.role] || 'REGISTRY';
    setActiveTab(defaultTab);
    loadBackendData();
  };

  const handleLogout = () => {
    setAuthUserId(null);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onmc_user');
      localStorage.removeItem('onmc_user_id');
      sessionStorage.removeItem('onmc_user');
      sessionStorage.removeItem('onmc_user_id');
    }
    setIsAuthModalOpen(false);
  };

  const isTabPermitted = (tab: ActiveTab) => {
    if (!currentUser) return false;
    const allowed = ROLE_ALLOWED_TABS[currentUser.role];
    return allowed ? allowed.includes(tab) : false;
  };

  const handleApproveCandidate = async (item: AdjudicationCandidate) => {
    if (backendConnected) {
      await submitAdjudication(item.id, 'APPROVE');
    }
    setQueue((prev) => prev.filter((q) => q.id !== item.id));
    setMasters((prev) =>
      prev.map((m) =>
        m.nationalCode === item.candidateMaster.nationalCode
          ? { ...m, totalMappedSKUs: (m.totalMappedSKUs || 1) + 1 }
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
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100 text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-600 selection:text-white">
      {/* SECTION 1 — TOP ENTERPRISE HEADER */}
      <header className="bg-[#0B1120] text-white border-b border-slate-800 px-6 py-2.5 sticky top-0 z-40 shadow-xs w-full">
        <div className="w-full flex items-center justify-between gap-4">
          {/* Left Branding: MoPNG Lion Emblem & Titles */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              {/* National Emblem SVG / Badge */}
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-serif shadow-2xs">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-blue-400">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
                </svg>
              </div>
              <div className="leading-tight">
                <div className="font-bold text-sm text-white tracking-tight">MoPNG</div>
                <div className="text-[10px] text-slate-400 font-normal">Government of India</div>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="hidden md:block leading-tight">
              <div className="font-bold text-xs text-white tracking-tight">
                National Unified Material Master Platform
              </div>
              <div className="text-[10px] text-slate-400">
                Inter-CPSE Federated Data Infrastructure
              </div>
            </div>
          </div>

          {/* Right Controls: Role Selector, Notifications, Help, Security, Profile */}
          <div className="flex items-center gap-3">
            {/* Active Role Selector Pill */}
            {currentUser && (
              <div className="flex items-center gap-2">
                {currentUser.role === 'SUPER_ADMIN' && activeTab !== 'ADMIN_PORTAL' && (
                  <button
                    onClick={() => setActiveTab('ADMIN_PORTAL')}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-all cursor-pointer shadow-2xs"
                    title="Return to National Admin Portal"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Admin Portal</span>
                  </button>
                )}
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer text-xs"
                >
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Role:</span>
                  <span className="font-semibold text-slate-200 text-xs">
                    {currentUser.role === 'SUPER_ADMIN'
                      ? 'National Admin Portal'
                      : currentUser.role === 'MOPNG_GOVERNMENT'
                      ? 'MoPNG Government'
                      : currentUser.role === 'CPSE_MANAGEMENT'
                      ? `${currentUser.cpse} Management`
                      : currentUser.role === 'ENGINEERING_EXPERT'
                      ? 'Engineering Expert'
                      : currentUser.role === 'PROCUREMENT_TEAM'
                      ? 'Procurement Team'
                      : 'IT / SAP Team'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            )}

            {/* Notification Bell with Subtle Unread Dot */}
            <div className="relative cursor-pointer p-1.5 text-slate-400 hover:text-white transition-colors" title="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500 ring-2 ring-[#0B1120]" />
            </div>

            {/* Help Icon */}
            <div className="cursor-pointer p-1.5 text-slate-400 hover:text-white transition-colors" title="Platform Documentation & Help">
              <HelpCircle className="w-4 h-4" />
            </div>

            {/* Security / Governance Shield */}
            <div className="cursor-pointer p-1.5 text-slate-400 hover:text-white transition-colors" title="Cryptographic SHA-256 Merkle Ledger Active">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>

            {/* User Profile Avatar & Name + Logout Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  title="Switch Persona / View Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center font-bold text-xs">
                    {currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="hidden lg:block text-xs font-semibold text-slate-200">
                    {currentUser.name}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-2 flex items-center gap-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-900/50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400 font-mono">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Official Access Gateway</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Content Workspace */}
      {!currentUser ? (
        <section className="flex-1 w-full py-8 flex items-center justify-center">
          <AuthModal
            isOpen={true}
            isLandingMode={true}
            currentUser={null}
            onLogin={handleLogin}
          />
        </section>
      ) : (
        <div className="flex-1 flex w-full">
          {/* SECTION 2 — LEFT ENTERPRISE SIDEBAR */}
          <aside className="w-64 bg-[#0B1120] text-slate-300 border-r border-slate-800 flex flex-col flex-shrink-0 z-30 font-sans">
            {/* Top Overview Dashboard */}
            <div className="p-3 pb-1">
              <button
                onClick={() => setActiveTab('REGISTRY')}
                className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left text-xs ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">Overview Dashboard</span>
              </button>
            </div>

            {/* Navigation Tabs List */}
            <div className="px-3 py-1 space-y-1 flex-1 overflow-y-auto text-xs">
              {/* Unified Admin Portal (Accessible to Super Admin) */}
              {isTabPermitted('ADMIN_PORTAL') && (
                <button
                  onClick={() => setActiveTab('ADMIN_PORTAL')}
                  className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-left mb-2 border ${
                    activeTab === 'ADMIN_PORTAL'
                      ? 'bg-blue-600 text-white font-bold shadow-sm border-blue-500'
                      : 'bg-slate-850 text-slate-200 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                    activeTab === 'ADMIN_PORTAL' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs leading-tight">Admin Portal</div>
                    <div className="text-[10px] text-slate-400 font-normal truncate">
                      Role Assignment &amp; Auth
                    </div>
                  </div>
                </button>
              )}

              {/* National Registry */}
              <button
                onClick={() => setActiveTab('REGISTRY')}
                className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'REGISTRY'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                  activeTab === 'REGISTRY' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">National Registry</div>
                  <div className={`text-[10px] truncate ${activeTab === 'REGISTRY' ? 'text-blue-100 font-normal' : 'text-slate-400'}`}>
                    Catalog &amp; Master Explorer
                  </div>
                </div>
              </button>

              {/* Reviewer Portal */}
              <button
                onClick={() => isTabPermitted('REVIEWER') && setActiveTab('REVIEWER')}
                disabled={!isTabPermitted('REVIEWER')}
                className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'REVIEWER'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isTabPermitted('REVIEWER')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                  activeTab === 'REVIEWER' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">Reviewer Portal</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Technical Adjudication</div>
                </div>
                {!isTabPermitted('REVIEWER') && <Lock className="w-3 h-3 text-slate-600 ml-auto" />}
              </button>

              {/* Duplicate & Cluster Analytics */}
              <button
                onClick={() => isTabPermitted('DUPLICATES') && setActiveTab('DUPLICATES')}
                disabled={!isTabPermitted('DUPLICATES')}
                className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'DUPLICATES'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isTabPermitted('DUPLICATES')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                  activeTab === 'DUPLICATES' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Copy className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">Duplicate &amp; Cluster</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Analytics &amp; Stock Pooling</div>
                </div>
                {!isTabPermitted('DUPLICATES') && <Lock className="w-3 h-3 text-slate-600 ml-auto" />}
              </button>

              {/* Strategic Sourcing Simulator */}
              <button
                onClick={() => isTabPermitted('SIMULATOR') && setActiveTab('SIMULATOR')}
                disabled={!isTabPermitted('SIMULATOR')}
                className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'SIMULATOR'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isTabPermitted('SIMULATOR')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                  activeTab === 'SIMULATOR' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">Strategic Sourcing</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Demand Aggregation &amp; MSE</div>
                </div>
                {!isTabPermitted('SIMULATOR') && <Lock className="w-3 h-3 text-slate-600 ml-auto" />}
              </button>

              {/* Legacy OCR Inspector */}
              <button
                onClick={() => isTabPermitted('OCR') && setActiveTab('OCR')}
                disabled={!isTabPermitted('OCR')}
                className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'OCR'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isTabPermitted('OCR')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                  activeTab === 'OCR' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">Legacy Document OCR</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Drawing &amp; P&amp;ID Extraction</div>
                </div>
                {!isTabPermitted('OCR') && <Lock className="w-3 h-3 text-slate-600 ml-auto" />}
              </button>

              {/* Vigilance & Drift Monitor */}
              <button
                onClick={() => isTabPermitted('VIGILANCE') && setActiveTab('VIGILANCE')}
                disabled={!isTabPermitted('VIGILANCE')}
                className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'VIGILANCE'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isTabPermitted('VIGILANCE')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                  activeTab === 'VIGILANCE' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">Vigilance &amp; Ledger</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Audit, Alerts &amp; SAP Sync</div>
                </div>
                {!isTabPermitted('VIGILANCE') && <Lock className="w-3 h-3 text-slate-600 ml-auto" />}
              </button>

              {/* Legacy Migration */}
              <button
                onClick={() => isTabPermitted('LEGACY_MIGRATION') && setActiveTab('LEGACY_MIGRATION')}
                disabled={!isTabPermitted('LEGACY_MIGRATION')}
                className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'LEGACY_MIGRATION'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isTabPermitted('LEGACY_MIGRATION')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                  activeTab === 'LEGACY_MIGRATION' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  <UploadCloud className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">Legacy Migration</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Batch Ingestion Pipeline</div>
                </div>
                {!isTabPermitted('LEGACY_MIGRATION') && <Lock className="w-3 h-3 text-slate-600 ml-auto" />}
              </button>

              {/* SECTION 2B — QUICK ACTIONS */}
              <div className="pt-4 border-t border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Quick Actions
                </div>

                {/* 1. Search National Material */}
                <button
                  onClick={() => setActiveTab('REGISTRY')}
                  className="w-full text-left px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 cursor-pointer text-xs transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Search National Material</span>
                </button>

                {/* 2. My Saved Searches */}
                <button
                  onClick={() => setActiveTab('REGISTRY')}
                  className="w-full text-left px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 cursor-pointer text-xs transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Saved Searches</span>
                </button>

                {/* 3. View Organization Data */}
                <button
                  onClick={() => setActiveTab('REGISTRY')}
                  className="w-full text-left px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 cursor-pointer text-xs transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Organization Master Data</span>
                </button>

                {/* 4. Download Registry Report */}
                <button
                  onClick={() => window.open(getExportCSVUrl(), '_blank')}
                  className="w-full text-left px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 cursor-pointer text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export Registry Report</span>
                </button>

                {/* 5. Data Correction Requests */}
                <button
                  onClick={() => setActiveTab('REGISTRY')}
                  className="w-full text-left px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 cursor-pointer text-xs transition-colors"
                >
                  <FileEdit className="w-3.5 h-3.5 text-slate-400" />
                  <span>Data Correction Requests</span>
                </button>
              </div>
            </div>

            {/* Sidebar Bottom Profile Card */}
            <div className="p-3 border-t border-slate-800 bg-[#080D18] space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-blue-400 flex items-center justify-center font-bold text-xs">
                  IN
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    Ministry of Petroleum &amp; Natural Gas
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Sovereign Governance Authority
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Switch Role</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="flex-1 px-6 py-5 overflow-y-auto">
            {/* Dashboard 0: Overview Dashboard based on Role */}
            {activeTab === 'OVERVIEW' && (
              <>
                {currentUser?.role === 'MOPNG_GOVERNMENT' && (
                  <MoPNGGovernanceView
                    masters={masters}
                    records={records}
                    ledger={ledger}
                    currentUser={currentUser}
                  />
                )}
                {currentUser?.role === 'CPSE_MANAGEMENT' && (
                  <CPSEManagementView
                    records={records}
                    currentUser={currentUser}
                  />
                )}
                {currentUser?.role === 'PROCUREMENT_TEAM' && (
                  <ProcurementCockpitView
                    records={records}
                    currentUser={currentUser}
                  />
                )}

                {(currentUser?.role === 'ENGINEERING_EXPERT' || currentUser?.role === 'IT_SAP_TEAM') && (
                  <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs text-xs text-slate-500 font-mono flex flex-col items-center justify-center min-h-[300px]">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 font-sans">Role Dashboard</h3>
                    <p>Select a specialized module from the sidebar (e.g. Reviewer Portal, Vigilance) to continue your work.</p>
                  </div>
                )}
              </>
            )}

            {/* Dashboard: Unified Admin Portal */}
            {activeTab === 'ADMIN_PORTAL' && (
              <AdminDashboardView
                currentUser={currentUser}
                onImpersonateUser={(user) => {
                  handleLogin(user);
                }}
              />
            )}

            {/* Dashboard 2: National Registry */}
            {activeTab === 'REGISTRY' && (

              <RegistryExplorerView
                masters={masters}
                records={records}
                currentUser={currentUser}
                onNavigateTab={(tab) => {
                  if (isTabPermitted(tab as ActiveTab)) {
                    setActiveTab(tab as ActiveTab);
                  }
                }}
              />
            )}

            {/* Dashboard 1: Reviewer Portal */}
            {activeTab === 'REVIEWER' && (
              <ReviewerPortalView
                queue={queue}
                records={records}
                onApprove={handleApproveCandidate}
                onReject={handleRejectCandidate}
                currentUser={currentUser}
                onNavigateTab={(tab) => {
                  if (isTabPermitted(tab as ActiveTab)) {
                    setActiveTab(tab as ActiveTab);
                  }
                }}
              />
            )}

            {/* Dashboard 3: Duplicate & Cluster Analytics */}
            {activeTab === 'DUPLICATES' && (
              <DuplicateClusterView currentUser={currentUser} />
            )}

            {/* Dashboard 4: Strategic Sourcing Simulator */}
            {activeTab === 'SIMULATOR' && (
              <SourcingSimulatorView currentUser={currentUser} records={records} />
            )}

            {/* Dashboard 5: Legacy OCR Inspector */}
            {activeTab === 'OCR' && (
              <LegacyOCRInspectorView currentUser={currentUser} />
            )}

            {/* Dashboard 6: Vigilance & Drift Monitor */}
            {activeTab === 'VIGILANCE' && (
              <VigilanceDashboardView currentUser={currentUser} />
            )}

            {/* Dashboard 7: Legacy Migration */}
            {activeTab === 'LEGACY_MIGRATION' && (
              <LegacyMigrationView currentUser={currentUser} />
            )}
          </main>
        </div>
      )}

      {/* Role Switcher Modal */}
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
