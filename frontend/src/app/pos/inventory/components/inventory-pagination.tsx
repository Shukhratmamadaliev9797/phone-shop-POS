import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

export function InventoryPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number; // 1-based
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useI18n();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const maxVisiblePages = 5;

  // ✅ 1 page bo'lsa ko'rsatmaymiz
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const shown = Math.min(pageSize, Math.max(total - (page - 1) * pageSize, 0));
  const windowSize = Math.min(maxVisiblePages, totalPages);
  const half = Math.floor(windowSize / 2);
  let startPage = Math.max(1, page - half);
  let endPage = startPage + windowSize - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - windowSize + 1);
  }

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );

  return (
    <div className="rounded-2xl border border-muted/40 bg-background/50 px-3 py-2">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="text-center text-xs text-muted-foreground">
          {t("inventory.pagination.showing")}{" "}
          <span className="font-medium text-foreground">{shown}</span> /{" "}
          <span className="font-medium text-foreground">{total}</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-xl px-3"
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
          >
            {t("inventory.pagination.prev")}
          </Button>

          <div className="hidden items-center gap-1 sm:flex">
            {pageNumbers.map((pageNumber) => (
              <Button
                key={pageNumber}
                type="button"
                variant={pageNumber === page ? "default" : "outline"}
                size="sm"
                className="h-8 min-w-8 rounded-xl px-2"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-xl px-3"
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
          >
            {t("inventory.pagination.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
