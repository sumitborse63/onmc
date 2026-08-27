import { useState } from 'react';
import type { UserProfile, UserRole, CPSEEntity } from '../types';
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
} from 'lucide-react';

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'USR-MOPNG-01',
    name: 'Ministry Stakeholder',
    email: 'admin@mopng.gov.in',
    cpse: 'MoPNG',
    plantLocation: 'Shastri Bhawan, New Delhi',
    role: 'MOPNG_GOVERNMENT',
    badgeId: 'GOV-MOPNG-001',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'USR-CPSE-02',
    name: 'CPSE Plant Manager',
    email: 'manager@cpcl.co.in',
    cpse: 'CPCL',
    plantLocation: 'Manali Refinery, Chennai',
    role: 'CPSE_MANAGEMENT',
    badgeId: 'CPCL-MGT-4910',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'USR-PROC-03',
    name: 'Joint Procurement Lead',
    email: 'procurement@indianoil.in',
    cpse: 'IOCL',
    plantLocation: 'Corporate Sourcing, Delhi',
    role: 'PROCUREMENT_TEAM',
    badgeId: 'IOCL-SCM-8821',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'USR-ENG-04',
    name: 'Technical Expert',
    email: 'engineer@ongc.co.in',
    cpse: 'ONGC',
    plantLocation: 'Western Offshore Basin',
    role: 'ENGINEERING_EXPERT',
    badgeId: 'ONGC-ENG-7712',
    avatarColor: 'bg-rose-600',
  },
  {
    id: 'USR-INV-05',
    name: 'Inventory Controller',
    email: 'inventory@sail.co.in',
    cpse: 'SAIL',
    plantLocation: 'Bhilai Steel Plant',
    role: 'INVENTORY_TEAM',
    badgeId: 'SAIL-INV-3011',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'USR-IT-06',
    name: 'SAP Basis Admin',
    email: 'it_audit@bpcl.in',
    cpse: 'BPCL',
    plantLocation: 'Mumbai Refinery',
    role: 'IT_SAP_TEAM',
    badgeId: 'BPCL-IT-9920',
    avatarColor: 'bg-slate-700',
  },
];

interface AuthModalProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export function AuthModal({ onLogin, onClose, isOpen }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'QUICK_PERSONA' | 'SIGNUP'>('QUICK_PERSONA');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpse: 'CPCL' as CPSEEntity,
    plantLocation: '',
    role: 'ENGINEERING_EXPERT' as UserRole,
    badgeId: '',
  });

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newUser: UserProfile = {
      id: `USR-${formData.cpse}-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      email: formData.email,
      cpse: formData.cpse,
      plantLocation: formData.plantLocation || `${formData.cpse} Central Facility`,
      role: formData.role,
      badgeId: formData.badgeId || `${formData.cpse}-AUTH-${Math.floor(Math.random() * 9000 + 1000)}`,
      avatarColor:
        formData.role === 'MOPNG_GOVERNMENT'
          ? 'bg-indigo-600'
          : formData.role === 'CPSE_MANAGEMENT'
          ? 'bg-blue-600'
          : formData.role === 'PROCUREMENT_TEAM'
          ? 'bg-emerald-600'
          : formData.role === 'ENGINEERING_EXPERT'
          ? 'bg-rose-600'
          : formData.role === 'INVENTORY_TEAM'
          ? 'bg-amber-600'
          : 'bg-slate-700',
    };

    onLogin(newUser);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Central Public Sector Enterprise (CPSE) Gateway
                  <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-semibold">
                    MoPNG Secure Auth
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Role-Based Access Control (RBAC) &amp; Enterprise Dashboard Provisioning
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                ✕ Close
              </button>
            )}
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex gap-2 mt-4 bg-slate-800/80 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('QUICK_PERSONA')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'QUICK_PERSONA'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              1-Click Stakeholder Personas
            </button>
            <button
              onClick={() => setActiveTab('SIGNUP')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'SIGNUP'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Custom Enterprise Sign-Up / Register
            </button>
          </div>
        </div>

        {/* Tab 1: 1-Click Stakeholder Personas */}
        {activeTab === 'QUICK_PERSONA' && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-600">
              Select an official CPSE stakeholder persona to instantly unlock their tailored operational cockpit and permissions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_PROFILES.map((profile) => {
                const isMoPNG = profile.role === 'MOPNG_GOVERNMENT';
                const isCPSE = profile.role === 'CPSE_MANAGEMENT';
                const isProc = profile.role === 'PROCUREMENT_TEAM';
                const isEng = profile.role === 'ENGINEERING_EXPERT';
                const isInv = profile.role === 'INVENTORY_TEAM';
                const isIT = profile.role === 'IT_SAP_TEAM';

                return (
                  <button
                    key={profile.id}
                    onClick={() => {
                      onLogin(profile);
                      if (onClose) onClose();
                    }}
                    className={`p-4 rounded-xl border text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 ${
                      isMoPNG
                        ? 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-500'
                        : isCPSE
                        ? 'bg-blue-50/40 border-blue-200 hover:border-blue-500'
                        : isProc
                        ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-500'
                        : isEng
                        ? 'bg-rose-50/40 border-rose-200 hover:border-rose-500'
                        : isInv
                        ? 'bg-amber-50/40 border-amber-200 hover:border-amber-500'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-lg ${profile.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
                        >
                          {profile.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{profile.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {profile.cpse} • {profile.badgeId}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          isMoPNG
                            ? 'bg-indigo-100 text-indigo-800'
                            : isCPSE
                            ? 'bg-blue-100 text-blue-800'
                            : isProc
                            ? 'bg-emerald-100 text-emerald-800'
                            : isEng
                            ? 'bg-rose-100 text-rose-800'
                            : isInv
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {profile.role.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                      <div className="font-medium text-slate-800 truncate">📍 {profile.plantLocation}</div>
                      <div className="text-slate-500 font-mono text-[10px]">
                        {isMoPNG && 'National standardization & efficiency'}
                        {isCPSE && 'Clean, harmonized material masters'}
                        {isProc && 'Faster & cheaper procurement'}
                        {isEng && 'Technically correct equivalence'}
                        {isInv && 'Better stock visibility & optimization'}
                        {isIT && 'Secure ERP integration'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Enterprise Sign-Up Form */}
        {activeTab === 'SIGNUP' && (
          <form onSubmit={handleCustomSubmit} className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5 text-slate-500" /> Full Name &amp; Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> Official Enterprise Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh.k@cpcl.co.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" /> CPSE Enterprise Organization
                </label>
                <select
                  value={formData.cpse}
                  onChange={(e) => setFormData({ ...formData, cpse: e.target.value as CPSEEntity })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="CPCL">CPCL (Chennai Petroleum Corporation Ltd)</option>
                  <option value="IOCL">IOCL (Indian Oil Corporation Ltd)</option>
                  <option value="ONGC">ONGC (Oil and Natural Gas Corporation)</option>
                  <option value="BPCL">BPCL (Bharat Petroleum Corporation Ltd)</option>
                  <option value="HPCL">HPCL (Hindustan Petroleum Corporation Ltd)</option>
                  <option value="SAIL">SAIL (Steel Authority of India Ltd)</option>
                  <option value="NTPC">NTPC (National Thermal Power Corporation)</option>
                  <option value="MoPNG">MoPNG (Ministry of Petroleum &amp; Natural Gas)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <HardHat className="w-3.5 h-3.5 text-slate-500" /> Stakeholder Role / Access Level
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="MOPNG_GOVERNMENT">MoPNG / Government</option>
                  <option value="CPSE_MANAGEMENT">CPSE Management</option>
                  <option value="PROCUREMENT_TEAM">Procurement Team</option>
                  <option value="ENGINEERING_EXPERT">Engineering Expert</option>
                  <option value="INVENTORY_TEAM">Inventory Team</option>
                  <option value="IT_SAP_TEAM">IT / SAP Team</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Refinery / Plant Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manali Refinery / Panipat Complex"
                  value={formData.plantLocation}
                  onChange={(e) => setFormData({ ...formData, plantLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <IdCard className="w-3.5 h-3.5 text-slate-500" /> Enterprise Badge / Employee ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. CPCL-EMP-2041"
                  value={formData.badgeId}
                  onChange={(e) => setFormData({ ...formData, badgeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="submit"
                className="btn-stitch bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Provision Enterprise Dashboard
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
