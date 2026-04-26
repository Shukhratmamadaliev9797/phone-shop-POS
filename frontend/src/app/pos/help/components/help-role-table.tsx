import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HelpGuideRecord } from "./help-data";
import { useI18n } from "@/lib/i18n/provider";

type HelpRoleTableProps = {
  guides: HelpGuideRecord[];
};

export function HelpRoleTable({ guides }: HelpRoleTableProps) {
  const { t } = useI18n();
  if (guides.length === 0) {
    return (
      <Card className="rounded-3xl border-muted/40 bg-muted/30">
        <CardContent className="p-4 text-sm text-muted-foreground">
          {t("help.roleTable.empty")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="p-4 sm:p-6">
        <div>
          <div className="text-sm font-semibold">{t("help.roleTable.title")}</div>
          <div className="text-sm text-muted-foreground">{t("help.roleTable.subtitle")}</div>
        </div>

        <Separator className="my-4" />

        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[130px]">{t("help.roleTable.module")}</TableHead>
                <TableHead className="min-w-[190px]">{t("help.roleTable.action")}</TableHead>
                <TableHead className="min-w-[260px]">{t("help.roleTable.usage")}</TableHead>
                <TableHead className="min-w-[120px]">{t("help.roleTable.path")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guides.map((guide) => (
                <TableRow key={guide.id}>
                  <TableCell className="font-medium">{guide.module}</TableCell>
                  <TableCell>{guide.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {guide.steps[0] ?? guide.summary}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{guide.path}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
