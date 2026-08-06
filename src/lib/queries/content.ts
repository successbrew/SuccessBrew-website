import { prisma } from "@/lib/prisma";

export async function getServices() {
  const rows = await prisma.service.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({ ...r, _id: r.id }));
}

export async function getBrandPartners() {
  const rows = await prisma.brandPartner.findMany({
    where: { group: "SERVICES_HOMEPAGE" },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({ ...r, _id: r.id }));
}

export async function getCommunityPartners() {
  const rows = await prisma.brandPartner.findMany({
    where: { group: "COMMUNITY_PARTNER" },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({ ...r, _id: r.id }));
}

export async function getCommunityMembers() {
  const rows = await prisma.brandPartner.findMany({
    where: { group: "COMMUNITY_MEMBER" },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({ ...r, _id: r.id }));
}

export async function getProcessSteps() {
  const rows = await prisma.processStep.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({ ...r, _id: r.id }));
}

export async function getCaseStudies() {
  const rows = await prisma.caseStudy.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({ ...r, _id: r.id }));
}

export async function getHomepageCaseStudies() {
  const rows = await prisma.caseStudy.findMany({
    where: { showOnHomepage: true },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({ ...r, _id: r.id }));
}

/** Client/service testimonials — powers the full /testimonials page. */
export async function getServiceTestimonials() {
  const rows = await prisma.testimonial.findMany({
    where: { group: "SERVICE" },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({
    ...r,
    _id: r.id,
    cardStyle: r.cardStyle.toLowerCase() as "sand" | "dark",
    avatarStyle: r.avatarStyle.toLowerCase() as "primary" | "accent",
  }));
}

/** Curated subset of service testimonials featured on the home/service page. */
export async function getHomepageTestimonials() {
  const rows = await prisma.testimonial.findMany({
    where: { group: "SERVICE", showOnHomepage: true },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({
    ...r,
    _id: r.id,
    cardStyle: r.cardStyle.toLowerCase() as "sand" | "dark",
    avatarStyle: r.avatarStyle.toLowerCase() as "primary" | "accent",
  }));
}

/** Community testimonials — powers /community/testimonials. */
export async function getCommunityTestimonials() {
  const rows = await prisma.testimonial.findMany({
    where: { group: "COMMUNITY" },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({
    ...r,
    _id: r.id,
    cardStyle: r.cardStyle.toLowerCase() as "sand" | "dark",
    avatarStyle: r.avatarStyle.toLowerCase() as "primary" | "accent",
  }));
}

export async function getStats() {
  const rows = await prisma.stat.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    ...r,
    _id: r.id,
    colorScheme: r.colorScheme.toLowerCase() as "default" | "primary" | "accent",
  }));
}

export async function getCommunityEvents() {
  const rows = await prisma.communityEvent.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    ...r,
    _id: r.id,
    imageUrl: r.imageUrl ?? "",
    speaker: r.speaker ?? undefined,
    registerUrl: r.registerUrl ?? undefined,
    seatsNote: r.seatsNote ?? undefined,
  }));
}

export async function getPodcastEpisodes() {
  const rows = await prisma.podcastEpisode.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    ...r,
    _id: r.id,
    listenUrl: r.listenUrl ?? undefined,
    thumbnailUrl: r.thumbnailUrl ?? undefined,
  }));
}

export async function getCommunityWins() {
  const rows = await prisma.communityWin.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    ...r,
    _id: r.id,
    cardStyle: r.cardStyle.toLowerCase() as "sand" | "blue" | "dark",
    avatarStyle: r.avatarStyle.toLowerCase() as "blue" | "lime",
  }));
}

export async function getCommunityPosts() {
  const rows = await prisma.communityPost.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    ...r,
    _id: r.id,
    avatarStyle: r.avatarStyle.toLowerCase() as "blue" | "dark",
    tagStyle: (r.tagStyle === "LIGHT_BLUE" ? "lightBlue" : r.tagStyle.toLowerCase()) as
      | "lime"
      | "dark"
      | "lightBlue",
  }));
}

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return {
    instagramUrl: settings?.instagramUrl ?? null,
    instagramUrl2: settings?.instagramUrl2 ?? null,
    linkedinUrl: settings?.linkedinUrl ?? null,
    youtubeUrl: settings?.youtubeUrl ?? null,
  };
}

/** Category -> sub-category tree for the application wizard's step-2 dependent dropdown. */
export async function getApplicationCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { subCategories: { orderBy: { order: "asc" } } },
  });
  return categories.map((c) => ({
    id: c.id,
    key: c.key,
    label: c.label,
    subCategories: c.subCategories.map((s) => ({ id: s.id, label: s.label })),
  }));
}
