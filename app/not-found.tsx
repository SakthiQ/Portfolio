import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative z-10 mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-4 pt-20 font-mono">
      <p className="text-sm text-muted">
        <span className="text-accent">sakthi@portfolio</span> <span className="text-cyan">~</span> $ cd this-page
      </p>
      <p className="mt-2 text-sm text-rose">bash: cd: this-page: No such file or directory (404)</p>
      <Link href="/" className="mt-8 text-sm text-accent hover:underline">
        $ cd ~ <span className="text-faint"># go home</span>
      </Link>
    </main>
  );
}
