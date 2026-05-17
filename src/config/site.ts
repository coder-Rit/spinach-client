/** Public site URL for canonical links and Open Graph (no trailing slash). */
export const SITE_URL = (
  process.env.REACT_APP_SITE_URL ?? "https://spinach.ddns.net"
).replace(/\/$/, "");

export const LIVE_APP_URL = SITE_URL;

export const GITHUB_CLIENT_URL =
  "https://github.com/coder-Rit/spinach-client";
export const GITHUB_SERVER_URL =
  "https://github.com/coder-Rit/spinach-server";

export const SITE_NAME = "Spinach";

export const SITE_TAGLINE = "Project management with AI assistance";

export const DEFAULT_DESCRIPTION =
  "Spinach helps teams manage projects, work items, and kanban boards with Spina AI — your intelligent project assistant.";

export const DEFAULT_KEYWORDS =
  "spinach, project management, kanban, work items, AI assistant, team collaboration, agile";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;

export const TWITTER_HANDLE = "";

export type PageSeoConfig = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

export const ROUTE_SEO: Record<string, PageSeoConfig> = {
  "/": {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  },
  "/login": {
    title: `Log in | ${SITE_NAME}`,
    description: `Sign in to ${SITE_NAME} to manage projects and chat with Spina AI.`,
    path: "/login",
  },
  "/signup": {
    title: `Sign up | ${SITE_NAME}`,
    description: `Create a free ${SITE_NAME} account for project management and AI-powered workflows.`,
    path: "/signup",
  },
  "/chat": {
    title: `Spina AI | ${SITE_NAME}`,
    description: `Chat with Spina AI to create projects, work items, and get insights across your workspace.`,
    path: "/chat",
    noIndex: true,
  },
  "/projects": {
    title: `Projects | ${SITE_NAME}`,
    description: `View and manage your projects on ${SITE_NAME}.`,
    path: "/projects",
    noIndex: true,
  },
};

export const getSeoForPath = (pathname: string): PageSeoConfig => {
  if (ROUTE_SEO[pathname]) {
    return ROUTE_SEO[pathname];
  }
  if (pathname.startsWith("/projects/")) {
    return {
      title: `Project | ${SITE_NAME}`,
      description: `Project board and work items on ${SITE_NAME}.`,
      path: pathname,
      noIndex: true,
    };
  }
  return ROUTE_SEO["/"];
};
