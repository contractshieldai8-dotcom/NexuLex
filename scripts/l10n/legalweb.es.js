// WAVE ST.3 — Privacidad + borrado (ES). WAVE B: accents restored.
module.exports = {
  privacy: `<h1>Política de privacidad</h1>
<p class="meta">Actualizado: 21 de octubre de 2026. Traducción de cortesía. Prima el texto inglés.</p>
<p>Esta política explica cómo NexuLex AI («nosotros», «la app») trata la información en la aplicación móvil y en los visores web relacionados.</p>
<h2>1. Datos que tratamos</h2>
<ul>
<li>Datos de cuenta como el correo y los identificadores de autenticación.</li>
<li>Texto de contrato, imágenes o PDF que sube o pega para analizar.</li>
<li>Fotos y PDF se eligen en el selector del sistema. No se capturan en segundo plano.</li>
<li>Resultados de análisis, briefs, recordatorios y mensajes de soporte que crea.</li>
<li>Estado de compra y derechos de las tiendas vía RevenueCat. Nuestro servidor pregunta a RevenueCat qué plan (Pro o Professional) tiene su cuenta y guarda solo ese plan y su caducidad en el perfil.</li>
<li>Señales básicas de dispositivo y diagnóstico para operar el servicio con seguridad.</li>
</ul>
<h2>2. Almacenamiento en la nube (Supabase)</h2>
<p>Los datos de producto autenticados se guardan en Supabase (PostgreSQL y servicios cloud relacionados). El acceso se limita por autenticación y políticas de seguridad por fila. Los briefs compartidos usan códigos de corta vida y no incluyen el contrato original.</p>
<h2>3. Cómo usamos los datos</h2>
<ul>
<li>Analizar contratos, generar informes y operar asientos de asesor / hogar.</li>
<li>Aplicar cupos gratuitos y Pro y restaurar compras.</li>
<li>Enviar recordatorios locales opcionales que programe en el dispositivo.</li>
<li>Responder a las solicitudes de soporte que envíe.</li>
</ul>
<h2>4. Tratamiento con IA</h2>
<p>El contenido de contrato que envíe puede ir a nuestro proxy de IA en la nube para analizarlo. No vendemos sus contratos. No suba información que no esté autorizado a tratar.</p>
<p>Preguntas jurídicas y las herramientas Professional (cronología, lista de issues, nota de investigación): su pregunta, hechos, material del caso y el archivo adjunto (sin pruebas) se envían por conexión cifrada a través de nuestro servidor al proveedor de IA solo para crear la respuesta. Nuestro servidor guarda solo un recuento diario de preguntas y ejecuciones Professional, no su texto ni la salida de la IA. Respuestas, resultados y expedientes quedan en su dispositivo salvo que los guarde o comparta.</p>
<p>Puede informar una salida de IA desde el informe de análisis, una respuesta del asesor o un borrador pulido. El informe guarda el motivo, su nota opcional, el id, el idioma de la app y el país elegido. El texto del contrato o la respuesta (hasta 2000 caracteres) solo se adjunta si activa «Incluir contexto del contrato».</p>
<p>Buscar abogado: el primer mensaje y el paquete del caso se crean en su dispositivo sin IA y no se envían a nuestros servidores ni a ningún abogado. Salen del dispositivo solo si usted los copia o comparte. Los enlaces de directorio abren sitios oficiales de colegios y organismos públicos, con sus propias políticas. NexuLex no pasa sus datos a abogados ni cobra comisión de derivación.</p>
<p data-consent-record="1">Registro de consentimiento de IA: cuando permite o retira el permiso para enviar su contenido al proveedor de IA, guardamos esa decisión en un registro de consentimiento de solo adición: el identificador de su cuenta, el tipo de consentimiento, la versión del texto, concedido o retirado, y la hora. No contiene texto de contratos. La decisión se aplica de inmediato en su dispositivo, incluso sin conexión; si el registro no se puede guardar enseguida, la aplicación lo guarda más tarde. Solo usted puede leer sus propias filas, nadie en la aplicación puede modificarlas ni borrarlas, y se eliminan cuando borra su cuenta.</p>
<h2>5. Conservación y supresión</h2>
<p>Puede borrar la cuenta en cualquier momento en la app en <strong>Ajustes, luego Borrar cuenta</strong>, o con los pasos de la <a href="delete-account.html">página de borrado</a> (sin la app). El borrado quita cuenta y perfil, análisis y textos de contrato, códigos de uso compartido, recordatorios, asientos de asesor / hogar y briefs, mensajes de soporte e informes de IA. En el dispositivo del borrado in-app también se limpian recordatorios programados, cachés locales y archivos exportados.</p>
<p>Tras el borrado, el identificador del dispositivo usado para el cupo gratuito se conserva sin vínculo con su cuenta, solo para impedir solicitudes gratuitas repetidas.</p>
<p>Una suscripción activa de App Store / Google Play no se cancela automáticamente al borrar la cuenta; cancélela en la cuenta de la tienda. Los códigos de brief caducan solos al terminar su plazo.</p>
<h2>6. Aviso legal</h2>
<p><strong>NexuLex AI no es un despacho de abogados y no presta asesoramiento jurídico.</strong> Las salidas son herramientas de información general. Las decisiones son suyas; consulte a un abogado habilitado para su asunto.</p>
<h2 data-sec="signup">7. Datos de registro</h2>
<p>Al registrarse facilita un correo electrónico y una contraseña, y confirma que tiene al menos 18 años y que acepta las Condiciones de uso y esta Política de privacidad; guardamos esa confirmación y su fecha. No pedimos número de teléfono. Un identificador del dispositivo se usa para reclamar el cupo gratuito de análisis y evitar abusos repetidos. No se usa para publicidad ni se vende.</p>
<p>Antes de su primera solicitud de IA, la app pide su permiso para enviar lo que usted aporta (texto del contrato, fotos, páginas PDF, preguntas) a nuestro proveedor de IA. Puede retirarlo en cualquier momento en Ajustes, en Privacidad; sin él no se envía ninguna solicitud de IA.</p>
<h2 data-sec="voice">8. Entrada de voz</h2>
<p>La entrada de voz es opcional. Al usar el micrófono, el reconocimiento de voz lo realiza el servicio de voz integrado en su teléfono (Apple o Google), con las condiciones de privacidad de ese proveedor. NexuLex AI no graba ni guarda su audio; solo recibe el texto que decide usar.</p>
<h2 data-sec="transfer">9. Proveedores y transferencias internacionales</h2>
<p>Para hacer funcionar NexuLex AI usamos estos proveedores:</p>
<ul>
<li>Supabase: base de datos en la nube, inicio de sesión y funciones de servidor. Nuestro proyecto está alojado en la Unión Europea (Fráncfort, Alemania).</li>
<li>Anthropic (API de Claude, Estados Unidos): análisis y respuestas, a las que solo se accede a través de nuestro servidor.</li>
<li>RevenueCat (Estados Unidos): estado de compras y del plan.</li>
<li>Netlify: aloja estas páginas web y puede tratar datos técnicos de la solicitud, como su dirección IP.</li>
<li>Apple y Google: las tiendas de aplicaciones, la facturación y el reconocimiento de voz integrado en su teléfono.</li>
</ul>
<p>Algunos proveedores, como Anthropic y RevenueCat, tratan datos en Estados Unidos, y otros pueden tratarlos fuera de su país, incluso fuera del Espacio Económico Europeo, el Reino Unido, Suiza y Turquía. Cuando la ley exige garantías para esas transferencias, nos basamos en los anexos de protección de datos y los mecanismos de transferencia internacional (como las cláusulas contractuales tipo) ofrecidos en las condiciones de servicio estándar de estos proveedores.</p>
<h2 data-sec="rights">10. Sus derechos</h2>
<p>Según dónde viva (por ejemplo, conforme al RGPD / UK GDPR, la LPD suiza, la DSG austriaca, la KVKK turca, la ley DPDP de la India, la PIPEDA canadiense y las leyes provinciales o la Privacy Act australiana), puede tener derecho a acceder a sus datos, rectificarlos, suprimirlos, portarlos, limitar su tratamiento u oponerse a él, y a retirar su consentimiento. Puede borrar su cuenta en la app. Para otras solicitudes escriba a nexulexai@gmail.com desde su correo registrado; respondemos en el plazo que exija la ley. También puede reclamar ante la autoridad de protección de datos de su país.</p>
<h2 data-sec="children">11. Menores, publicidad y seguimiento</h2>
<p>NexuLex AI está pensada para adultos de 18 años o más y no se dirige a menores. No recogemos a sabiendas datos de menores; contáctenos y los borraremos. La app no contiene publicidad ni seguimiento entre apps, y no vendemos datos personales.</p>
<h2 data-sec="analytics">12. Informes anónimos de uso y errores</h2>
<p>Para mantener la app fiable y mejorarla, NexuLex AI puede enviar eventos anónimos breves: por ejemplo qué áreas se usan, si un análisis terminó o falló, los resultados de la pantalla de suscripción y de las compras, y el tipo de error. Cada informe incluye un ID de instalación aleatorio creado en tu dispositivo (no el ID de hardware), la versión de la app, la plataforma y el idioma de la app. Los informes nunca contienen tus contratos, textos, imágenes, correo electrónico, número de teléfono ni ID de cuenta, y no se usan para publicidad ni se venden.</p>
<p>En el Espacio Económico Europeo, el Reino Unido, Suiza, Turquía, Brasil, India, Corea del Sur y Sudáfrica no se envía nada salvo que lo permitas. En el resto del mundo está activado por defecto. Puedes cambiarlo en cualquier momento en <strong>Ajustes → Privacidad</strong>; al desactivarlo se borran los informes que sigan pendientes en tu dispositivo. Los informes se guardan en Supabase y se eliminan como máximo a los 180 días.</p>
<h2 data-sec="invite">13. Códigos de invitación</h2>
<p>Si has iniciado sesión, NexuLex AI te asigna un código de invitación corto. Cuando un amigo lo introduce, guardamos los dos ID de cuenta, el identificador de dispositivo del amigo (el mismo que se usa para la cuota de análisis gratuitos) y la fecha, solo para conceder los análisis extra y evitar abusos. No se comparte nada sobre tus contratos. Si borras tu cuenta, se eliminan tu código y sus vínculos con cuentas; puede conservarse un registro sin ningún ID de cuenta para que el mismo dispositivo no pueda reclamar de nuevo el bonus.</p>
<h2 data-sec="controller">14. Responsable y bases jurídicas</h2>
<p>El responsable del tratamiento de sus datos personales es Doğancan Kara, empresario individual en Bağcılar, Estambul, Turquía (correo: nexulexai@gmail.com), editor de NexuLex AI. Cuando se aplican el RGPD, el RGPD del Reino Unido o la LPD suiza, nos basamos en estas bases jurídicas: la ejecución de nuestro contrato con usted (su cuenta, análisis, cuotas y compras); nuestros intereses legítimos (operar el servicio de forma segura, evitar el abuso de la cuota gratuita y corregir errores); su consentimiento (funciones opcionales que usted activa, como los informes de uso anónimos donde se exige consentimiento); y las obligaciones legales cuando correspondan. Puede retirar su consentimiento en cualquier momento sin afectar al tratamiento anterior. Cuando se apliquen otras leyes de protección de datos, nos basamos en los fundamentos equivalentes que ofrezcan.</p>
<h2 data-sec="security">15. Seguridad</h2>
<p>Protegemos los datos con conexiones cifradas (HTTPS), autenticación de cuentas y políticas de seguridad a nivel de fila en nuestra base de datos; las solicitudes de IA pasan por nuestro servidor y no salen directamente de la aplicación. Ningún sistema es completamente seguro, por lo que le pedimos que proteja sus credenciales de acceso. Si una violación de datos personales le afecta, se lo comunicaremos a usted y a las autoridades cuando la ley lo exija.</p>
<h2 data-sec="templates">16. Plantillas de contratos</h2>
<p>La biblioteca de contratos (pestaña Asesor) rellena plantillas de contratos de código abierto en su dispositivo. Los datos que escribe en el formulario solo se usan para construir el documento en pantalla y se mantienen únicamente en la memoria de la aplicación durante esa sesión; no se envían a nuestros servidores, a nuestro proveedor de IA ni a nadie más, y no se guardan en su cuenta. El documento solo sale de su dispositivo cuando usted lo copia, comparte o exporta. Los textos de las plantillas vienen incluidos en la aplicación y los publica General Legal bajo la licencia de dominio público CC0-1.0.</p>
<h2 data-sec="retention">17. Plazos de conservación</h2>
<p>Cuánto tiempo conservamos los datos en nuestros servidores:</p>
<table>
<thead><tr><th>Datos</th><th>Plazo</th></tr></thead>
<tbody>
<tr><td>Cuenta y perfil</td><td>Hasta que elimine su cuenta</td></tr>
<tr><td>Análisis guardados y texto de los contratos</td><td>Hasta que los elimine o elimine su cuenta</td></tr>
<tr><td>Códigos de resumen y de uso compartido</td><td>Hasta que termine el plazo de validez indicado; un código caducado deja de funcionar automáticamente</td></tr>
<tr><td>Mensajes de soporte</td><td>Como máximo 24 meses, o hasta que elimine su cuenta</td></tr>
<tr><td>Informes anónimos de uso y de errores</td><td>Como máximo 180 días</td></tr>
<tr><td>Registro de la cuota gratuita (identificador del dispositivo, sin vínculo con su cuenta)</td><td>Sin fecha de fin fija; se conserva solo para evitar el abuso repetido de la cuota gratuita</td></tr>
<tr><td>Plan y fecha de vencimiento en su perfil</td><td>Hasta que elimine su cuenta; los registros de compra de Apple, Google y RevenueCat se rigen por sus propias políticas</td></tr>
<tr><td>Datos en su dispositivo (historial, expedientes, respuestas, borradores)</td><td>Hasta que los elimine o desinstale la app</td></tr>
</tbody>
</table>
<h2 data-sec="kvkk">18. Turquía: aviso informativo KVKK (Ley n.º 6698)</h2>
<p>Si se encuentra en Turquía, esta sección es nuestro aviso informativo conforme al artículo 10 de la Ley turca n.º 6698 de Protección de Datos Personales (KVKK). Responsable del tratamiento: Doğancan Kara (empresario individual), Bağcılar, Estambul, Turquía; correo: nexulexai@gmail.com.</p>
<p>Finalidades: crear y gestionar su cuenta, analizar los contratos que envía, aplicar las cuotas, procesar compras, prestar soporte, mantener el servicio seguro y evitar abusos, y cumplir obligaciones legales. Bases jurídicas (artículo 5): la ejecución de un contrato, los intereses legítimos del responsable, el consentimiento explícito cuando se exige (por ejemplo, los informes de uso anónimos opcionales) y las obligaciones legales. Forma de recogida: lo que usted introduce y la recogida automática a través de la app, por medios electrónicos.</p>
<p>Destinatarios y transferencias: sus datos son tratados por los proveedores citados en la sección 9, algunos fuera de Turquía (Supabase en la Unión Europea, Anthropic y RevenueCat en Estados Unidos). Realizamos las transferencias al extranjero conforme al artículo 9 de la KVKK. No vendemos sus datos.</p>
<p>Sus derechos según el artículo 11: saber si se tratan sus datos y pedir información; conocer la finalidad y si se usan conforme a ella; conocer los terceros a quienes se transfieren en Turquía o en el extranjero; pedir la corrección de datos incompletos o erróneos; pedir la supresión o destrucción según el artículo 7 y que se notifique a los terceros; oponerse a un resultado desfavorable que provenga solo de un análisis automatizado; y reclamar indemnización por los daños causados por un tratamiento ilícito.</p>
<p>Para ejercerlos, escriba a nexulexai@gmail.com desde la dirección con la que se registró y describa su solicitud. Respondemos en un máximo de 30 días. Si no queda satisfecho, puede reclamar ante la Autoridad turca de protección de datos (Kişisel Verileri Koruma Kurulu). Los contratos que suba pueden contener datos de otras personas; debe tener derecho a tratarlos.</p>
<h2 data-sec="ccpa">19. Estados Unidos: derechos en California y otros estados</h2>
<p>No vendemos su información personal ni la compartimos para publicidad conductual entre contextos. La app no contiene publicidad, por lo que no existe un ajuste «No vender ni compartir mi información personal» que activar.</p>
<p>Si vive en California o en otro estado de EE. UU. con ley de privacidad del consumidor (por ejemplo, la CCPA/CPRA), en la medida en que esa ley se nos aplique, puede tener derecho a saber qué información personal recogemos, usamos y divulgamos; a acceder a ella, corregirla y eliminarla; a limitar el uso de información personal sensible; y a no sufrir discriminación por ejercer estos derechos.</p>
<p>En los últimos doce meses recogimos estas categorías: identificadores (correo electrónico, identificadores de dispositivo y de instalación); información comercial (estado del plan y de las compras); actividad en la app (eventos de uso anónimos); y el contenido que envía (contratos y preguntas). Solo la divulgamos a los proveedores de la sección 9, para los fines empresariales descritos en esta política. No almacenamos su audio de voz.</p>
<p>Para ejercer sus derechos, escriba a nexulexai@gmail.com desde la dirección con la que se registró. Podemos pedir datos para verificar su identidad, puede usar un representante autorizado y respondemos en 45 días cuando la ley lo exija.</p>
<h2 data-sec="changes">20. Cambios en esta política</h2>
<p>Podemos actualizar esta política de privacidad. Si hacemos cambios importantes, modificaremos la fecha de la parte superior y, cuando la ley lo exija, se lo comunicaremos en la aplicación o por otro medio adecuado antes de que el cambio se aplique. Revise esta página de vez en cuando.</p>
<h2 data-sec="language">21. Idiomas</h2>
<p>Esta política está disponible en varios idiomas por comodidad. Si una traducción difiere de la versión en inglés, prevalece la versión en inglés.</p>
<p lang="en" dir="ltr">In case of discrepancies, the English version shall prevail.</p>
<h2>22. Contacto</h2>
<p>Preguntas de privacidad y solicitudes sobre sus datos: escriba a nexulexai@gmail.com o use la pantalla de Soporte en la app. Editor y responsable del tratamiento: Doğancan Kara (empresario individual), Bağcılar, Estambul, Turquía.</p>`,

  deleteAccount: `<h1>Borre su cuenta de NexuLex AI</h1>
<p class="meta">Actualizado: 25 de septiembre de 2026. Traducción de cortesía. Prima el texto inglés.</p>
<h2>En la app (lo más rápido)</h2>
<ol>
<li>Abra NexuLex AI e inicie sesión.</li>
<li>Vaya a <strong>Ajustes</strong> y pulse <strong>Borrar cuenta</strong>.</li>
<li>Lea el aviso y confirme dos veces. El borrado se ejecuta al momento y se cierra la sesión.</li>
</ol>
<p class="warn"><strong>Las suscripciones no se cancelan automáticamente.</strong> Cancele un plan activo en
<a href="https://apps.apple.com/account/subscriptions">suscripciones de App Store</a> o
<a href="https://play.google.com/store/account/subscriptions">suscripciones de Google Play</a>.</p>
<h2>Sin la app</h2>
<p>Escriba a <a href="mailto:nexulexai@gmail.com?subject=Account%20deletion%20request">nexulexai@gmail.com</a> desde el correo registrado el texto «Delete my account» / «Borrar mi cuenta». Confirmamos por correo y completamos el borrado en 30 días.</p>
<h2>Qué se borra</h2>
<ul>
<li>Cuenta y perfil (correo, identificadores, estado Pro).</li>
<li>Análisis y textos de contrato, códigos de uso compartido, recordatorios, asientos de asesor / hogar y briefs.</li>
<li>Mensajes de soporte e informes de IA que envió.</li>
<li>En el dispositivo del borrado in-app: recordatorios programados, cachés locales y archivos exportados.</li>
</ul>
<h2>Qué se conserva</h2>
<p>El identificador del dispositivo usado para el cupo gratuito de análisis se conserva sin vínculo con su cuenta, solo para impedir solicitudes gratuitas repetidas. Las compras en Apple, Google y RevenueCat siguen sus propias normas.</p>
<p>Vea también la <a href="privacy.html">política de privacidad</a>.</p>`,

  terms: `<h1>Condiciones de uso (EULA)</h1>
<p class="meta">Actualizado: 21 de octubre de 2026. Traducción de cortesía. Prima el texto inglés.</p>
<p>Al descargar o usar NexuLex AI acepta estas condiciones y nuestra <a href="privacy.html">política de privacidad</a>.</p>
<h2>1. Descripción del servicio</h2>
<p>NexuLex AI es un programa de consumo que ayuda a revisar contratos, ver riesgos, redactar contrapuestas y compartir briefs de solo lectura. Se ofrece «tal cual».</p>
<h2>2. No es un despacho</h2>
<p><strong>NexuLex AI no es un despacho de abogados y no presta asesoramiento jurídico.</strong> Nada en la app crea una relación abogado-cliente. Verifique decisiones importantes con un abogado habilitado en su país.</p>
<p>«Buscar abogado» solo enlaza directorios oficiales de colegios y organismos públicos. NexuLex AI no recomienda, clasifica ni deriva abogados, no cobra comisión de derivación y no responde por los servicios del abogado que elija. Compruebe colegiación y honorarios antes de encargarle el asunto.</p>
<h2>3. Cuentas y suscripciones</h2>
<ul>
<li>Los cupos gratuitos y derechos Pro se aplican en el servidor y mediante RevenueCat / las tiendas.</li>
<li>El plan Professional incluye todo Pro más las herramientas Professional y los límites diarios más altos que muestra la app. Su plan lo verifica nuestro servidor con RevenueCat; no se puede cambiar desde la app.</li>
<li>Las herramientas Professional son ayudas de trabajo, no asesoramiento jurídico. Usan solo su material y pueden tener errores; verifique cada fecha, hecho y fuente. NexuLex AI no representa a nadie ante un tribunal o autoridad.</li>
<li>Facturación, reembolsos y cancelaciones siguen las reglas de App Store o Google Play.</li>
<li>Usted responde de la seguridad de sus credenciales.</li>
</ul>
<h2>4. Uso aceptable</h2>
<ul>
<li>No suba contenido ilegal ni material que no esté autorizado a tratar.</li>
<li>No intente eludir, saturar o desensamblar seguridad, cupos o paywalls.</li>
<li>No use el servicio para acosar, defraudar o engañar.</li>
<li>No comparta secretos, credenciales ni datos personales de terceros sin base legal.</li>
</ul>
<h2>5. Propiedad intelectual</h2>
<p>El nombre, la marca y el software de NexuLex AI pertenecen al editor. Usted conserva derechos sobre los contratos que sube. Nos concede una licencia limitada para tratar ese contenido solo para prestar el servicio.</p>
<h2>6. Briefs compartidos y asientos</h2>
<p>Los enlaces de brief y los asientos de asesor / hogar están pensados para ocultar el contrato original. Los destinatarios aún ven los resúmenes de análisis que elija compartir. Tenga cuidado antes de crear códigos.</p>
<h2>7. Limitación de responsabilidad</h2>
<p>En la medida permitida por la ley no respondemos de decisiones basadas en la salida de la app, errores de IA de terceros, disputas de facturación de la tienda o cortes fuera de nuestro control razonable.</p>
<h2>8. Cambios</h2>
<p>Podemos actualizar estas condiciones. Seguir usando el servicio tras un cambio implica aceptación.</p>
<h2 data-sec="eligibility">9. Edad mínima</h2>
<p>Para usar NexuLex AI debe tener al menos 18 años o la mayoría de edad donde viva. Si la usa para una empresa, confirma que puede obligarla.</p>
<h2 data-sec="renewal">10. Suscripciones y renovación automática</h2>
<p>Los planes de pago se renuevan automáticamente por el mismo período al precio de la tienda mostrado, hasta que los cancele. El pago se carga a su cuenta de App Store o Google Play. Puede gestionarlos o cancelarlos en los ajustes de su cuenta de la tienda; en App Store, al menos 24 horas antes de que termine el período actual. Borrar su cuenta de NexuLex AI no cancela la suscripción. Los reembolsos siguen la política de la tienda.</p>
<h2 data-sec="ai">11. Resultados generados por IA</h2>
<p>Los análisis, respuestas, borradores y resúmenes los genera inteligencia artificial. Pueden ser incompletos, estar desactualizados o ser erróneos, y la ley varía según el país y cambia con el tiempo. Compruebe los puntos importantes con fuentes oficiales o con un abogado habilitado antes de fiarse de ellos.</p>
<h2 data-sec="termin">12. Suspensión y terminación</h2>
<p>Puede dejar de usar NexuLex AI y borrar su cuenta en cualquier momento. Podemos suspender o terminar un acceso que incumpla estas condiciones o ponga en riesgo el servicio u otros usuarios.</p>
<h2 data-sec="templates">13. Plantillas de contratos</h2>
<p>La biblioteca de contratos (pestaña Asesor) ofrece plantillas de contratos comerciales de uso general publicadas por General Legal bajo la licencia de dominio público CC0-1.0. NexuLex AI inserta los datos que usted escribe y deja el resto de cada plantilla sin cambios, con su redacción original en inglés. Las plantillas no están adaptadas a su situación, país o sector y pueden no ser válidas ni exigibles donde usted se encuentre. Se ofrecen «tal cual», sin garantía. Haga que un abogado habilitado en la jurisdicción aplicable revise cualquier contrato antes de firmarlo. NexuLex AI no es parte de ningún contrato que usted cree, y la biblioteca de contratos no crea una relación abogado-cliente. El documento completo, la exportación a Word, copiar y compartir forman parte del plan Pro; los usuarios gratuitos ven una vista previa.</p>
<h2 data-sec="law">14. Ley aplicable y tribunales</h2>
<p>Estas condiciones se rigen por las leyes de la República de Turquía. Son competentes los tribunales y las oficinas de ejecución de Estambul (Çağlayan), sin perjuicio de los derechos imperativos de protección del consumidor que le correspondan según la ley de su país de residencia, incluido el derecho a acudir allí al tribunal u organismo competente.</p>
<h2 data-sec="language">15. Idiomas</h2>
<p>Estas condiciones están disponibles en varios idiomas por comodidad. Si una traducción difiere de la versión en inglés, prevalece la versión en inglés.</p>
<p lang="en" dir="ltr">In case of discrepancies, the English version shall prevail.</p>
<h2>16. Contacto</h2>
<p>Para cuenta, producto o consultas de consumidores use la pantalla de Soporte en la app o escriba a nexulexai@gmail.com. Editor: Doğancan Kara (empresario individual), Bağcılar, Estambul, Turquía.</p>`,
};
