export type Language = "pl" | "en";

export interface TranslationDictionary {
  nav: {
    brandTitle: string;
    research: string;
    grants: string;
    software: string;
    publications: string;
    cv: string;
    talks: string;
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
  adminScholar: {
    badge: string;
    heading: string;
    headingAccent: string;
    lead: string;
    statusConnected: string;
    syncTitle: string;
    syncDesc: string;
    syncBtn: string;
    bibtexTitle: string;
    bibtexDesc: string;
    bibtexPlaceholder: string;
    parseBtn: string;
    stagedTitle: string;
    commitBtn: string;
    successParsed: string;
    successCommitted: string;
    noStaged: string;
  };
  cvPage: {
    badge: string;
    heading: string;
    headingAccent: string;
    lead: string;
    appointmentsTitle: string;
    educationTitle: string;
    grantsTitle: string;
    skillsTitle: string;
    talksTitle: string;
    contactTitle: string;
    printCv: string;
  };
  researchPage: {
    badge: string;
    heading: string;
    headingAccent: string;
    lead: string;
    domain1Title: string;
    domain1Desc: string;
    domain1Math: string;
    domain2Title: string;
    domain2Desc: string;
    domain2Math: string;
    domain3Title: string;
    domain3Desc: string;
    domain3Math: string;
    backToHome: string;
  };
  softwarePage: {
    badge: string;
    heading: string;
    headingAccent: string;
    lead: string;
    quickstart: string;
    techStack: string;
    keyFeatures: string;
    license: string;
  };
  talksPage: {
    badge: string;
    heading: string;
    headingAccent: string;
    lead: string;
    filterAll: string;
    filterInvited: string;
    abstractTitle: string;
  };
}
