/** Default shapes when CMS value is empty — match main site fallbacks. */

export const DEFAULT_HERO = {
  eyebrow: "The Next Frontier",
  headlineLine1: "Intelligence,",
  headlineLine2: "Engineered.",
  body: "A growing ecosystem of intelligent SaaS products designed to streamline workflows, optimize growth, and redefine the standard of modern enterprise tools.",
  primaryCta: { label: "Explore Products", href: "/products" },
  secondaryCta: { label: "Watch Demo", href: "/updates" },
  imageUrl: "",
  imageAlt: "",
};

export const DEFAULT_NAV = {
  mainLinks: [
    { label: "Products", href: "/products" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
  signInLabel: "Sign In",
  signInHref: "/blog",
  ctaLabel: "Get Started",
  ctaHref: "/products",
};

export const DEFAULT_ABOUT = {
  label: "About Us",
  heading: "We build the tools that build the future.",
  body: "Intelligence Tech is a product-driven technology company building a connected ecosystem of SaaS tools designed for the modern enterprise.",
  pillars: [
    { icon: "rocket_launch", title: "Our Mission", desc: "To democratize intelligent software." },
    { icon: "visibility", title: "Our Vision", desc: "A world where every business decision is powered by interconnected systems." },
    { icon: "diversity_3", title: "Our Culture", desc: "Remote-first, builder-focused." },
  ],
  stats: [
    { value: "4+", label: "Products Shipped" },
    { value: "99.9%", label: "Platform Uptime" },
  ],
};

export const DEFAULT_FOOTER = {
  tagline: "Building the software layer for the next generation of digital enterprise.",
  socialLinks: [
    { platform: "facebook", url: "https://facebook.com" },
    { platform: "instagram", url: "https://instagram.com" },
    { platform: "linkedin", url: "https://linkedin.com" },
  ],
  columns: [
    {
      title: "Products",
      links: [
        { label: "Product Tour", href: "/products" },
        { label: "Ecosystem Hub", href: "/ecosystem" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Release Notes", href: "/updates" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "support@intelligencetech.com", href: "mailto:support@intelligencetech.com" },
      ],
    },
  ],
  copyright: "Intelligence Tech Editorial",
};

export const DEFAULT_CONTACT = {
  eyebrow: "Contact Us",
  heading: "Let's talk.",
  body: "Whether you have a question about our products, need a demo, or want to explore partnership opportunities — we'd love to hear from you.",
  details: [
    { icon: "mail", label: "Email", value: "support@intelligencetech.com" },
    { icon: "location_on", label: "Headquarters", value: "500 Silicon Way, San Francisco, CA 94105" },
    { icon: "schedule", label: "Business Hours", value: "Mon – Fri, 9:00 AM – 6:00 PM PST" },
  ],
};

/** Matches `PrivacyPolicyClient` FALLBACK — used when CMS has no sections yet. */
export const DEFAULT_PRIVACY_SECTIONS = [
  {
    title: "Information we collect",
    type: "cards" as const,
    items: [
      {
        title: "Information you provide",
        body: "Account details, contact information, and any content you submit through our platform.",
      },
      {
        title: "Usage information",
        body: "How you interact with our services, including pages visited, features used, and time spent.",
      },
      {
        title: "Cookies & tracking",
        body: "We use cookies and similar technologies to remember preferences and improve experience.",
      },
      {
        title: "Log data",
        body: "Server logs that include IP address, browser type, and referring pages.",
      },
    ],
  },
  {
    title: "How we use information",
    type: "bullets" as const,
    items: [
      "To provide, maintain, and improve our services",
      "To communicate with you about updates and changes",
      "To detect and prevent fraud or abuse",
      "To comply with legal obligations",
      "To personalize your experience",
    ],
  },
  {
    title: "How we share information",
    type: "mixed" as const,
    intro: "We do not sell your personal information. We may share data with:",
    items: [
      "Service providers who assist in operations",
      "Legal authorities when required by law",
      "Business partners with your consent",
      "Affiliated companies within our ecosystem",
    ],
  },
  {
    title: "Data retention & security",
    type: "paragraph" as const,
    body: "We retain your data only as long as necessary for the purposes outlined in this policy. We employ industry-standard encryption, access controls, and monitoring to protect your information.",
  },
  {
    title: "Your choices & rights",
    type: "paragraph" as const,
    body: "You can access, update, or delete your account information at any time. You may opt out of marketing communications. Depending on your jurisdiction, you may have additional rights under GDPR, CCPA, or similar regulations.",
  },
];

export const DEFAULT_PRIVACY = {
  lastUpdated: "",
  intro: "",
  sections: [] as unknown[],
  contactEmail: "",
  contactAddress: "",
};
