// Personal details shown on the site and given to the chatbot.
// Fields marked TODO are placeholders: fill them in and they appear automatically.

export const site = {
  name: "Sakthi",
  handle: "sakthi",
  role: "Backend & AI Engineer",
  tagline:
    "I build backend systems and AI applications you can trust: answers that are verified, bookings that can't collide, and tools that admit what they don't know.",
  location: "", // TODO(Sakthi): e.g. "Chennai, India"
  email: "", // TODO(Sakthi): public contact email
  github: "https://github.com/SakthiQ",
  githubUser: "SakthiQ",
  linkedin: "", // TODO(Sakthi): full LinkedIn URL
  resume: "", // TODO(Sakthi): put resume.pdf in /public and set this to "/resume.pdf"
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "Java", "TypeScript", "JavaScript", "Go", "SQL", "Solidity", "Dart"] },
  { group: "Backend", items: ["FastAPI", "Spring Boot", "Node.js", "REST APIs", "SQLAlchemy", "Alembic", "Pydantic"] },
  { group: "AI / ML", items: ["RAG", "Ollama", "Llama 3", "Hybrid search", "NLI verification", "NLP", "Prompt-injection defense"] },
  { group: "Data", items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLGlot"] },
  { group: "Frontend", items: ["React", "Next.js", "Vite", "Tailwind CSS", "Streamlit", "Flutter"] },
  { group: "DevOps & Cloud", items: ["Docker", "Nginx", "GitHub Actions", "AWS S3", "Azure Blob", "GCS", "Prometheus"] },
];

export const timeline: { when: string; title: string; detail: string }[] = [
  {
    when: "2026",
    title: "Secure AI and reliable backends",
    detail: "Built ATTS-RAG, the Healthcare Appointment Manager, PayGuard and the Medical Miscommunication Detector.",
  },
  {
    when: "2025",
    title: "Systems and tooling",
    detail: "Built BitbyBit (multi-database backups), hotreload (Go), ChainJudge (blockchain capstone) and DCT forgery detection.",
  },
  {
    when: "TODO",
    title: "Education", // TODO(Sakthi): degree and college
    detail: "TODO(Sakthi): add your degree, college and graduation year.",
  },
];

export const sections = [
  { id: "about", label: "About" },
  { id: "featured", label: "Featured" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "github", label: "GitHub" },
  { id: "timeline", label: "Journey" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const isTodo = (v: string) => !v || v.startsWith("TODO");
