import { getDb } from "./mongodb";
import {
  mockLeads,
  mockServices,
  mockCaseStudies,
  mockWebsiteContent,
  mockSettings,
} from "./mock-data";
import type { Lead, Service, CaseStudy } from "./types";

export type WebsiteContent = typeof mockWebsiteContent;
export type Settings = typeof mockSettings;

// In-memory fallback if MongoDB connection is not configured
const fallbackState = {
  leads: [] as Lead[],
  services: [...mockServices],
  caseStudies: [...mockCaseStudies],
  content: { ...mockWebsiteContent },
  settings: { ...mockSettings },
};

// ============================================================================
// LEADS
// ============================================================================
export async function getLeads(): Promise<Lead[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("MongoDB not connected, returning fallback leads");
      return fallbackState.leads;
    }

    const leads = await db
      .collection<Lead>("leads")
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return leads;
  } catch (error) {
    console.error("MongoDB getLeads error:", error);
    return fallbackState.leads;
  }
}

export async function getLeadById(id: string): Promise<Lead | null> {
  try {
    const db = await getDb();
    if (!db) {
      return fallbackState.leads.find((l) => l.id === id) || null;
    }

    const lead = await db
      .collection<Lead>("leads")
      .findOne({ id }, { projection: { _id: 0 } });

    return lead || null;
  } catch (error) {
    console.error("MongoDB getLeadById error:", error);
    return fallbackState.leads.find((l) => l.id === id) || null;
  }
}

export async function saveLead(lead: Lead): Promise<Lead> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("MongoDB not connected, saving lead to fallback memory");
      const index = fallbackState.leads.findIndex((l) => l.id === lead.id);
      if (index >= 0) {
        fallbackState.leads[index] = lead;
      } else {
        fallbackState.leads.unshift(lead);
      }
      return lead;
    }

    await db
      .collection("leads")
      .updateOne({ id: lead.id }, { $set: lead }, { upsert: true });

    return lead;
  } catch (error) {
    console.error("MongoDB saveLead error:", error);
    return lead;
  }
}

export async function deleteLead(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      const len = fallbackState.leads.length;
      fallbackState.leads = fallbackState.leads.filter((l) => l.id !== id);
      return fallbackState.leads.length !== len;
    }

    const res = await db.collection("leads").deleteOne({ id });
    return (res.deletedCount ?? 0) > 0;
  } catch (error) {
    console.error("MongoDB deleteLead error:", error);
    return false;
  }
}

export async function clearAllLeads(): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      fallbackState.leads = [];
      return true;
    }

    await db.collection("leads").deleteMany({});
    return true;
  } catch (error) {
    console.error("MongoDB clearAllLeads error:", error);
    return false;
  }
}

export async function loadSampleLeads(): Promise<Lead[]> {
  try {
    const db = await getDb();
    if (!db) {
      fallbackState.leads = [...mockLeads];
      return fallbackState.leads;
    }

    await db.collection("leads").deleteMany({});
    await db.collection("leads").insertMany(mockLeads.map((l) => ({ ...l })));
    return mockLeads;
  } catch (error) {
    console.error("MongoDB loadSampleLeads error:", error);
    return mockLeads;
  }
}

// ============================================================================
// SERVICES
// ============================================================================
export async function getServices(): Promise<Service[]> {
  try {
    const db = await getDb();
    if (!db) return fallbackState.services;

    const count = await db.collection("services").countDocuments();
    if (count === 0) {
      await db.collection("services").insertMany(mockServices.map((s) => ({ ...s })));
      return mockServices;
    }

    const services = await db
      .collection<Service>("services")
      .find({}, { projection: { _id: 0 } })
      .toArray();

    return services;
  } catch (error) {
    console.error("MongoDB getServices error:", error);
    return fallbackState.services;
  }
}

export async function saveServices(services: Service[]): Promise<Service[]> {
  try {
    const db = await getDb();
    if (!db) {
      fallbackState.services = services;
      return services;
    }

    await db.collection("services").deleteMany({});
    if (services.length > 0) {
      await db.collection("services").insertMany(services.map((s) => ({ ...s })));
    }
    return services;
  } catch (error) {
    console.error("MongoDB saveServices error:", error);
    return services;
  }
}

export async function saveService(service: Service): Promise<Service> {
  try {
    const db = await getDb();
    if (!db) {
      const idx = fallbackState.services.findIndex((s) => s.id === service.id);
      if (idx >= 0) fallbackState.services[idx] = service;
      else fallbackState.services.unshift(service);
      return service;
    }

    await db
      .collection("services")
      .updateOne({ id: service.id }, { $set: service }, { upsert: true });
    return service;
  } catch (error) {
    console.error("MongoDB saveService error:", error);
    return service;
  }
}

export async function deleteService(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      const len = fallbackState.services.length;
      fallbackState.services = fallbackState.services.filter((s) => s.id !== id);
      return fallbackState.services.length !== len;
    }

    const res = await db.collection("services").deleteOne({ id });
    return (res.deletedCount ?? 0) > 0;
  } catch (error) {
    console.error("MongoDB deleteService error:", error);
    return false;
  }
}

// ============================================================================
// CASE STUDIES
// ============================================================================
export async function getCaseStudies(): Promise<CaseStudy[]> {
  try {
    const db = await getDb();
    if (!db) return fallbackState.caseStudies;

    const count = await db.collection("case_studies").countDocuments();
    if (count === 0) {
      await db.collection("case_studies").insertMany(mockCaseStudies.map((c) => ({ ...c })));
      return mockCaseStudies;
    }

    const list = await db
      .collection<CaseStudy>("case_studies")
      .find({}, { projection: { _id: 0 } })
      .toArray();

    return list;
  } catch (error) {
    console.error("MongoDB getCaseStudies error:", error);
    return fallbackState.caseStudies;
  }
}

export async function saveCaseStudies(caseStudies: CaseStudy[]): Promise<CaseStudy[]> {
  try {
    const db = await getDb();
    if (!db) {
      fallbackState.caseStudies = caseStudies;
      return caseStudies;
    }

    await db.collection("case_studies").deleteMany({});
    if (caseStudies.length > 0) {
      await db.collection("case_studies").insertMany(caseStudies.map((c) => ({ ...c })));
    }
    return caseStudies;
  } catch (error) {
    console.error("MongoDB saveCaseStudies error:", error);
    return caseStudies;
  }
}

export async function saveCaseStudy(cs: CaseStudy): Promise<CaseStudy> {
  try {
    const db = await getDb();
    if (!db) {
      const idx = fallbackState.caseStudies.findIndex((c) => c.id === cs.id);
      if (idx >= 0) fallbackState.caseStudies[idx] = cs;
      else fallbackState.caseStudies.unshift(cs);
      return cs;
    }

    await db
      .collection("case_studies")
      .updateOne({ id: cs.id }, { $set: cs }, { upsert: true });
    return cs;
  } catch (error) {
    console.error("MongoDB saveCaseStudy error:", error);
    return cs;
  }
}

export async function deleteCaseStudy(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      const len = fallbackState.caseStudies.length;
      fallbackState.caseStudies = fallbackState.caseStudies.filter((c) => c.id !== id);
      return fallbackState.caseStudies.length !== len;
    }

    const res = await db.collection("case_studies").deleteOne({ id });
    return (res.deletedCount ?? 0) > 0;
  } catch (error) {
    console.error("MongoDB deleteCaseStudy error:", error);
    return false;
  }
}

// ============================================================================
// CONTENT
// ============================================================================
export async function getContent(): Promise<WebsiteContent> {
  try {
    const db = await getDb();
    if (!db) return fallbackState.content;

    const doc = await db
      .collection("content")
      .findOne({ _key: "site_content" }, { projection: { _id: 0, _key: 0 } });

    if (!doc) {
      await db.collection("content").updateOne(
        { _key: "site_content" },
        { $set: { _key: "site_content", ...mockWebsiteContent } },
        { upsert: true }
      );
      return mockWebsiteContent;
    }

    return { ...mockWebsiteContent, ...doc } as WebsiteContent;
  } catch (error) {
    console.error("MongoDB getContent error:", error);
    return fallbackState.content;
  }
}

export async function saveContent(content: Partial<WebsiteContent>): Promise<WebsiteContent> {
  try {
    const current = await getContent();
    const updated = { ...current, ...content };

    const db = await getDb();
    if (!db) {
      fallbackState.content = updated;
      return updated;
    }

    await db.collection("content").updateOne(
      { _key: "site_content" },
      { $set: { _key: "site_content", ...updated } },
      { upsert: true }
    );

    return updated;
  } catch (error) {
    console.error("MongoDB saveContent error:", error);
    return { ...mockWebsiteContent, ...content } as WebsiteContent;
  }
}

// ============================================================================
// SETTINGS
// ============================================================================
export async function getSettings(): Promise<Settings> {
  try {
    const db = await getDb();
    if (!db) return fallbackState.settings;

    const doc = await db
      .collection("settings")
      .findOne({ _key: "site_settings" }, { projection: { _id: 0, _key: 0 } });

    if (!doc) {
      await db.collection("settings").updateOne(
        { _key: "site_settings" },
        { $set: { _key: "site_settings", ...mockSettings } },
        { upsert: true }
      );
      return mockSettings;
    }

    return { ...mockSettings, ...doc } as Settings;
  } catch (error) {
    console.error("MongoDB getSettings error:", error);
    return fallbackState.settings;
  }
}

export async function saveSettings(settings: Partial<Settings>): Promise<Settings> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };

    const db = await getDb();
    if (!db) {
      fallbackState.settings = updated;
      return updated;
    }

    await db.collection("settings").updateOne(
      { _key: "site_settings" },
      { $set: { _key: "site_settings", ...updated } },
      { upsert: true }
    );

    return updated;
  } catch (error) {
    console.error("MongoDB saveSettings error:", error);
    return { ...mockSettings, ...settings } as Settings;
  }
}
