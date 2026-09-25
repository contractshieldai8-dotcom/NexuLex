// WAVE ST.3 — Privacidade + eliminacao (PT).
module.exports = {
  privacy: `<h1>Politica de privacidade</h1>
<p class="meta">Atualizado: 25 de setembro de 2026. Traducao de cortesia. Prevalece o texto ingles.</p>
<p>Esta politica explica como a NexuLex AI («nos», «a aplicacao») trata informacao na aplicacao movel e nos visualizadores web associados.</p>
<h2>1. Dados que tratamos</h2>
<ul>
<li>Dados de conta como e-mail e identificadores de autenticacao.</li>
<li>Texto de contrato, imagens ou PDF que carrega ou cola para analise.</li>
<li>Fotos e PDF sao escolhidos no seletor do sistema. Nao sao capturados em segundo plano.</li>
<li>Resultados de analise, briefs, lembretes e mensagens de apoio que cria.</li>
<li>Estado de compra e direitos das lojas via RevenueCat. O nosso servidor pergunta ao RevenueCat que plano (Pro ou Professional) a conta tem e guarda so esse plano e a data de fim no perfil.</li>
<li>Sinais basicos de dispositivo e diagnostico para operar o servico com seguranca.</li>
</ul>
<h2>2. Armazenamento na nuvem (Supabase)</h2>
<p>Os dados de produto autenticados ficam no Supabase (PostgreSQL e servicos cloud associados). O acesso e limitado por autenticacao e politicas de seguranca por linha. Os briefs partilhados usam codigos de curta duracao e nao incluem o contrato original.</p>
<h2>3. Como usamos os dados</h2>
<ul>
<li>Analisar contratos, gerar relatorios e operar lugares de consultor / agregado.</li>
<li>Aplicar quotas gratuitas e Pro e restaurar compras.</li>
<li>Enviar lembretes locais opcionais que agenda no dispositivo.</li>
<li>Responder a pedidos de apoio que envia.</li>
</ul>
<h2>4. Tratamento por IA</h2>
<p>O conteudo de contrato que envia pode ir ao nosso proxy de IA na nuvem para analise. Nao vendemos os seus contratos. Nao carregue informacao que nao esteja autorizado a tratar.</p>
<p>Perguntas juridicas e as ferramentas Professional (cronologia, lista de questoes, nota de pesquisa): a pergunta, factos, material do processo e o ficheiro anexo (sem provas) sao enviados por ligacao cifrada atraves do nosso servidor ao fornecedor de IA so para criar a resposta. O nosso servidor guarda apenas uma contagem diaria de perguntas e execucoes Professional, nao o seu texto nem a saida da IA. Respostas, resultados e processos ficam no dispositivo salvo se os guardar ou partilhar.</p>
<p>Pode reportar uma saida de IA a partir do relatorio de analise, de uma resposta do consultor ou de um rascunho melhorado. O reporte guarda o motivo, a nota opcional, o id, o idioma da app e o pais escolhido. O texto do contrato ou da resposta (ate 2000 caracteres) so e anexado se ligar «Incluir o contexto do contrato».</p>
<p>Encontrar um advogado: a primeira mensagem e o pacote do processo sao criados no dispositivo sem IA e nao sao enviados aos nossos servidores nem a qualquer advogado. Saem do dispositivo so quando os copia ou partilha. As ligacoes de diretorio abrem sitios oficiais de ordens e entidades publicas, com as suas politicas. A NexuLex nao passa os seus dados a advogados e nao recebe honorarios de referencia.</p>
<h2>5. Conservacao e eliminacao</h2>
<p>Pode apagar a conta em qualquer momento na app em <strong>Definicoes, depois Apagar conta</strong>, ou com os passos da <a href="delete-account.html">pagina de eliminacao</a> (sem a app). A eliminacao remove conta e perfil, analises e textos de contrato, codigos de partilha, lembretes, lugares de consultor / agregado e briefs, mensagens de apoio e relatos de IA. No dispositivo da eliminacao in-app tambem se limpam lembretes agendados, caches locais e ficheiros exportados.</p>
<p>Apos a eliminacao, o identificador do dispositivo e o telefone usados para a quota gratuita ficam sem ligacao a conta, so para impedir pedidos gratuitos repetidos.</p>
<p>Uma subscricao ativa da App Store / Google Play nao e cancelada automaticamente ao apagar a conta; cancele-a na conta da loja. Os codigos de brief expiram sozinhos apos a janela indicada.</p>
<h2>6. Aviso legal</h2>
<p><strong>A NexuLex AI nao e um escritorio de advogados e nao presta aconselhamento juridico.</strong> As saidas sao ferramentas de informacao geral. As decisoes sao suas; consulte um advogado habilitado para o seu assunto.</p>
<h2>7. Contacto</h2>
<p>Questoes de privacidade: use o ecran de Apoio na app ou contacte o editor indicado na ficha da loja.</p>`,

  deleteAccount: `<h1>Apague a sua conta NexuLex AI</h1>
<p class="meta">Atualizado: 25 de setembro de 2026. Traducao de cortesia. Prevalece o texto ingles.</p>
<h2>Na aplicacao (o mais rapido)</h2>
<ol>
<li>Abra a NexuLex AI e inicie sessao.</li>
<li>Va a <strong>Definicoes</strong> e toque em <strong>Apagar conta</strong>.</li>
<li>Leia o aviso e confirme duas vezes. A eliminacao corre de imediato e a sessao fecha.</li>
</ol>
<p class="warn"><strong>As subscricoes nao sao canceladas automaticamente.</strong> Cancele um plano ativo em
<a href="https://apps.apple.com/account/subscriptions">subscricoes da App Store</a> ou
<a href="https://play.google.com/store/account/subscriptions">subscricoes da Google Play</a>.</p>
<h2>Sem a aplicacao</h2>
<p>Escreva para <a href="mailto:nexulexai@gmail.com?subject=Account%20deletion%20request">nexulexai@gmail.com</a> a partir do endereco registado o texto «Delete my account» / «Apagar a minha conta». Confirmamos por e-mail e concluimos a eliminacao em 30 dias.</p>
<h2>O que e apagado</h2>
<ul>
<li>Conta e perfil (e-mail, identificadores, estado Pro).</li>
<li>Analises e textos de contrato, codigos de partilha, lembretes, lugares de consultor / agregado e briefs.</li>
<li>Mensagens de apoio e relatos de IA que enviou.</li>
<li>No dispositivo da eliminacao in-app: lembretes agendados, caches locais e ficheiros exportados.</li>
</ul>
<h2>O que e conservado</h2>
<p>O identificador do dispositivo e o telefone usados para a quota gratuita de analise ficam sem ligacao a conta, so para impedir pedidos gratuitos repetidos. As compras na Apple, Google e RevenueCat seguem as proprias regras.</p>
<p>Veja tambem a <a href="privacy.html">politica de privacidade</a>.</p>`,
};
