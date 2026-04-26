import * as React from "react";
import { useNavigate } from "react-router-dom";
import { InventoryFilters, type InventoryFiltersValue } from "./components/inventory-filters";
import { InventoryPageHeader } from "./components/inventory-header";
import { InventoryTable, type InventoryRow } from "./components/inventory-table";
import { InventoryPagination } from "./components/inventory-pagination";
import {
  deleteInventoryItem,
  listInventoryItems,
  type InventoryCondition,
} from "@/lib/api/inventory";
import { canManageSales } from "@/lib/auth/permissions";
import { useAppSelector } from "@/store/hooks";
import { useI18n } from "@/lib/i18n/provider";

const PAGE_SIZE = 10;

const INITIAL_FILTERS: InventoryFiltersValue = {
  q: "",
  storage: "ALL",
  condition: "ALL",
  brand: "ALL",
};

export default function InventoryPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canManage = canManageSales(role);
  const [filters, setFilters] = React.useState<InventoryFiltersValue>(INITIAL_FILTERS);
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState<InventoryRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadRows = React.useCallback(async () => {
    try {
      if (rows.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const response = await listInventoryItems({
        page,
        limit: PAGE_SIZE,
        q: filters.q.trim() || undefined,
        condition:
          filters.condition === "ALL"
            ? undefined
            : (filters.condition as InventoryCondition),
      });

      const mapped = response.data.map((item) => ({
        id: String(item.id),
        itemName: item.itemName,
        brand: item.brand,
        model: item.model,
        storage: item.storage ?? null,
        color: item.color ?? null,
        imei: item.imei,
        serialNumber: item.serialNumber ?? null,
        purchaseId: item.purchaseId ?? null,
        saleId: item.saleId ?? null,
        condition: item.condition,
        status: item.status,
        cost: Number(item.cost),
        expectedPrice:
          item.expectedSalePrice === null || item.expectedSalePrice === undefined
            ? undefined
            : Number(item.expectedSalePrice),
        profitEst:
          item.expectedSalePrice === null || item.expectedSalePrice === undefined
            ? undefined
            : Number(item.expectedSalePrice) - Number(item.cost),
        purchaseCost: Number(item.purchaseCost),
        repairCost: Number(item.repairCost),
        knownIssues: item.knownIssues ?? null,
      })) satisfies InventoryRow[];

      setRows(mapped);
      setTotal(response.meta.total);
    } catch (requestError) {
      setRows([]);
      setTotal(0);
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("inventory.page.error.loadFailed"),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.condition, filters.q, page, rows.length, t]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const brands = React.useMemo(() => {
    const unique = new Set<string>();
    rows.forEach((row) => {
      const [brand] = row.itemName.split(" ");
      if (brand) unique.add(brand);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const storages = React.useMemo(() => {
    const unique = new Set<string>();
    rows.forEach((row) => {
      if (row.storage?.trim()) unique.add(row.storage.trim());
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const tableRows = React.useMemo(() => {
    return rows.filter((row) => {
      const matchBrand =
        filters.brand === "ALL" ||
        row.itemName.toLowerCase().startsWith(filters.brand.toLowerCase());
      const matchStorage =
        filters.storage === "ALL" || (row.storage ?? "").toLowerCase() === filters.storage.toLowerCase();
      return matchBrand && matchStorage;
    });
  }, [filters.brand, filters.storage, rows]);

  const handleFiltersChange = (next: InventoryFiltersValue) => {
    setPage(1);
    setFilters(next);
  };

  const handleReset = () => {
    setPage(1);
    setFilters(INITIAL_FILTERS);
  };

  async function handleDeleteItem(item: InventoryRow): Promise<void> {
    if (!canManage) throw new Error(t("inventory.page.error.notAllowed"));
    await deleteInventoryItem(Number(item.id));
    await loadRows();
  }

  return (
    <div className="space-y-6">
      <InventoryPageHeader
        canManage={canManage}
        onAddPhone={() => navigate("/inventory/addPhone")}
      />
      <InventoryFilters
        value={filters}
        brands={brands}
        storages={storages}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />
      <InventoryTable
        rows={tableRows}
        loading={loading}
        refreshing={refreshing}
        error={error}
        canManage={canManage}
        onViewDetails={(item) => {
          navigate(`/inventory/${item.id}`, { state: { item } });
        }}
        onEditItem={(item) => {
          navigate(`/inventory/${item.id}/edit`, { state: { item } });
        }}
        onCreateSale={(item) => {
          navigate("/sales/new", {
            state: {
              preselectedItemId: Number(item.id),
              from: "/inventory",
              item: {
                brand: item.brand ?? "",
                model: item.model ?? "",
                imei: item.imei ?? "",
                condition: item.condition ?? null,
                storage: item.storage ?? null,
                color: item.color ?? null,
                serialNumber: item.serialNumber ?? null,
                phonePrice: item.purchaseCost ?? item.cost ?? 0,
                repairCost: item.repairCost ?? 0,
                knownIssues: item.knownIssues ?? null,
              },
            },
          });
        }}
        onDeleteItem={handleDeleteItem}
      />
      <InventoryPagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
