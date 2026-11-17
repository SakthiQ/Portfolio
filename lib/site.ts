// Personal details shown on the site and given to the chatbot.

export const site = {
  name: "Sakthi",
  fullName: "Sakthi Narayan V",
  handle: "sakthi",
  role: "Backend & AI Engineer",
  tagline:
    "I build backend systems and AI applications you can trust: answers that are verified, bookings that can't collide, and tools that admit what they don't know.",
  education: "B.Tech in Computer Science and Engineering, Vellore Institute of Technology (VIT), Vellore, 2023–2027",
  location: "",
  email: "sakthinarayanvinodhkannan@gmail.com",
  phone: "+91 8148868038",
  github: "https://github.com/SakthiQ",
  githubUser: "SakthiQ",
  linkedin: "https://www.linkedin.com/in/sakthinarayan-v",
  resume: "/Sakthi_Narayan_V_Resume.pdf", // file lives in public/
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "Java", "TypeScript", "JavaScript", "Go", "SQL", "C", "Solidity", "Dart"] },
  { group: "Backend", items: ["FastAPI", "Spring Boot", "Spring Data JPA", "Node.js", "REST APIs", "SQLAlchemy", "Pydantic", "JWT / RBAC"] },
  {
    group: "AI / ML",
    items: ["RAG", "LLMs", "AI Agents", "LangChain", "LangGraph", "LangFuse", "Evals", "Ollama", "Llama 3", "NLP", "PyTorch", "Hugging Face", "Prompt-injection defense"],
  },
  { group: "Data", items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "ChromaDB", "FAISS", "SQLGlot"] },
  { group: "Frontend", items: ["React", "Next.js", "Vite", "Tailwind CSS", "Streamlit", "Flutter"] },
  { group: "Cloud & DevOps", items: ["Docker", "AWS", "Oracle Cloud (OCI)", "Nginx", "GitHub Actions", "Azure Blob", "GCS", "Prometheus", "Git"] },
];

export const timeline: { when: string; title: string; detail: string }[] = [
  {
    when: "May – Jul 2026",
    title: "AI Intern · Hexaware Technologies",
    detail:
      "Built 4+ AI agents on Oracle Fusion Cloud AI Agent Studio across two supply-chain domains (Inventory Management and Procurement), integrating enterprise APIs and structured business data, and refining prompts and workflows for retrieval and task automation.",
  },
  {
    when: "2026",
    title: "Secure AI and reliable backends",
    detail: "Built ATTS-RAG (VIT capstone), the Healthcare Appointment Manager, PayGuard and the Medical Miscommunication Detector.",
  },
  {
    when: "2025",
    title: "Oracle Cloud Infrastructure 2025 Certified Generative AI Professional",
    detail: "Certification in generative AI on Oracle Cloud Infrastructure.",
  },
  {
    when: "Jun 2025",
    title: "SAP Intern · Wheels India Limited",
    detail: "Learned SAP-based enterprise operations: ERP workflows, process requirements, data flows and system interactions across business functions.",
  },
  {
    when: "2025",
    title: "Systems and tooling",
    detail: "Built BitbyBit (multi-database backups), hotreload (Go), ChainJudge (blockchain capstone) and DCT forgery detection.",
  },
  {
    when: "VIT Leo Club",
    title: "Point of Contact",
    detail: "Grew the club's Instagram by 1,500+ followers, managed LinkedIn outreach, and mobilised students for E-Summit (3,500+ participants).",
  },
  {
    when: "2023 – 2027",
    title: "B.Tech, Computer Science and Engineering",
    detail: "Vellore Institute of Technology (VIT), Vellore.",
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
