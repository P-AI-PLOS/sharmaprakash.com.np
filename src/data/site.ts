export const headTitle = {
  siteTitle: "Prakash - Product manager, founder, builder",
  aboutTitle: "About",
  notFoundTitle: "Not Found",
  contactTitle: "Contact",
  resumeTitle: "Resume",
  termsTitle: "Terms",
  worksTitle: "Works",
  blogsTitle: "Blogs",
  homeTitle: "Home",
} as const;

export const siteConfig = {
  firstName: "Prakash",
  fullName: "Prakash Poudel Sharma",
  metaImage: "/images/prakash-horizontal.jpeg",
  twitterUsername: "@poudelprakash",
  descriptionContent:
    "Prakash Poudel Sharma — independent product manager, founder, and builder. Product management, codebase readiness audits, and agentic engineering consulting.",
  disqusShortname: "prakash014",
  /**
   * Canonical GitHub URL for this site's source repo. Posts that link to the
   * repo (e.g. design.md walkthroughs) reference this. If the repo moves or
   * gets renamed, update here AND grep posts for the old URL — markdown can't
   * import this constant directly, so post links use reference-style markdown
   * with the URL repeated once per file (search for `[repo-design-md]:`).
   */
  repoUrl: "https://github.com/poudelprakash/personal_blog_2026",
  repoDesignMdUrl:
    "https://github.com/poudelprakash/personal_blog_2026/blob/main/design.md",
} as const;

export const information = {
  firstName: "Prakash",
  lastName: "Poudel Sharma",
  fullName: "Prakash Poudel Sharma",
  thumbImage: "/images/formal-image.jpeg",
  largeImage: "/images/prakash-horizontal.jpeg",
  bio: "I'm an independent product manager, founder, and software builder based in Kathmandu. I help teams make product decisions and adopt agentic software development, drawing on over a decade of building software. I write about product thinking, engineering with AI, and hands-on experiments.",
  age: 31,
  nationality: "Nepalese",
  languages: ["English", "Nepali", "Hindi"],
  address: "Kathmandu, Nepal",
  freelance: "Available for freelance PM work and consulting",
  currentRole: "Independent product manager & agentic engineering consultant",
  currentCompany: null as string | null,
  socialAddress: {
    facebook: "https://www.facebook.com/poudelprakash",
    twitter: "https://twitter.com/poudelprakash",
    github: "https://github.com/poudelprakash",
    linkedin: "https://linkedin.com/in/poudelprakash",
  },
  phoneNumbers: ["+977-9803572935"],
  emailAddress: ["prakash@tremark.com.np"],
} as const;

export const professionalByline = [information.currentRole, information.currentCompany]
  .filter(Boolean)
  .join(" · ");

export const bookingShortUrl = "https://calendar.app.google/KMPNnkNsJUzBbBg66";
export const bookingUrl =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0mILGNRh97CvouTPB37GRFlIpOAAGzCQVvJmE3uI1HHUF_bs9E_9TkH9jz1czfo5r0sq-5TCZ0";
export const bookingEmbedUrl = `${bookingUrl}?gv=true`;
