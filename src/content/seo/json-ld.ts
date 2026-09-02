import type { Profile } from "../schemas/profile.schema";
import type { Publication } from "../schemas/publication.schema";
import type { Software } from "../schemas/software.schema";

export function generatePersonJsonLd(profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.primaryRole,
    description: profile.bio,
    worksFor: {
      "@type": "EducationalOrganization",
      name: profile.affiliation.institution,
      subOrganization: {
        "@type": "Department",
        name: `${profile.affiliation.department}, ${profile.affiliation.faculty}`,
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: profile.affiliation.city,
        addressCountry: profile.affiliation.country,
      },
      url: profile.affiliation.website,
    },
    sameAs: [
      `https://orcid.org/${profile.identifiers.orcid}`,
      profile.identifiers.googleScholar,
      profile.identifiers.github,
    ].filter(Boolean),
    knowsAbout: profile.researchInterests,
  };
}

export function generateScholarlyArticleJsonLd(pub: Publication) {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: pub.title,
    author: pub.authors.map((author) => ({
      "@type": "Person",
      name: author,
    })),
    datePublished: `${pub.year}`,
    isPartOf: {
      "@type": "Periodical",
      name: pub.journal,
    },
    identifier: {
      "@type": "PropertyValue",
      propertyID: "doi",
      value: pub.doi,
    },
    url: pub.doiUrl,
    description: pub.abstract,
    keywords: pub.keywords.join(", "),
  };
}

export function generateSoftwareApplicationJsonLd(soft: Software) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: soft.name,
    description: soft.description,
    applicationCategory: "ScientificSoftware",
    operatingSystem: "Linux, macOS, Windows",
    programmingLanguage: soft.language,
    license: soft.license,
    codeRepository: soft.repoUrl,
  };
}
