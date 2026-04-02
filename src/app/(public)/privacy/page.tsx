export const metadata = {
  title: 'Politica de Privacidade | Clapper',
  description:
    'Politica de Privacidade do Clapper - CRM para produtoras audiovisuais.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-16 text-white">
      <article className="mx-auto max-w-3xl space-y-10">
        {/* Header */}
        <header className="space-y-3 border-b border-zinc-800 pb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Politica de Privacidade
          </h1>
          <p className="text-sm text-zinc-400">
            Ultima atualizacao: 1 de abril de 2026
          </p>
        </header>

        {/* Intro */}
        <section className="space-y-4 text-zinc-300 leading-relaxed">
          <p>
            A <strong className="text-white">Trip Labz</strong> (&quot;nos&quot;,
            &quot;nosso&quot; ou &quot;nossa&quot;) opera o aplicativo{' '}
            <strong className="text-white">Clapper</strong>, um CRM voltado para
            produtoras audiovisuais no Brasil. Esta Politica de Privacidade
            descreve como coletamos, usamos, armazenamos e protegemos suas
            informacoes pessoais ao utilizar nosso servico.
          </p>
          <p>
            Ao utilizar o Clapper, voce concorda com a coleta e o uso de
            informacoes conforme descrito nesta politica.
          </p>
        </section>

        {/* 1 - Dados coletados */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            1. Dados que Coletamos
          </h2>
          <div className="space-y-3 text-zinc-300 leading-relaxed">
            <p>Podemos coletar os seguintes tipos de informacoes:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong className="text-white">Dados de cadastro:</strong> nome,
                e-mail, telefone e informacoes da empresa ao criar sua conta.
              </li>
              <li>
                <strong className="text-white">Dados de uso:</strong>{' '}
                informacoes sobre como voce interage com o aplicativo, incluindo
                paginas visitadas, funcionalidades utilizadas e horarios de
                acesso.
              </li>
              <li>
                <strong className="text-white">Dados de clientes e projetos:</strong>{' '}
                informacoes que voce insere no CRM sobre seus clientes,
                propostas, projetos e financeiro.
              </li>
              <li>
                <strong className="text-white">Dados de integracao:</strong>{' '}
                informacoes obtidas por meio de integracoes autorizadas por voce,
                como o Google Calendar.
              </li>
            </ul>
          </div>
        </section>

        {/* 2 - Google Calendar */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            2. Integracao com o Google Calendar
          </h2>
          <div className="space-y-3 text-zinc-300 leading-relaxed">
            <p>
              O Clapper oferece integracao opcional com o Google Calendar para
              sincronizar eventos e prazos de projetos. Ao conectar sua conta
              Google:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Utilizamos o protocolo <strong className="text-white">OAuth 2.0</strong>{' '}
                do Google para autenticacao. Nunca temos acesso a sua senha do
                Google.
              </li>
              <li>
                Armazenamos de forma segura os{' '}
                <strong className="text-white">tokens de acesso e refresh</strong>{' '}
                necessarios para manter a integracao ativa. Esses tokens sao
                criptografados em repouso.
              </li>
              <li>
                Solicitamos apenas os escopos minimos necessarios para ler e
                criar eventos no seu calendario.
              </li>
              <li>
                Voce pode revogar o acesso a qualquer momento nas configuracoes
                do Clapper ou diretamente na sua conta Google em{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
                >
                  myaccount.google.com/permissions
                </a>
                .
              </li>
            </ul>
          </div>
        </section>

        {/* 3 - Uso dos dados */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            3. Como Usamos seus Dados
          </h2>
          <div className="space-y-3 text-zinc-300 leading-relaxed">
            <p>Utilizamos suas informacoes para:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Fornecer, manter e melhorar o servico do Clapper.</li>
              <li>
                Gerenciar sua conta e fornecer suporte ao cliente.
              </li>
              <li>
                Sincronizar dados com servicos de terceiros autorizados por voce
                (ex.: Google Calendar).
              </li>
              <li>
                Enviar comunicacoes relacionadas ao servico, como atualizacoes e
                alertas de seguranca.
              </li>
              <li>
                Cumprir obrigacoes legais e regulatorias, incluindo a LGPD (Lei
                Geral de Protecao de Dados).
              </li>
            </ul>
          </div>
        </section>

        {/* 4 - Compartilhamento */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            4. Compartilhamento de Dados
          </h2>
          <div className="space-y-3 text-zinc-300 leading-relaxed">
            <p>
              Nao vendemos, alugamos ou compartilhamos seus dados pessoais com
              terceiros para fins de marketing. Podemos compartilhar informacoes
              apenas nas seguintes situacoes:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Com provedores de servicos essenciais para a operacao do Clapper
                (hospedagem, banco de dados, autenticacao).
              </li>
              <li>
                Quando exigido por lei, regulamento ou ordem judicial.
              </li>
              <li>
                Com seu consentimento explicito.
              </li>
            </ul>
          </div>
        </section>

        {/* 5 - Seguranca */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            5. Seguranca dos Dados
          </h2>
          <div className="space-y-3 text-zinc-300 leading-relaxed">
            <p>
              Adotamos medidas tecnicas e organizacionais para proteger seus
              dados, incluindo:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Criptografia de dados em transito (HTTPS/TLS).</li>
              <li>
                Criptografia de tokens e credenciais sensíveis em repouso.
              </li>
              <li>
                Controle de acesso baseado em funcoes (RBAC) dentro da
                aplicacao.
              </li>
              <li>
                Monitoramento e auditoria de acessos.
              </li>
            </ul>
            <p>
              Embora nos esforcemos para proteger suas informacoes, nenhum
              metodo de transmissao ou armazenamento eletronico e 100% seguro.
            </p>
          </div>
        </section>

        {/* 6 - Cookies */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            6. Cookies e Tecnologias Semelhantes
          </h2>
          <div className="space-y-3 text-zinc-300 leading-relaxed">
            <p>
              O Clapper utiliza cookies estritamente necessarios para o
              funcionamento do servico, como:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong className="text-white">Cookies de sessao:</strong> para
                manter voce autenticado durante o uso do aplicativo.
              </li>
              <li>
                <strong className="text-white">Cookies de preferencias:</strong>{' '}
                para armazenar configuracoes de interface.
              </li>
            </ul>
            <p>
              Nao utilizamos cookies de rastreamento de terceiros para fins
              publicitarios.
            </p>
          </div>
        </section>

        {/* 7 - Direitos do usuario */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            7. Seus Direitos (LGPD)
          </h2>
          <div className="space-y-3 text-zinc-300 leading-relaxed">
            <p>
              De acordo com a Lei Geral de Protecao de Dados (Lei n.
              13.709/2018), voce tem direito a:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Confirmar a existencia de tratamento de seus dados.</li>
              <li>Acessar seus dados pessoais.</li>
              <li>
                Corrigir dados incompletos, inexatos ou desatualizados.
              </li>
              <li>
                Solicitar a anonimizacao, bloqueio ou eliminacao de dados
                desnecessarios ou excessivos.
              </li>
              <li>
                Solicitar a portabilidade dos dados a outro fornecedor de
                servico.
              </li>
              <li>
                Revogar o consentimento a qualquer momento.
              </li>
              <li>
                Solicitar a exclusao de seus dados pessoais.
              </li>
            </ul>
            <p>
              Para exercer qualquer um desses direitos, entre em contato conosco
              pelo e-mail indicado abaixo.
            </p>
          </div>
        </section>

        {/* 8 - Retencao */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            8. Retencao de Dados
          </h2>
          <div className="space-y-3 text-zinc-300 leading-relaxed">
            <p>
              Mantemos seus dados pessoais apenas pelo tempo necessario para
              cumprir as finalidades descritas nesta politica, a menos que um
              periodo de retencao maior seja exigido ou permitido por lei. Ao
              encerrar sua conta, seus dados serao excluidos ou anonimizados em
              ate 30 dias, salvo obrigacoes legais.
            </p>
          </div>
        </section>

        {/* 9 - Alteracoes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            9. Alteracoes nesta Politica
          </h2>
          <div className="space-y-3 text-zinc-300 leading-relaxed">
            <p>
              Podemos atualizar esta Politica de Privacidade periodicamente.
              Notificaremos sobre quaisquer alteracoes significativas por meio do
              aplicativo ou por e-mail. A data da ultima atualizacao sera sempre
              indicada no topo desta pagina.
            </p>
          </div>
        </section>

        {/* 10 - Contato */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            10. Contato
          </h2>
          <div className="space-y-3 text-zinc-300 leading-relaxed">
            <p>
              Se voce tiver duvidas, solicitacoes ou reclamacoes sobre esta
              Politica de Privacidade ou sobre o tratamento de seus dados
              pessoais, entre em contato:
            </p>
            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-2">
              <p>
                <strong className="text-white">Trip Labz</strong>
              </p>
              <p>
                E-mail:{' '}
                <a
                  href="mailto:contato@triplabz.com"
                  className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
                >
                  contato@triplabz.com
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800 pt-8 text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Trip Labz. Todos os direitos reservados.</p>
        </footer>
      </article>
    </main>
  )
}
