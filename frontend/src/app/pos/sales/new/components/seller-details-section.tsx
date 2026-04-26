import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/provider";

type SellerOption = {
  id: string;
  fullName: string;
};

type Props = {
  value: string;
  options: SellerOption[];
  onChange: (value: string) => void;
  loading?: boolean;
};

export function SellerDetailsSection({
  value,
  options,
  onChange,
  loading = false,
}: Props) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">
        {t("sales.new.seller.title")}
      </div>
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4">
        <div className="space-y-2">
          <Label>
            {t("sales.new.seller.question")}
          </Label>
          <Select value={value} onValueChange={onChange} disabled={loading}>
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue
                placeholder={
                  loading
                    ? t("sales.new.seller.loading")
                    : t("sales.new.seller.select")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
