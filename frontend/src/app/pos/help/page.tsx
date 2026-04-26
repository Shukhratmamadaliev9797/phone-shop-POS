// src/app/pos/help/page.tsx

import { HelpFaq } from "./components/help-faq";
import { HelpGuides } from "./components/help-guides";
import { HelpPageHeader } from "./components/help-header";
import { HelpSearch } from "./components/help-search";
import { HelpTroubleshooting } from "./components/help-troubleshooting";
import {
  filterGuidesByRoleAndQuery,
  getLocalizedGuides,
  normalizeHelpRole,
} from "./components/help-data";
import * as React from "react";
import { useAppSelector } from "@/store/hooks";
import { useI18n } from "@/lib/i18n/provider";


export default function HelpPage() {
  const { t } = useI18n();
  const role = useAppSelector((state) => state.auth.user?.role);
  const [query, setQuery] = React.useState("");

  const normalizedRole = normalizeHelpRole(role);
  const guides = React.useMemo(() => getLocalizedGuides(t), [t]);
  const visibleGuides = React.useMemo(
    () => filterGuidesByRoleAndQuery(normalizedRole, query, guides),
    [guides, normalizedRole, query],
  );

  return (
    <div className="space-y-6">
      <HelpPageHeader role={normalizedRole} />
      <HelpSearch value={query} onChange={setQuery} />
      <HelpGuides guides={visibleGuides} />
      <HelpFaq />
      <HelpTroubleshooting />
    </div>
  );
}
