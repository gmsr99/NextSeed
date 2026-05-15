import { Link } from "react-router-dom";
import NexSeedLogo from "@/components/NexSeedLogo";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link to="/login">
            <NexSeedLogo dark={false} />
          </Link>
        </div>

        <h1 className="text-3xl font-heading font-bold mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: 15 de maio de 2025</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">1. Quem somos</h2>
            <p className="text-muted-foreground leading-relaxed">
              A <strong>NexSeed</strong> é uma plataforma digital de apoio ao homeschooling, disponível em{" "}
              <strong>nexseed.pt</strong>. O responsável pelo tratamento dos dados pessoais é o titular do
              projeto NexSeed, contactável através do endereço{" "}
              <a href="mailto:geral@nexseed.pt" className="text-primary underline">geral@nexseed.pt</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">2. Dados que recolhemos</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Recolhemos apenas os dados necessários para prestar o serviço:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Dados da conta:</strong> endereço de email e password (armazenada de forma cifrada)</li>
              <li><strong>Dados da família:</strong> nome da família</li>
              <li><strong>Dados dos filhos:</strong> nome, data de nascimento, ano escolar e interesses (introduzidos pelos pais/tutores)</li>
              <li><strong>Dados pedagógicos:</strong> atividades, planos semanais, portfólios, relatórios e progressos educativos criados pelos utilizadores</li>
              <li><strong>Dados técnicos:</strong> endereço IP e logs de acesso, necessários para a segurança do serviço</li>
              <li><strong>Consentimento:</strong> data e hora de aceitação destes termos aquando do registo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">3. Finalidade e base legal</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Tratamos os teus dados com as seguintes finalidades e bases legais ao abrigo do RGPD:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Prestação do serviço</strong> — execução do contrato (art. 6.º, n.º 1, al. b) do RGPD):
                  autenticação, gestão da conta e família, e disponibilização de todas as funcionalidades da plataforma.
                </li>
                <li>
                  <strong>Segurança e prevenção de fraude</strong> — interesse legítimo (art. 6.º, n.º 1, al. f) do RGPD):
                  proteção da plataforma e dos utilizadores.
                </li>
                <li>
                  <strong>Cumprimento de obrigações legais</strong> — obrigação legal (art. 6.º, n.º 1, al. c) do RGPD).
                </li>
              </ul>
              <p className="mt-2">
                Não utilizamos os teus dados para fins de marketing, publicidade ou venda a terceiros.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">4. Dados de menores</h2>
            <p className="text-muted-foreground leading-relaxed">
              A NexSeed não recolhe dados diretamente de menores. Os dados relativos a crianças são
              introduzidos exclusivamente pelos pais ou tutores legais, que assumem a responsabilidade
              por essa introdução. Tratamos esses dados ao abrigo do legítimo interesse dos pais/tutores
              na gestão da educação dos seus filhos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">5. Partilha de dados com terceiros</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Os teus dados são processados pelos seguintes subcontratantes, com quem temos contratos
              de proteção de dados adequados:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Supabase, Inc.</strong> (EUA) — base de dados e autenticação. Os dados são
                transferidos com base em Cláusulas Contratuais Tipo aprovadas pela Comissão Europeia.
              </li>
              <li>
                <strong>Vercel, Inc.</strong> (EUA) — alojamento da aplicação web. Os dados são
                transferidos com base em Cláusulas Contratuais Tipo.
              </li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Não vendemos, alugamos nem partilhamos os teus dados com outras entidades para fins comerciais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">6. Conservação dos dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os teus dados são conservados enquanto a tua conta estiver ativa. Ao eliminares a conta,
              todos os dados associados — família, filhos, atividades, planos e portfólios — são
              apagados de forma permanente e imediata. Os logs de segurança podem ser conservados
              por um período máximo de 90 dias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">7. Os teus direitos</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Ao abrigo do RGPD, tens os seguintes direitos em relação aos teus dados pessoais:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Acesso</strong> — saber que dados temos sobre ti</li>
              <li><strong>Retificação</strong> — corrigir dados incorretos</li>
              <li><strong>Eliminação</strong> — solicitar o apagamento dos teus dados ("direito a ser esquecido")</li>
              <li><strong>Portabilidade</strong> — receber os teus dados num formato legível por máquina</li>
              <li><strong>Oposição</strong> — opor-te ao tratamento baseado em interesse legítimo</li>
              <li><strong>Limitação</strong> — solicitar a suspensão do tratamento em determinadas circunstâncias</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Para exerceres qualquer um destes direitos, contacta-nos em{" "}
              <a href="mailto:geral@nexseed.pt" className="text-primary underline">geral@nexseed.pt</a>.
              Tens também o direito de apresentar reclamação à{" "}
              <strong>CNPD — Comissão Nacional de Proteção de Dados</strong> (
              <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                www.cnpd.pt
              </a>).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">8. Cookies e armazenamento local</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies e armazenamento local (localStorage) estritamente necessários para
              o funcionamento da plataforma: manutenção da sessão autenticada e preferências da
              interface. Não utilizamos cookies de rastreamento, publicidade ou análise de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">9. Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Adotamos medidas técnicas e organizativas adequadas para proteger os teus dados:
              passwords cifradas com bcrypt, comunicações cifradas via HTTPS/TLS, acesso restrito
              aos dados por autenticação e controlo de acessos ao nível da base de dados (RLS).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">10. Alterações a esta política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Em caso de alterações
              materiais, notificaremos os utilizadores por email ou através da plataforma.
              A continuação do uso da plataforma após a notificação constitui aceitação das alterações.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">11. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para qualquer questão relacionada com a proteção dos teus dados pessoais, contacta-nos em:{" "}
              <a href="mailto:geral@nexseed.pt" className="text-primary underline">geral@nexseed.pt</a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Voltar ao início de sessão
          </Link>
        </div>
      </div>
    </div>
  );
}
