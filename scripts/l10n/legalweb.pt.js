// WAVE ST.3 — Privacidade + eliminação (PT). WAVE B: accents restored.
module.exports = {
  privacy: `<h1>Política de privacidade</h1>
<p class="meta">Atualizado: 5 de outubro de 2026. Tradução de cortesia. Prevalece o texto inglês.</p>
<p>Esta política explica como a NexuLex AI («nós», «a aplicação») trata informação na aplicação móvel e nos visualizadores web associados.</p>
<h2>1. Dados que tratamos</h2>
<ul>
<li>Dados de conta como e-mail e identificadores de autenticação.</li>
<li>Texto de contrato, imagens ou PDF que carrega ou cola para análise.</li>
<li>Fotos e PDF são escolhidos no seletor do sistema. Não são capturados em segundo plano.</li>
<li>Resultados de análise, briefs, lembretes e mensagens de apoio que cria.</li>
<li>Estado de compra e direitos das lojas via RevenueCat. O nosso servidor pergunta ao RevenueCat que plano (Pro ou Professional) a conta tem e guarda só esse plano e a data de fim no perfil.</li>
<li>Sinais básicos de dispositivo e diagnóstico para operar o serviço com segurança.</li>
</ul>
<h2>2. Armazenamento na nuvem (Supabase)</h2>
<p>Os dados de produto autenticados ficam no Supabase (PostgreSQL e serviços cloud associados). O acesso é limitado por autenticação e políticas de segurança por linha. Os briefs partilhados usam códigos de curta duração e não incluem o contrato original.</p>
<h2>3. Como usamos os dados</h2>
<ul>
<li>Analisar contratos, gerar relatórios e operar lugares de consultor / agregado.</li>
<li>Aplicar quotas gratuitas e Pro e restaurar compras.</li>
<li>Enviar lembretes locais opcionais que agenda no dispositivo.</li>
<li>Responder a pedidos de apoio que envia.</li>
</ul>
<h2>4. Tratamento por IA</h2>
<p>O conteúdo de contrato que envia pode ir ao nosso proxy de IA na nuvem para análise. Não vendemos os seus contratos. Não carregue informação que não esteja autorizado a tratar.</p>
<p>Perguntas jurídicas e as ferramentas Professional (cronologia, lista de questões, nota de pesquisa): a pergunta, factos, material do processo e o ficheiro anexo (sem provas) são enviados por ligação cifrada através do nosso servidor ao fornecedor de IA só para criar a resposta. O nosso servidor guarda apenas uma contagem diária de perguntas e execuções Professional, não o seu texto nem a saída da IA. Respostas, resultados e processos ficam no dispositivo salvo se os guardar ou partilhar.</p>
<p>Pode reportar uma saída de IA a partir do relatório de análise, de uma resposta do consultor ou de um rascunho melhorado. O reporte guarda o motivo, a nota opcional, o id, o idioma da app e o país escolhido. O texto do contrato ou da resposta (até 2000 caracteres) só é anexado se ligar «Incluir o contexto do contrato».</p>
<p>Encontrar um advogado: a primeira mensagem e o pacote do processo são criados no dispositivo sem IA e não são enviados aos nossos servidores nem a qualquer advogado. Saem do dispositivo só quando os copia ou partilha. As ligações de diretório abrem sítios oficiais de ordens e entidades públicas, com as suas políticas. A NexuLex não passa os seus dados a advogados e não recebe honorários de referência.</p>
<h2>5. Conservação e eliminação</h2>
<p>Pode apagar a conta em qualquer momento na app em <strong>Definições, depois Apagar conta</strong>, ou com os passos da <a href="delete-account.html">página de eliminação</a> (sem a app). A eliminação remove conta e perfil, análises e textos de contrato, códigos de partilha, lembretes, lugares de consultor / agregado e briefs, mensagens de apoio e relatos de IA. No dispositivo da eliminação in-app também se limpam lembretes agendados, caches locais e ficheiros exportados.</p>
<p>Após a eliminação, o identificador do dispositivo e o telefone usados para a quota gratuita ficam sem ligação à conta, só para impedir pedidos gratuitos repetidos.</p>
<p>Uma subscrição ativa da App Store / Google Play não é cancelada automaticamente ao apagar a conta; cancele-a na conta da loja. Os códigos de brief expiram sozinhos após a janela indicada.</p>
<h2>6. Aviso legal</h2>
<p><strong>A NexuLex AI não é um escritório de advogados e não presta aconselhamento jurídico.</strong> As saídas são ferramentas de informação geral. As decisões são suas; consulte um advogado habilitado para o seu assunto.</p>
<h2 data-sec="signup">7. Dados de registo</h2>
<p>No registo indica um endereço de e-mail e um número de telefone. O número de telefone e um identificador do dispositivo servem para reclamar a quota gratuita de análise e impedir abusos repetidos. Não são usados para publicidade nem são vendidos.</p>
<h2 data-sec="voice">8. Entrada de voz</h2>
<p>A entrada de voz é opcional. Quando usa o microfone, o reconhecimento de voz é feito pelo serviço de voz integrado no seu telefone (Apple ou Google), segundo as condições de privacidade desse fornecedor. A NexuLex AI não grava nem guarda o seu áudio; recebe apenas o texto que decidir usar.</p>
<h2 data-sec="transfer">9. Prestadores de serviços e transferências internacionais</h2>
<p>Usamos o Supabase (base de dados na nuvem e início de sessão), um fornecedor de IA terceiro acedido através do nosso servidor (análises e respostas), o RevenueCat (estado de compra) e as lojas da Apple e da Google. Estes prestadores podem tratar dados em países diferentes do seu, incluindo fora do Espaço Económico Europeu, do Reino Unido e da Suíça. Quando a lei exigir garantias para essas transferências, apoiamo-nos nos mecanismos de transferência oferecidos por esses prestadores.</p>
<h2 data-sec="rights">10. Os seus direitos</h2>
<p>Consoante o local onde vive (por exemplo, ao abrigo do RGPD / UK GDPR, da LPD suíça, da DSG austríaca, da KVKK turca, da DPDP Act indiana, da PIPEDA canadiana e das leis provinciais ou da Privacy Act australiana), pode ter direito a aceder aos seus dados, retificá-los, apagá-los, portá-los, limitar o tratamento ou opor-se-lhe e retirar o consentimento. Pode apagar a conta na app. Para outros pedidos escreva para nexulexai@gmail.com a partir do endereço registado; respondemos no prazo que a lei exigir. Pode também apresentar reclamação à autoridade de proteção de dados do seu país.</p>
<h2 data-sec="children">11. Crianças, publicidade e seguimento</h2>
<p>A NexuLex AI destina-se a adultos com 18 anos ou mais e não se dirige a crianças. Não recolhemos conscientemente dados de crianças; contacte-nos e apagá-los-emos. A app não contém publicidade nem seguimento entre apps, e não vendemos dados pessoais.</p>
<h2>12. Contacto</h2>
<p>Questões de privacidade: use o ecrã de Apoio na app ou contacte o editor indicado na ficha da loja.</p>`,

  deleteAccount: `<h1>Apague a sua conta NexuLex AI</h1>
<p class="meta">Atualizado: 25 de setembro de 2026. Tradução de cortesia. Prevalece o texto inglês.</p>
<h2>Na aplicação (o mais rápido)</h2>
<ol>
<li>Abra a NexuLex AI e inicie sessão.</li>
<li>Vá a <strong>Definições</strong> e toque em <strong>Apagar conta</strong>.</li>
<li>Leia o aviso e confirme duas vezes. A eliminação corre de imediato e a sessão fecha.</li>
</ol>
<p class="warn"><strong>As subscrições não são canceladas automaticamente.</strong> Cancele um plano ativo em
<a href="https://apps.apple.com/account/subscriptions">subscrições da App Store</a> ou
<a href="https://play.google.com/store/account/subscriptions">subscrições da Google Play</a>.</p>
<h2>Sem a aplicação</h2>
<p>Escreva para <a href="mailto:nexulexai@gmail.com?subject=Account%20deletion%20request">nexulexai@gmail.com</a> a partir do endereço registado o texto «Delete my account» / «Apagar a minha conta». Confirmamos por e-mail e concluímos a eliminação em 30 dias.</p>
<h2>O que é apagado</h2>
<ul>
<li>Conta e perfil (e-mail, identificadores, estado Pro).</li>
<li>Análises e textos de contrato, códigos de partilha, lembretes, lugares de consultor / agregado e briefs.</li>
<li>Mensagens de apoio e relatos de IA que enviou.</li>
<li>No dispositivo da eliminação in-app: lembretes agendados, caches locais e ficheiros exportados.</li>
</ul>
<h2>O que é conservado</h2>
<p>O identificador do dispositivo e o telefone usados para a quota gratuita de análise ficam sem ligação à conta, só para impedir pedidos gratuitos repetidos. As compras na Apple, Google e RevenueCat seguem as próprias regras.</p>
<p>Veja também a <a href="privacy.html">política de privacidade</a>.</p>`,

  terms: `<h1>Termos de utilização (EULA)</h1>
<p class="meta">Atualizado: 5 de outubro de 2026. Tradução de cortesia. Prevalece o texto inglês.</p>
<p>Ao descarregar ou usar a NexuLex AI aceita estes termos e a nossa <a href="privacy.html">política de privacidade</a>.</p>
<h2>1. Descrição do serviço</h2>
<p>A NexuLex AI é um programa de consumo que ajuda a rever contratos, ver riscos, redigir contra-linguagem e partilhar briefs só de leitura. É fornecida «tal como está».</p>
<h2>2. Não é um escritório</h2>
<p><strong>A NexuLex AI não é um escritório de advogados e não presta aconselhamento jurídico.</strong> Nada na app cria uma relação advogado-cliente. Confirme decisões importantes com um advogado habilitado no seu país.</p>
<p>«Encontrar um advogado» liga apenas a diretórios oficiais de ordens e entidades públicas. A NexuLex AI não recomenda, classifica nem refere advogados, não recebe honorários de referência e não responde pelos serviços do advogado que escolher. Verifique inscrição e honorários antes de o constituir.</p>
<h2>3. Contas e subscrições</h2>
<ul>
<li>As quotas gratuitas e direitos Pro aplicam-se no servidor e via RevenueCat / as lojas.</li>
<li>O plano Professional inclui tudo do Pro mais as ferramentas Professional e os limites diários mais altos mostrados na app. O plano é verificado pelo nosso servidor com RevenueCat; não pode ser alterado na app.</li>
<li>As ferramentas Professional são auxílios de trabalho, não aconselhamento jurídico. Usam só o seu material e podem ter erros; verifique cada data, facto e fonte. A NexuLex AI não representa ninguém perante um tribunal ou autoridade.</li>
<li>Faturação, reembolsos e cancelamentos seguem as regras da App Store ou da Google Play.</li>
<li>É responsável pela segurança das credenciais.</li>
</ul>
<h2>4. Uso aceitável</h2>
<ul>
<li>Não carregue conteúdo ilegal nem material que não esteja autorizado a tratar.</li>
<li>Não tente contornar, sobrecarregar ou desmontar segurança, quotas ou paywalls.</li>
<li>Não use o serviço para assediar, defraudar ou enganar.</li>
<li>Não partilhe segredos, credenciais ou dados pessoais de terceiros sem base legal.</li>
</ul>
<h2>5. Propriedade intelectual</h2>
<p>O nome, a marca e o software NexuLex AI pertencem ao editor. Conserva direitos nos contratos que carrega. Concede-nos uma licença limitada para tratar esse conteúdo só para prestar o serviço.</p>
<h2>6. Briefs partilhados e lugares</h2>
<p>As ligações de brief e os lugares de consultor / agregado destinam-se a esconder o contrato original. Os destinatários ainda veem os resumos de análise que escolher partilhar. Tenha cuidado antes de criar códigos.</p>
<h2>7. Limitação de responsabilidade</h2>
<p>Na medida permitida pela lei, não respondemos por decisões baseadas na saída da app, erros de IA de terceiros, disputas de faturação da loja ou falhas fora do nosso controlo razoável.</p>
<h2>8. Alterações</h2>
<p>Podemos atualizar estes termos. Continuar a usar o serviço após uma atualização constitui aceitação.</p>
<h2 data-sec="eligibility">9. Idade mínima</h2>
<p>Para usar a NexuLex AI tem de ter pelo menos 18 anos ou a maioridade do local onde vive. Se a usar para uma empresa, confirma que pode vinculá-la.</p>
<h2 data-sec="renewal">10. Subscrições e renovação automática</h2>
<p>Os planos pagos renovam-se automaticamente pelo mesmo período ao preço da loja apresentado, até os cancelar. O pagamento é cobrado na sua conta App Store ou Google Play. Pode geri-los ou cancelá-los nas definições da conta da loja; na App Store, pelo menos 24 horas antes do fim do período atual. Apagar a sua conta NexuLex AI não cancela a subscrição. Os reembolsos seguem a política da loja.</p>
<h2 data-sec="ai">11. Resultados gerados por IA</h2>
<p>As análises, respostas, rascunhos e resumos são gerados por inteligência artificial. Podem estar incompletos, desatualizados ou errados, e a lei varia consoante o país e muda com o tempo. Confirme os pontos importantes em fontes oficiais ou com um advogado habilitado antes de confiar neles.</p>
<h2 data-sec="termin">12. Suspensão e cessação</h2>
<p>Pode deixar de usar a NexuLex AI e apagar a sua conta a qualquer momento. Podemos suspender ou terminar um acesso que viole estes termos ou ponha em risco o serviço ou outros utilizadores.</p>
<h2>13. Contacto</h2>
<p>Para conta ou produto use o ecrã de Apoio na app. Para reclamações de consumidores valem os dados do editor na ficha da loja.</p>`,
};
