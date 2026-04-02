import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso | Clapper',
  description:
    'Termos de Uso da plataforma Clapper, desenvolvida pela Trip Labz.',
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-12">
          <Link
            href="/"
            className="mb-8 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            &larr; Voltar ao inicio
          </Link>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Termos de Uso
          </h1>
          <p className="mt-3 text-zinc-400">
            Ultima atualizacao: 1 de abril de 2026
          </p>
        </header>

        {/* Content */}
        <div className="space-y-10 text-zinc-300 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mb-4 [&_p]:mb-3">
          {/* 1 */}
          <section>
            <h2>1. Aceitacao dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma <strong>Clapper</strong>,
              desenvolvida e mantida pela <strong>Trip Labz</strong>, voce
              concorda em cumprir e estar vinculado a estes Termos de Uso. Se
              voce nao concorda com qualquer parte destes termos, nao devera
              utilizar a plataforma.
            </p>
            <p>
              O uso continuado da plataforma apos a publicacao de alteracoes
              nestes termos constitui aceitacao das modificacoes.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2>2. Descricao do Servico</h2>
            <p>
              O Clapper e um sistema de gestao de relacionamento com clientes
              (CRM) desenvolvido especificamente para{' '}
              <strong>produtoras audiovisuais</strong> no Brasil. A plataforma
              oferece funcionalidades como:
            </p>
            <ul className="ml-6 mt-2 list-disc space-y-1 text-zinc-400">
              <li>Gestao de contatos e clientes</li>
              <li>Criacao e acompanhamento de propostas comerciais</li>
              <li>Controle financeiro de projetos</li>
              <li>Integracao com Google Calendar para agendamento de eventos</li>
              <li>Dashboard com metricas e indicadores de desempenho</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2>3. Contas de Usuario</h2>
            <p>
              Para utilizar o Clapper, voce devera criar uma conta fornecendo
              informacoes verdadeiras, completas e atualizadas. Voce e
              responsavel por:
            </p>
            <ul className="ml-6 mt-2 list-disc space-y-1 text-zinc-400">
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>
                Todas as atividades realizadas sob sua conta
              </li>
              <li>
                Notificar imediatamente a Trip Labz sobre qualquer uso nao
                autorizado da sua conta
              </li>
            </ul>
            <p className="mt-3">
              A Trip Labz reserva-se o direito de suspender ou encerrar contas
              que violem estes termos ou que permanecam inativas por periodo
              prolongado.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2>4. Uso Aceitavel</h2>
            <p>Ao utilizar o Clapper, voce concorda em nao:</p>
            <ul className="ml-6 mt-2 list-disc space-y-1 text-zinc-400">
              <li>
                Utilizar a plataforma para fins ilegais ou nao autorizados
              </li>
              <li>
                Tentar acessar areas restritas do sistema ou contas de outros
                usuarios
              </li>
              <li>
                Transmitir virus, malware ou qualquer codigo de natureza
                destrutiva
              </li>
              <li>
                Realizar engenharia reversa, descompilar ou desmontar qualquer
                parte da plataforma
              </li>
              <li>
                Utilizar bots, scrapers ou ferramentas automatizadas para
                acessar ou extrair dados da plataforma
              </li>
              <li>
                Compartilhar sua conta com terceiros sem autorizacao
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2>5. Propriedade Intelectual</h2>
            <p>
              Todo o conteudo da plataforma Clapper, incluindo mas nao limitado
              a design, codigo-fonte, logotipos, textos, graficos e interfaces,
              e de propriedade exclusiva da Trip Labz ou de seus licenciadores e
              esta protegido pelas leis brasileiras de propriedade intelectual.
            </p>
            <p>
              Os dados inseridos pelo usuario na plataforma permanecem de
              propriedade do usuario. A Trip Labz nao reivindica propriedade
              sobre o conteudo gerado pelo usuario, mas reserva-se o direito de
              utilizar dados anonimizados e agregados para fins de melhoria do
              servico.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2>6. Integracao com Google Calendar</h2>
            <p>
              O Clapper oferece integracao opcional com o Google Calendar. Ao
              ativar essa integracao, voce:
            </p>
            <ul className="ml-6 mt-2 list-disc space-y-1 text-zinc-400">
              <li>
                Autoriza o Clapper a acessar, criar, editar e excluir eventos em
                seu Google Calendar conforme necessario para o funcionamento da
                plataforma
              </li>
              <li>
                Reconhece que essa integracao esta sujeita tambem aos{' '}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Termos de Servico do Google
                </a>{' '}
                e a{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Politica de Privacidade do Google
                </a>
              </li>
              <li>
                Pode revogar o acesso a qualquer momento atraves das
                configuracoes da sua conta Google
              </li>
            </ul>
            <p className="mt-3">
              O Clapper utiliza os dados do Google Calendar exclusivamente para
              fornecer as funcionalidades de agendamento dentro da plataforma. O
              uso dos dados obtidos via APIs do Google esta em conformidade com a{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline hover:text-blue-300"
              >
                Politica de Dados de Usuario dos Servicos de API do Google
              </a>
              , incluindo os requisitos de Uso Limitado.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2>7. Limitacao de Responsabilidade</h2>
            <p>
              A plataforma Clapper e fornecida &ldquo;como esta&rdquo; e
              &ldquo;conforme disponivel&rdquo;. A Trip Labz nao garante que o
              servico sera ininterrupto, livre de erros ou completamente seguro.
            </p>
            <p>
              Na maxima extensao permitida pela legislacao brasileira, a Trip
              Labz nao sera responsavel por:
            </p>
            <ul className="ml-6 mt-2 list-disc space-y-1 text-zinc-400">
              <li>
                Danos indiretos, incidentais, especiais ou consequenciais
                decorrentes do uso ou incapacidade de uso da plataforma
              </li>
              <li>
                Perda de dados, lucros cessantes ou interrupcao de negocios
              </li>
              <li>
                Conteudo ou acoes de terceiros na plataforma
              </li>
              <li>
                Problemas decorrentes de integracoes com servicos de terceiros,
                incluindo Google Calendar
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2>8. Rescisao</h2>
            <p>
              Voce pode encerrar sua conta a qualquer momento entrando em
              contato com nossa equipe de suporte. A Trip Labz pode suspender ou
              encerrar seu acesso a plataforma, sem aviso previo, caso:
            </p>
            <ul className="ml-6 mt-2 list-disc space-y-1 text-zinc-400">
              <li>Voce viole qualquer disposicao destes Termos de Uso</li>
              <li>
                Seu uso da plataforma represente risco a seguranca ou ao
                funcionamento do servico
              </li>
              <li>
                Seja exigido por lei ou ordem judicial
              </li>
            </ul>
            <p className="mt-3">
              Apos o encerramento da conta, seus dados poderao ser retidos pelo
              periodo necessario para cumprimento de obrigacoes legais, resolucao
              de disputas e aplicacao de nossos acordos.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2>9. Legislacao Aplicavel</h2>
            <p>
              Estes Termos de Uso sao regidos e interpretados de acordo com as
              leis da Republica Federativa do Brasil. Qualquer disputa
              decorrente destes termos sera submetida ao foro da comarca de
              domicilio da Trip Labz, com exclusao de qualquer outro, por mais
              privilegiado que seja.
            </p>
            <p>
              A plataforma esta em conformidade com a Lei Geral de Protecao de
              Dados (LGPD - Lei n. 13.709/2018) e demais legislacoes aplicaveis.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2>10. Alteracoes nos Termos</h2>
            <p>
              A Trip Labz reserva-se o direito de modificar estes Termos de Uso
              a qualquer momento. Alteracoes significativas serao comunicadas
              atraves da plataforma ou por e-mail. O uso continuado do Clapper
              apos a notificacao de alteracoes constitui aceitacao dos novos
              termos.
            </p>
            <p>
              Recomendamos que voce revise periodicamente esta pagina para se
              manter informado sobre quaisquer mudancas.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2>11. Contato</h2>
            <p>
              Se voce tiver duvidas, sugestoes ou preocupacoes sobre estes
              Termos de Uso, entre em contato conosco:
            </p>
            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <p className="mb-1 font-medium text-white">Trip Labz</p>
              <p className="text-zinc-400">
                E-mail:{' '}
                <a
                  href="mailto:contato@triplabz.com"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  contato@triplabz.com
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-zinc-800 pt-8 text-sm text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()} Trip Labz. Todos os direitos
            reservados. Clapper e uma marca da Trip Labz.
          </p>
        </footer>
      </article>
    </main>
  )
}
