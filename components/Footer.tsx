import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 font-mono text-xs text-faint sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} {site.name} · built with Next.js and Gemini
        </p>
        <p>
          press <kbd className="rounded border border-line px-1">Ctrl</kbd> + <kbd className="rounded border border-line px-1">K</kbd> to
          navigate
        </p>
      </div>
    </footer>
  );
}
