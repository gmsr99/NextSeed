// V-22 (nota do Elton, 26 nov): no Diário, escolher uma atividade do plano da
// semana e a app preenche o resto (criança, título, área, descrição, dia).
// Só falta a foto e, se quiserem, as observações.
import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfWeek, subWeeks } from "date-fns";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { stripOptional } from "@/lib/essentialPlan";
import { planDescriptionText } from "@/lib/activityAreas";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

export interface PickedPlanItem {
  key: string;
  childId: string;
  title: string;
  discipline: string | null;
  description: string;
  date: Date;
}

interface Row { id: string; child_id: string; day_of_week: number; time_slot: string; discipline: string | null; title: string; description: string | null }

async function loadWeek(): Promise<{ monday: Date; items: Row[] } | null> {
  const thisMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
  // Esta semana; ao fim de semana sem plano novo, ainda a anterior
  for (const monday of [thisMonday, subWeeks(thisMonday, 1)]) {
    const { data: plan } = await supabase
      .from("weekly_plans")
      .select("id")
      .eq("week_start", format(monday, "yyyy-MM-dd"))
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!plan) continue;
    const { data } = await supabase
      .from("weekly_plan_items")
      .select("id, child_id, day_of_week, time_slot, discipline, title, description")
      .eq("plan_id", (plan as { id: string }).id)
      .order("day_of_week")
      .order("time_slot");
    return { monday, items: (data ?? []) as Row[] };
  }
  return null;
}

export default function PlanActivityPicker({ children, value, onPick }: {
  children: { id: string; name: string }[];
  value: string | null;
  onPick: (p: PickedPlanItem | null) => void;
}) {
  const { family } = useAuth();
  const { data } = useQuery({
    queryKey: ["diary-plan-items", family?.id],
    enabled: !!family,
    staleTime: 5 * 60 * 1000,
    queryFn: () => loadWeek(), // a RLS limita à família
  });
  const items = (data?.items ?? []).filter((i) => i.discipline !== "reading");
  if (!data || items.length === 0) return null;

  const name = (id: string) => children.find((c) => c.id === id)?.name.split(" ")[0] ?? "";
  const onChange = (key: string) => {
    if (key === "__none__") return onPick(null);
    const it = items.find((i) => i.id === key);
    if (!it) return;
    onPick({
      key,
      childId: it.child_id,
      title: stripOptional(it.title),
      discipline: it.discipline,
      description: planDescriptionText(it.description),
      date: addDays(data.monday, it.day_of_week - 1),
    });
  };

  return (
    <div className="space-y-2 rounded-lg bg-muted/40 p-3">
      <Label>Do plano da semana (opcional)</Label>
      <Select value={value ?? "__none__"} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Escolher uma atividade do plano" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">Outra atividade (escrever à mão)</SelectItem>
          {items.map((i) => (
            <SelectItem key={i.id} value={i.id}>
              {DAYS[i.day_of_week - 1]} · {name(i.child_id)} · {stripOptional(i.title)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Escolham a atividade e a app preenche o resto; só falta a foto e, se quiserem, as observações.
      </p>
    </div>
  );
}
