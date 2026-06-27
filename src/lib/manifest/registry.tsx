import * as React from "react";
import { z } from "zod";
import { ArrowRight, ChevronDown, Heart, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ComponentKind, Theme } from "./schema";
import {
  ctaBannerProps,
  faqAccordionProps,
  filterBarProps,
  heroProps,
  productListProps,
  statCalloutProps,
  testimonialProps,
  type ProductCard,
} from "./sections";

/**
 * The whitelist. Each ComponentKind maps to a zod props schema (validated at
 * render time) and the component that renders it. The renderer never trusts
 * agent output blindly — a section only renders if its props pass the schema,
 * otherwise the renderer shows a skeleton.
 */

type RegistryEntry = {
  propsSchema: z.ZodType;
  Component: React.ComponentType<Record<string, unknown> & { theme: Theme }>;
};

type Action = { label: string; href?: string };

function registryComponent<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
): RegistryEntry["Component"] {
  return Component as unknown as RegistryEntry["Component"];
}

function ActionButton({
  action,
  variant = "primary",
}: {
  action?: Action;
  variant?: "primary" | "secondary";
}) {
  if (!action) return null;

  const className = cn(
    "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--b-radius)] border px-5 text-sm font-semibold transition-colors",
    variant === "primary"
      ? "border-[var(--brim-accent)] bg-[var(--brim-accent)] text-white hover:bg-[color-mix(in_srgb,var(--brim-accent)_92%,black)]"
      : "border-[var(--b-ink)] bg-transparent text-[var(--b-ink)] hover:bg-[var(--b-paper)]",
  );

  const children = (
    <>
      {action.label}
      <ArrowRight data-brim-arrow className="size-4" />
    </>
  );

  if (action.href) {
    return (
      <a className={className} href={action.href}>
        {children}
      </a>
    );
  }

  return (
    <button className={className} type="button">
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--b-muted)] uppercase">
      {children}
    </span>
  );
}

// --- hero ------------------------------------------------------------------
function Hero(p: z.infer<typeof heroProps> & { theme: Theme }) {
  return (
    <section className="grid overflow-hidden rounded-[var(--b-radius-lg)] border border-[var(--b-line)] bg-[var(--b-bg)] md:grid-cols-[1.4fr_1fr]">
      <div className="flex min-h-[340px] flex-col items-start justify-center gap-6 px-8 py-10 md:px-12">
        {p.eyebrow ? <SectionLabel>{p.eyebrow}</SectionLabel> : null}
        <h1 className="max-w-xl font-heading text-5xl leading-[0.96] font-black text-balance text-[var(--b-ink)] md:text-6xl">
          {p.headline}
        </h1>
        {p.subheadline ? (
          <p className="max-w-md text-base leading-7 text-pretty text-[var(--b-muted)]">
            {p.subheadline}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton action={p.primaryCta} />
          <ActionButton action={p.secondaryCta} variant="secondary" />
        </div>
      </div>
      <div className="flex min-h-[300px] items-center justify-center bg-[var(--b-paper)] p-10">
        {p.imageUrl ? (
          <div
            aria-label={p.imageAlt ?? ""}
            className="h-64 w-full max-w-sm rounded-[var(--b-radius-lg)] bg-contain bg-center bg-no-repeat"
            role="img"
            style={{ backgroundImage: `url(${p.imageUrl})` }}
          />
        ) : (
          <HatIllustration className="h-56 w-80" />
        )}
      </div>
    </section>
  );
}

// --- filterBar -------------------------------------------------------------
function FilterBar(p: z.infer<typeof filterBarProps>) {
  return (
    <section className="flex flex-col gap-3 rounded-[var(--b-radius)] border border-[var(--b-line)] bg-[var(--b-bg)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {p.categories.map((category) => {
          const active = category.value === p.active || (!p.active && category.value === "all");
          return (
            <button
              key={category.value}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-medium transition-colors",
                active
                  ? "border-[var(--brim-accent)] bg-[var(--brim-accent)] text-white"
                  : "border-[var(--b-line)] bg-[var(--b-paper)] text-[var(--b-ink)] hover:border-[var(--b-muted)]",
              )}
              type="button"
            >
              {category.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 text-sm text-[var(--b-muted)]">
        {p.resultLabel ? <span>{p.resultLabel}</span> : null}
        {p.sortLabel ? (
          <span className="inline-flex h-9 items-center gap-2 rounded-[var(--b-radius)] border border-[var(--b-line)] bg-[var(--b-bg)] px-3 text-[var(--b-ink)]">
            <SlidersHorizontal className="size-4" />
            {p.sortLabel}
          </span>
        ) : null}
      </div>
    </section>
  );
}

// --- productList -----------------------------------------------------------
function ProductList(p: z.infer<typeof productListProps> & { theme: Theme }) {
  const density = p.density ?? p.theme.density;
  const compact = density === "compact";
  const list = p.layout === "list" || compact;

  return (
    <section className="flex flex-col gap-6">
      {p.title || p.summary || p.eyebrow ? (
        <header className="flex flex-col gap-2 border-b border-[var(--b-line)] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            {p.eyebrow ? <SectionLabel>{p.eyebrow}</SectionLabel> : null}
            {p.title ? (
              <h2 className="font-heading text-3xl leading-tight font-black text-[var(--b-ink)]">
                {p.title}
              </h2>
            ) : null}
          </div>
          {p.summary ? (
            <p className="max-w-md font-mono text-[11px] tracking-[0.16em] text-[var(--b-muted)] uppercase">
              {p.summary}
            </p>
          ) : null}
        </header>
      ) : null}
      <div
        className={cn(
          list
            ? "grid grid-cols-1 overflow-hidden rounded-[var(--b-radius)] border border-[var(--b-line)] bg-[var(--b-bg)]"
            : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {p.products.map((product, index) => (
          <ProductCardView
            key={product.state === "skeleton" ? `skeleton-${index}` : product.id ?? product.name}
            compact={compact}
            list={list}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

function ProductCardView({
  compact,
  list,
  product,
}: {
  compact: boolean;
  list: boolean;
  product: ProductCard;
}) {
  if (product.state === "skeleton") {
    return <ProductCardSkeleton compact={compact} list={list} />;
  }

  const ready = product.state === "ready";
  const imageUrl = product.imageUrl;
  const badge = product.badge;
  const colors = product.colors ?? [];

  return (
    <article
      className={cn(
        "group overflow-hidden border border-[var(--b-line)] bg-[var(--b-bg)] text-start",
        list
          ? "grid min-h-20 grid-cols-[72px_1fr_auto] items-center gap-4 border-x-0 border-t-0 p-3 last:border-b-0"
          : "rounded-[var(--b-radius)]",
      )}
      data-state={product.state}
    >
      <ProductMedia
        badge={badge}
        compact={compact}
        imageAlt={product.imageAlt ?? product.name}
        imageUrl={imageUrl}
        list={list}
      />
      <div className={cn("flex min-w-0 flex-col", list ? "gap-1" : "gap-3 p-4")}>
        <div className={cn("flex min-w-0 items-start justify-between gap-3", list && "items-center")}>
          <h3
            className={cn(
              "font-heading font-black text-[var(--b-ink)]",
              list ? "truncate text-base" : "text-xl leading-tight",
            )}
          >
            {product.name}
          </h3>
          {!list && product.price ? (
            <span className="shrink-0 font-heading text-lg font-black text-[var(--b-ink)]">
              {product.price}
            </span>
          ) : null}
        </div>
        {product.description ? (
          <p className={cn("text-[var(--b-muted)]", list ? "truncate text-xs" : "text-sm")}>
            {product.description}
          </p>
        ) : (
          <div className="brim-skeleton h-4 w-32 rounded-full" />
        )}
        {!list ? (
          <>
            <div className="flex min-h-6 flex-wrap items-center gap-2 text-xs text-[var(--b-ink)]">
              {product.sizes ? (
                <span className="rounded-full border border-[var(--b-line)] bg-[var(--b-paper)] px-2 py-1">
                  {product.sizes}
                </span>
              ) : (
                <span className="brim-skeleton h-5 w-16 rounded-full" />
              )}
              {colors.slice(0, 4).map((color) => (
                <span
                  aria-label={color.name}
                  className="size-3 rounded-full border border-black/10"
                  key={color.name}
                  style={{ backgroundColor: color.value ?? "var(--b-line)" }}
                  title={color.name}
                />
              ))}
            </div>
            {ready ? (
              <button
                className="h-10 rounded-[var(--b-radius)] bg-[var(--brim-accent)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[color-mix(in_srgb,var(--brim-accent)_92%,black)]"
                type="button"
              >
                {product.ctaLabel ?? "Add to bag"}
              </button>
            ) : (
              <div className="brim-skeleton h-10 rounded-[var(--b-radius)]" />
            )}
          </>
        ) : null}
      </div>
      {list ? (
        <span className="shrink-0 font-heading text-base font-black text-[var(--b-ink)]">
          {product.price ?? ""}
        </span>
      ) : null}
    </article>
  );
}

function ProductCardSkeleton({ compact, list }: { compact: boolean; list: boolean }) {
  return (
    <article
      aria-busy
      className={cn(
        "overflow-hidden border border-[var(--b-line)] bg-[var(--b-bg)]",
        list
          ? "grid min-h-20 grid-cols-[72px_1fr_auto] items-center gap-4 border-x-0 border-t-0 p-3 last:border-b-0"
          : "rounded-[var(--b-radius)]",
      )}
    >
      <div
        className={cn(
          "brim-skeleton bg-[var(--b-paper)]",
          list ? "h-14 rounded-[var(--b-radius)]" : compact ? "h-40" : "h-56",
        )}
      />
      <div className={cn("flex flex-col", list ? "gap-2" : "gap-3 p-4")}>
        <div className="brim-skeleton h-4 w-2/3 rounded-full" />
        <div className="brim-skeleton h-3 w-1/2 rounded-full" />
        {!list ? (
          <>
            <div className="brim-skeleton h-5 w-20 rounded-full" />
            <div className="brim-skeleton h-10 rounded-[var(--b-radius)]" />
          </>
        ) : null}
      </div>
      {list ? <div className="brim-skeleton h-4 w-12 rounded-full" /> : null}
    </article>
  );
}

function ProductMedia({
  badge,
  compact,
  imageAlt,
  imageUrl,
  list,
}: {
  badge?: string;
  compact: boolean;
  imageAlt: string;
  imageUrl?: string;
  list: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-[var(--b-paper)]",
        list ? "h-14 rounded-[var(--b-radius)]" : compact ? "h-40" : "h-56",
      )}
    >
      {badge && !list ? (
        <span
          className="absolute top-3 z-10 rounded-full bg-[var(--brim-accent)] px-2 py-1 text-[10px] font-semibold text-white"
          style={{ insetInlineStart: "0.75rem" }}
        >
          {badge}
        </span>
      ) : null}
      {!list ? (
        <button
          aria-label="Save product"
          className="absolute top-3 z-10 flex size-8 items-center justify-center rounded-full border border-[var(--b-line)] bg-white/80 text-[var(--b-muted)]"
          style={{ insetInlineEnd: "0.75rem" }}
          type="button"
        >
          <Heart className="size-4" />
        </button>
      ) : null}
      {imageUrl ? (
        <div
          aria-label={imageAlt}
          className="h-full w-full bg-contain bg-center bg-no-repeat"
          role="img"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <HatIllustration className={list ? "h-8 w-14" : "h-32 w-48"} />
      )}
    </div>
  );
}

function HatIllustration({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("relative", className)}>
      <div className="absolute start-1/2 top-[42%] h-[36%] w-[36%] -translate-x-1/2 rounded-t-full bg-[color-mix(in_srgb,var(--brim-accent)_70%,var(--b-ink))]" />
      <div className="absolute start-1/2 top-[62%] h-[12%] w-[88%] -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--brim-accent)_60%,var(--b-ink))]" />
      <div className="absolute start-1/2 top-[61%] h-[10%] w-[38%] -translate-x-1/2 bg-[var(--b-ink)]" />
    </div>
  );
}

// --- statCallout -----------------------------------------------------------
function StatCallout(p: z.infer<typeof statCalloutProps>) {
  const dark = p.tone === "dark";
  return (
    <section
      className={cn(
        "rounded-[var(--b-radius-lg)] border p-8",
        dark
          ? "border-[var(--b-ink)] bg-[var(--b-ink)] text-[var(--b-paper)]"
          : "border-[var(--b-line)] bg-[var(--b-paper)] text-[var(--b-ink)]",
      )}
    >
      {p.title ? <SectionLabel>{p.title}</SectionLabel> : null}
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {p.stats.map((stat, index) => (
          <div
            className={cn(
              "border-[var(--b-line)]",
              index > 0 && "sm:border-s sm:ps-6",
              dark && "border-white/20",
            )}
            key={`${stat.label}-${index}`}
          >
            <div className="font-heading text-5xl leading-none font-black">{stat.value}</div>
            <div className={cn("mt-2 text-sm", dark ? "text-white/70" : "text-[var(--b-muted)]")}>
              {stat.label}
            </div>
            {stat.sub ? (
              <div className={cn("mt-1 text-xs", dark ? "text-white/50" : "text-[var(--b-muted)]")}>
                {stat.sub}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

// --- testimonial -----------------------------------------------------------
function Testimonial(p: z.infer<typeof testimonialProps>) {
  const initials = p.author
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section className="rounded-[var(--b-radius-lg)] border border-[var(--b-line)] bg-[var(--b-bg)] p-8">
      <blockquote className="max-w-3xl font-heading text-2xl leading-snug font-black text-pretty text-[var(--b-ink)] italic">
        &ldquo;{p.quote}&rdquo;
      </blockquote>
      <div className="mt-6 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-[var(--b-paper)] font-mono text-xs text-[var(--b-ink)]">
          {initials}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[var(--b-ink)]">{p.author}</span>
          {p.role || p.place ? (
            <span className="text-xs text-[var(--b-muted)]">
              {[p.role, p.place].filter(Boolean).join(" in ")}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// --- faqAccordion ----------------------------------------------------------
function FaqAccordion(p: z.infer<typeof faqAccordionProps>) {
  return (
    <section className="overflow-hidden rounded-[var(--b-radius)] border border-[var(--b-line)] bg-[var(--b-bg)]">
      {p.title ? (
        <h2 className="border-b border-[var(--b-line)] px-6 py-5 font-heading text-2xl font-black text-[var(--b-ink)]">
          {p.title}
        </h2>
      ) : null}
      {p.items.map((item, index) => (
        <details
          className="group border-b border-[var(--b-line)] last:border-b-0"
          key={`${item.question}-${index}`}
          open={index === p.openIndex}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-heading text-lg font-black text-[var(--b-ink)] marker:hidden">
            {item.question}
            <ChevronDown className="size-4 shrink-0 text-[var(--b-muted)] transition-transform group-open:rotate-180" />
          </summary>
          <p className="max-w-3xl px-6 pb-6 text-sm leading-6 text-[var(--b-muted)]">
            {item.answer}
          </p>
        </details>
      ))}
    </section>
  );
}

// --- ctaBanner -------------------------------------------------------------
function CtaBanner(p: z.infer<typeof ctaBannerProps>) {
  return (
    <section className="flex flex-col items-start justify-between gap-6 rounded-[var(--b-radius-lg)] bg-[var(--brim-accent)] px-8 py-9 text-white sm:flex-row sm:items-center">
      <div className="flex flex-col gap-3">
        {p.eyebrow ? (
          <span className="font-mono text-[11px] tracking-[0.18em] text-white/70 uppercase">
            {p.eyebrow}
          </span>
        ) : null}
        <h2 className="max-w-xl font-heading text-3xl leading-tight font-black text-balance">
          {p.headline}
        </h2>
        {p.body ? <p className="max-w-xl text-sm leading-6 text-white/75">{p.body}</p> : null}
      </div>
      {p.cta ? (
        <a
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[var(--b-radius)] bg-white px-6 text-sm font-semibold text-[var(--brim-accent)]"
          href={p.cta.href ?? "#"}
        >
          {p.cta.label}
          <ArrowRight data-brim-arrow className="size-4" />
        </a>
      ) : null}
    </section>
  );
}

export const registry: Record<ComponentKind, RegistryEntry> = {
  hero: { propsSchema: heroProps, Component: registryComponent(Hero) },
  filterBar: { propsSchema: filterBarProps, Component: registryComponent(FilterBar) },
  productList: { propsSchema: productListProps, Component: registryComponent(ProductList) },
  statCallout: { propsSchema: statCalloutProps, Component: registryComponent(StatCallout) },
  testimonial: { propsSchema: testimonialProps, Component: registryComponent(Testimonial) },
  faqAccordion: { propsSchema: faqAccordionProps, Component: registryComponent(FaqAccordion) },
  ctaBanner: { propsSchema: ctaBannerProps, Component: registryComponent(CtaBanner) },
};
