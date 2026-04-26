import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n/provider";

const FAQ_IDS = ["1", "2", "3", "4", "5"] as const;

export function HelpFaq() {
  const { t } = useI18n();

  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="p-4 sm:p-6">
        <div>
          <div className="text-sm font-semibold">{t("help.faq.title")}</div>
          <div className="text-sm text-muted-foreground">{t("help.faq.subtitle")}</div>
        </div>

        <Separator className="my-4" />

        <Accordion type="single" collapsible className="w-full">
          {FAQ_IDS.map((id) => (
            <AccordionItem key={id} value={id}>
              <AccordionTrigger>{t(`help.faq.items.${id}.q`)}</AccordionTrigger>
              <AccordionContent>
                <div className="text-sm text-muted-foreground">{t(`help.faq.items.${id}.a`)}</div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

