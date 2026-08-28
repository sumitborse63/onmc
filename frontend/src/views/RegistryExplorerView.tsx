import { useState, useMemo } from 'react';
import type { MaterialRecord, NationalMaterialMaster, UserProfile } from '../types';
import {
  Search,
  Download,
  Hash,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Globe,
} from 'lucide-react';
import { uploadCSV, getExportCSVUrl } from '../services/api';

interface RegistryExplorerProps {
  masters: NationalMaterialMaster[];
  records: MaterialRecord[];
  currentUser?: UserProfile | null;
}

export function RegistryExplorerView({ masters, records, currentUser }: RegistryExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCPSE, setSelectedCPSE] = useState<string>(currentUser?.cpse === 'MoPNG' ? 'ALL' : (currentUser?.cpse || 'ALL'));
  const [selectedMaster, setSelectedMaster] = useState<NationalMaterialMaster | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredMasters = useMemo(() => {
    return masters.filter((m) => {
      const matchesSearch =
        m.nationalCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.standardizedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.materialGrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.unspscCode.includes(searchQuery);

      const matchesCPSE =
        selectedCPSE === 'ALL' || m.participatingCPSEs.includes(selectedCPSE);

      return matchesSearch && matchesCPSE;
    });
  }, [masters, searchQuery, selectedCPSE]);

  const mappedLegacyRecords = useMemo(() => {
    if (!selectedMaster) return [];
    return records.filter(
      (r) =>
        r.groundTruthNationalCode === selectedMaster.nationalCode ||
        r.existingClassificationCode === selectedMaster.unspscCode
    );
  }, [records, selectedMaster]);

  const handleExportCSV = () => {
    window.open(getExportCSVUrl(), '_blank');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadCSV(file);
      if (data) {
        setUploadStatus(`Successfully Ingested ${data.importedCount} Material Records! Assigned Common National Codes & Synced to Ledger.`);
        setTimeout(() => {
          setUploadStatus(null);
          setShowUploadModal(false);
          window.location.reload();
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                National Unified Material Master Registry (1:N Explorer)
              </h2>
              {currentUser && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  currentUser.role === 'MOPNG_GOVERNMENT'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {currentUser.role === 'MOPNG_GOVERNMENT' ? 'SOVEREIGN DPI OVERSIGHT MODE' : `${currentUser.cpse} CATALOG VIEW`}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              One Nation – One Material Code persistent mapping table maintaining full backward traceability
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-stitch bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" /> Bulk CSV Ingestion
          </button>
          <button
            onClick={handleExportCSV}
            className="btn-stitch bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export SAP Catalog (CSV)
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Common National Code, Nomenclature, UNSPSC, or Material Grade (e.g. SS316, 150#, CF8M)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-rose-500"
          />
        </div>

        {/* CPSE Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
          <span className="text-slate-500 mr-1 text-[11px]">Filter CPSE:</span>
          {['ALL', 'CPCL', 'IOCL', 'ONGC', 'BPCL', 'HPCL', 'SAIL'].map((cpse) => (
            <button
              key={cpse}
              onClick={() => setSelectedCPSE(cpse)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                selectedCPSE === cpse
                  ? 'bg-rose-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cpse}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Master List (Left) vs Mapped Legacy Codes (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: National Master List */}
        <div className="col-span-7 space-y-2">
          <div className="flex justify-between items-center px-1 text-xs font-mono text-slate-500">
            <span>Harmonized Masters ({filteredMasters.length})</span>
            <span>Click row to view 1:N legacy mappings</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredMasters.map((master) => (
              <div
                key={master.nationalCode}
                onClick={() => setSelectedMaster(master)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedMaster?.nationalCode === master.nationalCode
                    ? 'bg-rose-50/40 border-rose-400 shadow-xs ring-1 ring-rose-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        {master.nationalCode}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        UNSPSC: {master.unspscCode}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 mt-1.5">
                      {master.standardizedName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {master.totalMappedSKUs} Mapped SKUs
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-600">
                  <div>Grade: <strong className="text-slate-900">{master.materialGrade}</strong></div>
                  <div>Rating: <strong className="text-slate-900">{master.pressureRating}</strong></div>
                  <div>Dimension: <strong className="text-slate-900">{master.dimensionSpec}</strong></div>
                  <div>UoM: <strong className="text-slate-900">{master.baseUoM}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Master 1:N Mapping Detail */}
        <div className="col-span-5">
          {selectedMaster ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 sticky top-16">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-900 uppercase">
                  1:N Traceability Matrix
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedMaster.nationalCode}
                </span>
              </div>

              {/* Master Snapshot Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2 text-xs font-mono">
                <div className="text-slate-500 text-[11px] uppercase">Standardized Specification:</div>
                <div className="font-bold text-slate-900">{selectedMaster.standardizedName}</div>
                <div className="flex justify-between text-[11px] pt-2 border-t border-slate-200 text-slate-600">
                  <span>Price Range:</span>
                  <span className="font-bold text-slate-900">
                    ₹{selectedMaster.lowestUnitPriceINR.toLocaleString()} - ₹{selectedMaster.highestUnitPriceINR.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Mapped Legacy CPSE Codes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
                  Mapped Legacy CPSE Material Numbers ({mappedLegacyRecords.length > 0 ? mappedLegacyRecords.length : selectedMaster.totalMappedSKUs}):
                </span>

                <div className="space-y-2 max-h-[300px] overflow-y-auto font-mono text-xs">
                  {mappedLegacyRecords.length > 0 ? (
                    mappedLegacyRecords.map((rec) => (
                      <div
                        key={rec.materialCodeCPSE}
                        className="bg-slate-50 border border-slate-200/70 p-2.5 rounded-lg space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{rec.materialCodeCPSE}</span>
                          <span className="bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {rec.cpseName} ({rec.plantLocation})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1">
                          "{rec.materialDescriptionRaw}"
                        </p>
                      </div>
                    ))
                  ) : (
                    selectedMaster.participatingCPSEs.map((cpse: string, idx: number) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/70 p-2.5 rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-900">MAT-{selectedMaster.nationalCode.slice(-4)}-{idx+1}</span>
                          <span className="bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {cpse} Plant
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SHA-256 Ledger Stamp */}
              <div className="bg-slate-900 text-white rounded-xl p-3 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <Hash className="w-3.5 h-3.5" /> Cryptographic Integrity Proof
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  SHA-256: {selectedMaster.sha256Proof}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl shadow-xs text-xs text-slate-500 font-mono">
              Select a Common National Material Master on the left to inspect its complete 1:N legacy CPSE cross-referencing matrix.
            </div>
          )}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 max-w-lg w-full font-mono text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-rose-600" />
                Bulk CPSE Material Master CSV Ingestion (Agent 2)
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadStatus ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="font-bold">{uploadStatus}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600 font-sans text-xs">
                  Upload raw material master CSV files from CPCL, IOCL, ONGC, or other CPSE ERP instances to execute automated Agent 1 & Agent 6 batch deduplication and Common National Code generation.
                </p>

                <div className="border-2 border-dashed border-slate-300 hover:border-rose-500 rounded-xl p-6 text-center bg-slate-50 transition-colors">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold shadow-xs hover:bg-rose-500 inline-block">
                      {isUploading ? 'Processing AI Pipeline...' : 'Choose CPSE CSV File'}
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Supports .CSV with columns: material_code_cpse, material_description_raw, plant_location, avg_unit_price_inr
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
