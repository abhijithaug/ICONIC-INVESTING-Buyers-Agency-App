import { Property, ClientProfile, BPReportAnalysis, OfferNegotiation, SettlementRecord } from '../types';

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'client-1',
    name: 'Marcus & Elena Vance',
    fullName: 'Marcus Vance & Elena Vance',
    email: 'marcus.vance@investor.com.au',
    phone: '+61 412 890 341',
    occupancyPurpose: 'Investment',
    budgetMin: 700000,
    budgetMax: 920000,
    depositAvailable: 220000,
    preApprovalStatus: 'Verified Pre-Approved',
    preApprovalLender: 'Macquarie Bank',
    preApprovalAmount: 950000,
    preApprovalExpiry: '2026-11-15',
    primaryGoal: 'Balanced (Growth + Yield)',
    targetStates: ['QLD', 'WA'],
    targetSuburbs: ['Moreton Bay Region (QLD)', 'Mandurah (WA)', 'Logan City (QLD)', 'Rockingham (WA)'],
    preferredSuburbs: ['Kallangur', 'Strathpine', 'Baldivis', 'Meadow Springs', 'Petrie'],
    propertyTypes: ['Freestanding House', 'Duplex / Dual Key'],
    bedrooms: '4+',
    minBedrooms: 4,
    mustHaves: [
      'Double Lockup Garage',
      'Side Access for Trailer/Boat',
      'High Rental Yield (>5.2%)',
      'Brick & Tile Construction',
      'Granny Flat Potential'
    ],
    dealBreakers: [
      'Flood Prone Zone (1-in-100yr)',
      'Main Arterial Road / High Noise',
      'High-Voltage Power Lines',
      'Asbestos Roof / Wall Panels',
      'High Body Corporate Fees'
    ],
    riskAppetite: 'Moderate',
    maxHoldPeriodYears: 10,
    smsfPurchase: false,
    renovationAppetite: 'Minor Cosmetic Ok',
    createdDate: '2026-08-10',
    accessStatus: 'active',
    tempPassword: 'client123',
    loginEmail: 'marcus.vance@investor.com.au',
    assignedAgent: 'Damian Sterling',
    strategyBrief: {
      briefTitle: 'Marcus & Elena - Balanced QLD/WA High-Growth Portfolio Strategy',
      executiveSummary: 'Targeting 4-bed brick dwellings in high-infrastructure growth corridors across South East Queensland and Greater Perth with positive cashflow cushion and sub-1.2% rental vacancy rates.',
      recommendedSuburbs: [
        { name: 'Kallangur / Strathpine', state: 'QLD', rationale: 'Petrie University campus precinct, train connectivity, high owner-occupier ratio.', targetYield: '5.2% - 5.8%' },
        { name: 'Baldivis / Meadow Springs', state: 'WA', rationale: 'Strong population growth, sub-$650k entry point, resource sector migration tailwind.', targetYield: '5.9% - 6.6%' }
      ],
      idealAssetArchetype: '4-bed, 2-bath, 2-car on 600sqm+ block built post-2005 with dual living or granny flat potential.',
      keyMetricsTarget: {
        minGrossYield: '5.2%',
        capitalGrowthForecast3Yr: '7.8% p.a.',
        maxVacancyRate: '1.2%'
      }
    }
  },
  {
    id: 'client-2',
    name: 'Dr. Sophia Thornton (SMSF)',
    fullName: 'Dr. Sophia Thornton',
    email: 's.thornton@medicalinvest.com',
    phone: '+61 405 671 229',
    occupancyPurpose: 'Investment',
    budgetMin: 1100000,
    budgetMax: 1650000,
    depositAvailable: 450000,
    preApprovalStatus: 'Verified Pre-Approved',
    preApprovalLender: 'NAB Private Wealth',
    preApprovalAmount: 1700000,
    preApprovalExpiry: '2026-12-01',
    primaryGoal: 'High Cashflow Yield',
    targetStates: ['QLD', 'SA', 'NSW'],
    targetSuburbs: ['Toowoomba (QLD)', 'Salisbury (SA)', 'Newcastle Fringe (NSW)'],
    preferredSuburbs: ['Toowoomba East', 'Salisbury North', 'Mayfield', 'Geebung'],
    propertyTypes: ['Duplex / Dual Key', 'Commercial / Industrial', 'Townhouse'],
    bedrooms: '3+',
    minBedrooms: 3,
    mustHaves: [
      'Dual Income / Dual Tenancy',
      'Net Yield > 5.5%',
      'Low Maintenance Grounds',
      'SMSF Compliant Entity Structure',
      'Long-term Lease in Place'
    ],
    dealBreakers: [
      'Single Industry Town / High Volatility',
      'Major Structural Movement',
      'Heritage Listing Restrictions',
      'Severe Strata Defects / Special Levies'
    ],
    riskAppetite: 'Conservative',
    maxHoldPeriodYears: 15,
    smsfPurchase: true,
    renovationAppetite: 'Turnkey Only',
    createdDate: '2026-08-18',
    accessStatus: 'active',
    tempPassword: 'client123',
    loginEmail: 's.thornton@medicalinvest.com',
    assignedAgent: 'Damian Sterling'
  },
  {
    id: 'client-3',
    name: "Liam & Chloe O'Connor",
    fullName: "Liam O'Connor & Chloe O'Connor",
    email: 'liam.oconnor@investor.com.au',
    phone: '+61 411 223 344',
    occupancyPurpose: 'Investment',
    budgetMin: 620000,
    budgetMax: 780000,
    depositAvailable: 160000,
    preApprovalStatus: 'Verified Pre-Approved',
    preApprovalLender: 'ANZ Commercial & Retail',
    preApprovalAmount: 800000,
    preApprovalExpiry: '2026-11-30',
    primaryGoal: 'Capital Growth',
    targetStates: ['QLD', 'WA'],
    targetSuburbs: ['Moreton Bay Region (QLD)', 'Wanneroo (WA)'],
    preferredSuburbs: ['Petrie', 'Griffin', 'Murrumba Downs', 'Butler'],
    propertyTypes: ['Freestanding House', 'Townhouse'],
    bedrooms: '3+',
    minBedrooms: 3,
    mustHaves: [
      'Walking distance to train station',
      'Low flood risk zone',
      'Rental yield > 4.8%'
    ],
    dealBreakers: [
      'High Crime Precinct',
      'Extensive termite damage history'
    ],
    riskAppetite: 'Moderate',
    maxHoldPeriodYears: 7,
    smsfPurchase: false,
    renovationAppetite: 'Minor Cosmetic Ok',
    createdDate: '2026-08-25',
    accessStatus: 'active',
    tempPassword: 'client123',
    loginEmail: 'liam.oconnor@investor.com.au',
    assignedAgent: 'Kylie Chen'
  },
  {
    id: 'client-4',
    name: 'Harrison Sterling',
    fullName: 'Harrison Sterling',
    email: 'harrison.sterling@investor.com.au',
    phone: '+61 422 998 112',
    occupancyPurpose: 'Investment',
    budgetMin: 850000,
    budgetMax: 1200000,
    depositAvailable: 260000,
    preApprovalStatus: 'In Progress',
    preApprovalLender: 'Westpac Banking Corp',
    preApprovalAmount: 1200000,
    preApprovalExpiry: '2026-10-15',
    primaryGoal: 'High Cashflow Yield',
    targetStates: ['SA', 'WA'],
    targetSuburbs: ['Adelaide Fringe (SA)', 'Mandurah (WA)'],
    preferredSuburbs: ['Salisbury', 'Elizabeth South', 'Greenfields'],
    propertyTypes: ['Duplex / Dual Key', 'Freestanding House'],
    bedrooms: '4+',
    minBedrooms: 4,
    mustHaves: [
      'Gross yield > 6.0%',
      'Positive cashflow day 1'
    ],
    dealBreakers: [
      'Significant structural foundation failure',
      'Bushfire BAL-FZ zone'
    ],
    riskAppetite: 'Aggressive Growth',
    maxHoldPeriodYears: 10,
    smsfPurchase: false,
    renovationAppetite: 'Major Renovation / Value-Add',
    createdDate: '2026-07-20',
    accessStatus: 'revoked', // Revoked access account for testing
    tempPassword: 'client123',
    loginEmail: 'harrison.sterling@investor.com.au',
    assignedAgent: 'Damian Sterling'
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    clientId: 'client-1',
    address: '42 Bunya Pine Circuit',
    suburb: 'Kallangur',
    state: 'QLD',
    postcode: '4503',
    priceGuide: 785000,
    estMarketValue: 820000,
    propertyType: 'Freestanding House',
    bedrooms: 4,
    bathrooms: 2,
    carSpaces: 2,
    landSizeM2: 680,
    internalAreaM2: 210,
    weeklyRentEst: 720,
    grossYield: 5.34,
    netYield: 4.25,
    cashflowWeekly: 38,
    capitalGrowthForecast3Yr: 8.6,
    desirabilityScore: 92,
    isOffMarket: true,
    daysOnMarket: 9,
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80',
    status: 'Shortlisted',
    shortlistTier: 'Tier 1 - High Priority',
    agentName: 'Damian Price',
    agentAgency: 'Ray White Moreton Bay',
    agentPhone: '+61 419 220 119',
    agentEmail: 'damian.price@raywhite.com',
    vendorMotivation: 'Relocating interstate for work by end of month. Motivated to secure quick unconditional buyer before general public auction.',
    notes: 'Off-market opportunity secured through agency relationship. 680m2 flat block with side access and space for auxiliary unit (granny flat).',
    keyFeatures: [
      '680m2 block with 3.2m side access',
      'Solar 6.6kW system installed 2023',
      'Modern open-plan kitchen with Caesarstone benches',
      'High rental demand zone with 0.8% vacancy',
      'Air conditioning throughout living and master'
    ],
    councilRatesPerYear: 2100,
    waterRatesPerYear: 1400,
    insurancePerYear: 1850,
    propertyManagementRate: 7.5,
    bpReportId: 'bp-1',
    negotiationId: 'neg-1'
  },
  {
    id: 'prop-2',
    clientId: 'client-1',
    address: '18 Sanctuary Way',
    suburb: 'Meadow Springs',
    state: 'WA',
    postcode: '6210',
    priceGuide: 645000,
    estMarketValue: 675000,
    propertyType: 'Freestanding House',
    bedrooms: 4,
    bathrooms: 2,
    carSpaces: 2,
    landSizeM2: 612,
    internalAreaM2: 195,
    weeklyRentEst: 660,
    grossYield: 6.01,
    netYield: 4.88,
    cashflowWeekly: 74,
    capitalGrowthForecast3Yr: 9.1,
    desirabilityScore: 89,
    isOffMarket: false,
    daysOnMarket: 14,
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80',
    status: 'Shortlisted',
    shortlistTier: 'Tier 1 - High Priority',
    agentName: 'Claire Davenport',
    agentAgency: 'Harcourts Mandurah',
    agentPhone: '+61 433 901 882',
    agentEmail: 'claire.d@harcourts.com.au',
    vendorMotivation: 'Downsizing to an apartment. Open to offers prior to scheduled second open inspection.',
    notes: 'Exceptional cashflow profile. Within 900m of golf club and primary school. Brick and tile construction in sound structural shape.',
    keyFeatures: [
      'Double lock-up garage with rear roller door',
      'Reticulated bore garden system',
      'Separate formal lounge + open games room',
      'Rental yield exceeds 6% gross',
      'Low council rates precinct'
    ],
    councilRatesPerYear: 1950,
    waterRatesPerYear: 1200,
    insurancePerYear: 1600,
    propertyManagementRate: 8.0,
    bpReportId: 'bp-2'
  },
  {
    id: 'prop-3',
    clientId: 'client-1',
    address: '7 Jacaranda Crescent',
    suburb: 'Strathpine',
    state: 'QLD',
    postcode: '4500',
    priceGuide: 835000,
    estMarketValue: 860000,
    propertyType: 'Duplex / Dual Key',
    bedrooms: 5,
    bathrooms: 3,
    carSpaces: 3,
    landSizeM2: 740,
    internalAreaM2: 240,
    weeklyRentEst: 950,
    grossYield: 6.48,
    netYield: 5.12,
    cashflowWeekly: 115,
    capitalGrowthForecast3Yr: 8.4,
    desirabilityScore: 94,
    isOffMarket: false,
    daysOnMarket: 21,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    status: 'Due Diligence',
    shortlistTier: 'Tier 1 - High Priority',
    agentName: 'Trent Hollister',
    agentAgency: 'LJ Hooker Pine Rivers',
    agentPhone: '+61 422 411 908',
    agentEmail: 'trent.h@ljhooker.com.au',
    vendorMotivation: 'Liquidating portfolio asset to fund commercial development.',
    notes: 'Configured as 3-bed main residence ($570/wk) + 2-bed self-contained council-approved granny flat ($380/wk). Dual income powerhouse.',
    keyFeatures: [
      'Dual electrical meters & sub-metered water',
      'Combined rental income $950/wk',
      'Walk to Strathpine Train Station (650m)',
      'Substantial depreciation benefits remaining',
      'No body corporate fees'
    ],
    councilRatesPerYear: 2600,
    waterRatesPerYear: 1800,
    insurancePerYear: 2400,
    propertyManagementRate: 7.0,
    bpReportId: 'bp-3',
    negotiationId: 'neg-2'
  },
  {
    id: 'prop-4',
    clientId: 'client-4',
    address: '15 Carrington Boulevard',
    suburb: 'Salisbury Heights',
    state: 'SA',
    postcode: '5109',
    priceGuide: 690000,
    estMarketValue: 715000,
    propertyType: 'Freestanding House',
    bedrooms: 4,
    bathrooms: 2,
    carSpaces: 2,
    landSizeM2: 650,
    internalAreaM2: 185,
    weeklyRentEst: 640,
    grossYield: 5.37,
    netYield: 4.29,
    cashflowWeekly: 25,
    capitalGrowthForecast3Yr: 7.9,
    desirabilityScore: 84,
    isOffMarket: true,
    daysOnMarket: 6,
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
    status: 'Shortlisted',
    shortlistTier: 'Tier 2 - Watchlist',
    agentName: 'Samira Haddad',
    agentAgency: 'Harris Real Estate',
    agentPhone: '+61 408 193 442',
    agentEmail: 'samira.h@harrisre.com.au',
    vendorMotivation: 'Deceased estate sale. Family executors seeking unconditional settlement.',
    notes: 'Well maintained 1990s solid brick build. Cosmetic refresh (carpets, paint) could lift weekly rent to $690/wk.',
    keyFeatures: [
      'Generous 650m2 elevated allotment with valley views',
      'Solar hot water and 5kW PV array',
      'Close to Lyell McEwin health precinct',
      'Strong historical capital growth in Salisbury pocket'
    ],
    councilRatesPerYear: 1800,
    waterRatesPerYear: 1100,
    insurancePerYear: 1550,
    propertyManagementRate: 7.7
  },
  {
    id: 'prop-5',
    clientId: 'client-1',
    address: '8 Coastal Ridge Road',
    suburb: 'Secret Harbour',
    state: 'WA',
    postcode: '6173',
    priceGuide: 715000,
    estMarketValue: 740000,
    propertyType: 'Freestanding House',
    bedrooms: 4,
    bathrooms: 2,
    carSpaces: 2,
    landSizeM2: 580,
    internalAreaM2: 200,
    weeklyRentEst: 700,
    grossYield: 5.72,
    netYield: 4.61,
    cashflowWeekly: 52,
    capitalGrowthForecast3Yr: 8.8,
    desirabilityScore: 88,
    isOffMarket: false,
    daysOnMarket: 18,
    imageUrl: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1000&q=80',
    status: 'Under Contract',
    agentName: 'Luke Patterson',
    agentAgency: 'Acton Belle Property',
    agentPhone: '+61 411 789 203',
    agentEmail: 'luke.p@actonbelle.com.au',
    vendorMotivation: 'Upgrading to larger acreage property in Serpentine.',
    notes: 'Offer successfully accepted at $705,000! Currently in Phase 3 conveyancing.',
    keyFeatures: [
      'Walk to Secret Harbour Golf Links and beach',
      'Ducted reverse-cycle zoned air-con',
      'Modern alfresco dining area with composite decking',
      'Tenanted until October 2026 at $700/wk to immaculate corporate tenants'
    ],
    councilRatesPerYear: 2200,
    waterRatesPerYear: 1300,
    insurancePerYear: 1750,
    propertyManagementRate: 8.0,
    settlementId: 'settle-1'
  },
  {
    id: 'prop-6',
    clientId: 'client-2',
    address: '29 Banksia Ridge Drive',
    suburb: 'Mount Barker',
    state: 'SA',
    postcode: '5251',
    priceGuide: 780000,
    estMarketValue: 810000,
    propertyType: 'Freestanding House',
    bedrooms: 4,
    bathrooms: 2,
    carSpaces: 2,
    landSizeM2: 720,
    internalAreaM2: 215,
    weeklyRentEst: 720,
    grossYield: 5.48,
    netYield: 4.35,
    cashflowWeekly: 42,
    capitalGrowthForecast3Yr: 8.9,
    desirabilityScore: 91,
    isOffMarket: false,
    daysOnMarket: 11,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    status: 'Under Review',
    shortlistTier: 'Tier 1 - High Priority',
    agentName: 'Marcus Vance',
    agentAgency: 'Elders Real Estate Adelaide Hills',
    agentPhone: '+61 405 889 120',
    agentEmail: 'marcus.v@elders.com.au',
    vendorMotivation: 'Vendor consolidating agricultural assets.',
    notes: 'Exceptional Adelaide Hills growth pocket. Currently awaiting revised building & pest re-inspection for subfloor moisture.',
    keyFeatures: [
      'Large 720m2 flat block with dual side access',
      'High rental yield with Adelaide Hills lifestyle appeal',
      'Modern open-plan entertaining with stone benchtops'
    ],
    councilRatesPerYear: 2100,
    waterRatesPerYear: 1250,
    insurancePerYear: 1680,
    propertyManagementRate: 7.5
  },
  {
    id: 'prop-7',
    clientId: 'client-1',
    address: '14 Parkside Grove',
    suburb: 'North Lakes',
    state: 'QLD',
    postcode: '4509',
    priceGuide: 890000,
    estMarketValue: 920000,
    propertyType: 'Townhouse',
    bedrooms: 3,
    bathrooms: 2,
    carSpaces: 2,
    landSizeM2: 340,
    internalAreaM2: 175,
    weeklyRentEst: 690,
    grossYield: 5.32,
    netYield: 4.15,
    cashflowWeekly: 18,
    capitalGrowthForecast3Yr: 7.8,
    desirabilityScore: 86,
    isOffMarket: false,
    daysOnMarket: 28,
    imageUrl: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1000&q=80',
    status: 'Offer Made',
    shortlistTier: 'Tier 1 - High Priority',
    agentName: 'Jessica Stirling',
    agentAgency: 'Place Real Estate North Lakes',
    agentPhone: '+61 412 344 991',
    agentEmail: 'jessica.s@place.com.au',
    vendorMotivation: 'Relocating to Sunshine Coast.',
    notes: 'Written offer submitted at $875,000 subject to 14-day finance and 7-day B&P clause. Awaiting vendor response by 5pm.',
    keyFeatures: [
      'Walking distance to Westfield North Lakes and bus interchange',
      'Low body corporate levy ($42/wk)',
      'High-spec kitchen with gas cooktop'
    ],
    councilRatesPerYear: 1950,
    waterRatesPerYear: 1350,
    insurancePerYear: 1450,
    propertyManagementRate: 7.5
  },
  {
    id: 'prop-8',
    clientId: 'client-3',
    address: '52 Ironbark Street',
    suburb: 'Petrie',
    state: 'QLD',
    postcode: '4502',
    priceGuide: 760000,
    estMarketValue: 770000,
    propertyType: 'Freestanding House',
    bedrooms: 3,
    bathrooms: 1,
    carSpaces: 1,
    landSizeM2: 605,
    internalAreaM2: 140,
    weeklyRentEst: 590,
    grossYield: 4.85,
    netYield: 3.80,
    cashflowWeekly: -15,
    capitalGrowthForecast3Yr: 6.5,
    desirabilityScore: 68,
    isOffMarket: false,
    daysOnMarket: 45,
    imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1000&q=80',
    status: 'Shortlisted',
    shortlistTier: 'Tier 2 - Watchlist',
    agentName: 'Greg Foster',
    agentAgency: 'First National Moreton',
    agentPhone: '+61 409 112 334',
    agentEmail: 'greg.f@firstnational.com.au',
    vendorMotivation: 'Firm on price guide, open to structural clauses.',
    notes: 'Shortlisted for review regarding council drainage buffers.',
    keyFeatures: [
      'Close to USC Moreton Bay Petrie Campus',
      'Substantial 605m2 block with rear garden'
    ],
    councilRatesPerYear: 2050,
    waterRatesPerYear: 1400,
    insurancePerYear: 2100,
    propertyManagementRate: 8.0
  },
  {
    id: 'prop-smsf-1',
    clientId: 'client-2',
    address: '14-16 Industrial Avenue',
    suburb: 'Toowoomba City',
    state: 'QLD',
    postcode: '4350',
    priceGuide: 1280000,
    estMarketValue: 1340000,
    propertyType: 'Duplex / Dual Key',
    bedrooms: 6,
    bathrooms: 4,
    carSpaces: 4,
    landSizeM2: 890,
    internalAreaM2: 320,
    weeklyRentEst: 1450,
    grossYield: 6.84,
    netYield: 5.62,
    cashflowWeekly: 185,
    capitalGrowthForecast3Yr: 7.9,
    desirabilityScore: 95,
    isOffMarket: true,
    daysOnMarket: 7,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    status: 'Shortlisted',
    shortlistTier: 'Tier 1 - High Priority',
    agentName: 'Damian Sterling',
    agentAgency: 'Iconic Investing Off-Market',
    agentPhone: '+61 418 720 941',
    agentEmail: 'damian.s@iconicinvesting.com.au',
    vendorMotivation: 'Off-market institutional liquidator disposing of high-yield dual-key duplex.',
    notes: 'Perfect SMSF fit: Dual lease contracts yielding $1,450/week, high tax depreciation schedule.',
    keyFeatures: [
      'Dual occupancy fully council compliant and separately metered',
      'Gross yield 6.84% with high cash surplus',
      'SMSF corporate trustee financing compliant'
    ],
    councilRatesPerYear: 3200,
    waterRatesPerYear: 1900,
    insurancePerYear: 2600,
    propertyManagementRate: 6.5
  },
  {
    id: 'prop-liam-1',
    clientId: 'client-3',
    address: '19 Station Street',
    suburb: 'Petrie',
    state: 'QLD',
    postcode: '4502',
    priceGuide: 695000,
    estMarketValue: 720000,
    propertyType: 'Freestanding House',
    bedrooms: 4,
    bathrooms: 2,
    carSpaces: 2,
    landSizeM2: 630,
    internalAreaM2: 180,
    weeklyRentEst: 670,
    grossYield: 5.52,
    netYield: 4.41,
    cashflowWeekly: 45,
    capitalGrowthForecast3Yr: 9.3,
    desirabilityScore: 92,
    isOffMarket: true,
    daysOnMarket: 5,
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80',
    status: 'Shortlisted',
    shortlistTier: 'Tier 1 - High Priority',
    agentName: 'Kylie Chen',
    agentAgency: 'Iconic Investing',
    agentPhone: '+61 422 610 882',
    agentEmail: 'kylie.c@iconicinvesting.com.au',
    vendorMotivation: 'Interstate relocation. Genuine off-market priority before auction.',
    notes: 'High ridge line position outside all council flood overlays. 450m walk to Petrie train station and USC university.',
    keyFeatures: [
      'Outside flood zones on high contour ridge',
      'Walk to train station and university campus',
      'Solid rental cashflow at $670/wk'
    ],
    councilRatesPerYear: 2000,
    waterRatesPerYear: 1250,
    insurancePerYear: 1650,
    propertyManagementRate: 7.5
  }
];

export const SAMPLE_BP_REPORTS: Record<string, string> = {
  sample1: `BUILDING & PEST INSPECTION REPORT (AS 4349.1-2007 & AS 4349.3)
PROPERTY: 42 Bunya Pine Circuit, Kallangur QLD 4503
INSPECTOR: Inspectrite Building Diagnostics (Lic: 104822)
DATE OF INSPECTION: 28 August 2026

EXECUTIVE SUMMARY:
Overall condition of the dwelling is FAIR to GOOD relative to age (approx. 18 years). Multiple items require immediate remediation or capital expenditure.

1. STRUCTURAL ISSUES:
- Subfloor bearer deflection (approx 12mm dip) noted beneath the primary living room. Under-joist timber packing is degraded.
- Stepped settlement cracking (2.5mm width) on north-east brick veneer elevation due to reactive clay soil expansion.

2. SAFETY HAZARDS:
- Main electrical switchboard contains older ceramic rewirable fuses without residual current devices (RCD) on light circuits.
- Non-compliant balustrade spacing (140mm gap vs 125mm max allowable under NCC) on elevated rear deck above 1.2m fall height.
- Missing hardwired photoelectric smoke alarm in bedroom corridor hallway 2.

3. MAJOR DEFECTS:
- Concrete tile roof ridge capping mortar is decayed and cracked across 8 sections, with dislodged valley tiles allowing rainwater backflow.
- Aging electric storage hot water unit (160L, 2008 build) showing heavy rust scale at base and pressure relief valve dripping continuously.

4. TERMITE RISK:
- No live active subterranean termites detected inside the living zones at inspection time.
- Historic termite workings and timber mud tubes discovered in rear treated pine landscaping retaining walls 3.8m from slab.
- Chemical termite barrier system has expired (last treated 2020); no current management zone in place. Moderate-to-high risk environment.

5. MOISTURE & DRAINAGE:
- High moisture readings (19-24% WME) detected on ensuite shower common wall gyprock, indicative of failed waterproof membrane.
- Inadequate subfloor ground drainage on western elevation; rainwater pooling adjacent to external brick foundation footings with blocked weepholes.

6. MINOR DEFECTS:
- Master bedroom timber sliding window sash stiff to operate and requires roller replacement.
- Laundry ceiling exhibits minor paint bubbling from clothes dryer steam condensation.
- Internal passage door latch out of alignment and sticking on door jamb.`,

  sample2: `BUILDING & PEST REPORT SUMMARY - 18 Sanctuary Way, Meadow Springs WA 6210
INSPECTOR: Coastal Guard Inspections | DATE: 24 August 2026

1. STRUCTURAL ISSUES:
- Concrete slab-on-ground in sound condition. No evidence of differential footing movement or perimeter cracking.

2. SAFETY HAZARDS:
- RCD switchboard compliant with modern electrical standards.
- Smoke alarms tested and verified compliant with WA 10-year lithium battery requirements.

3. MAJOR DEFECTS:
- Colorbond metal roof in good condition. Flashings and box gutters clear of debris.
- Ducted evaporative air conditioning unit requires seasonal servicing and pad replacement.

4. TERMITE RISK:
- Physical termite collar barriers on internal penetrations intact.
- No evidence of active or historic subterranean termite activity. Low environmental risk.

5. MOISTURE & DRAINAGE:
- Shower recesses dry upon thermal imaging and pinless moisture testing.
- Stormwater connected to dual external soakwells away from perimeter footings.

6. MINOR DEFECTS:
- Minor chipped paint along hallway skirting boards.
- Garage side pedestrian door weather seal worn at bottom threshold.`,

  sample3: `BUILDING & PEST INSPECTION DEFECT NOTES - 29 Banksia Ridge Drive, Mount Barker SA
INSPECTOR: Adelaide Hills Structural Surveys | DATE: 26 August 2026

1. STRUCTURAL ISSUES:
- Minor floor bounce in bedroom 3 timber joist span; subfloor timber pier requires shim leveling.

2. SAFETY HAZARDS:
- Inground swimming pool gate latch fails to auto-close from 45-degree angle (NCC 2022 safety hazard).
- Exposed wiring junction box inside outdoor garden shed requiring weatherproof enclosure.

3. MAJOR DEFECTS:
- Underground stormwater discharge pipe on southern boundary is cracked by tree root intrusion, causing water pooling during heavy rainfall.

4. TERMITE RISK:
- Termite visual inspection clear of active infestation; recommendation to renew chemical perimeter barrier within 6 months.

5. MOISTURE & DRAINAGE:
- High damp readings detected in subfloor soil beneath front porch due to downpipe leaking at elbow joint.

6. MINOR DEFECTS:
- Kitchen rangehood grease filters require degreasing.
- Hairline hairline plaster settlement cracks above laundry door frame.`
};

export const INITIAL_BP_ANALYSES: BPReportAnalysis[] = [
  {
    id: 'bp-1',
    propertyId: 'prop-1',
    propertyAddress: '42 Bunya Pine Circuit, Kallangur QLD 4503',
    reportDate: '2026-08-28',
    inspectorName: 'Inspectrite Building Diagnostics (Lic: 104822)',
    overallRisk: 'MODERATE',
    riskScore: 68,
    headlineSummary: 'Solid brick veneer asset with excellent capital growth upside, but requires immediate attention for subfloor moisture, electrical RCD safety upgrade, ensuite membrane resealing, and chemical termite barrier renewal.',
    
    // 1. Structural Issues
    structuralIssues: [
      {
        id: 'struct-1',
        category: 'Structural Issues',
        item: 'Subfloor Bearer Deflection & Packing Degradation',
        severity: 'HIGH',
        estCostMin: 2800,
        estCostMax: 4500,
        estCostRange: '$2,800 - $4,500',
        description: 'Living room subfloor bearer shows approx. 12mm dip. Requires jacking, replacement of decayed timber shims, and supplemental steel pier prop.',
        location: 'Subfloor zone beneath main open living area'
      },
      {
        id: 'struct-2',
        category: 'Structural Issues',
        item: 'Stepped Diagonal Brickwork Cracking (2.5mm)',
        severity: 'MODERATE',
        estCostMin: 1200,
        estCostMax: 2200,
        estCostRange: '$1,200 - $2,200',
        description: 'Reactive clay ground expansion cracking on north-east elevation. Mortar repointing and flexible joint sealing recommended.',
        location: 'North-East external brick veneer wall'
      }
    ],

    // 2. Safety Hazards
    safetyHazards: [
      {
        id: 'safe-1',
        category: 'Safety Hazards',
        item: 'Outdated Switchboard Fuses without RCD Safety Switches',
        severity: 'CRITICAL',
        estCostMin: 1400,
        estCostMax: 2200,
        estCostRange: '$1,400 - $2,200',
        description: 'Ceramic rewireable fuses on sub-circuits pose severe electric shock & fire hazard. Mandatory compliance upgrade before leasing out.',
        location: 'External garage switchboard'
      },
      {
        id: 'safe-2',
        category: 'Safety Hazards',
        item: 'Non-Compliant Rear Deck Balustrade Spacing (140mm gap)',
        severity: 'HIGH',
        estCostMin: 850,
        estCostMax: 1600,
        estCostRange: '$850 - $1,600',
        description: 'Balustrade infill spacing exceeds 125mm maximum allowable under NCC building code on elevated deck over 1.2m drop.',
        location: 'Rear outdoor entertaining timber deck'
      },
      {
        id: 'safe-3',
        category: 'Safety Hazards',
        item: 'Missing Interconnected Photoelectric Smoke Alarm',
        severity: 'HIGH',
        estCostMin: 450,
        estCostMax: 750,
        estCostRange: '$450 - $750',
        description: 'Hallway 2 lacks compliant QLD 2022 interconnected photoelectric smoke alarm unit.',
        location: 'Hallway adjacent to bedrooms 3 and 4'
      }
    ],

    // 3. Major Defects
    majorDefects: [
      {
        id: 'maj-1',
        category: 'Major Defects',
        item: 'Decayed Roof Ridge Capping Mortar & Dislodged Valley Tiles',
        severity: 'HIGH',
        estCostMin: 2200,
        estCostMax: 3800,
        estCostRange: '$2,200 - $3,800',
        description: 'Deteriorated flexible mortar bedding across 8 ridge sections with slipped tiles allowing water ingress during heavy downpours.',
        location: 'Main roof concrete tile surface'
      },
      {
        id: 'maj-2',
        category: 'Major Defects',
        item: 'Failing Hot Water Storage Cylinder (2008 Unit)',
        severity: 'MODERATE',
        estCostMin: 1800,
        estCostMax: 2600,
        estCostRange: '$1,800 - $2,600',
        description: '160L electric storage system beyond end-of-life with heavy rust on base casing and leaking pressure relief valve.',
        location: 'Southern external wall'
      }
    ],

    // 4. Termite Risk
    termiteRisk: [
      {
        id: 'term-1',
        category: 'Termite Risk',
        item: 'Expired Chemical Termite Management Zone',
        severity: 'HIGH',
        estCostMin: 3200,
        estCostMax: 4800,
        estCostRange: '$3,200 - $4,800',
        description: 'Perimeter chemical protection expired in 2020. Recommend full perimeter Termidor chemical treatment with 5-year warranty.',
        location: 'Dwelling external foundation perimeter'
      },
      {
        id: 'term-2',
        category: 'Termite Risk',
        item: 'Historic Termite Workings in Landscaping Retaining Wall',
        severity: 'MODERATE',
        estCostMin: 600,
        estCostMax: 1200,
        estCostRange: '$600 - $1,200',
        description: 'Old inactive mud tubing in sleeper wall 3.8m from house. Requires removal of decayed pine sleepers and barrier spray.',
        location: 'Rear garden retaining wall'
      }
    ],

    // 5. Moisture & Drainage
    moistureAndDrainage: [
      {
        id: 'moist-1',
        category: 'Moisture & Drainage',
        item: 'Ensuite Shower Recess Failed Waterproof Membrane',
        severity: 'HIGH',
        estCostMin: 2500,
        estCostMax: 4500,
        estCostRange: '$2,500 - $4,500',
        description: 'Moisture detector recorded 19-24% WME dampness in adjoining gyprock wall. Requires stripping base tiles and applying epoxy waterproof membrane.',
        location: 'Master ensuite shower cubicle'
      },
      {
        id: 'moist-2',
        category: 'Moisture & Drainage',
        item: 'Subfloor Soil Moisture & Blocked Foundation Weepholes',
        severity: 'HIGH',
        estCostMin: 1800,
        estCostMax: 3200,
        estCostRange: '$1,800 - $3,200',
        description: 'Western exterior garden bed soil level is built up above foundation damp proof course, covering weepholes and trapping runoff.',
        location: 'Western exterior wall footings'
      }
    ],

    // 6. Minor Defects
    minorDefects: [
      {
        id: 'min-1',
        category: 'Minor Defects',
        item: 'Stiff Master Bedroom Sliding Window Roller',
        severity: 'LOW',
        estCostMin: 180,
        estCostMax: 320,
        estCostRange: '$180 - $320',
        description: 'Window roller carriage worn; requires replacement and track lubrication.',
        location: 'Master bedroom window'
      },
      {
        id: 'min-2',
        category: 'Minor Defects',
        item: 'Laundry Ceiling Paint Peeling from Dryer Steam',
        severity: 'LOW',
        estCostMin: 250,
        estCostMax: 450,
        estCostRange: '$250 - $450',
        description: 'Cosmetic flaking paint; sand, seal with anti-mould primer and topcoat.',
        location: 'Laundry ceiling'
      },
      {
        id: 'min-3',
        category: 'Minor Defects',
        item: 'Passage Door Catch Misalignment',
        severity: 'LOW',
        estCostMin: 100,
        estCostMax: 180,
        estCostRange: '$100 - $180',
        description: 'Strike plate requires minor repositioning for positive door latching.',
        location: 'Hallway linen cupboard'
      }
    ],

    pestFindings: {
      activeTermitesFound: false,
      previousActivityFound: true,
      barrierInstalled: false,
      barrierRecommendation: 'Install complete perimeter chemical termite barrier (Termidor / Biflex) with 5-year warranty protection.',
      timberPestRisk: 'MODERATE TO HIGH (due to subfloor moisture, expired barrier, and proximity of treated pine landscaping)'
    },

    totalEstimatedRepairCost: {
      minimum: 18630,
      maximum: 30150,
      formatted: '$18,630 - $30,150 AUD'
    },

    // Vendor Negotiation Points
    vendorNegotiationPoints: [
      'Present combined $24,000 midpoint rectification quote across essential safety (RCD switchboard, balustrade), waterproofing, and expired termite barrier.',
      'Request a firm $18,000 - $22,000 price discount off the agreed price, or an equivalent settlement adjustment credit.',
      'Insert contractual Annexure Clause requiring vendor to have a licensed electrician upgrade the switchboard to RCD compliance and supply electrical Certificate of Safety prior to settlement.',
      'Remind selling agent that any subsequent buyer who conducts building and pest will uncover the identical membrane leak and subfloor moisture defects.',
      'Offer unconditional contract exchange within 24 hours of vendor accepting the price reduction or settlement adjustment.'
    ],

    // Buyer Risk Summary in plain English
    buyerRiskSummary: 'This property has a fundamentally strong structural footprint in an exceptional high-growth Kallangur pocket, and is by no means a "knockdown" or "walk-away". However, prior owners have neglected key preventative maintenance. Crucially, before placing a tenant, you will need to spend approximately $4,500 immediately on mandatory safety items: installing electrical RCD safety switches, adjusting the rear deck balustrade, and upgrading smoke alarms. The remaining $15k - $20k in repairs (re-pointing roof tiles, renewing the chemical termite barrier, and resealing the ensuite shower) represent powerful negotiation leverage that our agency will use to reduce the vendor\'s purchase price rather than absorbing the expense yourself.',

    negotiationStrategy: {
      suggestedPriceReduction: 20000,
      negotiationPoints: [
        'Quote $24,000 total estimated rectification costs across subfloor ventilation, electrical safety, drainage, and termite barrier.',
        'Use B&P report findings to anchor revised counter-offer down from $785k guide to $765k.',
        'Offer rapid 5-day conditional waiver once $20k reduction or vendor settlement credit is confirmed in contract Annexure.'
      ],
      suggestedSpecialConditions: [
        'Vendor warrants that prior to settlement, a licensed electrician installs RCD safety switches and provides compliance certification.',
        'Buyer is entitled to a $4,000 credit adjustment on the Settlement Adjustment Statement towards chemical termite barrier installation.'
      ]
    },
    verdict: 'PROCEED WITH NEGOTIATION: High-leverage report. Foundation is sound, but defect cost estimates provide clear justification for a $18,000 - $22,000 price discount.'
  }
];

export const INITIAL_OFFERS: OfferNegotiation[] = [
  {
    id: 'neg-1',
    propertyId: 'prop-1',
    propertyAddress: '42 Bunya Pine Circuit, Kallangur QLD 4503',
    propertyImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80',
    listPrice: 785000,
    listedPrice: 785000,
    initialOffer: 760000,
    initialOfferDate: '2026-08-29',
    vendorCounterOffer: 779000,
    vendorCounterPrice: 779000,
    finalAgreedPrice: undefined,
    currentOfferPrice: 768000,
    outcome: 'Under Negotiation',
    status: 'Under Counter-Offer',
    offerConditions: {
      finance: true,
      financeDays: 14,
      financeDueDate: '2026-09-12',
      buildingAndPest: true,
      bpDays: 7,
      bpDueDate: '2026-09-05',
      specialConditions: [
        'Subject to satisfactory finance approval within 14 days',
        'Subject to vendor providing $3,500 termite barrier credit at settlement',
        'Licensed electrician RCD safety certification prior to settlement'
      ],
      customNotes: 'B&P report identifies $18k in rectification items (subfloor moisture, expired termite barrier, electrical RCD upgrade).'
    },
    settlementDate: '2026-10-05',
    settlementDays: 35,
    depositAmount: 76800,
    depositPercent: 10,
    financeDays: 14,
    bpDays: 7,
    specialConditions: [
      'Subject to satisfactory finance approval within 14 days',
      'Subject to vendor providing $3,500 termite barrier credit at settlement',
      'Licensed electrician RCD safety certification prior to settlement'
    ],
    vendorMotivation: 'Relocating interstate end of month. Wants clean terms and quick settlement.',
    sellingAgentName: 'Damian Price',
    sellingAgentPhone: '+61 419 220 119',
    sellingAgentEmail: 'damian.price@raywhite.com',
    timeline: [
      {
        id: 'step-1',
        stepNumber: 1,
        date: '2026-08-29',
        time: '10:30 AM',
        party: 'Buyer (Buyers Agent)',
        title: 'Initial Written Anchor Offer Submitted',
        amount: 760000,
        terms: '10% deposit ($76,000), 30 days settlement, standard finance & B&P clause',
        conditions: 'Finance: 14 Days | B&P: 7 Days | 48-Hour Expiry',
        notes: 'Initial conservative anchor submitted to test vendor price expectations.',
        statusBadge: 'Submitted'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        date: '2026-08-30',
        time: '03:45 PM',
        party: 'Vendor / Selling Agent',
        title: 'Vendor Formal Counter-Offer Received',
        amount: 779000,
        terms: '30 days settlement, vendor agrees to $1,000 repair contribution',
        conditions: 'Vendor requesting unconditional exchange on B&P clause',
        notes: 'Selling agent called stating vendor rejected $760k but has signed contract at $779k.',
        statusBadge: 'Counter-Offer'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        date: '2026-08-31',
        time: '11:15 AM',
        party: 'Buyer (Buyers Agent)',
        title: 'Tactical Buyer Counter-Offer with Defect Quotes',
        amount: 768000,
        terms: '10% deposit, 35 days settlement, $3,500 termite credit clause included',
        conditions: 'Finance: 14 Days | B&P: 7 Days | Certified RCD Switchboard Condition',
        notes: 'Countered at $768,000 with attached AS 4349.1 building & pest defect rectification quotes as leverage.',
        statusBadge: 'Counter-Offer'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        date: '2026-09-01',
        time: '09:00 AM',
        party: 'Legal / Conveyancer',
        title: 'Contract Annexure Special Clauses Prepared',
        amount: 768000,
        terms: 'Special condition drafted for $3,500 settlement adjustment credit',
        conditions: 'Draft contract amendments circulated to selling agent and vendor conveyancer',
        notes: 'Awaiting vendor sign-off or final split-the-difference response before open house.',
        statusBadge: 'In Review'
      }
    ],
    history: [
      {
        id: 'h-1',
        timestamp: '2026-08-29 10:30',
        party: 'Buyer (Iconic)',
        amount: 760000,
        terms: '10% deposit, 30 days settlement, standard B&P clause',
        notes: 'Initial opening anchor submitted in writing.'
      },
      {
        id: 'h-2',
        timestamp: '2026-08-30 15:45',
        party: 'Vendor / Seller',
        amount: 779000,
        terms: '30 days settlement, vendor agrees to $1,000 repair contribution',
        notes: 'Selling agent called back stating vendor rejected $760k but will sign immediately at $779k.'
      },
      {
        id: 'h-3',
        timestamp: '2026-08-31 11:15',
        party: 'Buyer (Iconic)',
        amount: 768000,
        terms: '10% deposit, 30 days, B&P report defect deduction included. Valid 48h.',
        notes: 'Countered at $768,000 using B&P moisture & termite quotes as strict justification.'
      }
    ],
    aiAdvice: {
      recommendedCounter: 772500,
      strategyName: 'Split-the-Difference + Early Unconditional Concession',
      confidenceScore: 91,
      rationale: 'Vendor has already dropped $6,000 in 24 hours. A final best-and-final counter at $772,500 with shortened 7-day finance clause guarantees a win before weekend open inspection.',
      tacticalRecommendations: [
        'Remind agent the vendor risks losing a guaranteed 30-day cash-settled buyer for the sake of $6,500.',
        'Submit a signed contract note with 5:00 PM tomorrow expiry.',
        'Offer to waive building inspection condition immediately since our report is already executed.'
      ],
      draftMessageToAgent: 'Hi Damian,\n\nOur buyers have reviewed the vendor counter. While the B&P rectification quotes exceed $12,000, they are prepared to meet the vendor in the middle at $772,500 as their final position.\n\nTo give your vendor complete peace of mind: we will waive our B&P condition immediately and commit to a strict 30-day settlement.\n\nPlease confirm by 5:00 PM tomorrow so we can finalize contracts before considering our alternate shortlist property.',
      riskLevel: 'LOW - High likelihood of vendor acceptance'
    }
  },
  {
    id: 'neg-2',
    propertyId: 'prop-5',
    propertyAddress: '8 Coastal Ridge Road, Secret Harbour WA 6173',
    propertyImage: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1000&q=80',
    listPrice: 715000,
    listedPrice: 715000,
    initialOffer: 695000,
    initialOfferDate: '2026-08-11',
    vendorCounterOffer: 710000,
    vendorCounterPrice: 710000,
    finalAgreedPrice: 705000,
    currentOfferPrice: 705000,
    outcome: 'Won',
    status: 'Accepted',
    offerConditions: {
      finance: true,
      financeDays: 14,
      financeDueDate: '2026-08-29',
      buildingAndPest: true,
      bpDays: 7,
      bpDueDate: '2026-08-22',
      specialConditions: [
        'Subject to finance approval within 14 days',
        'Subject to AS 4349.1 building & pest inspection satisfied within 7 days',
        '$1,200 vendor settlement credit for gutter cleaning and maintenance'
      ],
      customNotes: 'Clean transaction negotiated $10,000 below listing guide with favorable 40-day settlement.'
    },
    settlementDate: '2026-09-25',
    settlementDays: 40,
    depositAmount: 70500,
    depositPercent: 10,
    financeDays: 14,
    bpDays: 7,
    specialConditions: [
      'Subject to finance approval within 14 days',
      'Subject to AS 4349.1 building & pest inspection satisfied within 7 days',
      '$1,200 vendor settlement credit for gutter cleaning and maintenance'
    ],
    vendorMotivation: 'Purchasing an off-the-plan retirement villa. Required secure buyer with pre-approved finance.',
    sellingAgentName: 'Claire Davenport',
    sellingAgentPhone: '+61 433 901 882',
    sellingAgentEmail: 'claire.d@harcourts.com.au',
    timeline: [
      {
        id: 'step-w-1',
        stepNumber: 1,
        date: '2026-08-11',
        time: '11:00 AM',
        party: 'Buyer (Buyers Agent)',
        title: 'Opening Written Offer of $695,000 Submitted',
        amount: 695000,
        terms: '10% deposit ($69,500), 45 days settlement, standard finance & inspection clauses',
        conditions: 'Finance: 14 Days | B&P: 7 Days | 48-Hour Expiry',
        notes: 'Submitted initial opening offer with buyer pre-approval letter attached.',
        statusBadge: 'Submitted'
      },
      {
        id: 'step-w-2',
        stepNumber: 2,
        date: '2026-08-12',
        time: '04:30 PM',
        party: 'Vendor / Selling Agent',
        title: 'Vendor Counter-Offer at $710,000',
        amount: 710000,
        terms: '40 days settlement, vendor agrees to standard REIWA contract conditions',
        conditions: 'Vendor reduced price expectation by $5,000 from $715k guide',
        notes: 'Selling agent communicated vendor willing to meet at $710,000.',
        statusBadge: 'Counter-Offer'
      },
      {
        id: 'step-w-3',
        stepNumber: 3,
        date: '2026-08-14',
        time: '02:00 PM',
        party: 'Buyer (Buyers Agent)',
        title: 'Final Best-and-Final Counter-Offer of $705,000',
        amount: 705000,
        terms: '10% deposit ($70,500), 40 days settlement, $1,200 gutter maintenance credit clause',
        conditions: 'Finance: 14 Days | B&P: 7 Days | 24-Hour Final Expiry',
        notes: 'Presented $705,000 as absolute non-negotiable ceiling with 24-hour sunset clause.',
        statusBadge: 'Counter-Offer'
      },
      {
        id: 'step-w-4',
        stepNumber: 4,
        date: '2026-08-15',
        time: '10:15 AM',
        party: 'Vendor / Selling Agent',
        title: 'Vendor Formally Accepted $705,000 — Deal Won 🏆',
        amount: 705000,
        terms: 'Contract exchanged and countersigned by both parties. Deposit lodged into trust.',
        conditions: 'All terms agreed. 40-day settlement scheduled for 25 September 2026.',
        notes: 'Contracts fully executed and uploaded into PEXA electronic workspace. Conveyancing initiated.',
        statusBadge: 'Won 🏆'
      }
    ],
    history: [
      {
        id: 'hw-1',
        timestamp: '2026-08-11 11:00',
        party: 'Buyer (Iconic)',
        amount: 695000,
        terms: '10% deposit, 45 days settlement',
        notes: 'Initial written offer submitted.'
      },
      {
        id: 'hw-2',
        timestamp: '2026-08-12 16:30',
        party: 'Vendor / Seller',
        amount: 710000,
        terms: '40 days settlement',
        notes: 'Vendor countered at $710k.'
      },
      {
        id: 'hw-3',
        timestamp: '2026-08-14 14:00',
        party: 'Buyer (Iconic)',
        amount: 705000,
        terms: '10% deposit, 40 days settlement, final position',
        notes: 'Best-and-final counter at $705,000.'
      },
      {
        id: 'hw-4',
        timestamp: '2026-08-15 10:15',
        party: 'Vendor / Seller',
        amount: 705000,
        terms: 'Accepted and contracts signed',
        notes: 'Deal secured $10,000 below guide price!'
      }
    ]
  },
  {
    id: 'neg-3',
    propertyId: 'prop-3',
    propertyAddress: '7 Jacaranda Crescent, Strathpine QLD 4500',
    propertyImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    listPrice: 835000,
    listedPrice: 835000,
    initialOffer: 820000,
    initialOfferDate: '2026-08-04',
    vendorCounterOffer: 840000,
    vendorCounterPrice: 840000,
    finalAgreedPrice: undefined,
    currentOfferPrice: 828000,
    outcome: 'Lost',
    status: 'Offer Rejected',
    offerConditions: {
      finance: true,
      financeDays: 14,
      financeDueDate: '2026-08-18',
      buildingAndPest: true,
      bpDays: 7,
      bpDueDate: '2026-08-11',
      specialConditions: [
        'Subject to finance approval within 14 days',
        'Subject to dual occupancy tenancy compliance verification'
      ],
      customNotes: 'Strict yield ceiling enforced at $830k. Competing cash buyer overpaid at $848k.'
    },
    settlementDate: '2026-09-15',
    settlementDays: 30,
    depositAmount: 82800,
    depositPercent: 10,
    financeDays: 14,
    bpDays: 7,
    specialConditions: [
      'Subject to finance approval within 14 days',
      'Subject to dual occupancy tenancy compliance verification'
    ],
    vendorMotivation: 'Liquidating portfolio asset to fund commercial development.',
    sellingAgentName: 'Trent Hollister',
    sellingAgentPhone: '+61 422 411 908',
    sellingAgentEmail: 'trent.h@ljhooker.com.au',
    outcomeNotes: 'Vendor accepted competing unconditional cash buyer at $848,000 (above our calculated strict yield ceiling of $830k). Client capital preserved for higher return assets.',
    timeline: [
      {
        id: 'step-l-1',
        stepNumber: 1,
        date: '2026-08-04',
        time: '09:30 AM',
        party: 'Buyer (Buyers Agent)',
        title: 'Opening Offer of $820,000 Submitted',
        amount: 820000,
        terms: '10% deposit, 30 days settlement, standard conditions',
        conditions: 'Finance: 14 Days | B&P: 7 Days | Dual Tenancy Verification',
        notes: 'Opening offer based on gross 6.5% yield requirement.',
        statusBadge: 'Submitted'
      },
      {
        id: 'step-l-2',
        stepNumber: 2,
        date: '2026-08-05',
        time: '02:15 PM',
        party: 'Vendor / Selling Agent',
        title: 'Vendor Informs Multiple Competing Bidders & Counters at $840,000',
        amount: 840000,
        terms: '30 days settlement, requests unconditional offer by 5 PM',
        conditions: 'Vendor leveraging multiple private inspection offers',
        notes: 'Agent stated three other parties submitted offers after Saturday open.',
        statusBadge: 'Counter-Offer'
      },
      {
        id: 'step-l-3',
        stepNumber: 3,
        date: '2026-08-06',
        time: '11:00 AM',
        party: 'Buyer (Buyers Agent)',
        title: 'Hard Ceiling Counter-Offer of $828,000 Submitted',
        amount: 828000,
        terms: '10% deposit, 30 days settlement, unconditional finance waiver',
        conditions: 'B&P: 5 Days | Non-negotiable client yield limit',
        notes: 'Enforced strict discipline; refused to enter emotional bidding escalation above $830k.',
        statusBadge: 'Counter-Offer'
      },
      {
        id: 'step-l-4',
        stepNumber: 4,
        date: '2026-08-07',
        time: '05:30 PM',
        party: 'Vendor / Selling Agent',
        title: 'Deal Lost — Competing Buyer Outbid at $848,000 (Above Value)',
        amount: 848000,
        terms: 'Vendor signed unconditional contract with interstate investor',
        conditions: 'Unconditional exchange with 0-day finance',
        notes: 'Property sold $13,000 above list guide. Client congratulated for avoiding yield dilution.',
        statusBadge: 'Lost ❌'
      }
    ],
    history: [
      {
        id: 'hl-1',
        timestamp: '2026-08-04 09:30',
        party: 'Buyer (Iconic)',
        amount: 820000,
        terms: '10% deposit, 30 days',
        notes: 'Initial offer.'
      },
      {
        id: 'hl-2',
        timestamp: '2026-08-05 14:15',
        party: 'Vendor / Seller',
        amount: 840000,
        terms: 'Counter offer',
        notes: 'Vendor countered.'
      },
      {
        id: 'hl-3',
        timestamp: '2026-08-06 11:00',
        party: 'Buyer (Iconic)',
        amount: 828000,
        terms: 'Final ceiling position',
        notes: 'Hard ceiling offer.'
      },
      {
        id: 'hl-4',
        timestamp: '2026-08-07 17:30',
        party: 'Vendor / Seller',
        amount: 848000,
        terms: 'Sold to competing buyer',
        notes: 'Lost to unconditional cash buyer.'
      }
    ]
  },
  {
    id: 'neg-4',
    propertyId: 'prop-4',
    propertyAddress: '15 Carrington Boulevard, Salisbury Heights SA 5109',
    propertyImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
    listPrice: 690000,
    listedPrice: 690000,
    initialOffer: 670000,
    initialOfferDate: '2026-08-08',
    vendorCounterOffer: 682000,
    vendorCounterPrice: 682000,
    finalAgreedPrice: undefined,
    currentOfferPrice: 670000,
    outcome: 'Withdrawn',
    status: 'Draft',
    offerConditions: {
      finance: true,
      financeDays: 14,
      financeDueDate: '2026-08-22',
      buildingAndPest: true,
      bpDays: 7,
      bpDueDate: '2026-08-15',
      specialConditions: [
        'Subject to building and timber pest inspection satisfied in buyers absolute discretion',
        'Subject to geotechnical subsoil stability assessment'
      ],
      customNotes: 'Withdrawn due to severe unapproved retaining wall defect and subsoil movement risk.'
    },
    settlementDate: '2026-09-20',
    settlementDays: 30,
    depositAmount: 67000,
    depositPercent: 10,
    financeDays: 14,
    bpDays: 7,
    specialConditions: [
      'Subject to building and timber pest inspection satisfied in buyers absolute discretion',
      'Subject to geotechnical subsoil stability assessment'
    ],
    vendorMotivation: 'Deceased estate sale. Family executors seeking quick unconditional exit.',
    sellingAgentName: 'Samira Haddad',
    sellingAgentPhone: '+61 408 193 442',
    sellingAgentEmail: 'samira.h@harrisre.com.au',
    outcomeNotes: 'Offer withdrawn by Buyers Agency after specialized geotechnical inspection revealed active subsoil slippage and unapproved 1.8m timber sleeper retaining wall. Vendor refused $25,000 rectification credit. Client successfully protected from high-risk liability.',
    timeline: [
      {
        id: 'step-wd-1',
        stepNumber: 1,
        date: '2026-08-08',
        time: '10:00 AM',
        party: 'Buyer (Buyers Agent)',
        title: 'Initial Off-Market Offer of $670,000 Submitted',
        amount: 670000,
        terms: '10% deposit, 30 days settlement, conditional on technical building due diligence',
        conditions: 'Finance: 14 Days | B&P: 7 Days | Geotech Subsoil Clause',
        notes: 'Off-market opportunity submitted to deceased estate executors.',
        statusBadge: 'Submitted'
      },
      {
        id: 'step-wd-2',
        stepNumber: 2,
        date: '2026-08-09',
        time: '03:00 PM',
        party: 'Vendor / Selling Agent',
        title: 'Vendor Estate Executors Counter at $682,000',
        amount: 682000,
        terms: '30 days settlement, standard contract',
        conditions: 'Vendor requesting removal of specialized geotechnical clause',
        notes: 'Selling agent reported family executors counter-offered at $682,000.',
        statusBadge: 'Counter-Offer'
      },
      {
        id: 'step-wd-3',
        stepNumber: 3,
        date: '2026-08-11',
        time: '01:30 PM',
        party: 'Buyer (Buyers Agent)',
        title: 'Specialist Geotech Inspection Discovers Severe Subsoil Defect',
        amount: 670000,
        terms: 'Engineering quote: $28,500 to underpin rear embankment and replace failing retaining wall',
        conditions: 'Requested vendor to issue $25,000 price discount or rebuild wall prior to exchange',
        notes: 'Inspection detected 45mm outward lean on unapproved retaining wall. Vendor refused rectification credit.',
        statusBadge: 'Due Diligence'
      },
      {
        id: 'step-wd-4',
        stepNumber: 4,
        date: '2026-08-12',
        time: '11:45 AM',
        party: 'Buyer (Buyers Agent)',
        title: 'Offer Formally Withdrawn by Buyers Agency — Capital Protected 🛡️',
        amount: undefined,
        terms: 'Formal notice of offer withdrawal served on selling agent in writing.',
        conditions: 'Due diligence failed. Property flagged in database as high structural risk.',
        notes: 'Buyers agency protected client from an estimated $30,000+ structural liability. Deal withdrawn cleanly.',
        statusBadge: 'Withdrawn ↩️'
      }
    ],
    history: [
      {
        id: 'hwd-1',
        timestamp: '2026-08-08 10:00',
        party: 'Buyer (Iconic)',
        amount: 670000,
        terms: 'Initial offer',
        notes: 'Off market offer.'
      },
      {
        id: 'hwd-2',
        timestamp: '2026-08-09 15:00',
        party: 'Vendor / Seller',
        amount: 682000,
        terms: 'Counter offer',
        notes: 'Executors countered.'
      },
      {
        id: 'hwd-3',
        timestamp: '2026-08-12 11:45',
        party: 'Buyer (Iconic)',
        amount: 670000,
        terms: 'Withdrawn',
        notes: 'Withdrawn due to geotech failure.'
      }
    ]
  }
];

export const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 'settle-1',
    clientId: 'client-1',
    propertyId: 'prop-5',
    propertyAddress: '8 Coastal Ridge Road, Secret Harbour WA 6173',
    propertyImage: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1000&q=80',
    contractDate: '2026-08-15',
    settlementDate: '2026-09-25',
    coolingOffExpiry: '2026-08-20',
    purchasePrice: 705000,
    depositPaid: 70500,
    balanceDueAtSettlement: 634500,
    daysRemaining: 24,
    status: 'In Progress',
    conveyancer: {
      name: 'Jessica Sterling',
      firm: 'Apex Legal & Conveyancing WA',
      phone: '+61 8 9321 4450',
      email: 'jessica@apexlegal.wa.gov.au'
    },
    mortgageBroker: {
      name: 'Michael Chang',
      firm: 'Iconic Lending & Finance Partners',
      phone: '+61 418 332 990',
      email: 'm.chang@iconiclending.com.au'
    },
    propertyManager: {
      name: 'Brooke Henderson',
      agency: 'Elite Asset Management WA',
      phone: '+61 8 9582 1100',
      email: 'brooke@elitepm.wa.com.au'
    },
    tasks: [
      // 1. PRE-EXCHANGE
      {
        id: 'st-pe-1',
        title: 'Solicitor / Conveyancer Engaged & Contract Reviewed',
        description: 'Conveyancer instructed to conduct contract review, title searches, encumbrances, and special condition annexures.',
        section: 'pre-exchange',
        sectionName: 'Pre-Exchange',
        phase: 1,
        phaseName: 'Pre-Exchange',
        dueDate: '2026-08-12',
        completed: true,
        completedAt: '2026-08-12 14:00',
        assignee: 'Conveyancer',
        documentName: 'Apex_Contract_Review_Report.pdf',
        notes: 'Contract clear of adverse restrictive covenants.'
      },
      {
        id: 'st-pe-2',
        title: 'Pest & Building Inspection Completed (AS 4349.1)',
        description: 'Comprehensive structural, moisture, subfloor, and timber pest termite inspection executed by licensed inspector.',
        section: 'pre-exchange',
        sectionName: 'Pre-Exchange',
        phase: 1,
        phaseName: 'Pre-Exchange',
        dueDate: '2026-08-14',
        completed: true,
        completedAt: '2026-08-14 16:30',
        assignee: 'Building Inspector',
        documentName: 'AS4349_Building_Pest_Report_SecretHarbour.pdf',
        notes: 'Minor gutter debris noted; $1,200 maintenance credit negotiated.'
      },
      {
        id: 'st-pe-3',
        title: 'Formal Bank Finance Approved (Unconditional Loan Offer)',
        description: 'Lender valuation confirmed at purchase price ($705,000). Formal unconditional loan commitment letter issued.',
        section: 'pre-exchange',
        sectionName: 'Pre-Exchange',
        phase: 1,
        phaseName: 'Pre-Exchange',
        dueDate: '2026-08-15',
        completed: true,
        completedAt: '2026-08-15 11:15',
        assignee: 'Mortgage Broker',
        documentName: 'Macquarie_Unconditional_Approval_Letter.pdf',
        notes: 'Formal approval received with 80% LVR.'
      },

      // 2. EXCHANGE
      {
        id: 'st-ex-1',
        title: 'Deposit Paid (Transferred into Trust Escrow)',
        description: '10% deposit ($70,500 AUD) transferred via electronic trust transfer to selling agency trust account and receipted.',
        section: 'exchange',
        sectionName: 'Exchange',
        phase: 2,
        phaseName: 'Exchange',
        dueDate: '2026-08-16',
        completed: true,
        completedAt: '2026-08-16 10:00',
        assignee: 'Buyers Agent',
        documentName: 'Trust_Deposit_Receipt_70500.pdf',
        notes: 'Deposit receipt verified by conveyancer.'
      },
      {
        id: 'st-ex-2',
        title: 'Contracts Signed & Exchanged (Dated & Countersigned)',
        description: 'Both parties executed contracts of sale; identical contract copies dated and exchanged by respective conveyancers.',
        section: 'exchange',
        sectionName: 'Exchange',
        phase: 2,
        phaseName: 'Exchange',
        dueDate: '2026-08-16',
        completed: true,
        completedAt: '2026-08-16 17:00',
        assignee: 'Conveyancer',
        documentName: 'Executed_Contract_of_Sale.pdf',
        notes: 'Legally binding contract exchanged.'
      },
      {
        id: 'st-ex-3',
        title: 'Cooling-Off Period Noted & Tracked',
        description: 'Cooling-off statutory deadline logged (5 business days, expiring 20 August 2026 at 5:00 PM). Section 66W waiver if applicable.',
        section: 'exchange',
        sectionName: 'Exchange',
        phase: 2,
        phaseName: 'Exchange',
        dueDate: '2026-08-20',
        completed: true,
        completedAt: '2026-08-20 17:00',
        assignee: 'Conveyancer',
        notes: 'Cooling-off expired smoothly; contract is now fully unconditional.'
      },

      // 3. PRE-SETTLEMENT
      {
        id: 'st-ps-1',
        title: 'Final Pre-Settlement Inspection Booked & Conducted',
        description: 'Arrange on-site final walk-through with selling agent (2-3 days before settlement) to verify appliances, vacant possession, and cleanliness.',
        section: 'pre-settlement',
        sectionName: 'Pre-Settlement',
        phase: 3,
        phaseName: 'Pre-Settlement',
        dueDate: '2026-09-22',
        completed: false,
        assignee: 'Buyers Agent',
        documentName: 'Final_Inspection_Checklist_Template.pdf',
        notes: 'Scheduled with Claire Davenport for Tuesday 22 Sept at 10:00 AM.'
      },
      {
        id: 'st-ps-2',
        title: 'Utilities & Council Rates Transferred',
        description: 'Notify Synergy Electricity, Water Corporation, and local council for meter readings and settlement adjustment adjustments.',
        section: 'pre-settlement',
        sectionName: 'Pre-Settlement',
        phase: 3,
        phaseName: 'Pre-Settlement',
        dueDate: '2026-09-23',
        completed: false,
        assignee: 'Client',
        notes: 'Water meter reading ordered for adjustment calculation.'
      },
      {
        id: 'st-ps-3',
        title: 'Building & Landlord Insurance Arranged (Certificate of Currency)',
        description: 'Secure comprehensive building insurance policy with lender noted as interested party; send Certificate of Currency to broker & conveyancer.',
        section: 'pre-settlement',
        sectionName: 'Pre-Settlement',
        phase: 3,
        phaseName: 'Pre-Settlement',
        dueDate: '2026-09-20',
        completed: true,
        completedAt: '2026-08-30 09:00',
        assignee: 'Insurer',
        documentName: 'Certificate_of_Currency_Allianz.pdf',
        notes: 'Allianz policy active with $850k replacement cover.'
      },
      {
        id: 'st-ps-4',
        title: 'Conveyancing Settlement Statement & PEXA Workspace Ready',
        description: 'Conveyancer finalizes adjustments for council rates, land tax, water rates, and locks PEXA digital settlement workspace.',
        section: 'pre-settlement',
        sectionName: 'Pre-Settlement',
        phase: 3,
        phaseName: 'Pre-Settlement',
        dueDate: '2026-09-24',
        completed: false,
        assignee: 'Conveyancer',
        documentName: 'Draft_Settlement_Adjustment_Statement.pdf'
      },

      // 4. SETTLEMENT DAY
      {
        id: 'st-sd-1',
        title: 'Funds Transferred & Disbursed via PEXA',
        description: 'Electronic financial settlement executes on PEXA; lender loans drawn down, stamp duty paid, and balance transmitted to vendor.',
        section: 'settlement-day',
        sectionName: 'Settlement Day',
        phase: 4,
        phaseName: 'Settlement Day',
        dueDate: '2026-09-25',
        completed: false,
        assignee: 'Conveyancer',
        notes: 'Scheduled for 2:00 PM AEST on PEXA electronic exchange.'
      },
      {
        id: 'st-sd-2',
        title: 'Keys Received & Key Handover Completed',
        description: 'Selling agent notified of settlement completion; keys, fobs, alarm codes, and remotes collected and delivered to buyer/property manager.',
        section: 'settlement-day',
        sectionName: 'Settlement Day',
        phase: 4,
        phaseName: 'Settlement Day',
        dueDate: '2026-09-25',
        completed: false,
        assignee: 'Buyers Agent',
        notes: 'Key collection booked at Harcourts Secret Harbour office.'
      },
      {
        id: 'st-sd-3',
        title: 'Certificate of Title & Ownership Registration Confirmed',
        description: 'Landgate WA electronic registration confirms transfer of title and new certificate of title generated in buyer name.',
        section: 'settlement-day',
        sectionName: 'Settlement Day',
        phase: 4,
        phaseName: 'Settlement Day',
        dueDate: '2026-09-25',
        completed: false,
        assignee: 'Conveyancer',
        documentName: 'Landgate_Title_Search_Confirmation.pdf',
        notes: 'Final title search will be sent to client archive.'
      }
    ]
  },
  {
    id: 'settle-2',
    clientId: 'client-1',
    propertyId: 'prop-1',
    propertyAddress: '42 Bunya Pine Circuit, Kallangur QLD 4503',
    propertyImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80',
    contractDate: '2026-09-01',
    settlementDate: '2026-10-05',
    coolingOffExpiry: '2026-09-08',
    purchasePrice: 772500,
    depositPaid: 77250,
    balanceDueAtSettlement: 695250,
    daysRemaining: 34,
    status: 'In Progress',
    conveyancer: {
      name: 'Brendan Vance',
      firm: 'Sunstate Conveyancing Brisbane',
      phone: '+61 7 3229 1180',
      email: 'brendan@sunstatelegal.qld.gov.au'
    },
    mortgageBroker: {
      name: 'Michael Chang',
      firm: 'Iconic Lending & Finance Partners',
      phone: '+61 418 332 990',
      email: 'm.chang@iconiclending.com.au'
    },
    propertyManager: {
      name: 'Marcus Bell',
      agency: 'North Brisbane Property Management',
      phone: '+61 7 3480 9922',
      email: 'marcus@northbrisbanepm.com.au'
    },
    tasks: [
      {
        id: 'st-b2-1',
        title: 'Solicitor / Conveyancer Engaged & Contract Reviewed',
        description: 'Sunstate Conveyancing engaged to conduct REIQ standard contract review with $3,500 credit special clause.',
        section: 'pre-exchange',
        sectionName: 'Pre-Exchange',
        dueDate: '2026-08-30',
        completed: true,
        completedAt: '2026-08-30 15:00',
        assignee: 'Conveyancer',
        documentName: 'REIQ_Special_Conditions_Advice.pdf'
      },
      {
        id: 'st-b2-2',
        title: 'Pest & Building Inspection Completed (AS 4349.1)',
        description: 'Comprehensive report completed; $18k defect estimates used to secure $3,500 settlement credit.',
        section: 'pre-exchange',
        sectionName: 'Pre-Exchange',
        dueDate: '2026-08-31',
        completed: true,
        completedAt: '2026-08-31 10:00',
        assignee: 'Building Inspector',
        documentName: 'Kallangur_BP_Report.pdf'
      },
      {
        id: 'st-b2-3',
        title: 'Formal Bank Finance Approved (Unconditional Loan Offer)',
        description: 'CBA pre-approval converting to formal approval following signed contract submission.',
        section: 'pre-exchange',
        sectionName: 'Pre-Exchange',
        dueDate: '2026-09-07',
        completed: false,
        assignee: 'Mortgage Broker'
      },
      {
        id: 'st-b2-4',
        title: 'Deposit Paid (Transferred into Trust Escrow)',
        description: '10% initial deposit ($77,250) transferred to Ray White trust account.',
        section: 'exchange',
        sectionName: 'Exchange',
        dueDate: '2026-09-02',
        completed: false,
        assignee: 'Buyers Agent'
      },
      {
        id: 'st-b2-5',
        title: 'Contracts Signed & Exchanged (Dated & Countersigned)',
        description: 'REIQ contract signed by buyers and vendor with agreed special conditions annexure.',
        section: 'exchange',
        sectionName: 'Exchange',
        dueDate: '2026-09-01',
        completed: true,
        completedAt: '2026-09-01 16:00',
        assignee: 'Conveyancer',
        documentName: 'Executed_REIQ_Contract_Kallangur.pdf'
      },
      {
        id: 'st-b2-6',
        title: 'Cooling-Off Period Noted & Tracked',
        description: 'QLD 5-day statutory cooling off expires 8 Sept 2026.',
        section: 'exchange',
        sectionName: 'Exchange',
        dueDate: '2026-09-08',
        completed: false,
        assignee: 'Conveyancer'
      },
      {
        id: 'st-b2-7',
        title: 'Final Pre-Settlement Inspection Booked & Conducted',
        description: 'Inspect property to ensure RCD safety switch installed and vendor credit applied.',
        section: 'pre-settlement',
        sectionName: 'Pre-Settlement',
        dueDate: '2026-10-02',
        completed: false,
        assignee: 'Buyers Agent'
      },
      {
        id: 'st-b2-8',
        title: 'Utilities & Council Rates Transferred',
        description: 'Moreton Bay Regional Council & Unitywater account setup.',
        section: 'pre-settlement',
        sectionName: 'Pre-Settlement',
        dueDate: '2026-10-03',
        completed: false,
        assignee: 'Client'
      },
      {
        id: 'st-b2-9',
        title: 'Building & Landlord Insurance Arranged (Certificate of Currency)',
        description: 'Insurance policy covering building replacement of $750k.',
        section: 'pre-settlement',
        sectionName: 'Pre-Settlement',
        dueDate: '2026-09-15',
        completed: false,
        assignee: 'Insurer'
      },
      {
        id: 'st-b2-10',
        title: 'Funds Transferred & Disbursed via PEXA',
        description: 'Electronic PEXA settlement execution.',
        section: 'settlement-day',
        sectionName: 'Settlement Day',
        dueDate: '2026-10-05',
        completed: false,
        assignee: 'Conveyancer'
      },
      {
        id: 'st-b2-11',
        title: 'Keys Received & Key Handover Completed',
        description: 'Collect keys and transfer management to North Brisbane Property Management.',
        section: 'settlement-day',
        sectionName: 'Settlement Day',
        dueDate: '2026-10-05',
        completed: false,
        assignee: 'Property Manager'
      },
      {
        id: 'st-b2-12',
        title: 'Certificate of Title & Ownership Registration Confirmed',
        description: 'Titles Queensland registration confirmation.',
        section: 'settlement-day',
        sectionName: 'Settlement Day',
        dueDate: '2026-10-05',
        completed: false,
        assignee: 'Conveyancer'
      }
    ]
  }
];

export const MOCK_CLIENTS = INITIAL_CLIENTS;
export const MOCK_PROPERTIES = INITIAL_PROPERTIES;
export const MOCK_BP_ANALYSES = INITIAL_BP_ANALYSES;
export const MOCK_OFFERS = INITIAL_OFFERS;
export const MOCK_SETTLEMENTS = INITIAL_SETTLEMENTS;


