import { Info } from "lucide-react";

// Anos sem currículo carregado na base de dados (curriculum_contents só tem 1.º–4.º).
// Feedback F-04 (T-09): uma criança de 5.º ou 6.º ano era criada sem qualquer aviso.
const YEARS_WITHOUT_CURRICULUM = ["5º ano", "6º ano"];

export function hasCurriculum(schoolYear: string | null | undefined): boolean {
  return !!schoolYear && !YEARS_WITHOUT_CURRICULUM.includes(schoolYear);
}

/** Aviso curto, na voz NexSeed: o que ainda não dá e o que dá para fazer hoje. */
export default function SchoolYearScopeNotice({ schoolYear }: { schoolYear: string | null | undefined }) {
  if (!schoolYear || hasCurriculum(schoolYear)) return null;
  return (
    <div
      role="note"
      className="flex gap-2 rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>
        Para o {schoolYear} ainda não temos o currículo carregado: por agora a NexSeed cobre do pré-escolar ao 4.º ano.
        O plano semanal funciona na mesma. O truque é abrires, em cada semana, "Ajustar os conteúdos desta semana"
        e escreveres as matérias de cada disciplina.
      </p>
    </div>
  );
}
