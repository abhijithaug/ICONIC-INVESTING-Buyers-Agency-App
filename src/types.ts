export type AppSection = 
  | 'dashboard'
  | 'admin-panel'
  | 'admin-management'
  | 'onboarding'
  | 'search'
  | 'analyser'
  | 'negotiation'
  | 'settlement'
  | 'market'
  | 'report'
  | 'documents'
  | 'messages';

export type UserRole = 'admin' | 'client';

export interface UserRoleRecord {
  id?: string;
  email: string;
  role: 'admin' | 'client';
  client_id?: number | string | null;
  created_at?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string; // If role === 'client', points to client profile id
  agencyTitle?: string;
  avatarUrl?: string;
  phone?: string;
}

export type DocumentCategory = 
  | 'Contracts'
  | 'Building & Pest Reports'
  | 'Payment Receipts'
  | 'Finance Documents'
  | 'ID Verification'
  | 'Other'
  | 'Contract of Sale' 
  | 'Building & Pest' 
  | 'Pre-Approval & Finance' 
  | 'Proof of ID & Entity' 
  | 'Settlement & PEXA' 
  | 'Due Diligence & Title';

export const REQUIRED_DOCUMENT_CATEGORIES = [
  'Contracts',
  'Building & Pest Reports',
  'Payment Receipts',
  'Finance Documents',
  'ID Verification',
  'Other'
] as const;

export type StandardDocumentCategory = typeof REQUIRED_DOCUMENT_CATEGORIES[number];

export interface ClientDocument {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedBy: 'admin' | 'client';
  uploadedByName: string;
  uploadedAt: string;
  propertyAddress?: string;
  status: 'Verified' | 'Pending Review' | 'Under Review' | 'Archived';
  downloadUrl?: string;
  notes?: string;
  // Microsoft Azure / OneDrive for Business synchronization metadata
  oneDriveSyncStatus?: 'synced' | 'pending' | 'failed' | 'simulated';
  oneDrivePath?: string;
  oneDriveUrl?: string;
  oneDriveId?: string;
  oneDriveSyncedAt?: string;
  oneDriveError?: string;
  // Google Drive API synchronization metadata (legacy/compat)
  gdriveSyncStatus?: 'synced' | 'pending' | 'failed' | 'simulated';
  gdrivePath?: string;
  gdriveUrl?: string;
  gdriveId?: string;
  gdriveSyncedAt?: string;
  gdriveError?: string;
}

export interface OneDriveSyncSummary {
  totalDocuments: number;
  syncedToOneDrive: number;
  userEmail: string;
  tenantId: string;
  basePath: string;
  lastSyncedAt?: string;
}

export interface GoogleDriveSyncSummary {
  totalDocuments: number;
  syncedToGoogleDrive: number;
  accountEmail: string;
  rootFolderId: string;
  lastSyncedAt?: string;
}

export type InvestmentGoal = 
  | 'Capital Growth'
  | 'High Cashflow Yield'
  | 'Balanced (Growth + Yield)'
  | 'Value-Add / Renovation'
  | 'Subdivision / Development'
  | 'SMSF Super Fund';

export type PropertyType = 
  | 'House & Land'
  | 'Freestanding House'
  | 'Townhouse'
  | 'Duplex / Dual Key'
  | 'Unit / Apartment'
  | 'Commercial / Industrial';

export type PropertyStatus = 
  | 'Shortlisted'
  | 'Under Review'
  | 'Offer Made'
  | 'Passed'
  | 'Discovered'
  | 'Due Diligence'
  | 'Offer Active'
  | 'Under Contract'
  | 'Settled'
  | 'Archived';

export type ShortlistTier = 'Tier 1 - High Priority' | 'Tier 2 - Watchlist' | 'Reviewing' | 'Tier 1 - Priority';

export interface Property {
  id: string;
  clientId?: string; // Links property to specific client shortlist
  address: string;
  suburb: string;
  state: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';
  postcode: string;
  priceGuide: number;
  estMarketValue?: number;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  landSizeM2: number;
  internalAreaM2?: number;
  weeklyRentEst: number;
  grossYield: number; // e.g. 5.4%
  netYield: number;   // e.g. 4.1%
  cashflowWeekly: number; // e.g. +$45/wk after mortgage & outgoings
  capitalGrowthForecast3Yr: number; // e.g. 8.2% p.a.
  desirabilityScore: number; // 0-100
  isOffMarket: boolean;
  daysOnMarket: number;
  imageUrl: string;
  additionalImages?: string[];
  status: PropertyStatus;
  shortlistTier?: ShortlistTier;
  councilRatesPerYear: number;
  waterRatesPerYear: number;
  insurancePerYear: number;
  propertyManagementRate: number; // percentage e.g. 7.5
  agentName: string;
  agentAgency: string;
  agentPhone: string;
  agentEmail: string;
  vendorMotivation?: string;
  notes?: string;
  keyFeatures: string[];
  bpReportId?: string;
  negotiationId?: string;
  settlementId?: string;
}

export type OccupancyPurpose = 'Investment' | 'Owner-Occupied' | 'Both / Future PPOR';
export type PreApprovalStatusType = 'Pre-Approved' | 'Verified Pre-Approved' | 'In Progress' | 'Not Started' | 'Unapproved' | 'Cash Buyer';

export interface ClientProfile {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  accessStatus?: 'active' | 'revoked';
  tempPassword?: string;
  loginEmail?: string;
  assignedAgent?: string;
  lastLogin?: string;
  occupancyPurpose?: OccupancyPurpose;
  budgetMin: number;
  budgetMax: number;
  depositAvailable: number;
  preApprovalStatus: PreApprovalStatusType;
  preApprovalLender?: string;
  preApprovalAmount?: number;
  preApprovalExpiry?: string;
  primaryGoal: InvestmentGoal;
  targetStates: string[];
  targetSuburbs: string[];
  preferredSuburbs?: string[];
  propertyTypes: PropertyType[];
  bedrooms?: string;
  minBedrooms?: number;
  mustHaves?: string[];
  dealBreakers?: string[];
  riskAppetite: 'Conservative' | 'Moderate' | 'Aggressive Growth';
  maxHoldPeriodYears: number;
  smsfPurchase: boolean;
  renovationAppetite: 'Turnkey Only' | 'Minor Cosmetic Ok' | 'Major Renovation / Value-Add';
  createdDate: string;
  strategyBrief?: {
    briefTitle: string;
    executiveSummary: string;
    recommendedSuburbs: { name: string; state: string; rationale: string; targetYield: string }[];
    idealAssetArchetype: string;
    keyMetricsTarget: {
      minGrossYield: string;
      capitalGrowthForecast3Yr: string;
      maxVacancyRate: string;
    };
  };
}

export interface DefectItem {
  id?: string;
  item: string;
  category?: 'Structural Issues' | 'Safety Hazards' | 'Major Defects' | 'Termite Risk' | 'Moisture & Drainage' | 'Minor Defects';
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  estCostMin?: number;
  estCostMax?: number;
  estCostRange: string;
  description: string;
  location?: string;
  recommendation?: string;
}

export interface PestFindings {
  activeTermitesFound: boolean;
  previousActivityFound: boolean;
  barrierInstalled: boolean;
  barrierRecommendation: string;
  timberPestRisk: string;
}

export interface BPReportAnalysis {
  id: string;
  propertyId: string;
  propertyAddress: string;
  reportDate: string;
  inspectorName: string;
  overallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  riskScore: number; // 0 - 100 (100 is flawless)
  headlineSummary: string;
  
  // 6 Required Core Defect Categories
  structuralIssues: DefectItem[];
  safetyHazards: DefectItem[];
  majorDefects: DefectItem[];
  termiteRisk: DefectItem[];
  moistureAndDrainage: DefectItem[];
  minorDefects: DefectItem[];

  // Legacy mappings for backwards compatibility
  structuralDefects?: DefectItem[];
  cosmeticDefects?: DefectItem[];
  
  pestFindings: PestFindings;
  totalEstimatedRepairCost: {
    minimum: number;
    maximum: number;
    formatted: string;
  };

  // Vendor Negotiation Points List & Buyer Risk Summary
  vendorNegotiationPoints: string[];
  buyerRiskSummary: string;

  negotiationStrategy: {
    suggestedPriceReduction: number;
    negotiationPoints: string[];
    suggestedSpecialConditions: string[];
  };
  verdict: string;
}

export type OfferOutcome = 'Won' | 'Lost' | 'Withdrawn' | 'Under Negotiation';

export type OfferStatus = 
  | 'Draft'
  | 'Offer Submitted'
  | 'Under Counter-Offer'
  | 'Accepted'
  | 'Subject to Conditions'
  | 'Unconditional Contract'
  | 'Offer Rejected';

export interface OfferHistoryItem {
  id: string;
  timestamp: string;
  party: 'Buyer (Iconic)' | 'Vendor / Seller' | 'Buyer (Buyers Agent)' | 'Vendor / Selling Agent';
  amount: number;
  terms: string;
  notes?: string;
}

export interface NegotiationStep {
  id: string;
  stepNumber: number;
  date: string;
  time?: string;
  party: 'Buyer (Buyers Agent)' | 'Vendor / Selling Agent' | 'Legal / Conveyancer' | 'Client';
  title: string;
  amount?: number;
  terms?: string;
  conditions?: string;
  notes?: string;
  statusBadge?: string;
}

export interface OfferConditions {
  finance: boolean;
  financeDays: number;
  financeDueDate?: string;
  buildingAndPest: boolean;
  bpDays: number;
  bpDueDate?: string;
  specialConditions: string[];
  customNotes?: string;
}

export interface OfferNegotiation {
  id: string;
  propertyId: string;
  propertyAddress: string;
  propertyImage?: string;
  listPrice: number;
  listedPrice?: number; // legacy alias
  initialOffer: number;
  initialOfferDate: string;
  vendorCounterOffer?: number;
  vendorCounterPrice?: number; // legacy alias
  finalAgreedPrice?: number;
  currentOfferPrice: number;
  outcome: OfferOutcome;
  status: OfferStatus;
  offerConditions: OfferConditions;
  settlementDate: string;
  settlementDays: number; // 30, 45, 60, 90
  depositAmount: number;
  depositPercent: number; // e.g. 10%
  financeDays?: number;    // e.g. 14 or 21
  bpDays?: number;         // e.g. 7 or 14
  specialConditions?: string[];
  vendorMotivation: string;
  sellingAgentName: string;
  sellingAgentPhone: string;
  sellingAgentEmail: string;
  timeline: NegotiationStep[];
  history: OfferHistoryItem[];
  outcomeNotes?: string;
  aiAdvice?: {
    recommendedCounter: number;
    strategyName: string;
    confidenceScore: number;
    rationale: string;
    tacticalRecommendations: string[];
    draftMessageToAgent: string;
    riskLevel: string;
  };
}

export type SettlementSectionKey = 'pre-exchange' | 'exchange' | 'pre-settlement' | 'settlement-day';

export interface SettlementTask {
  id: string;
  title: string;
  description: string;
  section: SettlementSectionKey;
  sectionName: 'Pre-Exchange' | 'Exchange' | 'Pre-Settlement' | 'Settlement Day';
  phase?: 1 | 2 | 3 | 4 | 5; // legacy backward compatibility
  phaseName?: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  assignee: 'Conveyancer' | 'Mortgage Broker' | 'Buyers Agent' | 'Client' | 'Building Inspector' | 'Property Manager' | 'Insurer';
  documentName?: string;
  notes?: string;
}

export interface SettlementRecord {
  id: string;
  clientId?: string; // Links settlement record to client
  propertyId: string;
  propertyAddress: string;
  propertyImage?: string;
  contractDate: string;
  settlementDate: string;
  coolingOffExpiry?: string;
  purchasePrice: number;
  depositPaid: number;
  balanceDueAtSettlement: number;
  daysRemaining: number;
  status: 'In Progress' | 'Ready for Settlement' | 'Settled' | 'Delayed';
  conveyancer: { name: string; firm: string; phone: string; email: string };
  mortgageBroker: { name: string; firm: string; phone: string; email: string };
  propertyManager: { name: string; agency: string; phone: string; email: string };
  tasks: SettlementTask[];
}

export interface NearbySchool {
  name: string;
  type: 'Primary' | 'Secondary' | 'Combined' | 'Private' | 'Public';
  distanceKm: number;
  icseaOrRating?: string;
  notes?: string;
}

export interface NearbyAmenity {
  name: string;
  category: 'Transport' | 'Shopping' | 'Healthcare' | 'Parks & Recreation' | 'Dining';
  distanceKm: number;
  description?: string;
}

export interface SuburbReportData {
  suburb: string;
  state: string;
  postcode: string;
  lgaName?: string;
  medianHousePrice: number;
  medianHousePriceFormatted: string;
  houseGrowth12M: number;
  medianUnitPrice: number;
  medianUnitPriceFormatted: string;
  unitGrowth12M: number;
  avgDaysOnMarket: number;
  auctionClearanceRate: number;
  rentalYieldEstimateHouse: number;
  rentalYieldEstimateUnit: number;
  medianHouseWeeklyRent: number;
  medianUnitWeeklyRent: number;
  vacancyRate: number;
  population: number;
  populationGrowthTrend: string;
  demographicHighlights: string[];
  nearbySchools: NearbySchool[];
  nearbyAmenities: NearbyAmenity[];
  marketDemandRating: 'High Demand' | 'Balanced' | 'Buyer Market';
  capitalGrowthForecast3Yr: number;
  buyersAgentInsight: string;
  searchSources?: Array<{ title: string; url?: string }>;
  dataSource: string;
  lastUpdated: string;
}

export interface ReportPropertyEvaluation {
  property: Property;
  isRecommended: boolean;
  pros: string[];
  cons: string[];
  suitabilityScore: number;
  cashflowProjectionNotes?: string;
}

export interface EstimatedPurchaseCosts {
  purchasePrice: number;
  state: string;
  stampDuty: number;
  legalConveyancingFee: number;
  buildingPestInspectionFee: number;
  mortgageRegistrationTransferFee: number;
  councilWaterAdjustmentsEst: number;
  buyersAgencyFee?: number;
  totalOutlayRequired: number;
  loanAmount: number;
  initialDepositEquity: number;
}

export interface BuyerReportData {
  reportId: string;
  title: string;
  generatedDate: string;
  preparedBy: {
    name: string;
    role: string;
    licenseNo: string;
    agencyName: string;
    phone: string;
    email: string;
  };
  client: ClientProfile;
  executiveBriefSummary: string;
  recommendedPropertyId: string;
  recommendationReasoning: string;
  evaluations: ReportPropertyEvaluation[];
  bpSummary: {
    inspectedPropertyAddress: string;
    overallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    keyFindings: string[];
    structuralNotes: string;
    pestTermiteNotes: string;
    estimatedRepairCosts: number;
    negotiationCreditRecommendation: string;
  };
  estimatedCosts: EstimatedPurchaseCosts;
  nextSteps: Array<{
    step: number;
    title: string;
    description: string;
    timeframe: string;
    responsibleParty: string;
  }>;
}

export interface AdvocateContact {
  name: string;
  role: string;
  agency: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  licenseNumber: string;
  status: 'Online' | 'In Inspection' | 'In Negotiation' | 'Away';
  typicalResponseTime: string;
}

export interface AgentMessage {
  id: string;
  clientId: string;
  sender: 'client' | 'agent';
  senderName: string;
  senderRole?: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  propertyRef?: {
    id: string;
    address: string;
    suburb: string;
    priceGuide: number;
    imageUrl?: string;
  };
  attachment?: {
    name: string;
    type: string;
    size: string;
  };
}

export interface ClientInvitation {
  id: string;
  token: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  invitedBy: string;
  invitedByRole: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired';
  usedAt?: string;
  portalUrl: string;
  emailSubject: string;
  emailPreview: string;
  customMessage?: string;
}
