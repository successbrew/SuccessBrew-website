import Link from "next/link";
import { notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { getSiteSettings } from "@/lib/queries/content";
import { getPublishedPost, getRelatedPosts, renderPost } from "@/lib/blog";
import { BLOG_PATH, blogPostPath, formatPostDate } from "@/lib/blog-format";
import { PostCardView, TagChip } from "@/components/blog/PostCard";
import { ReadingProgress, ShareButtons, TableOfContents } from "@/components/blog/PostChrome";
import { CoverReveal, FadeIn, RiseTitle } from "@/components/blog/BlogMotion";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://successbrew.in";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug).catch(() => null);
  if (!post) return {};
  const url = `${SITE_URL}${blogPostPath(post.slug)}`;
  const description = post.excerpt || `${post.title} — on the Successbrew blog.`;
  const images = post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined;
  return {
    title: `${post.title} | Successbrew Blog`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
      tags: post.tags.map((t) => t.tag.name),
      images,
    },
    twitter: { card: post.coverImageUrl ? "summary_large_image" : "summary", title: post.title, description, images: post.coverImageUrl ? [post.coverImageUrl] : undefined },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, siteSettings] = await Promise.all([
    getPublishedPost(slug).catch(() => null),
    getSiteSettings().catch(() => ({ instagramUrl: null, instagramUrl2: null, linkedinUrl: null, youtubeUrl: null })),
  ]);
  if (!post) notFound();

  const tags = post.tags.map((t) => t.tag);
  const { html, toc, readingMinutes } = renderPost(post.body);
  const related = await getRelatedPosts(post.id, tags.map((t) => t.id)).catch(() => []);
  const url = `${SITE_URL}${blogPostPath(post.slug)}`;
  const published = post.publishedAt?.toISOString() ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImageUrl ?? undefined,
    datePublished: published ?? undefined,
    dateModified: post.updatedAt.toISOString(),
    author: post.authorName ? { "@type": "Person", name: post.authorName } : { "@type": "Organization", name: "Successbrew" },
    publisher: { "@type": "Organization", name: "Successbrew", url: SITE_URL },
    mainEntityOfPage: url,
    keywords: tags.map((t) => t.name).join(", ") || undefined,
  };

  return (
    <>
      <ReadingProgress />
      <NavBar activePage="Blog" ctaText="Apply to Join" ctaHref="/apply?source=blog" />
      <main className="min-h-screen bg-[#F2ECDD] font-sans text-[#111111]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

        {/* ══ HEADER ═════════════════════════════════════════════════════ */}
        <header className="pt-32 lg:pt-40">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <Link href={BLOG_PATH} className="text-xs font-semibold uppercase tracking-[0.12em] text-[#111111]/50 hover:text-[#003CD1]">← All posts</Link>
            {tags.length > 0 && (
              <FadeIn y={12} className="mt-8 flex flex-wrap gap-2">
                {tags.map((t) => <TagChip key={t.slug} name={t.name} slug={t.slug} />)}
              </FadeIn>
            )}
            <RiseTitle text={post.title} delay={0.1} className="mt-6 text-[clamp(2.25rem,5.5vw,4.5rem)] font-black leading-[1.02] tracking-tight" />
            {post.excerpt && <FadeIn delay={0.35} y={16}><p className="mt-6 max-w-3xl text-xl leading-relaxed text-[#111111]/65">{post.excerpt}</p></FadeIn>}
            <FadeIn delay={0.5} y={12} className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#111111]/10 pt-6 text-sm">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#003CD1] font-bold text-white">
                {(post.authorName ?? "S").charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-bold">{post.authorName ?? "Successbrew Team"}</p>
                <p className="text-[#111111]/50">
                  {published && <time dateTime={published}>{formatPostDate(published)}</time>}
                  <span className="mx-2 text-[#111111]/25">·</span>{readingMinutes} min read
                </p>
              </div>
            </FadeIn>
          </div>
          {post.coverImageUrl && (
            <div className="mx-auto mt-10 max-w-6xl px-6 lg:px-10">
              <CoverReveal src={post.coverImageUrl} />
            </div>
          )}
        </header>

        {/* ══ ARTICLE ════════════════════════════════════════════════════ */}
        <div className={`mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:px-10 lg:py-20 ${toc.length >= 2 ? "lg:grid-cols-[1fr_15rem]" : ""}`}>
          <div className="min-w-0">
            <FadeIn delay={0.1}>
              <article className="blog-prose mx-auto max-w-[68ch]" dangerouslySetInnerHTML={{ __html: html }} />
            </FadeIn>
            <div className="mx-auto mt-14 max-w-[68ch] space-y-6 border-t border-[#111111]/10 pt-8">
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#111111]/45">Filed under</span>
                  {tags.map((t) => <TagChip key={t.slug} name={t.name} slug={t.slug} />)}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <span className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#111111]/45">Share</span>
                <ShareButtons url={url} title={post.title} />
              </div>
            </div>
          </div>
          {toc.length >= 2 && (
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-8">
                <TableOfContents items={toc} />
              </div>
            </aside>
          )}
        </div>

        {/* ══ RELATED ════════════════════════════════════════════════════ */}
        {related.length > 0 && (
          <section className="border-t border-[#111111]/10 bg-[#FFF3D0] py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="mb-10 flex items-end justify-between gap-4">
                <h2 className="text-3xl font-black tracking-tight md:text-4xl">Keep reading.</h2>
                <Link href={BLOG_PATH} className="shrink-0 text-sm font-semibold text-[#003CD1] hover:underline">All posts →</Link>
              </div>
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p, i) => <FadeIn key={p.id} delay={i * 0.08}><PostCardView post={p} /></FadeIn>)}
              </div>
            </div>
          </section>
        )}

        {/* ══ CTA ════════════════════════════════════════════════════════ */}
        <section className="bg-[#111111] py-16 text-white lg:py-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <h2 className="max-w-2xl text-balance text-3xl font-black leading-[1.05] tracking-tight md:text-5xl">Want to talk about this with 8,000+ founders?</h2>
            <Link href="/apply?source=blog" className="w-fit rounded-full bg-[#C6FF3A] px-7 py-4 text-sm font-bold text-[#111111] transition hover:translate-y-[-2px]">Join the Community</Link>
          </div>
        </section>

        <Footer siteSettings={siteSettings} />
      </main>
    </>
  );
}
