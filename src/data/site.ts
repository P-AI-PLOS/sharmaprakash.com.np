export const headTitle = {
  siteTitle: "Prakash - Programmer Turned Entreprenuer",
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
    "Engineering Manager and Product Owner at Varicon. Eleven years building software — programmer, founder, and now sharpening the product craft.",
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
  bio: "Engineering Manager at Varicon, leading the Onboarding squad as Product Owner. Eleven years of building software — first as a programmer, then as a founder, now sharpening the product craft from the inside of a focused team.",
  age: 31,
  nationality: "Nepalese",
  languages: ["English", "Nepali", "Hindi"],
  address: "Kathmandu, Nepal",
  freelance: "Open to conversations",
  currentRole: "Engineering Manager · Product Owner",
  currentCompany: "Varicon",
  yearsOfExperience: 11,
  socialAddress: {
    facebook: "https://www.facebook.com/poudelprakash",
    twitter: "https://twitter.com/poudelprakash",
    github: "https://github.com/poudelprakash",
    linkedin: "https://linkedin.com/in/poudelprakash",
  },
  phoneNumbers: ["+977-9803572935"],
  emailAddress: ["prakash.poudel@varicon.com.au"],
  companyName: "Varicon",
} as const;

export const bookingShortUrl = "https://calendar.app.google/KMPNnkNsJUzBbBg66";
export const bookingUrl =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0mILGNRh97CvouTPB37GRFlIpOAAGzCQVvJmE3uI1HHUF_bs9E_9TkH9jz1czfo5r0sq-5TCZ0";
export const bookingEmbedUrl = `${bookingUrl}?gv=true`;
