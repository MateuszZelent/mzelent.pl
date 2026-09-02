export type Language = "pl" | "en";

export interface TranslationDictionary {
  nav: {
    brandTitle: string;
    research: string;
    grants: string;
    software: string;
    publications: string;
    visualLab: string;
    activeResearch: string;
    labSandbox: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleAccent: string;
    lead: string;
    ctaResearch: string;
    ctaLab: string;
    domain1: string;
    domain2: string;
    domain3: string;
  };
  researchGrid: {
    tag: string;
    title: string;
    titleAccent: string;
    lead: string;
  };
  grants: {
    tag: string;
    title: string;
    titleAccent: string;
    lead: string;
    projectDetails: string;
    hostPartner: string;
    budget: string;
    grantNo: string;
    statusActive: string;
    statusCompleted: string;
  };
  software: {
    tag: string;
    title: string;
    titleAccent: string;
    lead: string;
    repoLink: string;
  };
  publications: {
    tag: string;
    title: string;
    titleAccent: string;
    lead: string;
    viewAll: string;
    openAccess: string;
    doi: string;
    copyBibtex: string;
    copied: string;
  };
  affiliations: {
    title: string;
    subtitle: string;
    mscaNote: string;
    ncnNote: string;
  };
  footer: {
    roleBio: string;
    navigationTitle: string;
    architectureTitle: string;
    backToTop: string;
    copyright: string;
  };
  publicationsPage: {
    heading: string;
    headingAccent: string;
    subheading: string;
    searchPlaceholder: string;
    allJournals: string;
    allYears: string;
    totalFound: string;
    backToHome: string;
    syncNotice: string;
    noResults: string;
  };
}
