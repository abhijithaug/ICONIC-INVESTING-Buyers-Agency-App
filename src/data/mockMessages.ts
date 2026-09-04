import { AgentMessage, AdvocateContact } from '../types';

export const ADVOCATES: Record<string, AdvocateContact> = {
  'Damian Sterling': {
    name: 'Damian Sterling',
    role: 'Senior Buyers Advocate & Partner',
    agency: 'Iconic Investing',
    phone: '+61 418 720 941',
    email: 'damian.s@iconicinvesting.com.au',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    licenseNumber: 'LIC #04291884 (REIQ & REBAA)',
    status: 'Online',
    typicalResponseTime: '< 15 minutes (Mon–Sat)'
  },
  'Kylie Chen': {
    name: 'Kylie Chen',
    role: 'Head of Client Acquisitions',
    agency: 'Iconic Investing',
    phone: '+61 422 610 882',
    email: 'kylie.c@iconicinvesting.com.au',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    licenseNumber: 'LIC #05182901 (REBAA Member)',
    status: 'Online',
    typicalResponseTime: '< 20 minutes (Mon–Sat)'
  }
};

export const INITIAL_MESSAGES: AgentMessage[] = [
  // Client 1: Marcus & Elena Vance
  {
    id: 'msg-1',
    clientId: 'client-1',
    sender: 'agent',
    senderName: 'Damian Sterling',
    senderRole: 'Senior Buyers Advocate',
    senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    text: "Hi Marcus & Elena, welcome to your private Iconic Investing Client Portal! I've uploaded your tailored investment shortlist for South East QLD and Greater Perth. All properties meet your $700k–$920k budget and >5.2% gross yield mandate.",
    timestamp: '2026-09-01 09:30 AM',
    status: 'read'
  },
  {
    id: 'msg-2',
    clientId: 'client-1',
    sender: 'agent',
    senderName: 'Damian Sterling',
    senderRole: 'Senior Buyers Advocate',
    senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    text: "Take a close look at 42 Bunya Pine Circuit in Kallangur. It's a genuine off-market deal from Ray White before auction marketing. 680m² flat block with 3.2m side access—ideal for an auxiliary granny flat to push gross yield over 6.8%.",
    timestamp: '2026-09-01 10:15 AM',
    status: 'read',
    propertyRef: {
      id: 'prop-1',
      address: '42 Bunya Pine Circuit',
      suburb: 'Kallangur QLD',
      priceGuide: 785000,
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    id: 'msg-3',
    clientId: 'client-1',
    sender: 'client',
    senderName: 'Marcus Vance',
    text: "Hi Damian, thanks for this! Elena and I reviewed the cashflow and suburb metrics. Kallangur looks like an exceptional growth corridor. What were the key findings on the building & pest report?",
    timestamp: '2026-09-01 01:45 PM',
    status: 'read'
  },
  {
    id: 'msg-4',
    clientId: 'client-1',
    sender: 'agent',
    senderName: 'Damian Sterling',
    senderRole: 'Senior Buyers Advocate',
    senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    text: "Structural integrity is solid (AS 4349.1 verified). No active termites found and subfloor is dry. The inspector noted minor gutter flashing wear and subsoil drainage clearing needed (~$1,200). We used this during vendor negotiation to lock in a $5,000 price discount!",
    timestamp: '2026-09-01 02:20 PM',
    status: 'read',
    attachment: {
      name: 'AS4349_Building_Pest_Summary_Kallangur.pdf',
      type: 'PDF Document',
      size: '2.4 MB'
    }
  },
  {
    id: 'msg-5',
    clientId: 'client-1',
    sender: 'client',
    senderName: 'Elena Vance',
    text: "That is fantastic news! How is our settlement timeline progressing for 8 Coastal Ridge Road in WA?",
    timestamp: '2026-09-02 09:10 AM',
    status: 'read'
  },
  {
    id: 'msg-6',
    clientId: 'client-1',
    sender: 'agent',
    senderName: 'Damian Sterling',
    senderRole: 'Senior Buyers Advocate',
    senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    text: "Secret Harbour is tracking right on schedule! Pre-exchange and exchange phases are 100% complete. Pre-settlement inspection is locked in for Sept 22nd. You can track all 14 PEXA milestones live under your 'Settlement Progress' tab.",
    timestamp: '2026-09-02 10:05 AM',
    status: 'read'
  },

  // Client 2: Dr. Sophia Thornton (SMSF)
  {
    id: 'msg-c2-1',
    clientId: 'client-2',
    sender: 'agent',
    senderName: 'Damian Sterling',
    senderRole: 'Senior Buyers Advocate',
    senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    text: "Welcome Dr. Thornton! Your SMSF high-yield mandate ($1.1M–$1.65M) has been configured. We are filtering exclusively for high cashflow dual-occupancy assets with net yields exceeding 5.5%.",
    timestamp: '2026-09-01 11:00 AM',
    status: 'read'
  },
  {
    id: 'msg-c2-2',
    clientId: 'client-2',
    sender: 'client',
    senderName: 'Dr. Sophia Thornton',
    text: "Hi Damian, thank you. Has NAB Private Wealth issued the formal pre-approval certificate for the corporate trustee entity?",
    timestamp: '2026-09-01 02:30 PM',
    status: 'read'
  },
  {
    id: 'msg-c2-3',
    clientId: 'client-2',
    sender: 'agent',
    senderName: 'Damian Sterling',
    senderRole: 'Senior Buyers Advocate',
    senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    text: "Yes, verified pre-approval for $1,700,000 is on file and uploaded directly to your Document Hub. I've also shortlisted a dual-key asset in Toowoomba delivering $950/wk with dual metering.",
    timestamp: '2026-09-01 03:15 PM',
    status: 'read',
    attachment: {
      name: 'NAB_Private_Wealth_PreApproval_1.7M.pdf',
      type: 'PDF Document',
      size: '1.8 MB'
    }
  },

  // Client 3: Liam & Chloe O'Connor
  {
    id: 'msg-c3-1',
    clientId: 'client-3',
    sender: 'agent',
    senderName: 'Kylie Chen',
    senderRole: 'Head of Client Acquisitions',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    text: "Hi Liam & Chloe! Kylie here from Iconic Investing. Your Petrie and Moreton Bay capital growth search is active. We are inspecting two properties near the train line this Thursday.",
    timestamp: '2026-09-02 08:30 AM',
    status: 'read'
  },
  {
    id: 'msg-c3-2',
    clientId: 'client-3',
    sender: 'client',
    senderName: 'Liam O\'Connor',
    text: "Hi Kylie, that sounds great. Please ensure they aren't in the council overland flood overlay like the one on Ironbark Street.",
    timestamp: '2026-09-02 09:15 AM',
    status: 'read'
  },
  {
    id: 'msg-c3-3',
    clientId: 'client-3',
    sender: 'agent',
    senderName: 'Kylie Chen',
    senderRole: 'Head of Client Acquisitions',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    text: "100% agreed—flood corridors are an immediate dealbreaker for our clients. We ran council hydrology contour maps and both shortlisted homes sit high on the ridge line outside all flood zones.",
    timestamp: '2026-09-02 09:45 AM',
    status: 'read'
  }
];
