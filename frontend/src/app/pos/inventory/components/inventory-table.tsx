import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";
import type { InventoryCondition, InventoryStatus } from "@/types/inventory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type InventoryRow = {
  id: string;
  itemName: string; // iPhone 12 128GB
  brand?: string;
  model?: string;
  storage?: string | null;
  color?: string | null;
  imei?: string;
  condition: InventoryCondition;
  status: InventoryStatus;
  cost: number; // total cost
  expectedPrice?: number;
  profitEst?: number;
  purchaseCost?: number;
  repairCost?: number;
  serialNumber?: string | null;
  purchaseId?: number | null;
  saleId?: number | null;
  knownIssues?: string | null;
};

function ConditionText({ condition }: { condition: InventoryCondition }) {
  const { t } = useI18n();
  const label =
    condition === "GOOD"
      ? t("inventory.condition.good")
      : condition === "USED"
        ? t("inventory.condition.used")
        : t("inventory.condition.broken");
  return <span className="text-sm">{label}</span>;
}

export function InventoryTable({
  rows,
  loading,
  refreshing,
  error,
  canManage,
  onViewDetails,
  onEditItem,
  onCreateSale,
  onDeleteItem,
}: {
  rows: InventoryRow[];
  loading: boolean;
  refreshing?: boolean;
  error: string | null;
  canManage: boolean;
  onViewDetails: (item: InventoryRow) => void;
  onEditItem: (item: InventoryRow) => void;
  onCreateSale: (item: InventoryRow) => void;
  onDeleteItem: (item: InventoryRow) => Promise<void>;
}) {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<InventoryRow | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const onAction = (action: string, row: InventoryRow) => {
    if (action === "view") onViewDetails(row);
    if (action === "edit") onEditItem(row);
    if (action === "sale") onCreateSale(row);
    if (action === "delete") {
      setDeleteTarget(row);
      setDeleteConfirmOpen(true);
    }
  };

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      setActionError(null);
      await onDeleteItem(deleteTarget);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : t("inventory.table.error.deleteFailed"),
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <div className="relative rounded-3xl border border-muted/40 bg-muted/30 p-3">
        {refreshing ? (
          <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-background/35 backdrop-blur-[1px]">
            <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-xl border bg-background/90 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("inventory.table.loading")}
            </div>
          </div>
        ) : null}

        <div
          className={`overflow-x-auto transition-opacity duration-200 ${
            refreshing ? "opacity-80" : "opacity-100"
          }`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">{t("inventory.table.model")}</TableHead>
                <TableHead className="min-w-[160px]">{t("inventory.table.storage")}</TableHead>
                <TableHead className="min-w-[140px]">{t("inventory.table.color")}</TableHead>
                <TableHead className="min-w-[180px]">IMEI</TableHead>
                <TableHead>{t("inventory.table.condition")}</TableHead>
                <TableHead className="text-right">{t("inventory.table.price")}</TableHead>
              <TableHead className="w-[60px] text-right"> </TableHead>
            </TableRow>
          </TableHeader>

            <TableBody>
              {loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    {t("inventory.table.loading")}
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading && !refreshing && error ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-rose-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : null}

              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => onViewDetails(row)}
                >
                  <TableCell className="font-medium">{row.model || row.itemName}</TableCell>

                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {row.storage?.trim() || "—"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {row.color?.trim() || "—"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {row.imei?.trim() || "—"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <ConditionText condition={row.condition} />
                  </TableCell>

                  <TableCell className="text-right">{money(row.purchaseCost ?? 0)}</TableCell>

                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onClick={() => onAction("view", row)}>
                          {t("inventory.actions.details")}
                        </DropdownMenuItem>
                        {canManage ? (
                          <>
                            <DropdownMenuItem onClick={() => onAction("edit", row)}>
                              {t("inventory.actions.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction("sale", row)}>
                              {t("inventory.actions.sell")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-600"
                              onClick={() => onAction("delete", row)}
                            >
                              {t("inventory.actions.delete")}
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && !refreshing && !error && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    {t("inventory.table.empty")}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      {actionError ? (
        <p className="mt-2 text-sm text-rose-600">{actionError}</p>
      ) : null}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("inventory.delete.title")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleteTarget
              ? t("inventory.delete.descriptionNamed").replace("{name}", deleteTarget.itemName)
              : t("inventory.delete.description")}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteTarget(null);
              }}
            >
              {t("inventory.delete.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deleteLoading}
            >
              {deleteLoading
                ? t("inventory.delete.deleting")
                : t("inventory.delete.confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
