export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost";

export type Lead = {
  id: string;
  name: string;
  business: string;
  phone: string;
  email: string;
  industry: string;
  problem: string;
  process: string;
  status: LeadStatus;
  notes: string;
  createdAt: string; // ISO date
};

export type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  active: boolean;
};

export type CaseStudy = {
  id: string;
  title: string;
  industry: string;
  summary: string;
  problem: string;
  solution: string;
  result: string;
  published: boolean;
  isDemo: boolean;
  createdAt: string;
};

export type ContactFormValues = {
  name: string;
  business: string;
  whatsapp: string;
  email: string;
  industry: string;
  problem: string;
  process: string;
};
