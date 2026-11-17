"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, MessageSquareText } from "lucide-react";
import { sections, site } from "@/lib/site";
import { useChat } from "./chat/ChatProvider";
import { PALETTE_EVENT } from "./CommandPalette";

export function Nav() {
  const pathname = usePathname();
  const { setOpen } = useChat();
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [pathname]);

  const nav = sections.filter((s) => ["about", "featured", "projects", "skills", "contact"].includes(s.id));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors ${
        scrolled ? "border-b border-line bg-bg/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6" aria-label="Main">
        <Link href="/" className="font-mono text-sm text-fg">
          <span className="text-accent">~/</span>
          {site.handle}
          <span className="animate-blink text-accent">_</span>
        </Link>
        <ul className="ml-6 hidden items-center gap-1 md:flex">
          {nav.map((s) => (
            <li key={s.id}>
              <Link
                href={`/#${s.id}`}
                className={`rounded-md px-3 py-1.5 font-mono text-xs transition ${
                  active === s.id && pathname === "/" ? "text-accent" : "text-muted hover:text-fg"
                }`}
              >
                {s.label.toLowerCase()}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new Event(PALETTE_EVENT))}
            className="hidden items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 font-mono text-xs text-muted transition hover:text-fg sm:inline-flex"
            aria-label="Open command palette"
          >
            <Command size={12} aria-hidden /> K
          </button>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-medium text-bg transition hover:brightness-110"
          >
            <MessageSquareText size={13} aria-hidden /> ask ai
          </button>
        </div>
      </nav>
    </header>
  );
}
