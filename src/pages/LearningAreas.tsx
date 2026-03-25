import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, FolderKanban } from "lucide-react";
import { disciplines, getAgeGroup, getAgeGroupLabel, type AgeGroup } from "@/lib/disciplines";

const children = [
  { name: "Bryan Malta", age: 7 },
  { name: "Noa Malta", age: 4 },
];

export default function LearningAreas() {
  const [selectedChild, setSelectedChild] = useState(children[0].name);
  const child = children.find((c) => c.name === selectedChild) ?? children[0];
  const ageGroup = getAgeGroup(child.age);

  return (
    <AppLayout>
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Áreas de Aprendizagem
            </h1>
            <p className="text-muted-foreground mt-1">
              Disciplinas adaptadas à idade e ao ritmo de cada criança.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-[180px] bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name} ({c.age} anos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              {getAgeGroupLabel(ageGroup)}
            </Badge>
          </div>
        </div>

        {/* Grid */}
        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          key={ageGroup}
        >
          {disciplines.map((d) => (
            <DisciplineCard key={d.id} discipline={d} ageGroup={ageGroup} />
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
}

function DisciplineCard({
  discipline,
  ageGroup,
}: {
  discipline: (typeof disciplines)[number];
  ageGroup: AgeGroup;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className="group relative overflow-hidden border-border/60 hover:shadow-elevated transition-shadow duration-300 cursor-pointer">
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 w-full h-1 rounded-t-lg"
          style={{ backgroundColor: discipline.color }}
        />

        <CardContent className="p-6 pt-7 space-y-4">
          {/* Icon + Name */}
          <div className="flex items-start gap-3">
            <span className="text-3xl leading-none">{discipline.icon}</span>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-foreground leading-tight">
                {discipline.names[ageGroup]}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {discipline.descriptions[ageGroup]}
          </p>

          {/* Counters */}
          <div className="flex items-center gap-4 pt-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {discipline.contentCount} conteúdos
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FolderKanban className="h-3.5 w-3.5" />
              {discipline.projectCount} projetos
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
