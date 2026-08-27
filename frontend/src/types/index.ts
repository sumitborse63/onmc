export type CPSEEntity = 'CPCL' | 'IOCL' | 'ONGC' | 'BPCL' | 'HPCL' | 'SAIL' | 'NTPC' | 'MoPNG' | 'CVO_AUDIT';

export type UserRole =
  | 'MOPNG_GOVERNMENT'
  | 'CPSE_MANAGEMENT'
  | 'PROCUREMENT_TEAM'
  | 'ENGINEERING_EXPERT'
  | 'INVENTORY_TEAM'
  | 'IT_SAP_TEAM';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cpse: CPSEEntity;
  plantLocation: string;
  role: UserRole;
  badgeId: string;
  avatarColor: string;
}

export interface MaterialRecord {
  rowId: number;
  cpseName: string;
  materialCodeCPSE: string;
  materialDescriptionRaw: string;
  specificationRaw: string;
  unitOfMeasurement: string;
  existingClassificationCode: string;
  plantLocation: string;
  annualProcuredQty: number;
  avgUnitPriceINR: number;
  vendorName: string;
  groundTruthClusterId: string;
  groundTruthStandardName: string;
  groundTruthNationalCode: string;
  // Computed Agent 1 Attributes
  extractedGrade?: string;
  extractedDimension?: string;
  extractedPressure?: string;
  extractedStandard?: string;
  vectorSimilarity?: number;
  attributeSimilarity?: number;
  finalConfidence?: number;
  triageTier?: 'GREEN' | 'YELLOW' | 'RED';
  status?: 'SYNCED' | 'PENDING_REVIEW' | 'NEW_CODE' | 'REJECTED';
}

export interface NationalMaterialMaster {
  nationalCode: string;
  standardizedName: string;
  unspscCode: string;
  unspscCategory: string;
  materialGrade: string;
  dimensionSpec: string;
  pressureRating: string;
  standardSpec: string;
  baseUoM: string;
  totalMappedSKUs: number;
  participatingCPSEs: string[];
  lowestUnitPriceINR: number;
  highestUnitPriceINR: number;
  medianUnitPriceINR: number;
  annualTotalVolume: number;
  sha256Proof: string;
}

export interface XAIAttributeDiff {
  attributeName: string;
  localSpec: string;
  nationalSpec: string;
  isMatch: boolean;
  matchScore: string;
  weight: number;
}

export interface AdjudicationCandidate {
  id: string;
  localRecord: MaterialRecord;
  candidateMaster: NationalMaterialMaster;
  finalConfidence: number;
  vectorScore: number;
  attributeScore: number;
  radarScores: {
    dimensions: number;
    materialGrade: number;
    pressureClass: number;
    standardCode: number;
    uomConsistency: number;
  };
  xaiDiffs: XAIAttributeDiff[];
  historicalRates: {
    cpseName: string;
    rate: number;
    annualQty: number;
  }[];
  potentialSavingsPercent: number;
  potentialSavingsINR: number;
}

export interface AuditLedgerBlock {
  blockIndex: number;
  timestamp: string;
  previousHash: string;
  currentHash: string;
  actor: string;
  actionType: 'AUTO_LINK' | 'MANUAL_APPROVE' | 'SAP_SYNC' | 'DRIFT_DETECTED' | 'NEW_CODE_GEN';
  nationalCode: string;
  cpseCode: string;
  cpseName: string;
  payloadSummary: string;
}

export interface DriftAlertItem {
  id: string;
  timestamp: string;
  cpseName: string;
  plantLocation: string;
  materialCode: string;
  nationalCode: string;
  severity: 'LEVEL_1_COSMETIC' | 'LEVEL_2_TOLERANCE' | 'LEVEL_3_ROGUE_OVERRIDE';
  driftDescription: string;
  fieldAltered: string;
  originalValue: string;
  driftedValue: string;
  status: 'ACTIVE_ALERT' | 'REVERTED' | 'APPROVED_CHANGE';
}

export interface OCRInspectionItem {
  id: string;
  filename: string;
  pageNumber: number;
  rawCropText: string;
  confidenceScore: number;
  flaggedLowConfidence: boolean;
  extractedJSON: Record<string, string>;
  spellCorrections: {
    rawToken: string;
    correctedToken: string;
    dictionaryMatch: string;
    confidence: number;
  }[];
}
