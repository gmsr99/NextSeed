// Política de Privacidade (B-07). Rascunho a validar por um jurista (doc 04 §7).
// Os dados por decidir (responsável, NIF, Gemini pago) vêm de src/lib/legal.ts.
import { Link } from "react-router-dom";
import LegalPage, { LegalList, LegalSection, Mail } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export default function PrivacyPolicy() {
  const controller = LEGAL.controllerName
    ? <><strong>{LEGAL.controllerName}</strong>{LEGAL.controllerNif ? <>, NIF {LEGAL.controllerNif}</> : null}</>
    : <strong>[nome e NIF do responsável, a preencher]</strong>;

  return (
    <LegalPage
      title="Política de Privacidade"
      summary={
        <>
          <p className="mb-2 font-semibold">Em poucas palavras</p>
          <LegalList
            items={[
              "A conta é sempre de um adulto. As crianças são perfis que tu crias e geres; nunca têm conta própria.",
              "Pedimos só o que é preciso para o plano e o portefólio. Tudo o que é das crianças começa privado e fica privado.",
              "A inteligência artificial que gera o plano não recebe os nomes das crianças nem as fotos.",
              "Não vendemos dados, não fazemos publicidade e não criamos perfis de menores para fins comerciais.",
              "Podes descarregar todos os dados da família ou apagar a conta, nas Definições, quando quiseres.",
            ]}
          />
        </>
      }
    >
      <LegalSection n={1} title="Quem é responsável pelos teus dados">
        <p>
          A NexSeed (<strong>nexseed.pt</strong>) é uma plataforma de apoio a famílias em ensino doméstico. O responsável
          pelo tratamento dos dados é {controller}. Para qualquer assunto de privacidade, escreve para <Mail to={LEGAL.contactEmail} />.
        </p>
        <p>
          A NexSeed está em fase beta. Estamos a fechar a camada legal completa (avaliação de impacto e parecer
          jurídico) antes do lançamento comercial e vamos atualizar este texto quando isso acontecer.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Que dados tratamos">
        <LegalList
          items={[
            <><strong>Conta:</strong> email e password (guardada cifrada), e a data, hora e versão destes textos quando os aceitaste.</>,
            <><strong>Família:</strong> nome da família e o email dos adultos que convidas para a conta.</>,
            <>
              <strong>Crianças</strong> (introduzidos por ti): nome (chega o primeiro nome ou uma alcunha), data de nascimento
              (para calcular a idade e sugerir o ano), ano de escolaridade, interesses e, se quiseres, estilo e ritmo de
              aprendizagem e a escola ou agrupamento (só para aparecer nos relatórios que entregas).
            </>,
            <>
              <strong>Aprendizagem:</strong> planos semanais, atividades e o seu registo, fotos e trabalhos, projetos,
              progresso nas áreas de aprendizagem, portefólio e relatórios, o calendário da família e os índices dos
              manuais que escreves (títulos das unidades e páginas).
            </>,
            <>
              <strong>Utilização e opinião:</strong> durante o beta registamos alguns eventos de uso (por exemplo, quando é
              gerado um plano) e as respostas que dás aos questionários de feedback. Não usamos cookies de rastreamento
              nem serviços de publicidade.
            </>,
            <><strong>Técnicos:</strong> endereço IP e registos de acesso, para segurança.</>,
            <><strong>Pagamentos</strong>, quando os houver: os dados de faturação do adulto que paga.</>,
          ]}
        />
      </LegalSection>

      <LegalSection n={3} title="Para que os usamos e com que fundamento">
        <LegalList
          items={[
            <><strong>Prestar o serviço</strong> (conta, crianças, plano, registo, portefólio, relatórios, emails de convite e de envio do plano): execução do contrato contigo (art. 6.º, n.º 1, al. b) do RGPD).</>,
            <><strong>Gerar o plano e analisar o que já foi coberto do currículo</strong>, com inteligência artificial: execução do contrato, enviando só o mínimo (ver ponto 5).</>,
            <><strong>Melhorar a NexSeed</strong> a partir dos eventos de uso e do feedback: interesse legítimo (al. f). Podes opor-te a qualquer momento.</>,
            <><strong>Segurança</strong> da plataforma e das contas: interesse legítimo (al. f).</>,
            <><strong>Faturação e obrigações fiscais</strong>, quando há pagamentos: cumprimento de obrigação legal (al. c).</>,
          ]}
        />
        <p>Não usamos os dados para marketing de terceiros, publicidade ou venda.</p>
      </LegalSection>

      <LegalSection n={4} title="Dados das crianças">
        <p>
          Quem cria a conta e introduz dados de uma criança declara ter responsabilidade parental sobre ela ou autorização
          de quem a tem. A NexSeed não fala diretamente com crianças e as crianças não têm conta.
        </p>
        <LegalList
          items={[
            "Pedimos só o necessário. Não precisas de pôr o nome completo; o primeiro nome ou uma alcunha chegam.",
            "As fotos ficam num espaço privado da família. Só os adultos da tua conta as veem; não são públicas nem indexadas.",
            "Os relatórios e o portefólio são gerados no teu próprio browser.",
            "Quando a criança crescer, pode pedir-nos para apagar o que foi registado sobre ela. Tratamos esse pedido como tratamos o teu.",
          ]}
        />
      </LegalSection>

      <LegalSection n={5} title="Inteligência artificial">
        <p>
          Para gerar o plano semanal, sugerir atividades e analisar a cobertura do currículo usamos o modelo Gemini, da
          Google, através de um servidor nosso (a app nunca fala diretamente com a Google). Enviamos o ano de
          escolaridade, os interesses, os conteúdos do currículo e dos manuais dessa semana e, na análise de cobertura,
          o título e a descrição das atividades escolhidas. <strong>Os nomes das crianças são substituídos por uma
          designação genérica antes do envio, e as fotos nunca são enviadas.</strong>
        </p>
        {LEGAL.geminiPaid ? (
          <p>Usamos o serviço pago da Google, em que o conteúdo enviado não é usado para treinar ou melhorar os modelos da Google.</p>
        ) : (
          <p>
            Durante o beta usamos o serviço gratuito da Google. Nesse serviço, a Google pode usar o conteúdo enviado para
            melhorar os seus produtos. É por isso que não enviamos nomes nem fotos. Vamos passar ao serviço pago, que não
            permite esse uso, antes de começarmos a cobrar.
          </p>
        )}
        <p>As sugestões da IA são propostas: tu decides o que fazer com elas.</p>
      </LegalSection>

      <LegalSection n={6} title="Quem mais trata os dados por nós">
        <p>Usamos estes prestadores (subcontratantes), cada um só para o que é preciso:</p>
        <LegalList
          items={[
            <><strong>Supabase</strong>: base de dados, autenticação e armazenamento das fotos.</>,
            <><strong>Vercel</strong>: alojamento da aplicação.</>,
            <><strong>Google (Gemini)</strong>: inteligência artificial (ver ponto 5).</>,
            <><strong>Resend</strong>: envio de emails (convites e plano semanal).</>,
          ]}
        />
        <p>
          Algumas destas empresas têm sede nos Estados Unidos. Quando há transferência de dados para fora da União
          Europeia, ela assenta nos mecanismos previstos no RGPD, como as Cláusulas Contratuais-Tipo da Comissão Europeia
          ou o Quadro de Privacidade de Dados UE-EUA. Não partilhamos dados com mais ninguém, incluindo outras entidades
          ou comunidades com quem colaboramos.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Quanto tempo guardamos">
        <LegalList
          items={[
            "Enquanto a conta estiver ativa.",
            "Quando apagas a conta, apagamos de imediato a família, as crianças, os planos, as atividades, o portefólio e as fotos.",
            "Os registos de segurança são guardados no máximo 90 dias.",
            "Os documentos de faturação, quando os houver, são guardados durante o prazo que a lei fiscal obriga, mesmo depois de a conta ser apagada.",
          ]}
        />
      </LegalSection>

      <LegalSection n={8} title="Os teus direitos">
        <p>Podes, a qualquer momento:</p>
        <LegalList
          items={[
            <><strong>Ver e descarregar</strong> todos os dados da família, em <Link to="/settings" className="text-primary underline">Definições</Link> (exportar dados).</>,
            <><strong>Corrigir</strong> qualquer dado, diretamente na app.</>,
            <><strong>Apagar</strong> a conta e tudo o que ela contém, em Definições.</>,
            <><strong>Opor-te</strong> ao uso para melhoria do produto, <strong>limitar</strong> o tratamento ou pedir a <strong>portabilidade</strong>, escrevendo para <Mail to={LEGAL.contactEmail} />.</>,
          ]}
        />
        <p>
          Respondemos no prazo máximo de 30 dias. Se achares que não tratámos bem os teus dados, podes apresentar
          reclamação à CNPD, a Comissão Nacional de Proteção de Dados (<a href="https://www.cnpd.pt" className="text-primary underline" target="_blank" rel="noreferrer">www.cnpd.pt</a>).
        </p>
      </LegalSection>

      <LegalSection n={9} title="Cookies e armazenamento no dispositivo">
        <p>
          Usamos apenas o que é necessário para a app funcionar: manter a sessão iniciada e guardar preferências da
          interface. Não usamos cookies de rastreamento, de publicidade ou de análise de terceiros.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Segurança">
        <p>
          As comunicações são cifradas (HTTPS). As passwords são guardadas cifradas. Cada família só acede aos seus dados,
          por regras aplicadas na própria base de dados. As fotos são comprimidas no teu dispositivo antes do envio e só
          se abrem com ligações temporárias. Se acontecer uma violação de dados que te afete, avisamos-te e avisamos a
          CNPD nos prazos da lei.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Alterações a esta política">
        <p>
          Quando mudarmos alguma coisa importante, avisamos por email ou na app antes de a mudança produzir efeitos, e
          dizemos o que mudou.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
