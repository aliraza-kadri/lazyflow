import type { Lead, Service, CaseStudy } from "@/lib/types";

// ============================================================================
// MOCK DATA — Admin panel UI only. No database is connected.
// When Supabase is added, replace these arrays with data fetched from
// `leads`, `services` and `case_studies` tables using the same shapes below.
// ============================================================================

export const mockLeads: Lead[] = [
  {
    id: "ld_001",
    name: "Rohit Mehta",
    business: "Mehta Garments",
    phone: "+91 98200 11223",
    email: "rohit@mehtagarments.in",
    industry: "Garments",
    problem: "We miss wholesale enquiries that come over WhatsApp after hours.",
    process: "Manually replying to every catalog request",
    status: "New",
    notes: "",
    createdAt: "2026-09-08T10:15:00.000Z",
  },
  {
    id: "ld_002",
    name: "Ayesha Khan",
    business: "Glow Studio Salon",
    phone: "+91 90210 44556",
    email: "ayesha@glowstudio.in",
    industry: "Salons",
    problem: "Too many no-shows for appointments.",
    process: "Calling every client a day before their appointment",
    status: "Contacted",
    notes: "Called on 9 Sep, interested — sending proposal next week.",
    createdAt: "2026-09-06T14:40:00.000Z",
  },
  {
    id: "ld_003",
    name: "Sanjay Patel",
    business: "Patel Electronics",
    phone: "+91 99887 65432",
    email: "sanjay@patelelectronics.in",
    industry: "Retail",
    problem: "Inventory numbers are always out of sync across two stores.",
    process: "Updating two spreadsheets manually every evening",
    status: "Qualified",
    notes: "Strong fit — wants a demo of the inventory sync flow.",
    createdAt: "2026-09-05T09:00:00.000Z",
  },
  {
    id: "ld_004",
    name: "Neha Verma",
    business: "The Daily Brew Cafe",
    phone: "+91 91234 56789",
    email: "neha@dailybrew.in",
    industry: "Restaurants & Cafes",
    problem: "Table reservations are handled over calls, often overlapping.",
    process: "Writing bookings in a physical register",
    status: "Proposal",
    notes: "Proposal shared 3 Sep. Awaiting confirmation.",
    createdAt: "2026-09-03T16:20:00.000Z",
  },
  {
    id: "ld_005",
    name: "Karan Shah",
    business: "Shah & Associates",
    phone: "+91 98765 12340",
    email: "karan@shahassociates.in",
    industry: "Service Business",
    problem: "Sending the same weekly status report manually to 12 clients.",
    process: "Copy-pasting data into a report template every Friday",
    status: "Won",
    notes: "Signed on 28 Aug. Kickoff scheduled.",
    createdAt: "2026-08-28T11:10:00.000Z",
  },
  {
    id: "ld_006",
    name: "Priya Nair",
    business: "CarePlus Clinic",
    phone: "+91 90000 11122",
    email: "priya@careplusclinic.in",
    industry: "Clinics",
    problem: "Patients forget appointments, front desk spends hours calling.",
    process: "Manual reminder calls every morning",
    status: "Lost",
    notes: "Went with an in-house solution.",
    createdAt: "2026-08-20T08:30:00.000Z",
  },
  {
    id: "ld_007",
    name: "Arjun Reddy",
    business: "Reddy Realty",
    phone: "+91 93456 78901",
    email: "arjun@reddyrealty.in",
    industry: "Real Estate",
    problem: "Leads from property portals aren't followed up quickly.",
    process: "Checking multiple portal dashboards manually each day",
    status: "New",
    notes: "",
    createdAt: "2026-09-09T12:05:00.000Z",
  },
  {
    id: "ld_008",
    name: "Divya Iyer",
    business: "Iyer E-store",
    phone: "+91 99001 22334",
    email: "divya@iyerestore.in",
    industry: "E-commerce",
    problem: "Abandoned carts never get a follow-up message.",
    process: "No process at all — carts are simply lost",
    status: "Contacted",
    notes: "Sent intro deck, follow-up call booked.",
    createdAt: "2026-09-07T18:45:00.000Z",
  },
];

export const mockServices: Service[] = [
  {
    id: "sv_001",
    title: "WhatsApp Automation",
    description: "Auto-replies, lead capture, order updates and support built into WhatsApp.",
    category: "Communication",
    active: true,
  },
  {
    id: "sv_002",
    title: "AI Automation",
    description: "AI that reads, sorts, responds and assists across your operations.",
    category: "AI",
    active: true,
  },
  {
    id: "sv_003",
    title: "Workflow Automation",
    description: "Multi-step internal processes connected end-to-end.",
    category: "Operations",
    active: true,
  },
  {
    id: "sv_004",
    title: "Lead & Follow-up Automation",
    description: "Every enquiry captured, qualified and followed up automatically.",
    category: "Sales",
    active: true,
  },
  {
    id: "sv_005",
    title: "CRM Automation",
    description: "Customer data organised, updated and actioned automatically.",
    category: "Sales",
    active: true,
  },
  {
    id: "sv_006",
    title: "Custom Business Automation",
    description: "Automation designed around a process unique to your business.",
    category: "Custom",
    active: true,
  },
];

export const mockCaseStudies: CaseStudy[] = [
  {
    id: "cs_001",
    title: "Cutting order-handling time for a retail chain",
    industry: "Retail",
    summary: "Replaced manual order tracking across two stores with a synced automated flow.",
    problem: "Orders and stock were tracked in two disconnected spreadsheets, updated manually every evening.",
    solution: "Built a workflow connecting POS data to a single automated stock & order tracker with WhatsApp order alerts.",
    result: "Store staff no longer reconcile spreadsheets manually at day-end.",
    published: true,
    isDemo: true,
    createdAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "cs_002",
    title: "Automating appointment reminders for a salon",
    industry: "Salons",
    summary: "Reduced manual reminder calls with an automated WhatsApp confirmation flow.",
    problem: "Front desk staff called every client individually the day before their appointment.",
    solution: "Automated WhatsApp reminders triggered directly from the booking calendar.",
    result: "Manual reminder calls were removed from the daily routine.",
    published: false,
    isDemo: true,
    createdAt: "2026-07-18T00:00:00.000Z",
  },
];

export const mockDashboardStats = {
  totalLeads: mockLeads.length,
  newLeads: mockLeads.filter((l) => l.status === "New").length,
  qualifiedLeads: mockLeads.filter((l) => l.status === "Qualified").length,
  wonLeads: mockLeads.filter((l) => l.status === "Won").length,
};

export const mockLeadsByWeek = [
  { label: "Wk 1", value: 3 },
  { label: "Wk 2", value: 5 },
  { label: "Wk 3", value: 4 },
  { label: "Wk 4", value: 8 },
  { label: "Wk 5", value: 6 },
  { label: "Wk 6", value: 9 },
];

export const mockLeadsByIndustry = [
  { label: "Retail", value: 1 },
  { label: "Garments", value: 1 },
  { label: "Salons", value: 1 },
  { label: "Restaurants", value: 1 },
  { label: "Services", value: 1 },
  { label: "Clinics", value: 1 },
  { label: "Real Estate", value: 1 },
  { label: "E-commerce", value: 1 },
];

export const mockWebsiteContent = {
  heroHeading: "Your business has problems.\nWe build the systems to solve them.",
  heroDescription:
    "LazyFlow helps businesses identify repetitive work, remove bottlenecks and build custom automation that makes operations simpler and more efficient.",
  ctaPrimaryText: "Automate My Business",
  ctaSecondaryText: "Talk to Us",
  aboutText:
    "LazyFlow began with a simple observation: most businesses don't need more software — they need someone to actually look at how they work and fix what's repetitive, manual or broken.",
  contactEmail: "hello@lazyflow.in",
  contactWhatsapp: "919999999999",
  instagramUrl: "https://instagram.com/lazyflow.in",
  linkedinUrl: "https://linkedin.com/company/lazyflow-in",
};

export const mockSettings = {
  whatsappNumber: "919999999999",
  email: "hello@lazyflow.in",
  instagram: "https://instagram.com/lazyflow.in",
  linkedin: "https://linkedin.com/company/lazyflow-in",
  metaTitle: "LazyFlow — Business Automation",
  metaDescription:
    "LazyFlow helps businesses identify repetitive work, remove bottlenecks and build custom automation.",
};
