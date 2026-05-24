import { portfolios } from "./portfolios";

export const services = [
  {
    id: 1,
    title: "Product engineering",
    text: "From discovery to shipped code — I work across the stack and across the product lifecycle.",
    icon: "/icons/code-s-slash-line.svg",
  },
  {
    id: 2,
    title: "Engineering leadership",
    text: "Hiring, coaching, and setting practice. Building teams that ship without burning out.",
    icon: "/icons/quill-pen-line.svg",
  },
  {
    id: 3,
    title: "Product ownership",
    text: "Roadmaps, prioritisation, and customer conversations. Translating outcomes into work.",
    icon: "/icons/smartphone-line.svg",
  },
];

export const skillGroups = [
  {
    id: "languages",
    label: "Languages",
    items: ["TypeScript", "JavaScript", "Ruby", "SQL"],
  },
  {
    id: "frontend",
    label: "Frontend",
    items: ["React", "Next.js", "Astro", "Tailwind CSS", "React Native"],
  },
  {
    id: "backend",
    label: "Backend & data",
    items: ["Node.js", "Rails", "REST", "GraphQL", "PostgreSQL"],
  },
  {
    id: "platforms",
    label: "Platforms & tooling",
    items: ["AWS", "Vercel", "Docker", "GitHub Actions", "Figma"],
  },
  {
    id: "practices",
    label: "Practices",
    items: [
      "Product discovery",
      "Roadmapping",
      "Hiring & coaching",
      "Code review",
      "Incident response",
    ],
  },
] as const;

export const jobExperience = [
  {
    id: 1,
    title: "Engineering Manager · Product Owner",
    meta: "Varicon — Onboarding squad",
    year: "Nov 2025 — Present",
    highlights: [
      "Own the Onboarding squad roadmap end-to-end — discovery through delivery.",
      "Lead hiring, coaching, and the engineering practice for the squad.",
      "Pair with design and customer success on a ground-up onboarding redesign.",
    ],
  },
  {
    id: 2,
    title: "Founder",
    meta: "Truemark Technology",
    year: "2017 — 2025",
    highlights: [
      "Founded and ran a product engineering studio for eight years, growing the team to ~20.",
      "Shipped 30+ products across Rails, React, and React Native for clients in the US, EU, and APAC.",
      "Wound the studio down deliberately in 2025 to focus full-time on a single product team.",
    ],
  },
  {
    id: 3,
    title: "CTO",
    meta: "Intelliante Inc.",
    year: "2022 — 2024",
    highlights: [
      "Hired the founding engineering team and set the practice from scratch.",
      "Shipped the HR-tech assessment platform from zero to production and first paying customers.",
    ],
  },
  {
    id: 4,
    title: "Full Stack Developer → Tech Lead",
    meta: "Leapfrog Technology",
    year: "2014 — 2017",
    highlights: [
      "Grew from intern to tech lead in three years.",
      "Led client engagements across Rails, React, and React Native.",
      "Mentored juniors and set early code-review and CI practices.",
    ],
  },
] as const;

export const educationalBackground = [
  {
    id: 1,
    title: "Bachelors of Engineering (Computer)",
    meta: "Advanced College of Engineering and Management (TU).",
    text: "",
    year: "2010 - 2014",
  },
  {
    id: 2,
    title: "HSEB +2",
    meta: "Nepal Police School, Sanga, Kavre.",
    text: "",
    year: "2007 - 2009",
  },
  {
    id: 3,
    title: "School Leaving Certificate",
    meta: "Nepal Police School, Sanga, Kavre.",
    text: "",
    year: "2004 - 2007",
  },
] as const;

type SelectedWorkItem = {
  title: string;
  role: string;
  summary: string;
  url: string;
};

const pickPortfolio = (id: number, role: string): SelectedWorkItem => {
  const p = portfolios.find((x) => x.id === id);
  if (!p || !p.url) throw new Error(`Portfolio ${id} not found or missing url`);
  return { title: p.title, role, summary: p.subtitle, url: p.url };
};

export const selectedWork: readonly SelectedWorkItem[] = [
  pickPortfolio(6, "Full-stack / team lead"),
  pickPortfolio(1, "Full-stack / Rails + React"),
  pickPortfolio(5, "Founder / tech lead"),
  pickPortfolio(2, "Full-stack / team lead"),
];
