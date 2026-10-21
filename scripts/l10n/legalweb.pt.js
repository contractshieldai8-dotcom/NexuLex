// WAVE ST.3 — Privacidade + eliminação (PT). WAVE B: accents restored.
module.exports = {
  privacy: `<h1>Política de privacidade</h1>
<p class="meta">Atualizado: 21 de outubro de 2026. Tradução de cortesia. Prevalece o texto inglês.</p>
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
<p>Para fazer funcionar o NexuLex AI usamos estes prestadores:</p>
<ul>
<li>Supabase: base de dados na nuvem, início de sessão e funções de servidor. O nosso projeto está alojado na União Europeia (Frankfurt, Alemanha).</li>
<li>Anthropic (API Claude, Estados Unidos): análise e respostas, acessível apenas através do nosso servidor.</li>
<li>RevenueCat (Estados Unidos): estado das compras e do plano.</li>
<li>Netlify: aloja estas páginas web e pode tratar dados técnicos do pedido, como o seu endereço IP.</li>
<li>Apple e Google: as lojas de aplicações, a faturação e o reconhecimento de voz integrado no seu telefone.</li>
</ul>
<p>Alguns prestadores, como a Anthropic e a RevenueCat, tratam dados nos Estados Unidos, e outros podem tratá-los fora do seu país, incluindo fora do Espaço Económico Europeu, do Reino Unido, da Suíça e da Turquia. Quando a lei exige garantias para essas transferências, baseamo-nos nos adendas de proteção de dados e nos mecanismos de transferência internacional (como as cláusulas contratuais-tipo) oferecidos nas condições de serviço padrão desses prestadores.</p>
<h2 data-sec="rights">10. Os seus direitos</h2>
<p>Consoante o local onde vive (por exemplo, ao abrigo do RGPD / UK GDPR, da LPD suíça, da DSG austríaca, da KVKK turca, da DPDP Act indiana, da PIPEDA canadiana e das leis provinciais ou da Privacy Act australiana), pode ter direito a aceder aos seus dados, retificá-los, apagá-los, portá-los, limitar o tratamento ou opor-se-lhe e retirar o consentimento. Pode apagar a conta na app. Para outros pedidos escreva para nexulexai@gmail.com a partir do endereço registado; respondemos no prazo que a lei exigir. Pode também apresentar reclamação à autoridade de proteção de dados do seu país.</p>
<h2 data-sec="children">11. Crianças, publicidade e seguimento</h2>
<p>A NexuLex AI destina-se a adultos com 18 anos ou mais e não se dirige a crianças. Não recolhemos conscientemente dados de crianças; contacte-nos e apagá-los-emos. A app não contém publicidade nem seguimento entre apps, e não vendemos dados pessoais.</p>
<h2 data-sec="analytics">12. Relatórios anónimos de utilização e erros</h2>
<p>Para manter a app fiável e melhorá-la, NexuLex AI pode enviar eventos anónimos curtos: por exemplo, que áreas são utilizadas, se uma análise terminou ou falhou, os resultados do ecrã de subscrição e das compras, e o tipo de erro. Cada relatório inclui um ID de instalação aleatório criado no seu dispositivo (não o ID de hardware), a versão da app, a plataforma e o idioma da app. Os relatórios nunca contêm os seus contratos, textos, imagens, endereço de e-mail, número de telefone nem ID da conta, e não são usados para publicidade nem vendidos.</p>
<p>No Espaço Económico Europeu, no Reino Unido, na Suíça, na Turquia, no Brasil, na Índia, na Coreia do Sul e na África do Sul, não é enviado nada sem a sua autorização. Nos restantes países está ativo por predefinição. Pode alterá-lo a qualquer momento em <strong>Definições → Privacidade</strong>; ao desativá-lo, os relatórios ainda pendentes no dispositivo são eliminados. Os relatórios são guardados no Supabase e removidos após, no máximo, 180 dias.</p>
<h2 data-sec="invite">13. Códigos de convite</h2>
<p>Se tiver sessão iniciada, o NexuLex AI atribui-lhe um código de convite curto. Quando um amigo o introduz, guardamos os dois IDs de conta, o identificador do dispositivo do amigo (o mesmo usado para a quota de análises gratuitas) e a data, apenas para conceder as análises de bónus e evitar abusos. Nada sobre os seus contratos é partilhado. Se eliminar a conta, o seu código e as respetivas ligações a contas são eliminados; pode permanecer um registo sem qualquer ID de conta para que o mesmo dispositivo não possa reclamar novamente o bónus.</p>
<h2 data-sec="controller">14. Responsável pelo tratamento e bases legais</h2>
<p>O responsável pelo tratamento dos seus dados pessoais é Doğancan Kara, empresário em nome individual em Bağcılar, Istambul, Turquia (e-mail: nexulexai@gmail.com), editor do NexuLex AI. Quando se aplicam o RGPD, o UK GDPR ou a LPD suíça, baseamo-nos nestas bases legais: a execução do contrato consigo (a sua conta, análises, quotas e compras); os nossos interesses legítimos (operar o serviço em segurança, evitar o abuso da quota gratuita e corrigir erros); o seu consentimento (funcionalidades opcionais que ativa, como os relatórios de utilização anónimos onde é exigido consentimento); e obrigações legais, quando aplicáveis. Pode retirar o consentimento a qualquer momento, sem afetar o tratamento anterior. Quando se aplicam outras leis de proteção de dados, baseamo-nos nos fundamentos equivalentes que estas preveem.</p>
<h2 data-sec="security">15. Segurança</h2>
<p>Protegemos os dados com ligações cifradas (HTTPS), autenticação de contas e políticas de segurança ao nível da linha na nossa base de dados; os pedidos de IA passam pelo nosso servidor e não diretamente a partir da app. Nenhum sistema é totalmente seguro, por isso mantenha as suas credenciais de acesso em segurança. Se uma violação de dados pessoais o afetar, informaremos o utilizador e as autoridades quando a lei o exigir.</p>
<h2 data-sec="templates">16. Modelos de contrato</h2>
<p>A biblioteca de contratos (separador Consultor) preenche modelos de contrato de código aberto no seu dispositivo. Os dados que escreve no formulário servem apenas para construir o documento no ecrã e ficam apenas na memória da app durante essa sessão; não são enviados para os nossos servidores, para o nosso fornecedor de IA nem para mais ninguém, e não são guardados na sua conta. O documento só sai do seu dispositivo quando o copia, partilha ou exporta. Os textos dos modelos vêm incluídos na app e são publicados pela General Legal ao abrigo da licença de domínio público CC0-1.0.</p>
<h2 data-sec="retention">17. Prazos de conservação</h2>
<p>Durante quanto tempo guardamos os dados nos nossos servidores:</p>
<table>
<thead><tr><th>Dados</th><th>Prazo</th></tr></thead>
<tbody>
<tr><td>Conta e perfil</td><td>Até eliminar a sua conta</td></tr>
<tr><td>Análises guardadas e texto dos contratos</td><td>Até as eliminar ou eliminar a sua conta</td></tr>
<tr><td>Códigos de resumo e de partilha</td><td>Até ao fim da validade indicada; um código expirado deixa de funcionar automaticamente</td></tr>
<tr><td>Mensagens de apoio</td><td>No máximo 24 meses, ou até eliminar a sua conta</td></tr>
<tr><td>Relatórios anónimos de utilização e de erros</td><td>No máximo 180 dias</td></tr>
<tr><td>Registo da quota gratuita (identificador do dispositivo e número de telefone, sem qualquer ligação à sua conta)</td><td>Sem data de fim fixa; guardado apenas para evitar o abuso repetido da quota gratuita</td></tr>
<tr><td>Plano e data de expiração no seu perfil</td><td>Até eliminar a sua conta; os registos de compra da Apple, da Google e da RevenueCat seguem as respetivas políticas</td></tr>
<tr><td>Dados no seu dispositivo (histórico, processos, respostas, rascunhos)</td><td>Até os eliminar ou desinstalar a app</td></tr>
</tbody>
</table>
<h2 data-sec="kvkk">18. Turquia: aviso de informação KVKK (Lei n.º 6698)</h2>
<p>Se se encontra na Turquia, esta secção é o nosso aviso de informação nos termos do artigo 10.º da Lei turca n.º 6698 de Proteção de Dados Pessoais (KVKK). Responsável pelo tratamento: Doğancan Kara (empresário em nome individual), Bağcılar, Istambul, Turquia; e-mail: nexulexai@gmail.com.</p>
<p>Finalidades: criar e gerir a sua conta, analisar os contratos que submete, aplicar as quotas, processar compras, prestar apoio, manter o serviço seguro e prevenir abusos, e cumprir obrigações legais. Fundamentos jurídicos (artigo 5.º): execução de um contrato, interesses legítimos do responsável, consentimento explícito quando exigido (por exemplo, nos relatórios de utilização anónimos opcionais) e obrigações legais. Forma de recolha: o que introduz e a recolha automática através da app, por meios eletrónicos.</p>
<p>Destinatários e transferências: os seus dados são tratados pelos prestadores indicados na secção 9, alguns fora da Turquia (Supabase na União Europeia, Anthropic e RevenueCat nos Estados Unidos). Efetuamos as transferências para o estrangeiro de acordo com o artigo 9.º da KVKK. Não vendemos os seus dados.</p>
<p>Os seus direitos nos termos do artigo 11.º: saber se os seus dados são tratados e pedir informações; conhecer a finalidade e se são usados em conformidade; conhecer os terceiros a quem são transferidos na Turquia ou no estrangeiro; pedir a correção de dados incompletos ou incorretos; pedir o apagamento ou a destruição nos termos do artigo 7.º e que os terceiros sejam informados; opor-se a um resultado desfavorável que decorra apenas de análise automatizada; e pedir indemnização por danos causados por tratamento ilícito.</p>
<p>Para exercer os seus direitos, escreva para nexulexai@gmail.com a partir do endereço com que se registou e descreva o pedido. Respondemos no prazo máximo de 30 dias. Se não ficar satisfeito, pode apresentar queixa à Autoridade turca de proteção de dados (Kişisel Verileri Koruma Kurulu). Os contratos que carrega podem conter dados de outras pessoas; deve ter o direito de os tratar.</p>
<h2 data-sec="ccpa">19. Estados Unidos: direitos na Califórnia e noutros estados</h2>
<p>Não vendemos as suas informações pessoais nem as partilhamos para publicidade comportamental entre contextos. A app não contém publicidade, pelo que não existe uma definição «Não vender nem partilhar as minhas informações pessoais» para ativar.</p>
<p>Se vive na Califórnia ou noutro estado dos EUA com lei de privacidade do consumidor (por exemplo, a CCPA/CPRA), na medida em que essa lei se aplique a nós, pode ter o direito de saber que informações pessoais recolhemos, usamos e divulgamos; de aceder a elas, corrigi-las e eliminá-las; de limitar o uso de informações pessoais sensíveis; e de não sofrer discriminação por exercer estes direitos.</p>
<p>Nos últimos doze meses recolhemos estas categorias: identificadores (endereço de e-mail, número de telefone, identificadores do dispositivo e da instalação); informações comerciais (estado do plano e das compras); atividade na app (eventos de utilização anónimos); e o conteúdo que submete (contratos e perguntas). Divulgamo-las apenas aos prestadores da secção 9, para as finalidades comerciais descritas nesta política. Não guardamos o seu áudio de voz.</p>
<p>Para exercer os seus direitos, escreva para nexulexai@gmail.com a partir do endereço com que se registou. Podemos pedir dados para verificar a sua identidade, pode recorrer a um representante autorizado e respondemos em 45 dias quando a lei o exigir.</p>
<h2 data-sec="changes">20. Alterações a esta política</h2>
<p>Podemos atualizar esta política de privacidade. Se fizermos alterações importantes, mudaremos a data no topo e, quando a lei o exigir, informá-lo-emos na app ou por outro meio adequado antes de a alteração se aplicar. Consulte esta página de vez em quando.</p>
<h2 data-sec="language">21. Idiomas</h2>
<p>Esta política está disponível em vários idiomas por conveniência. Se uma tradução diferir da versão em inglês, prevalece a versão em inglês.</p>
<p lang="en" dir="ltr">In case of discrepancies, the English version shall prevail.</p>
<h2>22. Contacto</h2>
<p>Questões de privacidade e pedidos sobre os seus dados: escreva para nexulexai@gmail.com ou use o ecrã de Apoio na app. Editor e responsável pelo tratamento: Doğancan Kara (empresário em nome individual), Bağcılar, Istambul, Turquia.</p>`,

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
<p class="meta">Atualizado: 21 de outubro de 2026. Tradução de cortesia. Prevalece o texto inglês.</p>
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
<h2 data-sec="templates">13. Modelos de contrato</h2>
<p>A biblioteca de contratos (separador Consultor) oferece modelos de contratos comerciais de uso geral publicados pela General Legal ao abrigo da licença de domínio público CC0-1.0. NexuLex AI insere os dados que escreve e deixa o resto de cada modelo inalterado, na redação original em inglês. Os modelos não estão adaptados à sua situação, país ou setor e podem não ser válidos ou executáveis onde se encontra. São fornecidos «tal como estão», sem garantia. Peça a um advogado habilitado na jurisdição aplicável que reveja qualquer contrato antes de o assinar. NexuLex AI não é parte em nenhum contrato que crie, e a biblioteca de contratos não cria uma relação advogado-cliente. O documento completo, a exportação para Word, copiar e partilhar fazem parte do plano Pro; os utilizadores gratuitos veem uma pré-visualização.</p>
<h2 data-sec="law">14. Lei aplicável e tribunais</h2>
<p>Estes termos regem-se pelas leis da República da Turquia. São competentes os tribunais e os serviços de execução de Istambul (Çağlayan), sem prejuízo dos direitos imperativos de proteção do consumidor que lhe assistam segundo a lei do seu país de residência, incluindo o direito de recorrer aí ao tribunal ou organismo competente.</p>
<h2 data-sec="language">15. Idiomas</h2>
<p>Estes termos estão disponíveis em vários idiomas por conveniência. Se uma tradução diferir da versão em inglês, prevalece a versão em inglês.</p>
<p lang="en" dir="ltr">In case of discrepancies, the English version shall prevail.</p>
<h2>16. Contacto</h2>
<p>Para conta, produto ou questões de consumidores use o ecrã de Apoio na app ou escreva para nexulexai@gmail.com. Editor: Doğancan Kara (empresário em nome individual), Bağcılar, Istambul, Turquia.</p>`,
};
