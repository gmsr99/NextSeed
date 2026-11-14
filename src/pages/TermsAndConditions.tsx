// Termos de Utilização (B-08). Rascunho a validar por um jurista (doc 04 §7).
// Inclui a declaração de autoridade parental, a cessão da posição contratual
// (doc 05 §4) e as regras de reembolso do beta e da coorte (doc 02 §7).
import { Link } from "react-router-dom";
import LegalPage, { LegalList, LegalSection, Mail } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export default function TermsAndConditions() {
  const controller = LEGAL.controllerName
    ? <><strong>{LEGAL.controllerName}</strong>{LEGAL.controllerNif ? <>, NIF {LEGAL.controllerNif}</> : null}</>
    : <strong>[nome e NIF, a preencher]</strong>;

  return (
    <LegalPage title="Termos de Utilização">
      <LegalSection n={1} title="Quem somos e o que é a NexSeed">
        <p>
          A NexSeed (<strong>nexseed.pt</strong>) é uma plataforma de apoio a famílias em ensino doméstico: plano anual e
          semanal, registo do dia a dia, portefólio e relatórios. É explorada por {controller}, contactável em{" "}
          <Mail to={LEGAL.contactEmail} />. Ao criar conta, aceitas estes Termos e a{" "}
          <Link to="/privacidade" className="text-primary underline">Política de Privacidade</Link>.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Fase beta">
        <p>
          A NexSeed está em beta: algumas funcionalidades ainda estão a ser construídas e podem mudar. Durante o beta, o
          acesso é gratuito em troca de feedback combinado contigo. Estamos a fechar a camada legal completa antes do
          lançamento comercial e dizemos-te quando estiver. Podes sair quando quiseres.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Quem pode criar conta">
        <LegalList
          items={[
            "A conta é de um adulto, com 18 anos ou mais. As crianças não têm conta: são perfis que o adulto cria e gere.",
            <>
              <strong>Ao introduzires dados, fotos ou trabalhos de uma criança, declaras que tens responsabilidade parental
              sobre ela, ou autorização de quem a tem, para o fazer.</strong> A NexSeed não consegue verificar acordos entre
              pais (por exemplo, em caso de separação); essa responsabilidade é de quem introduz os dados.
            </>,
            "Podes convidar outros adultos da família para a conta. Quem convidas aceita estes Termos ao entrar.",
            "Os planos pagos, quando existirem, destinam-se a residentes em Portugal.",
          ]}
        />
      </LegalSection>

      <LegalSection n={4} title="A tua conta">
        <LegalList
          items={[
            "Guarda a tua password e não a partilhes fora da família.",
            <>Se suspeitares de um acesso indevido, avisa-nos de imediato em <Mail to={LEGAL.contactEmail} />.</>,
            "Podemos suspender uma conta que viole estes Termos, avisando antes sempre que possível.",
          ]}
        />
      </LegalSection>

      <LegalSection n={5} title="Uso aceitável">
        <p>Não é permitido:</p>
        <LegalList
          items={[
            "tentar aceder a dados de outras famílias ou comprometer a segurança da plataforma;",
            "introduzir conteúdo ilegal, ofensivo ou que viole direitos de terceiros;",
            "usar sistemas automáticos para aceder à plataforma ou extrair conteúdo;",
            "revender ou explorar comercialmente a NexSeed sem autorização escrita.",
          ]}
        />
      </LegalSection>

      <LegalSection n={6} title="O teu conteúdo e os manuais">
        <p>
          O que crias na NexSeed (registos, fotos, trabalhos, notas) continua a ser teu. Dás-nos apenas a autorização
          necessária para o guardar e mostrar a ti e aos adultos da tua conta, dentro do serviço.
        </p>
        <p>
          Quando escreves o índice de um manual, a NexSeed guarda só os títulos das unidades e as páginas, para os
          distribuir pelas semanas. Não carregues o conteúdo dos manuais (textos, exercícios, imagens): esse conteúdo
          pertence aos respetivos autores e editoras, e a NexSeed não o reproduz.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Inteligência artificial e sugestões">
        <p>
          Os planos, atividades e sugestões são gerados com apoio de inteligência artificial e são propostas. Podem conter
          erros ou não se adequar à tua criança: revê-os antes de os usar. A NexSeed não substitui o acompanhamento
          pedagógico, psicológico ou médico, nem as obrigações que tens perante a escola onde a criança está matriculada.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Preços, sinal e reembolsos">
        <LegalList
          items={[
            <>
              <strong>Beta (até ao lançamento comercial):</strong> sem subscrição. O sinal de reserva de lugar na coorte
              fundadora é opcional, é <strong>devolvido na totalidade a qualquer momento, sem justificação</strong>, e é
              descontado na primeira anuidade.
            </>,
            <>
              <strong>Coorte fundadora:</strong> o preço de fundador mantém-se enquanto a subscrição estiver ativa. Nos
              primeiros três meses, podes pedir o <strong>reembolso total, sem justificação</strong>.
            </>,
            "Os preços e as condições de cada plano são apresentados antes do pagamento.",
            "Como consumidor, tens também os direitos que a lei te dá na contratação à distância, incluindo o direito de livre resolução nos termos legais.",
            <>Para pedir um reembolso, escreve para <Mail to={LEGAL.contactEmail} />.</>,
          ]}
        />
      </LegalSection>

      <LegalSection n={9} title="Disponibilidade e responsabilidade">
        <p>
          Fazemos o possível para manter a NexSeed disponível e os teus dados seguros, mas não garantimos funcionamento sem
          interrupções. Podemos parar o serviço por pouco tempo para manutenção ou segurança. Recomendamos que descarregues
          os relatórios e o portefólio que tens de entregar à escola. Na medida permitida pela lei, não respondemos por
          danos indiretos; nada nestes Termos limita os teus direitos como consumidor.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Terminar">
        <p>
          Podes apagar a conta a qualquer momento, em Definições. Antes disso, podes descarregar todos os dados da família.
          Apagar a conta apaga os dados de forma permanente (ver a Política de Privacidade).
        </p>
      </LegalSection>

      <LegalSection n={11} title="Transmissão para uma sociedade">
        <p>
          A NexSeed é explorada, nesta fase, por uma pessoa singular. Aceitas que a posição contratual nestes Termos, e as
          subscrições ativas, possam ser transmitidas para uma sociedade a constituir pelo mesmo titular, para continuar a
          prestar o serviço nas mesmas condições, sem necessidade de novo acordo. Avisamos-te antes, e podes sempre
          terminar a conta se não concordares.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Alterações">
        <p>
          Se mudarmos estes Termos de forma importante, avisamos por email com pelo menos 15 dias de antecedência. Se não
          concordares, podes apagar a conta antes de as alterações produzirem efeitos.
        </p>
      </LegalSection>

      <LegalSection n={13} title="Lei aplicável e litígios">
        <p>
          Estes Termos regem-se pela lei portuguesa. Se tivermos um desentendimento, escreve-nos primeiro: queremos
          resolvê-lo contigo. Podes também usar o Livro de Reclamações Eletrónico ou recorrer a uma entidade de resolução
          alternativa de litígios de consumo
          {LEGAL.adrEntity ? (
            <>
              : <strong>{LEGAL.adrEntity}</strong>
              {LEGAL.adrWebsite ? <> (<a href={LEGAL.adrWebsite} className="text-primary underline" target="_blank" rel="noreferrer">{LEGAL.adrWebsite}</a>)</> : null}
            </>
          ) : (
            <> <strong>[entidade a indicar]</strong></>
          )}
          . Mantêns sempre o direito de recorrer aos tribunais da tua área de residência.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
