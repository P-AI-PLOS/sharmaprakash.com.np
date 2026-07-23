/**
 * Scroll-reveal for lists rendered *inside* a React island.
 *
 * `<ScrollReveal>` is an `.astro` component and cannot render in an island, so
 * this hook drives the site's own `.sr-reveal` / `.is-visible` primitive (styles
 * live in `~/components/motion/ScrollReveal.astro`, `is:global`; the hosting
 * page imports it so the CSS ships — see `src/pages/tools/vertical-slicer.astro`).
 * `prefers-reduced-motion` is honoured globally in `tokens.css`, which collapses
 * the transition duration, so nothing extra is needed here.
 *
 * Reveal state is React state, not an imperatively-added class: a class added
 * with `classList.add` is wiped the next time React re-renders the row (every
 * keystroke in an editable list), which would flash rows back to invisible.
 *
 * Only the items present on the *first* render are revealed on scroll; items
 * added afterwards render visible from their first paint. A card the visitor
 * just created shouldn't fade in, and nothing they add can end up waiting on an
 * observer to become visible.
 *
 * Used by the saved-sessions dashboard only. The story list is deliberately not
 * revealed: it's an editable form list, where fading rows in on scroll is both
 * wrong UX and a needless way for content to be briefly invisible.
 */
import { useEffect, useRef, useState } from "react";

/** Stagger for the nth item, capped per the repo's list-reveal convention. */
export const revealDelay = (index: number): number => Math.min(index, 4) * 40;

export function useReveal<T extends HTMLElement = HTMLDivElement>(deps: unknown) {
  const containerRef = useRef<T | null>(null);
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set<string>());
  /** Keys rendered in the first pass that actually produced items — the only ones we animate. */
  const initialKeys = useRef<Set<string>>(new Set());
  const collecting = useRef(true);

  // Closes the collection window after the first render that rendered any item.
  // The island's very first render happens before localStorage has resolved, so
  // this deliberately runs on every render until items exist.
  useEffect(() => {
    if (collecting.current && containerRef.current?.querySelector("[data-reveal-key]")) {
      collecting.current = false;
    }
  });

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const pending = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-key]")).filter(
      (el) => {
        const key = el.dataset.revealKey;
        return !!key && initialKeys.current.has(key) && !revealed.has(key);
      },
    );
    if (pending.length === 0) return;

    const reveal = (keys: string[]) =>
      setRevealed((prev) => {
        const next = new Set(prev);
        for (const k of keys) next.add(k);
        return next.size === prev.size ? prev : next;
      });

    // No IntersectionObserver (very old browser, some test envs): show everything
    // rather than leaving the list invisible.
    if (!("IntersectionObserver" in window)) {
      reveal(pending.map((el) => el.dataset.revealKey as string));
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const key = el.dataset.revealKey;
          if (!key) continue;
          io.unobserve(el);
          timers.push(
            window.setTimeout(() => {
              if (!cancelled) reveal([key]);
            }, Number(el.dataset.srDelay ?? 0)),
          );
        }
      },
      { threshold: 0.15 },
    );
    pending.forEach((el) => io.observe(el));

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
      io.disconnect();
    };
  }, [deps, revealed]);

  /** Props to spread on each list item: reveal class + stagger + tracking key. */
  const revealProps = (key: string, index: number) => {
    if (collecting.current) initialKeys.current.add(key);
    // Anything added after mount is visible immediately — never animated in.
    const visible = !initialKeys.current.has(key) || revealed.has(key);
    return {
      className: `sr-reveal${visible ? " is-visible" : ""}`,
      "data-reveal-key": key,
      "data-sr-delay": revealDelay(index),
    };
  };

  return { containerRef, revealProps };
}
