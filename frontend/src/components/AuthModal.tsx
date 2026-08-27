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
    id: 'USR-CPCL-01',
    name: 'Er. R. Sundaram',
    email: 'r.sundaram@cpcl.co.in',
    cpse: 'CPCL',
    plantLocation: 'Manali Refinery, Chennai',
    role: 'PLANT_ENGINEER',
    badgeId: 'CPCL-TECH-4910',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'USR-IOCL-02',
    name: 'Dr. Neha Verma',
    email: 'verman@indianoil.in',
    cpse: 'IOCL',
    plantLocation: 'Corporate Procurement, New Delhi',
    role: 'PROCUREMENT_OFFICER',
    badgeId: 'IOCL-SCM-8821',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'USR-MOPNG-03',
    name: 'Shri Amitabh Kant (CVO)',
    email: 'cvo-oversight@mopng.gov.in',
    cpse: 'MoPNG',
    plantLocation: 'Shastri Bhawan, New Delhi',
    role: 'VIGILANCE_AUDITOR',
    badgeId: 'GOI-CVO-0019',
    avatarColor: 'bg-rose-600',
  },
  {
    id: 'USR-ONGC-04',
    name: 'Sanjay Deshmukh',
    email: 'deshmukh_s@ongc.co.in',
    cpse: 'ONGC',
    plantLocation: 'Western Offshore Basin, Mumbai',
    role: 'MASTER_DATA_ADMIN',
    badgeId: 'ONGC-ERP-7712',
    avatarColor: 'bg-amber-600',
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
    role: 'PLANT_ENGINEER' as UserRole,
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
        formData.role === 'PLANT_ENGINEER'
          ? 'bg-blue-600'
          : formData.role === 'PROCUREMENT_OFFICER'
          ? 'bg-emerald-600'
          : formData.role === 'VIGILANCE_AUDITOR'
          ? 'bg-rose-600'
          : 'bg-amber-600',
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
                const isEng = profile.role === 'PLANT_ENGINEER';
                const isProc = profile.role === 'PROCUREMENT_OFFICER';
                const isVig = profile.role === 'VIGILANCE_AUDITOR';

                return (
                  <button
                    key={profile.id}
                    onClick={() => {
                      onLogin(profile);
                      if (onClose) onClose();
                    }}
                    className={`p-4 rounded-xl border text-left transition-all hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 ${
                      isEng
                        ? 'bg-blue-50/40 border-blue-200 hover:border-blue-500'
                        : isProc
                        ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-500'
                        : isVig
                        ? 'bg-rose-50/40 border-rose-200 hover:border-rose-500'
                        : 'bg-amber-50/40 border-amber-200 hover:border-amber-500'
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
                          isEng
                            ? 'bg-blue-100 text-blue-800'
                            : isProc
                            ? 'bg-emerald-100 text-emerald-800'
                            : isVig
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {profile.role.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                      <div className="font-medium text-slate-800 truncate">📍 {profile.plantLocation}</div>
                      <div className="text-slate-500 font-mono truncate text-[10px]">
                        Primary Cockpit: {isEng ? 'Reviewer Adjudication Queue' : isProc ? 'Strategic Sourcing & PDI' : isVig ? 'Vigilance & Drift Ledger' : '1:N National Catalog'}
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
                  <option value="PLANT_ENGINEER">Plant Materials Reviewer (Technical)</option>
                  <option value="PROCUREMENT_OFFICER">Central Sourcing Director (Procurement)</option>
                  <option value="VIGILANCE_AUDITOR">Chief Vigilance Officer / CAG Auditor</option>
                  <option value="MASTER_DATA_ADMIN">Master Data &amp; ERP Admin</option>
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
