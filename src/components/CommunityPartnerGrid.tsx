/* eslint-disable @next/next/no-img-element */
"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import type { BrandPartner } from "@/components/LogoShowcase";

const E = [0.22, 1, 0.36, 1] as const;

type Slot = { kind: "blank" } | { kind: "logo"; partner: BrandPartner };

/** Spreads logos evenly across the available slots (Bresenham-style) so they
 * scatter instead of clustering, however many partners there are. */
function buildSlots(partners: BrandPartner[], blankCount: number): Slot[] {
  const total = partners.length + blankCount;
  const slots: Slot[] = [];
  let used = 0;
  for (let i = 0; i < total; i++) {
    const shouldPlaceLogo = Math.floor((i * partners.length) / total) !== Math.floor(((i - 1) * partners.length) / total);
    if (shouldPlaceLogo && used < partners.length) {
      slots.push({ kind: "logo", partner: partners[used] });
      used++;
    } else {
      slots.push({ kind: "blank" });
    }
  }
  return slots;
}

/** Where the feature block should sit so it lands dead-center in a `cols`-wide
 * grid, given how many other cells (blanks + logos + the block itself) need
 * to fit around it. */
function centerPlacement(cols: number, colSpan: number, rowSpan: number, otherCells: number) {
  const totalCells = otherCells + colSpan * rowSpan;
  const rows = Math.max(rowSpan, Math.ceil(totalCells / cols));
  const colStart = Math.max(1, Math.floor((cols - colSpan) / 2) + 1);
  const rowStart = Math.max(1, Math.floor((rows - rowSpan) / 2) + 1);
  return { col: `${colStart} / span ${colSpan}`, row: `${rowStart} / span ${rowSpan}` };
}

function LogoCell({ partner, index }: { partner: BrandPartner; index: number }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1, transition: { duration: 0.5, delay: (index % 9) * 0.04, ease: E } }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ scale: 1.08, transition: { duration: 0.25, ease: E } }}
      className="group flex h-full w-full items-center justify-center p-4"
    >
      <img
        src={partner.logoUrl}
        alt={partner.name}
        draggable={false}
        className="max-h-9 max-w-[85%] object-contain transition-transform duration-300 sm:max-h-10"
      />
    </motion.div>
  );
  return partner.websiteUrl ? (
    <a href={partner.websiteUrl} target="_blank" rel="noreferrer noopener" aria-label={partner.name} className="contents">
      {content}
    </a>
  ) : (
    content
  );
}

export function CommunityPartnerGrid({ partners }: { partners: BrandPartner[] }) {
  if (partners.length === 0) return null;

  const blankCount = Math.max(Math.round(partners.length * 1.55), 6);
  const slots = buildSlots(partners, blankCount);
  const otherCells = slots.length;

  // Centered placement for the feature block, computed per breakpoint (column
  // count changes at each one, so "center" isn't the same cell coordinates).
  const mobile = centerPlacement(4, 4, 2, otherCells);
  const tablet = centerPlacement(6, 3, 2, otherCells);
  const desktop = centerPlacement(9, 3, 2, otherCells);

  const gridVars = {
    "--feat-col-base": mobile.col,
    "--feat-row-base": mobile.row,
    "--feat-col-sm": tablet.col,
    "--feat-row-sm": tablet.row,
    "--feat-col-lg": desktop.col,
    "--feat-row-lg": desktop.row,
  } as CSSProperties;

  return (
    <section className="relative overflow-hidden bg-[#F2ECDD] py-24 lg:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 25, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-16 top-0 h-[340px] w-[340px] rounded-full bg-[#0037D2]/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -35, 0], y: [0, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-16 bottom-0 h-[360px] w-[360px] rounded-full bg-[#C1FF3B]/25 blur-3xl"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: E } }}
          viewport={{ once: true, margin: "-60px" }}
          className="mb-10 text-center"
        >
          <h2 className="text-balance text-3xl font-black tracking-tight text-[#111111] md:text-5xl">
            Community Partners.
          </h2>
        </motion.div>
      </div>

      <div className="relative ml-[calc(50%-50vw)] mt-10 w-screen">
        <div
          className="relative grid auto-rows-[100px] grid-cols-4 border-y border-[#111111]/10 sm:grid-cols-6 sm:auto-rows-[110px] lg:grid-cols-9 lg:auto-rows-[120px]"
          style={{ gridAutoFlow: "dense", ...gridVars }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: E } }}
            viewport={{ once: true, margin: "-60px" }}
            className="flex flex-col items-center justify-center gap-3 border border-[#111111]/10 bg-[#F0EBD8] p-6 text-center [grid-column:var(--feat-col-base)] [grid-row:var(--feat-row-base)] sm:[grid-column:var(--feat-col-sm)] sm:[grid-row:var(--feat-row-sm)] lg:[grid-column:var(--feat-col-lg)] lg:[grid-row:var(--feat-row-lg)]"
          >
            <span className="rounded-full bg-[#0037D2]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0037D2]">
              Community Network
            </span>
            <h3 className="text-balance text-xl font-black leading-tight tracking-tight text-[#111111] sm:text-2xl lg:text-3xl">
              50+ brands trust our <em className="not-italic text-[#0037D2]">8,000+ founder</em> community.
            </h3>
            <p className="max-w-xs text-sm text-[#111111]/60">
              Get in front of the builders, operators and investors already inside.
            </p>
            <a
              href="#cta"
              className="group inline-flex items-center overflow-hidden rounded-full text-sm font-bold"
            >
              <span className="bg-[#C1FF3B] px-5 py-3 text-[#111111]">Partner with us</span>
              <span className="grid h-full place-items-center bg-[#111111] px-4 py-3 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </motion.div>

          {slots.map((slot, i) => {
            if (slot.kind === "logo") {
              return (
                <div key={`${slot.partner._id}-${i}`} className="border border-[#111111]/10">
                  <LogoCell partner={slot.partner} index={i} />
                </div>
              );
            }
            return <div key={`blank-${i}`} aria-hidden className="border border-[#111111]/10" />;
          })}
        </div>
      </div>
    </section>
  );
}
