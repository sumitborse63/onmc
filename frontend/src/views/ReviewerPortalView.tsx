import { useState, useMemo, useEffect } from 'react';
import type { UserProfile } from '../types';
import {
  Search, Filter, Clock, ChevronRight, X, ShieldCheck, ArrowUpRight, ExternalLink,
  Edit3, RotateCcw, Sparkles, Info, Check, BarChart3, Shield, FileText,
  Bookmark, Share2, Cpu, Hash, Activity, FolderTree, GitMerge, SlidersHorizontal,
  FileSpreadsheet, History, FileCode, CheckCircle, HelpCircle, BookOpen,
  FileSearch, MessageSquare, AlertOctagon, ArrowRight, Download, FileCheck,
  Send, Eye, CheckCircle2, FileQuestion, AlertTriangle, CheckSquare, ListChecks, Layers
} from 'lucide-react';

interface ReviewCaseItem {
  id: string;
  title: string;
  subtitle: string;
  priority: 'High' | 'Medium' | 'Low';
  confidence: number;
  candidateCount: number;
  slaText: string;
  status: 'Pending Review' | 'Assigned' | 'In Progress' | 'Needs More Information' | 'Escalated' | 'Approved' | 'Rejected' | 'Submitted to National Registry' | 'Completed';
  assignedReviewer: string;
  proposedNationalCode: string;
  sources: {
    cpse: string;
    code: string;
    sourceType: 'SAP' | 'Legacy OCR' | 'Excel';
    attributes: Record<string, string>;
  }[];
  canonicalProposed: Record<string, string>;
  attributeStates: Record<string, 'MATCH' | 'NORMALIZED' | 'CONFLICT' | 'MISSING'>;
  attributeConfidence: Record<string, number>;
  aiAnalysis: {
    overallSimilarity: number;
    factors: { name: string; score: number; status: 'MATCH' | 'NORMALIZED' | 'CONFLICT' }[];
    recommendation: string;
    explanation: string;
  };
  impact: {
    newNationalCode: string;
    cpsesUnified: string[];
    stockPoolingUnits: string;
    procurementSavings: string;
  };
  standards: { code: string; title: string; link: string; valid: boolean }[];
  sourceDocs: { cpse: string; filename: string; page: string; extract: string; confidence: number; type: string }[];
  notes: { author: string; date: string; text: string }[];
  history: { date: string; author: string; action: string; details: string; oldVal?: string; newVal?: string }[];
  duplicates: { cpse: string; code: string; score: number; confidence: string; status: string }[];
}

const REVIEW_CASES_DATA: ReviewCaseItem[] = [
  {
    id: 'REV-2025-4187',
    title: 'Seamless Carbon Steel Pipe',
    subtitle: '2" NB, SCH 40, ASTM A106 Gr.B',
    priority: 'High',
    confidence: 89,
    candidateCount: 3,
    slaText: 'Review within 24 hrs',
    status: 'In Progress',
    assignedReviewer: 'Er. Rajesh Kulkarni (ONGC)',
    proposedNationalCode: 'NMM-0001842',
    sources: [
      {
        cpse: 'CPCL',
        code: 'CPCL-458921',
        sourceType: 'SAP',
        attributes: {
          'Material Type': 'CS Pipe',
          'Grade': 'Gr. B',
          'Standard': 'ASTM A106',
          'Size': '2 INCH',
          'Nominal Bore': '2 INCH',
          'Schedule': 'SCH 40',
          'Manufacturing': 'SMLS',
          'Material Group': 'Pipe & Tubes',
          'UOM': 'MTR',
          'End Type': 'Plain End',
          'Surface Finish': 'Black',
        },
      },
      {
        cpse: 'IOCL',
        code: 'IOCL-893201',
        sourceType: 'Legacy OCR',
        attributes: {
          'Material Type': 'Carbon Steel Pipe',
          'Grade': 'Grade B',
          'Standard': 'ASTM-A106',
          'Size': '2" NB',
          'Nominal Bore': '2" NB',
          'Schedule': 'SCH40',
          'Manufacturing': 'Seamless',
          'Material Group': 'Pipe',
          'UOM': 'MTR',
          'End Type': 'PE',
          'Surface Finish': 'Plain',
        },
      },
      {
        cpse: 'ONGC',
        code: 'ONGC-771201',
        sourceType: 'Excel',
        attributes: {
          'Material Type': 'MS Pipe',
          'Grade': 'B',
          'Standard': 'ASTM A106',
          'Size': '2 NB',
          'Nominal Bore': '2 NB',
          'Schedule': 'Schedule 40',
          'Manufacturing': 'Seamless',
          'Material Group': 'Pipe & Tubes',
          'UOM': 'MTR',
          'End Type': 'Plain End',
          'Surface Finish': 'Black / Plain',
        },
      }
    ],
    canonicalProposed: {
      'Material Type': 'Carbon Steel Pipe',
      'Grade': 'B (Gr.B)',
      'Standard': 'ASTM A106',
      'Size': '2" NB',
      'Nominal Bore': '2" NB',
      'Schedule': 'SCH 40',
      'Manufacturing': 'Seamless',
      'Material Group': 'Pipe & Tubes',
      'UOM': 'MTR',
      'End Type': 'Plain End',
      'Surface Finish': 'Black / Plain',
      'Functional Characteristics': 'High-Temperature Service',
    },
    attributeStates: {
      'Material Type': 'NORMALIZED',
      'Grade': 'MATCH',
      'Standard': 'MATCH',
      'Size': 'NORMALIZED',
      'Nominal Bore': 'NORMALIZED',
      'Schedule': 'NORMALIZED',
      'Manufacturing': 'NORMALIZED',
      'Material Group': 'MATCH',
      'UOM': 'MATCH',
      'End Type': 'NORMALIZED',
      'Surface Finish': 'NORMALIZED',
      'Functional Characteristics': 'MISSING',
    },
    attributeConfidence: {
      'Material Type': 94,
      'Grade': 100,
      'Standard': 100,
      'Size': 98,
      'Nominal Bore': 98,
      'Schedule': 97,
      'Manufacturing': 99,
      'Material Group': 100,
      'UOM': 100,
      'End Type': 96,
      'Surface Finish': 95,
      'Functional Characteristics': 0,
    },
    aiAnalysis: {
      overallSimilarity: 89,
      factors: [
        { name: 'Description Similarity', score: 92, status: 'NORMALIZED' },
        { name: 'Specification Match', score: 100, status: 'MATCH' },
        { name: 'Material Type Match', score: 94, status: 'NORMALIZED' },
        { name: 'Grade Match', score: 100, status: 'MATCH' },
        { name: 'Dimension Consistency', score: 98, status: 'NORMALIZED' },
        { name: 'Schedule/Rating Match', score: 97, status: 'NORMALIZED' },
        { name: 'Manufacturing Match', score: 99, status: 'MATCH' },
        { name: 'Unit Normalization', score: 100, status: 'MATCH' },
        { name: 'Standard Compatibility', score: 100, status: 'MATCH' },
        { name: 'Attribute Completeness', score: 91, status: 'NORMALIZED' },
      ],
      recommendation: 'Equivalent (Consolidate into NMM-0001842)',
      explanation: 'Textual variances in description ("CS Pipe" vs "MS Pipe") resolve to identical underlying metallurgy (ASTM A106 Gr.B) and dimensions (2" NB SCH 40).',
    },
    impact: {
      newNationalCode: 'NMM-0001842',
      cpsesUnified: ['CPCL', 'IOCL', 'ONGC'],
      stockPoolingUnits: '2,145 Units',
      procurementSavings: '₹12.4 Cr Estimated',
    },
    standards: [
      { code: 'ASTM A106', title: 'Seamless Carbon Steel Pipe for High-Temperature Service', link: '#', valid: true },
      { code: 'ASME B36.10M', title: 'Welded and Seamless Wrought Steel Pipe', link: '#', valid: true },
    ],
    sourceDocs: [
      { cpse: 'CPCL', filename: 'CPCL_SAP_EXTRACT_458921.pdf', page: 'Line 42', extract: 'PIPE CS SMLS 2" SCH40 ASTM A106 GR.B', confidence: 99, type: 'SAP S/4HANA Line' },
      { cpse: 'IOCL', filename: 'IOCL_REFINERY_DWG_893201.tif', page: 'Sheet 4, Block B2', extract: 'CARBON STEEL PIPE SEAMLESS 2 INCH NB SCH 40 A106-B', confidence: 91, type: 'Legacy Scanned Drawing' },
      { cpse: 'ONGC', filename: 'ONGC_ASSET_REGISTER_2024.xlsx', page: 'Row 8912', extract: 'MS PIPE SMLS 2 NB SCH 40 ASTM A106 B', confidence: 95, type: 'Asset Master Excel' },
    ],
    notes: [],
    history: [
      { date: '26 Aug 2025 09:00 AM', author: 'System', action: 'Review Created', details: 'Case auto-generated from Cluster DC-1842' },
      { date: '26 Aug 2025 09:15 AM', author: 'AI Agent', action: 'AI Analysis', details: 'Generated similarity scoring & equivalence recommendation' },
      { date: '26 Aug 2025 10:00 AM', author: 'Workflow Engine', action: 'Assigned', details: 'Assigned to Er. Rajesh Kulkarni (ONGC)' },
    ],
    duplicates: [
      { cpse: 'CPCL', code: 'CPCL-458921', score: 94, confidence: 'HIGH', status: 'Equivalent Candidate' },
      { cpse: 'IOCL', code: 'IOCL-893201', score: 92, confidence: 'HIGH', status: 'Equivalent Candidate' },
      { cpse: 'ONGC', code: 'ONGC-771201', score: 89, confidence: 'HIGH', status: 'Equivalent Candidate' },
    ]
  }
];

export function ReviewerPortalView({
  currentUser,
  onNavigateTab,
}: {
  currentUser?: UserProfile | null;
  onNavigateTab?: (tab: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'ASSIGNED' | 'ESCALATED' | 'COMPLETED'>('QUEUE');
  const [currentCase, setCurrentCase] = useState<ReviewCaseItem | null>(REVIEW_CASES_DATA[0]);

  // Decision State
  const [decision, setDecision] = useState<'EQUIVALENT' | 'NOT_EQUIVALENT' | 'NEEDS_INFO' | null>(null);
  const [rationaleChecks, setRationaleChecks] = useState<Record<string, boolean>>({});
  const [rationaleComment, setRationaleComment] = useState('');

  // Modals
  const [showStandardsModal, setShowStandardsModal] = useState(false);
  const [showSourceDocsModal, setShowSourceDocsModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [showApproveConfirmModal, setShowApproveConfirmModal] = useState(false);
  const [showProvenanceModal, setShowProvenanceModal] = useState(false);
  const [provenanceAttr, setProvenanceAttr] = useState<string | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const isAssignedToMe = currentUser?.name === currentCase?.assignedReviewer || true;

  // Render State Badge
  const renderStateBadge = (state: string) => {
    switch(state) {
      case 'MATCH': return <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> 🟢 MATCH</span>;
      case 'NORMALIZED': return <span className="text-amber-500 font-bold flex items-center gap-1"><GitMerge className="w-3 h-3"/> 🟡 NORMALIZED</span>;
      case 'CONFLICT': return <span className="text-rose-600 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> 🔴 CONFLICT</span>;
      case 'MISSING': return <span className="text-slate-400 font-bold flex items-center gap-1"><Info className="w-3 h-3"/> ⚪ MISSING</span>;
      default: return null;
    }
  };

  const handleApproveAndPush = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowApproveConfirmModal(false);
      if (currentCase) currentCase.status = 'Approved';
      // Provide user feedback that it's submitted
      alert('Success: Technical adjudication approved and pushed to National Registry. Merkle block sealed.');
      if (onNavigateTab) onNavigateTab('REGISTRY');
    }, 1500);
  };

  const getRationaleOptions = () => {
    if (decision === 'EQUIVALENT') {
      return ['Same technical specification', 'Same material grade', 'Same dimensions', 'Same applicable standard', 'Same functional characteristics', 'Different CPSE nomenclature only'];
    }
    if (decision === 'NOT_EQUIVALENT') {
      return ['Different material', 'Different grade', 'Different specification', 'Dimensional conflict', 'Standard conflict', 'Functional difference', 'Insufficient evidence'];
    }
    return [];
  };

  return (
    <div className="space-y-4 max-w-[1750px] mx-auto font-sans">
      {/* HEADER & TOP ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Reviewer Portal — Material Comparison &amp; Attribute Affirmation
            </h1>
            <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1" title="Permissions: Review, Affirm, Escalate">
              <ShieldCheck className="w-3 h-3" /> Engineering Review Authority
            </span>
            <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200">
              Scope: CPCL, IOCL, ONGC
            </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Technical adjudication workspace for cross-CPSE equivalence and canonical standardization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowStandardsModal(true)} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Standards Library
          </button>
          <button onClick={() => setShowAuditModal(true)} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <History className="w-3.5 h-3.5 text-purple-600" /> Review Audit Trail
          </button>
          <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <FolderTree className="w-3.5 h-3.5 text-slate-600" /> Generate Review Evidence Package
          </button>
          <button onClick={() => onNavigateTab && onNavigateTab('REGISTRY')} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <span>View National Registry</span> <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 6 KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Reviews Assigned</div>
          <div className="text-2xl font-bold text-slate-900">184</div>
          <div className="text-[10px] text-slate-400 mt-1">32 high priority</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Approved Today</div>
          <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">67 <CheckCircle2 className="w-5 h-5"/></div>
          <div className="text-[10px] text-emerald-600 mt-1">&uarr; 12% vs yesterday</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">48</div>
          <div className="text-[10px] text-slate-400 mt-1">Active adjudication</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Pending Escalation</div>
          <div className="text-2xl font-bold text-amber-600">12</div>
          <div className="text-[10px] text-slate-400 mt-1">Senior review needed</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Avg. Review Time</div>
          <div className="text-2xl font-bold text-slate-900">14.5 min</div>
          <div className="text-[10px] text-emerald-600 mt-1">&uarr; 18% improvement</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Equivalence Accuracy</div>
          <div className="text-2xl font-bold text-slate-900 flex items-center justify-between">98.6% <ShieldCheck className="w-5 h-5 text-emerald-500"/></div>
          <div className="text-[10px] text-slate-400 mt-1">Post-audit validation</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-280px)] min-h-[800px]">
        {/* LEFT: REVIEW QUEUE */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col h-full overflow-hidden">
          <div className="p-3 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900">Queue</h2>
              <select className="text-[10px] bg-slate-50 border border-slate-200 rounded p-1 font-semibold text-slate-600 focus:outline-blue-500 cursor-pointer">
                <option>Filter: All</option>
                <option>Priority: High</option>
                <option>SLA: At Risk</option>
                <option>Status: Escalated</option>
                <option>Status: Missing Info</option>
              </select>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg text-[10px] font-semibold">
              <button onClick={() => setActiveTab('QUEUE')} className={`flex-1 py-1.5 rounded-md cursor-pointer ${activeTab === 'QUEUE' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500'}`}>Queue (184)</button>
              <button onClick={() => setActiveTab('ASSIGNED')} className={`flex-1 py-1.5 rounded-md cursor-pointer ${activeTab === 'ASSIGNED' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500'}`}>My Assigned (12)</button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search by ID..." className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 pl-8 pr-2 text-xs focus:outline-blue-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
            {REVIEW_CASES_DATA.map((item) => (
              <div
                key={item.id}
                onClick={() => setCurrentCase(item)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${currentCase?.id === item.id ? 'bg-blue-50/50 border-blue-300 shadow-xs' : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-xs'}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-xs font-mono">{item.id}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.priority}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 line-clamp-1">{item.title}</div>
                <div className="text-[10px] text-slate-500 truncate mb-2">{item.subtitle}</div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                  <span className="flex items-center gap-1 text-slate-600"><Layers className="w-3 h-3" /> {item.candidateCount} candidates</span>
                  <span className="flex items-center gap-1 text-amber-600 font-bold"><Clock className="w-3 h-3" /> SLA Risk</span>
                  <span className="flex items-center gap-1 text-blue-600 font-semibold cursor-pointer hover:underline" title="Transfer or Assign Backup"><Share2 className="w-3 h-3" /> Reassign</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Conf: {item.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: TECHNICAL COMPARISON & ANALYSIS */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col h-full overflow-hidden">
          {currentCase ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 font-mono">{currentCase.id}</h2>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">{currentCase.status}</span>
                  </div>
                  <button onClick={() => setShowSourceDocsModal(true)} className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                    <FileSearch className="w-4 h-4" /> View Source Evidence
                  </button>
                </div>
                <h3 className="text-base font-bold text-slate-900">{currentCase.title}</h3>
                <p className="text-xs text-slate-600">{currentCase.subtitle}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                
                {/* Cross-CPSE Nomenclature Summary */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <GitMerge className="w-4 h-4 text-blue-600" /> CROSS-CPSE NOMENCLATURE RECONCILIATION
                  </h4>
                  <div className="flex flex-col items-center justify-center space-y-2 pt-2">
                    <div className="flex gap-4">
                      {currentCase.sources.map(s => (
                        <div key={s.cpse} className="bg-slate-50 border border-slate-200 rounded p-2 text-center shadow-2xs">
                          <div className="text-[9px] font-bold text-slate-400">{s.cpse}</div>
                          <div className="text-[10px] font-mono font-semibold text-slate-800 mt-1">{s.attributes['Material Type']}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-slate-300">&darr;</div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center shadow-2xs w-2/3">
                      <div className="text-[9px] font-bold text-blue-600 uppercase">Potential Canonical Description</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">{currentCase.canonicalProposed['Material Type']}</div>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 p-2 rounded flex items-start gap-2 text-rose-800 mt-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="text-[10px]">
                        <strong>False-Positive Protection</strong>
                        <p>Similar naming does not imply technical equivalence. Always verify grade and application restrictions.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Equivalence Analysis */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    {/* EXISTING CANONICAL MASTER CHECK */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 mb-4">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase border-b border-slate-200 pb-1">
                <FileCheck className="w-4 h-4 text-emerald-600" /> Existing Canonical Master Check
              </h3>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500">No active identical National Code exists.</span>
                  <span className="text-[11px] font-bold text-emerald-700">Safe to create new Canonical Master.</span>
                </div>
                <button className="text-[10px] text-blue-600 font-bold hover:underline">Search Global Registry</button>
              </div>
            </div>

<h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-600" /> POTENTIAL EQUIVALENT MATERIALS ({currentCase.duplicates.length})
                    </h4>
                    {onNavigateTab && (
                      <button onClick={() => onNavigateTab('DUPLICATES')} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
                        View Detailed Duplicate Analysis <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {currentCase.duplicates.map(dup => (
                      <div key={dup.code} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200/60 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 text-white font-bold text-[9px] px-1.5 py-0.5 rounded">{dup.cpse}</span>
                          <span className="font-mono font-bold text-slate-800">{dup.code}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-emerald-600">{dup.status}</span>
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[10px]">{dup.score}% Similar</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Comparison Matrix */}
                <div className="bg-white border border-slate-200 rounded-xl p-0 overflow-hidden shadow-2xs">
                  <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-slate-600" /> TECHNICAL COMPARISON &amp; ATTRIBUTE MATRIX
                    </h4>
                    <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> MATCH</span>
                      <span className="flex items-center gap-1 text-amber-500"><div className="w-2 h-2 rounded-full bg-amber-500"></div> NORMALIZED</span>
                      <span className="flex items-center gap-1 text-rose-600"><div className="w-2 h-2 rounded-full bg-rose-500"></div> CONFLICT</span>
                      <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-slate-400"></div> MISSING</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-sans">
                      <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="p-2.5 w-1/4">Factor</th>
                          <th className="p-2.5 w-1/4 bg-blue-50/30 text-blue-800">Canonical Proposed</th>
                          {currentCase.sources.map(s => (
                            <th key={s.cpse} className="p-2.5 text-slate-700">{s.cpse} ({s.sourceType})</th>
                          ))}
                          <th className="p-2.5 text-right w-24">Match Logic</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(currentCase.canonicalProposed).map(([attr, canonicalVal]) => {
                          const state = currentCase.attributeStates[attr] || 'MISSING';
                          return (
                            <tr key={attr} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-bold text-slate-700 bg-slate-50/30">{attr}</td>
                              <td className="p-2.5 font-bold text-blue-900 font-mono text-[10px] bg-blue-50/10">{canonicalVal}</td>
                              {currentCase.sources.map(s => (
                                <td key={s.cpse} className="p-2.5 text-slate-600 font-mono text-[10px]">{s.attributes[attr] || '—'}</td>
                              ))}
                              <td className="p-2.5 text-right">
                                {renderStateBadge(state)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Analysis & Standards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* AI Analysis */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> AI MATCH ANALYSIS</span>
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">ADVISORY ONLY</span>
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">Overall Similarity Score</span>
                      <span className="text-lg font-bold text-emerald-600">{currentCase.aiAnalysis.overallSimilarity}%</span>
                    </div>
                    <div className="space-y-1.5">
                      {currentCase.aiAnalysis.factors.map(f => (
                        <div key={f.name} className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-600">{f.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{f.score}%</span>
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full ${f.score > 95 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${f.score}%` }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white p-2.5 rounded border border-slate-200 text-[10px] text-slate-700 italic leading-relaxed">
                      <strong>AI Explanation:</strong> {currentCase.aiAnalysis.explanation}
                    </div>
                  </div>

                  {/* Standards Validation */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-blue-600" /> APPLICABLE STANDARDS</span>
                    </h4>
                    <div className="space-y-2">
                      {currentCase.standards.map(s => (
                        <div key={s.code} className="flex justify-between items-start bg-white p-2 rounded border border-slate-200">
                          <div>
                            <div className="font-bold text-slate-900 text-[11px]">{s.code}</div>
                            <div className="text-[9px] text-slate-500 truncate w-32" title={s.title}>{s.title}</div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3"/> Validated</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white p-2.5 rounded border border-slate-200 text-[10px] text-slate-700 space-y-1">
                      <div className="flex justify-between"><span>Specification Match</span><span className="text-emerald-600 font-bold">✓</span></div>
                      <div className="flex justify-between"><span>Grade Compatibility</span><span className="text-emerald-600 font-bold">✓</span></div>
                      <div className="flex justify-between"><span>Dimension Compatibility</span><span className="text-emerald-600 font-bold">✓</span></div>
                      <div className="flex justify-between"><span>Schedule Compatibility</span><span className="text-emerald-600 font-bold">✓</span></div>
                    </div>
                    <button onClick={() => setShowStandardsModal(true)} className="w-full text-center text-[10px] font-bold text-blue-600 hover:bg-blue-50 py-1.5 rounded cursor-pointer transition-colors">
                      View Standard Evidence &rarr;
                    </button>
                    <div className="pt-2 border-t border-slate-200 mt-2">
                      <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">Engineering Guidelines</div>
                      <ul className="text-[10px] text-slate-700 list-disc pl-4 space-y-1">
                        <li>Require mandatory Yield Strength evidence for High-Temp applications.</li>
                        <li>Do not consolidate if End Connections (e.g. PE vs BE) differ.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Impact Preview */}
                <div className="bg-slate-900 rounded-xl p-4 space-y-3 shadow-2xs text-white">
                  <h4 className="text-xs font-bold flex items-center gap-1.5 border-b border-slate-700 pb-2">
                    <Activity className="w-4 h-4 text-sky-400" /> IMPACT PREVIEW (IF APPROVED)
                  </h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Proposed Code</div>
                      <div className="text-xs font-bold text-sky-300 font-mono">{currentCase.impact.newNationalCode}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">CPSEs Unified</div>
                      <div className="text-xs font-bold">{currentCase.impact.cpsesUnified.length} Orgs</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Stock Pooling</div>
                      <div className="text-xs font-bold">{currentCase.impact.stockPoolingUnits}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Strategic Sourcing</div>
                      <div className="text-[10px] text-emerald-400 font-bold">Analysis in Dashboard 4</div>
                    </div>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-slate-200" />
              <div className="text-sm font-semibold">Select a review case from the queue to begin technical adjudication.</div>
            </div>
          )}
        </div>

        {/* RIGHT: ATTRIBUTE AFFIRMATION & DECISION WORKFLOW */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col h-full overflow-hidden">
          {currentCase ? (
            <>
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-blue-600" /> ATTRIBUTE AFFIRMATION
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Confirm or correct extracted canonical attributes.</p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/30">
                {Object.entries(currentCase.canonicalProposed).map(([attr, val]) => {
                  const state = currentCase.attributeStates[attr] || 'MISSING';
                  return (
                    <div key={attr} className="bg-white border border-slate-200 p-2 rounded-lg space-y-1.5 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
                            {attr}
                            {['Material Type', 'Grade', 'Standard', 'Specification'].includes(attr) && (
                                <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1 py-0.5 rounded border border-rose-200 ml-1">CRITICAL</span>
                            )}
                          </span>
                        {renderStateBadge(state)}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={val}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-[11px] font-mono text-slate-900 focus:outline-blue-500"
                        />
                        <button
                          onClick={() => { setProvenanceAttr(attr); setShowProvenanceModal(true); }}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 p-1.5 rounded cursor-pointer transition-colors"
                          title="Inspect Provenance"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              
              {/* COMPLIANCE & CONFLICT GATES */}
              {(() => {
                const missingCount = Object.values(currentCase.attributeStates).filter(s => s === 'MISSING').length;
                const conflictCount = Object.values(currentCase.attributeStates).filter(s => s === 'CONFLICT').length;
                return (
                  <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-center bg-white p-2 border border-slate-200 rounded">
                      <span className="text-[10px] font-bold text-slate-600">Evidence Sufficiency:</span>
                      {missingCount === 0 ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Sufficient</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Partial (Missing {missingCount})</span>
                      )}
                    </div>
                    
                    {conflictCount > 0 && (
                      <div className="bg-rose-50 border border-rose-200 p-2 rounded">
                        <div className="text-[10px] font-bold text-rose-800 flex items-center gap-1 mb-1">
                          <AlertOctagon className="w-3.5 h-3.5" /> TECHNICAL CONFLICTS: {conflictCount}
                        </div>
                        <ul className="text-[9px] text-rose-700 list-disc pl-4">
                          <li>Major: Standard/Specification Mismatch</li>
                        </ul>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 p-2 rounded flex items-start gap-1.5">
                      <History className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-[9px] text-blue-900 leading-tight">
                        <strong>Consistency Check:</strong> 3 similar materials reviewed previously (Consolidated to ASTM A106 Gr.B by Er. Gupta).
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TECHNICAL DECISION PANEL */}
              <div className="p-3 border-t border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <h4 className="text-xs font-bold text-slate-900 mb-2">Technical Decision</h4>
                <div className="space-y-2 mb-3 text-[11px] font-semibold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-emerald-50 transition-colors">
                    <input type="radio" name="decision" value="EQUIVALENT" className="accent-emerald-600" onChange={() => setDecision('EQUIVALENT')} />
                    Equivalent — Create Canonical National Code
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-rose-50 transition-colors">
                    <input type="radio" name="decision" value="NOT_EQUIVALENT" className="accent-rose-600" onChange={() => setDecision('NOT_EQUIVALENT')} />
                    Not Equivalent — Reject Consolidation
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-amber-50 transition-colors">
                    <input type="radio" name="decision" value="NEEDS_INFO" className="accent-amber-600" onChange={() => setDecision('NEEDS_INFO')} />
                    Needs More Information
                  </label>
                </div>

                {decision && decision !== 'NEEDS_INFO' && (
                  <div className="space-y-2 mb-3 bg-slate-50 p-2.5 rounded border border-slate-200 animate-fadeIn">
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Decision Rationale:</div>
                    <div className="space-y-1 text-[10px] text-slate-700 font-medium">
                      {getRationaleOptions().map(opt => (
                        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rationaleChecks[opt] || false}
                            onChange={(e) => setRationaleChecks({...rationaleChecks, [opt]: e.target.checked})}
                            className="rounded border-slate-300 accent-blue-600"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Add mandatory technical rationale comments..."
                      value={rationaleComment}
                      onChange={(e) => setRationaleComment(e.target.value)}
                      className="w-full mt-2 bg-white border border-slate-200 rounded p-2 text-[10px] focus:outline-blue-500"
                      rows={2}
                    />
                    {decision === 'EQUIVALENT' && (
                      <label className="flex items-center gap-1.5 cursor-pointer mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-700 font-bold">
                        <input type="checkbox" className="rounded border-slate-300 accent-blue-600" />
                        Requires Second-Level Approval (Senior Engineering Authority)
                      </label>
                    )}
                  </div>
                )}
                
                {decision === 'NEEDS_INFO' && (
                  <div className="space-y-2 mb-3 bg-amber-50 p-2.5 rounded border border-amber-200 animate-fadeIn text-[10px]">
                    <div className="font-bold text-amber-800 uppercase mb-2 border-b border-amber-200 pb-1 flex items-center gap-1">
                      <FileQuestion className="w-3 h-3"/> Request Information Workflow
                    </div>
                    <label className="block">
                      <span className="text-amber-900 font-semibold mb-0.5 block">Target CPSE:</span>
                      <select className="w-full p-1.5 rounded border border-amber-300 bg-white focus:outline-amber-500">
                        <option>CPCL</option>
                        <option>IOCL</option>
                        <option>ONGC</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-amber-900 font-semibold mb-0.5 block">Required Technical Attribute:</span>
                      <select className="w-full p-1.5 rounded border border-amber-300 bg-white focus:outline-amber-500">
                        <option>Functional Characteristics</option>
                        <option>Surface Finish</option>
                        <option>Manufacturing Standard</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-amber-900 font-semibold mb-0.5 block">Reviewer Notes/Reason:</span>
                      <textarea
                        value={rationaleComment}
                        onChange={(e) => setRationaleComment(e.target.value)}
                        placeholder="Explain exactly what evidence is required..."
                        className="w-full p-1.5 rounded border border-amber-300 bg-white focus:outline-amber-500"
                        rows={2}
                      />
                    </label>
                    <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 rounded mt-1 flex items-center justify-center gap-1">
                      <Send className="w-3 h-3"/> Dispatch Request
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                {/* SAFEGUARD: Blocking logic */}
                {(() => {
                  const hasMissing = Object.values(currentCase.attributeStates).includes('MISSING');
                  const hasConflict = Object.values(currentCase.attributeStates).includes('CONFLICT');
                  const isBlocked = hasMissing || hasConflict;
                  
                  return (
                    <div className="space-y-3">
                      {isBlocked && decision === 'EQUIVALENT' && (
                        <div className="bg-rose-50 border border-rose-200 p-2 rounded text-[10px] text-rose-800 flex gap-2 items-start">
                          <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Approval Blocked</strong>
                            <p className="mt-0.5">Cannot approve while mandatory technical attributes are MISSING or in CONFLICT. Escalate or override with authority.</p>
                          </div>
                        </div>
                      )}
                      <button
                        disabled={!decision || rationaleComment.trim().length === 0 || (decision === 'EQUIVALENT' && isBlocked)}
                        onClick={() => { if(decision === 'EQUIVALENT') setShowApproveConfirmModal(true); }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        <span>Approve &amp; Push to National Registry</span> <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })()}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 rounded-lg text-xs cursor-pointer transition-colors">
                      Save as Draft
                    </button>
                    <button onClick={() => setShowEscalateModal(true)} className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold py-1.5 rounded-lg text-xs cursor-pointer flex justify-center items-center gap-1 transition-colors">
                      <AlertTriangle className="w-3 h-3" /> Escalate
                    </button>
                    <button className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold py-1.5 rounded-lg text-xs cursor-pointer flex justify-center items-center gap-1 transition-colors" title="Requires Administrator or Senior Authority">
                      <RotateCcw className="w-3 h-3" /> Reopen Review
                    </button>
                  </div>
                </div>

              {/* Inline Engineering Notes */}
              <div className="p-3 border-t border-slate-200 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" /> Engineering Collaboration
                </h4>
                <textarea
                  placeholder="Add internal notes, mention (@) other engineers..."
                  className="w-full bg-white border border-slate-200 rounded p-2 text-[10px] focus:outline-blue-500 mb-2"
                  rows={2}
                />
                <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-1 px-3 rounded text-[10px] cursor-pointer shadow-2xs">
                  Save Note
                </button>
              </div>
              </div>
            </>
          ) : (
            <div className="flex-1 bg-slate-50/50" />
          )}
        </div>
      </div>

      {/* ALL MODALS BELOW */}

      {/* 1. Attribute Provenance Modal */}
      {showProvenanceModal && currentCase && provenanceAttr && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-xs font-sans space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" /> Attribute Provenance: {provenanceAttr}
              </h3>
              <button onClick={() => setShowProvenanceModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex justify-between items-center">
                <span className="font-bold text-blue-900 uppercase">Canonical Value Proposed:</span>
                <span className="font-mono text-sm font-bold text-blue-700 bg-white px-2 py-1 rounded shadow-xs">{currentCase.canonicalProposed[provenanceAttr]}</span>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Source System Extraction Traceability:</div>
                {currentCase.sources.map(s => {
                  const rawVal = s.attributes[provenanceAttr] || 'MISSING';
                  const canonicalVal = currentCase.canonicalProposed[provenanceAttr];
                  const state = rawVal === canonicalVal ? 'MATCH' : (rawVal !== 'MISSING' ? 'NORMALIZED' : 'MISSING');
                  
                  return (
                    <div key={s.cpse} className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col gap-2 shadow-2xs">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{s.cpse}</span>
                          <span className="font-mono font-bold text-slate-700 text-[10px]">{s.code}</span>
                          <span className="text-slate-400 text-[10px]">({s.sourceType})</span>
                        </div>
                        {renderStateBadge(state)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-2 rounded border border-slate-100">
                        <div>
                          <div className="text-[9px] text-slate-500 font-semibold mb-0.5">Original Raw Value:</div>
                          <div className="font-mono text-[11px] text-slate-800 font-bold">{rawVal}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-500 font-semibold mb-0.5">Extraction Confidence:</div>
                          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3"/> {s.sourceType === 'SAP' ? '100%' : '94%'} Verified
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setShowProvenanceModal(false)} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer">
                Close Provenance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Review Audit Trail Modal */}
      {showAuditModal && currentCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-xs font-sans space-y-4 animate-scaleUp max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-600" /> Immutable Review Audit Trail
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">Chronological record of all adjudication actions for {currentCase.id}</p>
              </div>
              <button onClick={() => setShowAuditModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {currentCase.history.map((evt, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wide border border-purple-200">
                      {evt.action}
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono">{evt.date}</span>
                  </div>
                  <div className="text-slate-800 text-[11px] font-medium leading-relaxed">{evt.details}</div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                    Actor: <strong>{evt.author}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 shrink-0">
              <button onClick={() => setShowAuditModal(false)} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer">
                Close Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Source Evidence Viewer Modal */}
      {showSourceDocsModal && currentCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-3xl w-full p-6 text-xs font-sans space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Source Documents &amp; Evidence ({currentCase.id})</h3>
                <p className="text-[10px] text-slate-500">Inspect OCR bounding boxes and raw ERP text records</p>
              </div>
              <button onClick={() => setShowSourceDocsModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {currentCase.sourceDocs.map(doc => (
                <div key={doc.cpse} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 text-white font-bold text-[9px] px-1.5 py-0.5 rounded">{doc.cpse}</span>
                      <span className="font-bold text-slate-800 font-mono text-[11px]">{doc.filename}</span>
                    </div>
                    <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded">Confidence: {doc.confidence}%</span>
                  </div>
                  <div className="bg-white p-3 rounded border border-slate-200 font-mono text-xs text-slate-800 shadow-inner overflow-x-auto whitespace-pre">
                    {doc.extract}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                    <span>Source Type: {doc.type}</span>
                    <span>Location: {doc.page}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              {onNavigateTab ? (
                <button onClick={() => onNavigateTab('OCR')} className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer">
                  <Eye className="w-4 h-4"/> Inspect Full Legacy OCR in Dashboard 5 &rarr;
                </button>
              ) : <div/>}
              <button onClick={() => setShowSourceDocsModal(false)} className="px-5 py-2 bg-slate-900 text-white rounded-lg font-bold cursor-pointer">
                Close Evidence Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Standards Library Modal */}
      {showStandardsModal && currentCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-3xl w-full p-6 text-xs font-sans space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> National Engineering Standards Library
              </h3>
              <button onClick={() => setShowStandardsModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {[
                { org: 'ASME', code: 'ASME B36.10M', desc: 'Welded and Seamless Wrought Steel Pipe', status: 'Active' },
                { org: 'ASTM', code: 'ASTM A106 / A106M', desc: 'Seamless Carbon Steel Pipe for High-Temperature Service', status: 'Active' },
                { org: 'ASME', code: 'ASME B16.34', desc: 'Valves - Flanged, Threaded, and Welding End', status: 'Active' },
                { org: 'ASME', code: 'ASME B16.20', desc: 'Metallic Gaskets for Pipe Flanges', status: 'Active' },
                { org: 'IS', code: 'IS 2062', desc: 'Hot Rolled Medium and High Tensile Structural Steel', status: 'Active' }
              ].map(s => (
                <div key={s.code} className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900 text-sm">{s.code}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">{s.status}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] mb-3">{s.desc}</div>
                  <button className="text-blue-600 font-bold text-[10px] flex items-center gap-1 hover:underline">
                    View Full Specification PDF <ExternalLink className="w-3 h-3"/>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setShowStandardsModal(false)} className="px-5 py-2 bg-slate-900 text-white rounded-lg font-bold cursor-pointer">
                Close Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Escalate Modal */}
      {showEscalateModal && currentCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs font-sans space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Escalate Review Case</h3>
              </div>
              <button onClick={() => setShowEscalateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Escalate case <strong>{currentCase.id}</strong> to Senior Engineering Authority for dispute resolution, conflicting standards, or missing evidence.
              </p>

              <label className="block space-y-1">
                <span className="text-slate-700 font-bold">Escalation Reason:</span>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-amber-500 cursor-pointer">
                  <option>Critical attribute conflict</option>
                  <option>Conflicting standard</option>
                  <option>Missing evidence / documents</option>
                  <option>Low technical confidence</option>
                  <option>Other technical dispute</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-slate-700 font-bold">Reviewer Comments:</span>
                <textarea
                  rows={3}
                  placeholder="Explain why technical consensus could not be reached..."
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-amber-500"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowEscalateModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer">
                Cancel
              </button>
              <button disabled={!escalateReason.trim()} onClick={() => setShowEscalateModal(false)} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50">
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Approve Confirmation Modal */}
      {showApproveConfirmModal && currentCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-xs font-sans space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Confirm &amp; Submit to National Registry</h3>
              </div>
              <button onClick={() => setShowApproveConfirmModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-800 text-[11px] font-semibold text-center uppercase tracking-wide">
                Decision: {decision === 'EQUIVALENT' ? 'Equivalent — Authorize National Code' : 'N/A'}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Proposed Canonical Material:</span>
                  <strong className="text-blue-700 font-mono font-bold text-[11px]">{currentCase.canonicalProposed['Material Type']}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Affected CPSEs:</span>
                  <strong className="text-slate-900">{currentCase.sources.map((s) => s.cpse).join(', ')}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Reviewing Authority:</span>
                  <strong className="text-slate-900">{currentUser?.name || 'Er. Rajesh Kulkarni'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Technical Rationale:</span>
                  <div className="text-right">
                    {Object.keys(rationaleChecks).filter(k => rationaleChecks[k]).map(k => (
                      <div key={k} className="text-slate-900 font-medium text-[10px]">{k}</div>
                    ))}
                  </div>
                </div>
                {rationaleComment && (
                  <div className="bg-white p-2 rounded border border-slate-200 mt-2 text-[10px] text-slate-600 italic">
                    "{rationaleComment}"
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 leading-relaxed pt-1">
                By confirming, you authorize this technical adjudication. The affirmed canonical attributes will be cryptographically hashed and appended to the SHA-256 Merkle Ledger. The authoritative National Material Master will immediately become discoverable in <strong>Dashboard [2] National Registry</strong>.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowApproveConfirmModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer">
                Cancel
              </button>
              <button onClick={handleApproveAndPush} disabled={isProcessing} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                {isProcessing ? 'Recording Ledger Proof...' : 'Confirm & Push to Registry'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

