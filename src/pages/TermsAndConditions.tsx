import { Link } from "react-router-dom";
import NexSeedLogo from "@/components/NexSeedLogo";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link to="/login">
            <NexSeedLogo dark={false} />
          </Link>
        </div>

        <h1 className="text-3xl font-heading font-bold mb-2">Termos e Condições</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: 15 de maio de 2025</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">1. Aceitação dos termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao criar uma conta e utilizar a plataforma NexSeed, aceitas estes Termos e Condições
              de utilização ("Termos") na íntegra. Se não concordares com alguma parte destes Termos,
              não deves utilizar a plataforma. Estes Termos constituem um acordo juridicamente
              vinculativo entre ti e a NexSeed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">2. Descrição do serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              A NexSeed é uma plataforma digital de apoio ao homeschooling que disponibiliza
              ferramentas para planeamento curricular, gestão de atividades, portfólios de aprendizagem,
              relatórios de progresso e recursos pedagógicos. O serviço destina-se exclusivamente a
              pais, tutores e responsáveis pela educação domiciliar de crianças.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">3. Elegibilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para criar uma conta, deves ter pelo menos 18 anos de idade. A plataforma não se destina
              ao uso direto por menores. Os pais ou tutores legais são os únicos responsáveis pela
              introdução e gestão de dados relativos às crianças sob a sua responsabilidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">4. Conta e segurança</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>És responsável por manter a confidencialidade das tuas credenciais de acesso.</li>
              <li>Deves notificar-nos imediatamente em caso de acesso não autorizado à tua conta.</li>
              <li>Não podes partilhar a tua conta com terceiros não autorizados.</li>
              <li>
                Podes convidar outros membros da família através da funcionalidade de convites,
                sendo tu responsável pelas suas ações na plataforma.
              </li>
              <li>A NexSeed reserva-se o direito de suspender contas que violem estes Termos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">5. Uso aceitável</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Comprometes-te a utilizar a plataforma apenas para fins lícitos e de acordo com estes Termos. É expressamente proibido:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Utilizar a plataforma para fins comerciais sem autorização prévia por escrito</li>
              <li>Tentar aceder a dados de outras famílias</li>
              <li>Introduzir conteúdo ilegal, ofensivo, difamatório ou que viole direitos de terceiros</li>
              <li>Realizar engenharia reversa, descompilar ou tentar extrair o código-fonte</li>
              <li>Utilizar sistemas automatizados para aceder à plataforma (scraping, bots)</li>
              <li>Tentar comprometer a segurança ou estabilidade da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">6. Conteúdo do utilizador</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mantés a propriedade intelectual de todo o conteúdo que introduzes na plataforma
              (planos, atividades, portfólios, etc.). Ao introduzires conteúdo, concedes à NexSeed
              uma licença limitada, não exclusiva e revogável para armazenar e apresentar esse
              conteúdo exclusivamente no âmbito da prestação do serviço. A NexSeed não reivindica
              qualquer direito de propriedade sobre o teu conteúdo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">7. Propriedade intelectual da NexSeed</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todos os elementos da plataforma NexSeed — incluindo software, design, logótipo,
              textos, ebooks e metodologias pedagógicas desenvolvidas — são propriedade exclusiva
              da NexSeed e estão protegidos por direitos de autor e demais legislação aplicável.
              Não podes reproduzir, distribuir ou criar obras derivadas sem autorização expressa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">8. Disponibilidade do serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              A NexSeed esforça-se por manter o serviço disponível 24/7, mas não garante
              disponibilidade ininterrupta. Podemos suspender temporariamente o serviço para
              manutenção, atualizações ou por razões de segurança. Não somos responsáveis por
              perdas resultantes de indisponibilidade do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">9. Limitação de responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              A NexSeed é uma ferramenta de apoio e não substitui aconselhamento pedagógico,
              psicológico ou legal profissional. O conteúdo e as sugestões geradas pela plataforma
              (incluindo planos com inteligência artificial) têm caráter orientativo. A NexSeed
              não se responsabiliza por decisões educativas tomadas com base na plataforma,
              nem por quaisquer danos indiretos, incidentais ou consequenciais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">10. Eliminação de conta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podes eliminar a tua conta a qualquer momento nas Definições da plataforma. A eliminação
              da conta resulta no apagamento permanente e imediato de todos os dados associados.
              Esta ação é irreversível. A NexSeed pode igualmente terminar ou suspender o acesso
              em caso de violação grave destes Termos, após notificação prévia sempre que possível.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">11. Alterações aos termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de atualizar estes Termos. Em caso de alterações materiais,
              notificaremos os utilizadores com pelo menos 15 dias de antecedência por email.
              A continuação do uso da plataforma após esse prazo constitui aceitação dos novos Termos.
              Se não concordares com as alterações, podes eliminar a tua conta antes da data de entrada
              em vigor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">12. Lei aplicável e foro competente</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes Termos são regidos pela lei portuguesa. Em caso de litígio, as partes acordam
              submeter-se à jurisdição dos tribunais portugueses, sem prejuízo do direito dos
              utilizadores consumidores de recorrer ao tribunal da sua residência habitual ou
              à plataforma europeia de resolução de litígios em linha (ODR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold mb-3">13. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões relacionadas com estes Termos, contacta-nos em:{" "}
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
