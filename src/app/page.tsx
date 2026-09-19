import Hero from "@/components/home/hero";
import BusinessProblems from "@/components/home/business-problems";
import WhatWeDo from "@/components/home/what-we-do";
import AutomationAreas from "@/components/home/automation-areas";
import HowItWorks from "@/components/home/how-it-works";
import SolutionsGrid from "@/components/home/solutions-grid";
import CaseStudies from "@/components/home/case-studies";
import AutomationFinder from "@/components/home/automation-finder";
import FinalCta from "@/components/home/final-cta";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <>
      <Hero />
      <BusinessProblems />
      <WhatWeDo />
      <AutomationAreas />
      <HowItWorks />
      <SolutionsGrid compact />
      <CaseStudies />
      <AutomationFinder />
      <FinalCta />
    </>
  );
}
