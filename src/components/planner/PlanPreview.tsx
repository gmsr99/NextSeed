import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, HelpCircle } from "lucide-react";
import { DISCIPLINE_LABELS, DISCIPLINE_COLORS, DAY_LABELS, type GeneratedPlanItem } from "@/lib/planGenerator";
import type { Child } from "@/lib/types";

// Detects and parses inline reading text: "texto... | Pergunta: ..."
function parseInlineText(description: string): { text: string; question: string } | null {
  const idx = description.indexOf(" | Pergunta:");
  if (idx === -1) return null;
  return {
    text: description.slice(0, idx).trim(),
    question: description.slice(idx + " | Pergunta:".length).trim(),
  };
}

function ActivityDescription({ description }: { description: string }) {
  const inline = parseInlineText(description);
  if (!inline) {
    return <p className="text-xs text-muted-foreground mt-1">{description}</p>;
  }
  return (
    <div className="mt-1 space-y-1.5">
      <p className="text-xs text-foreground/80 leading-relaxed bg-white/60 rounded-lg p-2 border border-border/40">
        {inline.text}
      </p>
      <div className="flex items-start gap-1.5">
        <HelpCircle className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5" />
        <p className="text-xs text-primary/80 font-medium">{inline.question}</p>
      </div>
    </div>
  );
}

// Color palette for children in the family view (up to 5 children)
const CHILD_COLORS = [
  { bg: "#DBEAFE", border: "#3B82F6", text: "#1D4ED8" }, // blue
  { bg: "#D1FAE5", border: "#10B981", text: "#065F46" }, // green
  { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" }, // amber
  { bg: "#EDE9FE", border: "#8B5CF6", text: "#5B21B6" }, // purple
  { bg: "#FCE7F3", border: "#EC4899", text: "#9D174D" }, // pink
];

interface PlanPreviewProps {
  children: Child[];
  planItems: GeneratedPlanItem[];
}

// Per-child view (existing)
function ChildView({ child, planItems }: { child: Child; planItems: GeneratedPlanItem[] }) {
  const childItems = planItems.filter((i) => i.child_id === child.id);
  return (
    <div className="space-y-4 mt-4">
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
                      <ActivityDescription description={item.description} />
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
    </div>
  );
}

// Family unified view — all children by day, color-coded per child
function FamilyView({ children, planItems }: { children: Child[]; planItems: GeneratedPlanItem[] }) {
  const childColorMap = new Map(children.map((c, i) => [c.id, CHILD_COLORS[i % CHILD_COLORS.length]]));
  const childNameMap = new Map(children.map((c) => [c.id, c.name.split(" ")[0]]));

  return (
    <div className="space-y-4 mt-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {children.map((c, i) => {
          const col = CHILD_COLORS[i % CHILD_COLORS.length];
          return (
            <span
              key={c.id}
              className="text-xs font-medium px-3 py-1 rounded-full border"
              style={{ backgroundColor: col.bg, borderColor: col.border, color: col.text }}
            >
              {c.name}
            </span>
          );
        })}
      </div>

      {[1, 2, 3, 4, 5].map((day) => {
        const dayItems = planItems
          .filter((i) => i.day_of_week === day)
          .sort((a, b) => a.time_slot.localeCompare(b.time_slot) || a.sort_order - b.sort_order);
        if (dayItems.length === 0) return null;

        // Group by time_slot
        const bySlot = new Map<string, GeneratedPlanItem[]>();
        for (const item of dayItems) {
          if (!bySlot.has(item.time_slot)) bySlot.set(item.time_slot, []);
          bySlot.get(item.time_slot)!.push(item);
        }

        return (
          <Card key={day} className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {DAY_LABELS[day - 1]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[...bySlot.entries()].map(([slot, items]) => (
                <div key={slot} className="flex gap-3">
                  <div className="text-xs text-muted-foreground w-24 shrink-0 pt-2">{slot}</div>
                  <div className="flex-1 space-y-2">
                    {items.map((item, idx) => {
                      const col = childColorMap.get(item.child_id) ?? CHILD_COLORS[0];
                      const childName = childNameMap.get(item.child_id) ?? "";
                      return (
                        <div
                          key={idx}
                          className="rounded-xl p-2.5"
                          style={{ backgroundColor: col.bg, borderLeft: `3px solid ${col.border}` }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: col.border + "22", color: col.text }}
                            >
                              {childName}
                            </span>
                            <span className="text-xs" style={{ color: col.text + "99" }}>
                              {DISCIPLINE_LABELS[item.discipline] ?? item.discipline}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function PlanPreview({ children, planItems }: PlanPreviewProps) {
  const showFamilyTab = children.length > 1;
  const defaultTab = showFamilyTab ? "familia" : children[0]?.id ?? "familia";

  return (
    <Tabs defaultValue={defaultTab}>
      {/* max-w-full + overflow: em mobile com várias crianças as tabs deslizam */}
      <TabsList className="max-w-full overflow-x-auto justify-start">
        {showFamilyTab && (
          <TabsTrigger value="familia" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Família
          </TabsTrigger>
        )}
        {children.map((child) => (
          <TabsTrigger key={child.id} value={child.id}>
            {child.name.split(" ")[0]}
          </TabsTrigger>
        ))}
      </TabsList>

      {showFamilyTab && (
        <TabsContent value="familia">
          <FamilyView children={children} planItems={planItems} />
        </TabsContent>
      )}

      {children.map((child) => (
        <TabsContent key={child.id} value={child.id}>
          <ChildView child={child} planItems={planItems} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
