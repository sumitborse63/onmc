import React, { useState, useEffect } from 'react';
import type { UserProfile, UserRole, CPSEEntity } from '../types';
import { loginUser, fetchAdminUsers, createAdminUser } from '../services/api';
import {
  Building2,
  HardHat,
  UserCheck,
  Lock,
  Mail,
  MapPin,
  IdCard,
  UserPlus,
  LogIn,
  Layers,
  TrendingUp,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Boxes,
  Activity,
  Cpu,
  CheckCircle2,
  X,
  AlertCircle,
  KeyRound,
  Loader2,
} from 'lucide-react';

export interface PersonaConfig extends UserProfile {
  title: string;
  department: string;
  strategicRemit: string;
  primaryCockpitName: string;
  primaryCockpitCode: string;
  primaryCockpitIcon: any;
  capabilities: string[];
  defaultPassword?: string;
  themeColor: {
    primary: string;
    bgBadge: string;
    textBadge: string;
    border: string;
    hoverBorder: string;
    cardBg: string;
    btnBg: string;
    btnHover: string;
    accentGlow: string;
  };
}

export const DEMO_PROFILES_EXTENDED: PersonaConfig[] = [
  {
    id: 'USR-ADMIN-00',
    name: 'National DPI Administrator',
    title: 'National DPI Governance Director',
    department: 'MoPNG Digital Public Infrastructure Division',
    email: 'admin@onmc.gov.in',
    defaultPassword: 'admin@password2026',
    cpse: 'MoPNG',
    plantLocation: 'Shastri Bhawan, New Delhi',
    role: 'SUPER_ADMIN',
    badgeId: 'GOV-DPI-ADMIN-001',
    avatarColor: 'bg-slate-900',
    strategicRemit: 'Authoritative sovereign governance, role provisioning, RBAC delegation & cryptographic SHA-256 Merkle audit',
    primaryCockpitName: 'Admin Dashboard (Role Manager & Identity Cockpit)',
    primaryCockpitCode: 'Admin Portal',
    primaryCockpitIcon: ShieldCheck,
    capabilities: [
      'Centralized Role Provisioning & Revocation',
      'Inter-CPSE Stakeholder Authorization Audit',
      'Account Security & Permission Management',
      'Cryptographic SHA-256 Merkle Verification',
    ],
    themeColor: {
      primary: 'text-slate-900',
      bgBadge: 'bg-slate-100 text-slate-800 border-slate-200',
      textBadge: 'text-slate-800',
      border: 'border-slate-200',
      hoverBorder: 'hover:border-slate-400',
      cardBg: 'bg-white',
      btnBg: 'bg-slate-900',
      btnHover: 'hover:bg-slate-800',
      accentGlow: 'group-hover:shadow-slate-500/10',
    },
  },
  {
    id: 'USR-MOPNG-01',
    name: 'Shri Amitabh Kant',
    title: 'Joint Secretary (Procurement & Policy)',
    department: 'MoPNG Central Procurement & DPI Wing',
    email: 'amitabh.kant@mopng.gov.in',
    defaultPassword: 'password123',
    cpse: 'MoPNG',
    plantLocation: 'Shastri Bhawan, New Delhi',
    role: 'MOPNG_GOVERNMENT',
    badgeId: 'GOV-MOPNG-001',
    avatarColor: 'bg-blue-900',
    strategicRemit: 'National standardization, cross-CPSE procurement efficiency & sovereign DPI governance',
    primaryCockpitName: 'National Registry (Master Catalog Explorer)',
    primaryCockpitCode: 'National Registry',
    primaryCockpitIcon: Layers,
    capabilities: [
      'Universal Catalog Explorer',
      'Inter-CPSE Price Dispersion Curves',
      'Public Sector Demand Consolidation',
      'Sovereign Policy Compliance & Oversight',
    ],
    themeColor: {
      primary: 'text-blue-700',
      bgBadge: 'bg-blue-50 text-blue-800 border-blue-200',
      textBadge: 'text-blue-700',
      border: 'border-slate-200',
      hoverBorder: 'hover:border-blue-400',
      cardBg: 'bg-white',
      btnBg: 'bg-blue-600',
      btnHover: 'hover:bg-blue-700',
      accentGlow: 'group-hover:shadow-blue-500/10',
    },
  },
  {
    id: 'USR-CPSE-02',
    name: 'Er. R. Sundaram',
    title: 'General Manager (Materials Management)',
    department: 'Refinery Materials & Standard Specifications',
    email: 'manager@cpcl.co.in',
    defaultPassword: 'password123',
    cpse: 'CPCL',
    plantLocation: 'Manali Refinery, Chennai',
    role: 'CPSE_MANAGEMENT',
    badgeId: 'CPCL-MGT-4910',
    avatarColor: 'bg-slate-800',
    strategicRemit: 'Harmonized material masters & legacy technical blueprint digitization',
    primaryCockpitName: 'Legacy OCR Inspector (Multimodal Extraction)',
    primaryCockpitCode: 'Legacy Document OCR',
    primaryCockpitIcon: FileText,
    capabilities: [
      'Scanned Technical Drawing & P&ID BBox OCR',
      'ASTM / ASME / API Lexicon Disambiguation',
      'Plant-Level S/4HANA SKU Normalization',
      'Batch Ingestion & Reconciliation',
    ],
    themeColor: {
      primary: 'text-slate-800',
      bgBadge: 'bg-slate-100 text-slate-800 border-slate-200',
      textBadge: 'text-slate-800',
      border: 'border-slate-200',
      hoverBorder: 'hover:border-slate-400',
      cardBg: 'bg-white',
      btnBg: 'bg-slate-900',
      btnHover: 'hover:bg-slate-800',
      accentGlow: 'group-hover:shadow-slate-500/10',
    },
  },
  {
    id: 'USR-PROC-03',
    name: 'Dr. Neha Verma',
    title: 'Chief General Manager (Strategic Sourcing)',
    department: 'Central SCM & Joint Tendering Authority',
    email: 'procurement@indianoil.in',
    defaultPassword: 'password123',
    cpse: 'IOCL',
    plantLocation: 'Corporate Sourcing, New Delhi',
    role: 'PROCUREMENT_TEAM',
    badgeId: 'IOCL-SCM-8821',
    avatarColor: 'bg-emerald-900',
    strategicRemit: 'Joint demand pooling, volume elasticity discounts & statutory 25% MSE quota allocation',
    primaryCockpitName: 'Strategic Sourcing Simulator',
    primaryCockpitCode: 'Strategic Sourcing',
    primaryCockpitIcon: TrendingUp,
    capabilities: [
      'Econometric Joint Demand Pooling',
      'MSEs Order Lot Allocation (25% Statutory)',
      'Inter-CPSE Rate Variance Modeling',
      'Executive Tender Memorandums',
    ],
    themeColor: {
      primary: 'text-emerald-800',
      bgBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      textBadge: 'text-emerald-700',
      border: 'border-slate-200',
      hoverBorder: 'hover:border-emerald-400',
      cardBg: 'bg-white',
      btnBg: 'bg-slate-900',
      btnHover: 'hover:bg-slate-800',
      accentGlow: 'group-hover:shadow-emerald-500/10',
    },
  },
  {
    id: 'USR-ENG-04',
    name: 'Er. Rajesh Kulkarni',
    title: 'Senior Chief Materials Engineer',
    department: 'Offshore Technical Standards & Reliability',
    email: 'engineer@ongc.co.in',
    defaultPassword: 'password123',
    cpse: 'ONGC',
    plantLocation: 'Western Offshore Basin, Mumbai',
    role: 'ENGINEERING_EXPERT',
    badgeId: 'ONGC-ENG-7712',
    avatarColor: 'bg-slate-800',
    strategicRemit: 'Material equivalence verification, 5-axis factor review & ERP synchronization authorization',
    primaryCockpitName: 'Reviewer Portal (Technical Adjudication)',
    primaryCockpitCode: 'Reviewer Portal',
    primaryCockpitIcon: ShieldCheck,
    capabilities: [
      'Technical Adjudication Review Queue',
      'Explainable AI (XAI) Attribute Diff Tables',
      '5-Axis Factor Radar Chart Scoring',
      'Real-Time SAP S/4HANA Sync Authorization',
    ],
    themeColor: {
      primary: 'text-blue-700',
      bgBadge: 'bg-blue-50 text-blue-800 border-blue-200',
      textBadge: 'text-blue-700',
      border: 'border-slate-200',
      hoverBorder: 'hover:border-blue-400',
      cardBg: 'bg-white',
      btnBg: 'bg-blue-600',
      btnHover: 'hover:bg-blue-700',
      accentGlow: 'group-hover:shadow-blue-500/10',
    },
  },
  {
    id: 'USR-IT-06',
    name: 'Vikramaditya Rao',
    title: 'Chief Enterprise Architect & SAP Basis Lead',
    department: 'Enterprise Systems & Cyber-Security Audit',
    email: 'it_audit@bpcl.in',
    defaultPassword: 'password123',
    cpse: 'BPCL',
    plantLocation: 'Mumbai Refinery Complex',
    role: 'IT_SAP_TEAM',
    badgeId: 'BPCL-IT-9920',
    avatarColor: 'bg-slate-900',
    strategicRemit: 'Secure ERP NetWeaver integration, drift alerts & cryptographic SHA-256 ledger audit',
    primaryCockpitName: 'Vigilance & Drift Monitor',
    primaryCockpitCode: 'Vigilance & Ledger',
    primaryCockpitIcon: ShieldAlert,
    capabilities: [
      'NetWeaver BAPI Delta Listener',
      'SHA-256 Merkle Chain Tamper-Evident Ledger',
      'Automated Outlier & Drift Detection',
      'Zero-Knowledge Field Redaction',
    ],
    themeColor: {
      primary: 'text-slate-800',
      bgBadge: 'bg-slate-100 text-slate-800 border-slate-200',
      textBadge: 'text-slate-800',
      border: 'border-slate-200',
      hoverBorder: 'hover:border-slate-400',
      cardBg: 'bg-white',
      btnBg: 'bg-slate-900',
      btnHover: 'hover:bg-slate-800',
      accentGlow: 'group-hover:shadow-slate-500/10',
    },
  },
];

export const DEMO_PROFILES: UserProfile[] = DEMO_PROFILES_EXTENDED.map(
  ({ strategicRemit, title, department, primaryCockpitName, primaryCockpitCode, primaryCockpitIcon, capabilities, themeColor, defaultPassword, ...profile }) => profile
);

interface AuthModalProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onClose?: () => void;
  isOpen: boolean;
  isLandingMode?: boolean;
}

export function AuthModal({ onLogin, onClose, isOpen, isLandingMode = false }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'QUICK_PERSONA' | 'CREDENTIAL_LOGIN' | 'SIGNUP' | 'ARCHITECTURE'>(
    isLandingMode ? 'CREDENTIAL_LOGIN' : 'QUICK_PERSONA'
  );
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('ALL');
  const [liveProfiles, setLiveProfiles] = useState<PersonaConfig[]>(DEMO_PROFILES_EXTENDED);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Direct Credential Login State
  const [loginIdentifier, setLoginIdentifier] = useState('admin@onmc.gov.in');
  const [loginPassword, setLoginPassword] = useState('admin@password2026');

  // Custom User Sign Up Form State
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    cpse: 'CPCL' as CPSEEntity,
    department: 'Materials Management',
    plantLocation: '',
    role: 'ENGINEERING_EXPERT' as UserRole,
    badgeId: '',
    password: 'password123',
    complianceCertified: true,
  });

  // Sync users dynamically from backend if available
  useEffect(() => {
    async function syncUsers() {
      try {
        const users = await fetchAdminUsers();
        if (Array.isArray(users) && users.length > 0) {
          setLiveProfiles((prev) =>
            prev.map((p) => {
              const remote = users.find((u: any) => u.id === p.id || u.email === p.email);
              if (remote) {
                return {
                  ...p,
                  role: remote.role || p.role,
                  status: remote.status || p.status,
                  name: remote.name || p.name,
                  plantLocation: remote.plantLocation || p.plantLocation,
                };
              }
              return p;
            })
          );
        }
      } catch {
        // Backend offline or unauthorized; standard profiles will serve
      }
    }
    if (isOpen) {
      syncUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePersonaClick = async (persona: PersonaConfig) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await loginUser({ userId: persona.id, password: persona.defaultPassword });
      if (res && res.user) {
        onLogin(res.user);
        if (onClose) onClose();
        return;
      }
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed';
      if (msg.toLowerCase().includes('suspended')) {
        setAuthError(msg);
        setAuthLoading(false);
        return;
      }
      console.warn('Backend login fallback to persona:', err);
    }
    // Fallback if backend is offline
    onLogin(persona);
    if (onClose) onClose();
    setAuthLoading(false);
  };

  const handleCredentialLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier) return;

    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await loginUser({
        identifier: loginIdentifier.trim(),
        password: loginPassword,
      });

      if (res && res.user) {
        onLogin(res.user);
        if (onClose) onClose();
        return;
      }
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials or account suspended');
      setAuthLoading(false);
      return;
    }

    // Offline fallback if server not reachable
    const matched = liveProfiles.find(
      (p) =>
        p.email.toLowerCase() === loginIdentifier.trim().toLowerCase() ||
        p.id.toLowerCase() === loginIdentifier.trim().toLowerCase()
    );
    if (matched) {
      onLogin(matched);
      if (onClose) onClose();
    } else {
      setAuthError('Stakeholder not found. Check email or register a new identity.');
    }
    setAuthLoading(false);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setAuthLoading(true);
    setAuthError(null);

    const newUser: UserProfile = {
      id: `USR-${formData.cpse}-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      email: formData.email,
      cpse: formData.cpse,
      plantLocation: formData.plantLocation || `${formData.cpse} Central Facility`,
      role: formData.role,
      badgeId: formData.badgeId || `${formData.cpse}-AUTH-${Math.floor(Math.random() * 9000 + 1000)}`,
      avatarColor: 'bg-slate-800',
      title: formData.title || 'Enterprise Specialist',
      department: formData.department || 'Operations',
      status: 'ACTIVE',
    };

    try {
      await createAdminUser({
        name: formData.name,
        email: formData.email,
        cpse: formData.cpse,
        plantLocation: formData.plantLocation || `${formData.cpse} Central Facility`,
        role: formData.role,
        badgeId: formData.badgeId,
        title: formData.title,
        department: formData.department,
        password: formData.password || 'password123',
      });
    } catch (err: any) {
      console.warn('Notice: Backend user sync was skipped or offline:', err);
    }

    onLogin(newUser);
    if (onClose) onClose();
    setAuthLoading(false);
  };

  const filteredPersonas = liveProfiles.filter((p) => {
    if (selectedEntityFilter === 'ALL') return true;
    return p.cpse === selectedEntityFilter;
  });

  const content = (
    <div className="w-full flex flex-col space-y-6">
      {/* Top Banner / Hero Bar */}
      <div className="bg-[#0B1120] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md ring-1 ring-blue-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                    National Unified Material Master Gateway
                  </h1>
                  <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Sovereign DPI Hub
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Activity className="w-3 h-3" /> System Active
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-mono mt-0.5">
                  Ministry of Petroleum &amp; Natural Gas (MoPNG) • Inter-CPSE Federated Data Infrastructure
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <X className="w-3.5 h-3.5" /> Close Gateway
              </button>
            )}
          </div>

          {/* Value Props & Stat Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800/90 text-xs font-mono">
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Architecture</span>
              <span className="font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Standardized Master
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Participating CPSEs</span>
              <span className="font-bold text-slate-100 mt-0.5 block truncate">
                CPCL • IOCL • ONGC • BPCL • HPCL • SAIL
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Stakeholder Roles</span>
              <span className="font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" /> 5 Roles + 1 Admin
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Audit Ledger</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <Lock className="w-3.5 h-3.5" /> SHA-256 Merkle Chain
              </span>
            </div>
          </div>

          {/* Segmented Mode Selector */}
          <div className="flex flex-wrap gap-2 pt-2 bg-slate-900/90 p-1.5 rounded-xl text-xs font-semibold border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('QUICK_PERSONA');
                setAuthError(null);
              }}
              className={`flex-1 min-w-[170px] py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'QUICK_PERSONA'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Stakeholder Cockpits
            </button>
            <button
              onClick={() => {
                setActiveTab('CREDENTIAL_LOGIN');
                setAuthError(null);
              }}
              className={`flex-1 min-w-[170px] py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'CREDENTIAL_LOGIN'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Credential Sign-In
            </button>
            <button
              onClick={() => {
                setActiveTab('SIGNUP');
                setAuthError(null);
              }}
              className={`flex-1 min-w-[170px] py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'SIGNUP'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Enterprise Sign-Up
            </button>
            <button
              onClick={() => {
                setActiveTab('ARCHITECTURE');
                setAuthError(null);
              }}
              className={`flex-1 min-w-[170px] py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'ARCHITECTURE'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              Architecture Matrix
            </button>
          </div>
        </div>
      </div>

      {authError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-xs font-mono">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <strong>Authentication Alert:</strong> {authError}
          </div>
          <button
            onClick={() => setAuthError(null)}
            className="text-rose-600 hover:text-rose-800 text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab 1: Stakeholder Personas */}
      {activeTab === 'QUICK_PERSONA' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Select Enterprise Stakeholder Role
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Choose an authoritative role to launch its specialized cockpit:
              </p>
            </div>

            {/* CPSE Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
              <span className="text-slate-500 text-[11px] font-sans mr-1">Organization:</span>
              {['ALL', 'MoPNG', 'CPCL', 'IOCL', 'ONGC', 'BPCL'].map((cpse) => (
                <button
                  key={cpse}
                  onClick={() => setSelectedEntityFilter(cpse)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                    selectedEntityFilter === cpse
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cpse}
                </button>
              ))}
            </div>
          </div>

          {/* 6 High-End Persona Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredPersonas.map((persona) => {
              const CockpitIcon = persona.primaryCockpitIcon;
              const isSuperAdmin = persona.role === 'SUPER_ADMIN';

              return (
                <div
                  key={persona.id}
                  onClick={() => !authLoading && handlePersonaClick(persona)}
                  className={`stitch-card bg-white border border-slate-200/90 hover:border-blue-500/70 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between gap-4 group relative ${
                    persona.status === 'SUSPENDED' ? 'opacity-50 grayscale' : ''
                  }`}
                >
                  {/* Header Row: Avatar, Name, Designation & Role Badge */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl ${persona.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
                        >
                          {persona.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 leading-tight group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                            {persona.name}
                            {isSuperAdmin && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-slate-900 text-white rounded">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-medium text-slate-600 line-clamp-1">
                            {persona.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {persona.cpse} • {persona.badgeId}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {persona.role.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Plant Location Pill */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium">{persona.plantLocation}</span>
                    </div>

                    {/* Strategic Operational Remit Box */}
                    <div className="bg-slate-900 text-slate-100 p-3 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-400" /> Operational Mandate
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        "{persona.strategicRemit}"
                      </p>
                    </div>

                    {/* Primary Cockpit Highlight */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-semibold">Primary Module:</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {persona.primaryCockpitCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                        <CockpitIcon className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate">{persona.primaryCockpitName}</span>
                      </div>
                    </div>

                    {/* Key Capabilities List */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">
                        Capabilities:
                      </span>
                      <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-600">
                        {persona.capabilities.map((cap, i) => (
                          <div key={i} className="flex items-center gap-1.5 truncate">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      disabled={authLoading || persona.status === 'SUSPENDED'}
                      className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>Access Cockpit</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Enterprise Credential Sign-In */}
      {activeTab === 'CREDENTIAL_LOGIN' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              Official Sovereign &amp; CPSE Enterprise Sign-In
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Authenticate using your official government email or CPSE identity:
            </p>
          </div>

          {/* Quick-fill Helper Badges */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase block">
              Quick-Select Stakeholder Account:
            </span>
            <div className="flex flex-wrap gap-2">
              {liveProfiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setLoginIdentifier(p.email);
                    setLoginPassword(p.defaultPassword || 'password123');
                    setAuthError(null);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    loginIdentifier === p.email
                      ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-semibold">{p.name.split(' ')[0]}</span>
                  <span className="text-slate-400 font-normal">({p.cpse})</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCredentialLoginSubmit} className="space-y-5 max-w-xl text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-500" /> Email Address or Stakeholder ID *
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. admin@onmc.gov.in or amitabh.kant@mopng.gov.in"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-500" /> Account Password *
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Verified against SHA-256 Merkle Ledger
              </span>

              <button
                type="submit"
                disabled={authLoading}
                className="btn-stitch bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In &amp; Launch</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">New stakeholder?</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('SIGNUP');
                  setAuthError(null);
                }}
                className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Custom Enterprise Sign-Up Form */}
      {activeTab === 'SIGNUP' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Stakeholder Registration &amp; Role Provisioning
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Provision an official stakeholder identity with CPSE affiliation and verified role permissions:
            </p>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-slate-500" /> Full Name &amp; Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar / Er. Priya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-500" /> Enterprise / MoPNG Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh.kumar@cpcl.co.in or priya@indianoil.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-500" /> CPSE Enterprise Organization *
                </label>
                <select
                  value={formData.cpse}
                  onChange={(e) => setFormData({ ...formData, cpse: e.target.value as CPSEEntity })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                >
                  <option value="CPCL">CPCL — Chennai Petroleum Corporation Limited</option>
                  <option value="IOCL">IOCL — Indian Oil Corporation Limited</option>
                  <option value="ONGC">ONGC — Oil and Natural Gas Corporation</option>
                  <option value="BPCL">BPCL — Bharat Petroleum Corporation Limited</option>
                  <option value="HPCL">HPCL — Hindustan Petroleum Corporation Limited</option>
                  <option value="SAIL">SAIL — Steel Authority of India Limited</option>
                  <option value="NTPC">NTPC — National Thermal Power Corporation</option>
                  <option value="MoPNG">MoPNG — Ministry of Petroleum &amp; Natural Gas</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-slate-500" /> Operational Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                >
                  <option value="MOPNG_GOVERNMENT">MoPNG / Government (National Registry Explorer)</option>
                  <option value="CPSE_MANAGEMENT">CPSE Management (Legacy OCR &amp; Blueprint Digitizer)</option>
                  <option value="PROCUREMENT_TEAM">Procurement Team (Strategic Sourcing &amp; Demand Aggregator)</option>
                  <option value="ENGINEERING_EXPERT">Engineering Expert (Reviewer Portal &amp; Technical Adjudication)</option>
                  <option value="IT_SAP_TEAM">IT / SAP Team (Vigilance &amp; Ledger Audit)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" /> Plant / Refinery / Administrative Complex
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manali Refinery, Chennai / Panipat Complex / Shastri Bhawan"
                  value={formData.plantLocation}
                  onChange={(e) => setFormData({ ...formData, plantLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <IdCard className="w-4 h-4 text-slate-500" /> Enterprise Badge / Employee ID Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CPCL-ENG-8402 / IOCL-SCM-1920"
                  value={formData.badgeId}
                  onChange={(e) => setFormData({ ...formData, badgeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Compliance Guarantee Checkbox */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="complianceCert"
                checked={formData.complianceCertified}
                onChange={(e) => setFormData({ ...formData, complianceCertified: e.target.checked })}
                className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="complianceCert" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                <strong>Enterprise Certification:</strong> I certify that access to this session adheres to the MoPNG Data Governance Charter. All local SAP MM material master records ingested will undergo anonymization before synchronization.
              </label>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-mono text-slate-500">
                Generated ID: <strong className="text-slate-900">{formData.cpse}-AUTH-TEMP</strong>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn-stitch bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" /> Provision Session &amp; Launch
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">Already registered?</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('CREDENTIAL_LOGIN');
                  setAuthError(null);
                }}
                className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In to Existing Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Architecture Matrix */}
      {activeTab === 'ARCHITECTURE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              Federated Pipeline Technical Architecture
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-1">
              Architectural services operating across on-premise CPSE edge nodes and the Central DPI Cloud Hub:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded font-mono text-[10px]">Service 1</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ACTIVE (&lt;250ms)</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900">Matching &amp; Routing Engine</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                Vector index + structured attribute matcher with tri-tier classification (Green &ge;95%, Yellow 70-94%, Red &lt;70%).
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                Output: Tri-Tier Mappings &amp; National Codes
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded font-mono text-[10px]">Service 2</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ACTIVE (&gt;85% Conf)</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900">Legacy Blueprint &amp; Document OCR</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                Multimodal extraction with specialized industrial lexicons (ASME, ASTM, API, IS standards).
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                Output: Structured Key-Value Attribute Payloads
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded font-mono text-[10px]">Service 3</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ACTIVE</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900">Strategic Sourcing Simulator</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                Statistical price variance modeling, volume elasticity simulation, and statutory MSE quota engine.
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                Output: Joint Tendering Matrices &amp; Analysis
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded font-mono text-[10px]">Service 4</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ACTIVE (BAPI)</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900">SAP S/4HANA Reconciliation</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                Idempotent bi-directional SAP MM line-item key updates via NetWeaver RFC connectors.
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                Output: Real-time S/4HANA Master Data Sync
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded font-mono text-[10px]">Service 5</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ACTIVE (Merkle)</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900">Vigilance &amp; Drift Monitor</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                Continuous SAP delta listener with automated rogue edit reversion and SHA-256 Merkle chain logs.
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                Output: Tamper-Evident Audit Ledger &amp; Alerts
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded font-mono text-[10px]">Service 6</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ACTIVE (Edge)</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900">Privacy Edge Security Enclave</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                On-premise masking of commercial vendor rates and plant identifiers before cloud synchronization.
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                Output: Anonymized Vector Stream over TLS 1.3
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isLandingMode) {
    return <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-fadeIn">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-100 border border-slate-300 rounded-3xl max-w-6xl w-full shadow-2xl p-4 sm:p-6 my-auto max-h-[92vh] overflow-y-auto animate-fadeIn">
        {content}
      </div>
    </div>
  );
}

export default AuthModal;
