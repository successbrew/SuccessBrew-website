/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { BorderBeam } from "@/components/ui/border-beam";
import { blogPostPath, blogTagPath, formatPostDate, type PostCard as Post } from "@/lib/blog-format";

export function TagChip({ name, slug, active = false, count }: { name: string; slug: string; active?: boolean; count?: number }) {
  return (
    <Link href={blogTagPath(slug)} aria-current={active ? "page" : undefined}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-[color,background-color,border-color,transform] duration-200 hover:-translate-y-px ${active ? "border-[#003CD1] bg-[#003CD1] text-white" : "border-[#111111]/12 bg-white text-[#111111]/70 hover:border-[#003CD1]/40 hover:text-[#003CD1]"}`}>
      {name}
      {count !== undefined && <span className={active ? "text-white/70" : "text-[#111111]/35"}>{count}</span>}
    </Link>
  );
}

function Meta({ post }: { post: Post }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#111111]/45">
      {formatPostDate(post.publishedAt)}<span className="mx-2 text-[#111111]/25">·</span>{post.readingMinutes} min read
    </p>
  );
}

function Cover({ post, className }: { post: Post; className: string }) {
  return post.coverImageUrl ? (
    <img src={post.coverImageUrl} alt="" loading="lazy" className={`${className} object-cover transition-transform duration-700 group-hover:scale-[1.03]`} />
  ) : (
    // No cover: a branded panel with the title's initial, so the grid never has holes.
    <div className={`${className} grid place-items-center bg-[linear-gradient(135deg,#003CD1_0%,#0B1640_100%)]`}>
      <span className="text-6xl font-black text-[#C6FF3A]/80">{post.title.charAt(0)}</span>
    </div>
  );
}

export function PostCardView({ post }: { post: Post }) {
  return (
    <article className="group flex h-full flex-col">
      <Link href={blogPostPath(post.slug)} tabIndex={-1} aria-hidden
        className="block overflow-hidden rounded-2xl bg-[#111111]/5 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.5)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_50px_-28px_rgba(0,60,209,0.45)]">
        <Cover post={post} className="aspect-[16/10] w-full" />
      </Link>
      <div className="mt-5 flex flex-1 flex-col">
        {post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((t) => <TagChip key={t.slug} name={t.name} slug={t.slug} />)}
          </div>
        )}
        <h3 className="text-xl font-black leading-snug tracking-tight">
          <Link href={blogPostPath(post.slug)}
            className="bg-[linear-gradient(#C6FF3A,#C6FF3A)] bg-[length:0%_0.35em] bg-left-bottom bg-no-repeat transition-[background-size,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[length:100%_0.35em]">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-[#111111]/60">{post.excerpt}</p>}
        <div className="mt-auto pt-4"><Meta post={post} /></div>
      </div>
    </article>
  );
}

/** Wide card for the newest post at the top of a listing. */
export function FeaturedPostCard({ post }: { post: Post }) {
  const ref = useRef<HTMLElement>(null);
  const [hot, setHot] = useState(false);
  // Spotlight position goes straight into CSS variables — no re-render per move.
  const move = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !ref.current) return;
    ref.current.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
  };
  return (
    <article ref={ref} onPointerEnter={() => setHot(true)} onPointerLeave={() => setHot(false)} onPointerMove={move}
      className="group relative grid overflow-hidden rounded-3xl bg-white shadow-[0_30px_70px_-45px_rgba(0,0,0,0.4)] transition-shadow duration-500 hover:shadow-[0_40px_80px_-40px_rgba(0,60,209,0.45)] lg:grid-cols-[1.2fr_1fr]">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(420px_circle_at_var(--spot-x,50%)_var(--spot-y,50%),rgba(198,255,58,0.18),transparent_60%)]" />
      <BorderBeam active={hot} />
      <Link href={blogPostPath(post.slug)} className="block overflow-hidden" tabIndex={-1} aria-hidden>
        <Cover post={post} className="aspect-[16/10] h-full w-full lg:aspect-auto lg:min-h-[380px]" />
      </Link>
      <div className="flex flex-col justify-center p-7 sm:p-10">
        <p className="mb-4 inline-flex w-fit rounded-full bg-[#C6FF3A] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#111111]">Latest</p>
        <h2 className="text-balance text-3xl font-black leading-[1.08] tracking-tight md:text-4xl">
          <Link href={blogPostPath(post.slug)} className="transition-colors hover:text-[#003CD1]">{post.title}</Link>
        </h2>
        {post.excerpt && <p className="mt-4 line-clamp-4 text-base leading-relaxed text-[#111111]/65">{post.excerpt}</p>}
        {post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {post.tags.map((t) => <TagChip key={t.slug} name={t.name} slug={t.slug} />)}
          </div>
        )}
        <div className="mt-6 flex items-center justify-between gap-4">
          <Meta post={post} />
          <Link href={blogPostPath(post.slug)} className="text-sm font-bold text-[#003CD1] hover:underline">Read →</Link>
        </div>
      </div>
    </article>
  );
}
