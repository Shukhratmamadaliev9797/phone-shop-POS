export type HelpRole = "ADMIN" | "MANAGER" | "CASHIER" | "TECHNICIAN";

export type HelpGuideRecord = {
  id: string;
  module: string;
  title: string;
  summary: string;
  path: string;
  roles: HelpRole[];
  keywords: string[];
  steps: string[];
};

type GuideSeed = {
  id: string;
  path: string;
  roles: HelpRole[];
  stepCount: number;
  keywordCount: number;
};

const GUIDE_SEEDS: GuideSeed[] = [
  {
    id: "sale",
    path: "/sales",
    roles: ["ADMIN", "MANAGER", "CASHIER"],
    stepCount: 5,
    keywordCount: 6,
  },
  {
    id: "customers",
    path: "/debts",
    roles: ["ADMIN", "MANAGER", "CASHIER"],
    stepCount: 4,
    keywordCount: 5,
  },
  {
    id: "inventory",
    path: "/inventory",
    roles: ["ADMIN", "MANAGER", "CASHIER", "TECHNICIAN"],
    stepCount: 4,
    keywordCount: 6,
  },
  {
    id: "workers",
    path: "/workers",
    roles: ["ADMIN"],
    stepCount: 3,
    keywordCount: 4,
  },
  {
    id: "settings",
    path: "/settings",
    roles: ["ADMIN"],
    stepCount: 3,
    keywordCount: 4,
  },
];

export function getLocalizedGuides(t: (key: string) => string): HelpGuideRecord[] {
  return GUIDE_SEEDS.map((seed) => {
    const steps = Array.from({ length: seed.stepCount }, (_, index) =>
      t(`help.guides.${seed.id}.steps.${index + 1}`),
    );
    const keywords = Array.from({ length: seed.keywordCount }, (_, index) =>
      t(`help.guides.${seed.id}.keywords.${index + 1}`),
    );

    return {
      id: seed.id,
      module: t(`help.guides.${seed.id}.module`),
      title: t(`help.guides.${seed.id}.title`),
      summary: t(`help.guides.${seed.id}.summary`),
      path: seed.path,
      roles: seed.roles,
      keywords,
      steps,
    };
  });
}

export function normalizeHelpRole(role: string | undefined): HelpRole {
  if (!role) return "CASHIER";
  if (role === "OWNER_ADMIN") return "ADMIN";
  if (role === "ADMIN" || role === "MANAGER" || role === "CASHIER" || role === "TECHNICIAN") {
    return role;
  }
  return "CASHIER";
}

export function filterGuidesByRoleAndQuery(
  role: HelpRole,
  query: string,
  guides: HelpGuideRecord[],
): HelpGuideRecord[] {
  const normalized = query.trim().toLowerCase();
  const roleFiltered = guides.filter((guide) => guide.roles.includes(role));
  if (!normalized) return roleFiltered;

  return roleFiltered.filter((guide) => {
    const haystack = [
      guide.module,
      guide.title,
      guide.summary,
      guide.path,
      ...guide.keywords,
      ...guide.steps,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

