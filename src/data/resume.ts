import { portfolios } from "./portfolios";

export const services = [
  {
    id: 1,
    title: "Freelance product management",
    text: "Discovery, prioritisation, and delivery. I help teams clarify the problem, decide what matters next, and connect product decisions to the work being shipped.",
    icon: "/icons/code-s-slash-line.svg",
  },
  {
    id: 2,
    title: "Codebase readiness audits",
    text: "Assess how well coding agents can understand and work in your repository: its structure, documentation, tests, and feedback loops. Identify the changes that would make agent work easier to review and verify.",
    icon: "/icons/quill-pen-line.svg",
  },
  {
    id: 3,
    title: "Software factory setup",
    text: "Connect requirements, coding agents, code review, testing, and release into a repeatable workflow. Make responsibilities and checks explicit so the team can follow work from an idea to a verified change.",
    icon: "/icons/smartphone-line.svg",
  },
  {
    id: 4,
    title: "Agentic coding adoption",
    text: "Help teams choose where agents fit, establish working practices, and learn through real development tasks. Build the team's ability to steer, review, and improve the workflow over time.",
    icon: "/icons/code-s-slash-line.svg",
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
    id: 5,
    title: "Product manager & agentic engineering consultant",
    meta: "Independent",
    year: "Now",
    highlights: [
      "Freelance product management across discovery, prioritisation, and delivery.",
      "Codebase readiness audits, software factory setup, and agentic coding adoption support.",
    ],
  },
  {
    id: 6,
    title: "Software Engineer · Independent contractor",
    meta: "Luthor (YC F24)",
    year: "Previous engagement",
    highlights: ["Worked with Luthor as an independent contract software engineer."],
  },
  {
    id: 1,
    title: "Engineering Manager · Product Owner",
    meta: "Varicon — Onboarding squad",
    year: "Previous role",
    highlights: [
      "Owned the Onboarding squad roadmap end-to-end — discovery through delivery.",
      "Led hiring, coaching, and the engineering practice for the squad.",
      "Paired with design and customer success on a ground-up onboarding redesign.",
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
