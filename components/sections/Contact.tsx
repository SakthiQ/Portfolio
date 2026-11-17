import { FileText, Mail, MessageSquareText, Phone } from "lucide-react";
import { Github, Linkedin } from "@/components/icons";
import { Reveal, SectionHeading } from "../Reveal";
import { site } from "@/lib/site";
import { OpenChatButton } from "../chat/OpenChatButton";

export function Contact() {
  const links = [
    site.email && { href: `mailto:${site.email}`, label: "Email", value: site.email, Icon: Mail },
    site.phone && { href: `tel:${site.phone.replace(/\s/g, "")}`, label: "Phone", value: site.phone, Icon: Phone },
    site.linkedin && { href: site.linkedin, label: "LinkedIn", value: "sakthinarayan-v", Icon: Linkedin },
    { href: site.github, label: "GitHub", value: site.githubUser, Icon: Github },
    site.resume && { href: site.resume, label: "Resume", value: "Download PDF", Icon: FileText },
  ].filter(Boolean) as { href: string; label: string; value: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[];

  return (
    <section id="contact" className="relative z-10 mx-auto max-w-6xl px-4 pb-32 pt-24 sm:px-6">
      <SectionHeading index="07" title="Let's talk" />
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-8 sm:p-12">
          <div className="pointer-events-none absolute -bottom-32 -right-20 size-96 rounded-full bg-cyan/10 blur-3xl" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                Building something where correctness matters?
              </p>
              <p className="mt-3 text-muted">
                I&apos;m open to internships and engineering roles in backend, AI and full-stack work. Reach out directly, or let
                the AI assistant answer your questions first.
              </p>
              <OpenChatButton className="mt-6">
                <MessageSquareText size={15} aria-hidden /> Ask the AI about me
              </OpenChatButton>
            </div>
            <ul className="grid content-start gap-3">
              {links.map(({ href, label, value, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("mailto:") || href.startsWith("tel:") ? undefined : "_blank"}
                    rel="noreferrer"
                    className="flex items-center gap-4 rounded-xl border border-line bg-bg/50 px-4 py-3 transition hover:border-accent/50"
                  >
                    <Icon size={18} className="text-accent" aria-hidden />
                    <span className="font-mono text-xs text-faint">{label.toLowerCase()}</span>
                    <span className="ml-auto truncate text-sm text-fg">{value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
