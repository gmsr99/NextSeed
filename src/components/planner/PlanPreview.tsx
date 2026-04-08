import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS, DAY_LABELS, type GeneratedPlanItem } from "@/lib/planGenerator";
import type { Child } from "@/lib/types";

interface PlanPreviewProps {
  children: Child[];
  planItems: GeneratedPlanItem[];
}

export function PlanPreview({ children, planItems }: PlanPreviewProps) {
  return (
    <Tabs defaultValue={children[0]?.id}>
      <TabsList>
        {children.map((child) => (
          <TabsTrigger key={child.id} value={child.id}>
            {child.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {children.map((child) => {
        const childItems = planItems.filter((i) => i.child_id === child.id);

        return (
          <TabsContent key={child.id} value={child.id} className="space-y-4 mt-4">
            {[1, 2, 3, 4, 5].map((day) => {
              const dayItems = childItems
                .filter((i) => i.day_of_week === day)
                .sort((a, b) => a.sort_order - b.sort_order);
              if (dayItems.length === 0) return null;

              return (
                <Card key={day} className="border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {DAY_LABELS[day - 1]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {dayItems.map((item, idx) => {
                      const color = DISCIPLINE_COLORS[item.discipline] ?? "#E5E7EB";
                      return (
                        <div
                          key={idx}
                          className="flex gap-3 rounded-xl p-3"
                          style={{ backgroundColor: color + "22", borderLeft: `3px solid ${color}` }}
                        >
                          <div className="text-xs text-muted-foreground w-24 shrink-0 pt-0.5">
                            {item.time_slot}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="secondary"
                                className="text-xs"
                                style={{ backgroundColor: color + "44" }}
                              >
                                {DISCIPLINE_LABELS[item.discipline] ?? item.discipline}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                            {item.materials.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.materials.map((m, mi) => (
                                  <span key={mi} className="text-xs bg-muted rounded px-2 py-0.5 text-muted-foreground">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
