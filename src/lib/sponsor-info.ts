// Editorial detail for well-known sponsors, looked up by name so the demo
// events stay lean. Unmatched sponsors simply render their basic card.

export interface SponsorProduct {
  name: string;
  description: string;
}

export interface SponsorInfo {
  industry: string;
  blurb: string;
  products: SponsorProduct[];
}

const INFO: Record<string, SponsorInfo> = {
  vercel: {
    industry: "Frontend cloud & hosting",
    blurb:
      "The platform for frontend developers — the team behind Next.js, built for instant global deploys.",
    products: [
      { name: "Next.js", description: "The React framework for the web, with hybrid rendering." },
      { name: "Vercel Platform", description: "Git-connected deploys, edge functions and previews." },
    ],
  },
  supabase: {
    industry: "Developer infrastructure",
    blurb: "The open-source Firebase alternative — a full Postgres backend in minutes.",
    products: [
      { name: "Postgres + Auth", description: "Managed Postgres with row-level-security auth baked in." },
      { name: "Realtime & Storage", description: "Live subscriptions and S3-compatible file storage." },
    ],
  },
  stripe: {
    industry: "Payments & fintech",
    blurb: "Financial infrastructure for the internet, powering payments for millions of businesses.",
    products: [
      { name: "Payments", description: "Accept cards and wallets with idempotent, webhook-driven flows." },
      { name: "Billing", description: "Subscriptions, invoicing and usage-based pricing." },
    ],
  },
  linear: {
    industry: "Developer tools & productivity",
    blurb: "The issue tracker built for high-performance software teams.",
    products: [
      { name: "Issue tracking", description: "Keyboard-first issues, cycles and roadmaps." },
      { name: "Linear Insights", description: "Velocity and workflow analytics for teams." },
    ],
  },
  aws: {
    industry: "Cloud computing",
    blurb: "The world's most comprehensive cloud platform, with 200+ services.",
    products: [
      { name: "EC2 & Lambda", description: "Elastic virtual machines and serverless compute." },
      { name: "S3", description: "Durable, scalable object storage." },
    ],
  },
  cloudflare: {
    industry: "Edge network & security",
    blurb: "A global network protecting and accelerating sites, apps and APIs.",
    products: [
      { name: "Workers", description: "Run code at the edge, milliseconds from users." },
      { name: "CDN & WAF", description: "Caching, DDoS protection and a web application firewall." },
    ],
  },
  figma: {
    industry: "Design & collaboration",
    blurb: "The collaborative interface design tool, in the browser.",
    products: [
      { name: "Figma Design", description: "Multiplayer vector design and prototyping." },
      { name: "Dev Mode", description: "Hand-off with specs, tokens and code snippets." },
    ],
  },
  chromatic: {
    industry: "Frontend testing",
    blurb: "Visual testing and review built on top of Storybook.",
    products: [
      { name: "Visual tests", description: "Catch UI regressions on every commit." },
      { name: "UI review", description: "Stakeholder sign-off on component changes." },
    ],
  },
  storybook: {
    industry: "Frontend tooling (open source)",
    blurb: "The industry-standard workshop for building UI components in isolation.",
    products: [
      { name: "Component explorer", description: "Develop and document components in isolation." },
      { name: "Addons", description: "Accessibility, interactions and docs extensions." },
    ],
  },
  sentry: {
    industry: "Observability & monitoring",
    blurb: "Application monitoring that helps developers find and fix issues fast.",
    products: [
      { name: "Error monitoring", description: "Real-time stack traces with full context." },
      { name: "Tracing", description: "Performance traces across your whole stack." },
    ],
  },
  "grafana labs": {
    industry: "Observability (open source)",
    blurb: "The open observability platform for metrics, logs and traces.",
    products: [
      { name: "Grafana", description: "Dashboards that unify all your data sources." },
      { name: "Loki & Tempo", description: "Scalable log aggregation and distributed tracing." },
    ],
  },
  neon: {
    industry: "Serverless databases",
    blurb: "Serverless Postgres with branching, built for the modern dev workflow.",
    products: [
      { name: "Serverless Postgres", description: "Autoscaling Postgres that scales to zero." },
      { name: "Database branching", description: "Instant copy-on-write branches per pull request." },
    ],
  },
  planetscale: {
    industry: "Serverless databases",
    blurb: "The MySQL-compatible serverless database built on Vitess.",
    products: [
      { name: "Serverless MySQL", description: "Horizontally scalable MySQL with no sharding pain." },
      { name: "Branching", description: "Schema changes via branches and deploy requests." },
    ],
  },
  "progress kendoreact": {
    industry: "UI component libraries",
    blurb: "A professional React UI library of 120+ components — and this app's toolkit.",
    products: [
      { name: "KendoReact", description: "Grids, inputs, charts and more, fully accessible." },
      { name: "ThemeBuilder", description: "Design and theme component libraries visually." },
    ],
  },
};

export function getSponsorInfo(name: string): SponsorInfo | undefined {
  return INFO[name.trim().toLowerCase()];
}
