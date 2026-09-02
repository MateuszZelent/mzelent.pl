import { ProfileSchema } from "./schemas/profile.schema";
import { PublicationSchema } from "./schemas/publication.schema";
import { SoftwareSchema } from "./schemas/software.schema";
import { GrantSchema } from "./schemas/grant.schema";
import { TalkSchema } from "./schemas/talk.schema";
import { ResearchDomainSchema } from "./schemas/research-domain.schema";
import { BlogPostSchema } from "./schemas/blog.schema";

import { profileData } from "./data/profile";
import { publicationsData } from "./data/publications";
import { softwareData } from "./data/software";
import { grantsData } from "./data/grants";
import { talksData } from "./data/talks";
import { researchDomainsData } from "./data/research-domains";
import { blogPostsData } from "./data/blog";

/**
 * Validated scientific content models.
 * All datasets are parsed through strict Zod schemas at build/evaluation time.
 */
export const profile = ProfileSchema.parse(profileData);
export const publications = publicationsData.map((pub) => PublicationSchema.parse(pub));
export const software = softwareData.map((soft) => SoftwareSchema.parse(soft));
export const grants = grantsData.map((grant) => GrantSchema.parse(grant));
export const talks = talksData.map((talk) => TalkSchema.parse(talk));
export const researchDomains = researchDomainsData.map((domain) => ResearchDomainSchema.parse(domain));
export const blogPosts = blogPostsData.map((post) => BlogPostSchema.parse(post));

export * from "./schemas/profile.schema";
export * from "./schemas/publication.schema";
export * from "./schemas/software.schema";
export * from "./schemas/grant.schema";
export * from "./schemas/talk.schema";
export * from "./schemas/research-domain.schema";
export * from "./schemas/blog.schema";
