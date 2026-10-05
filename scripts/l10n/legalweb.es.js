// WAVE ST.3 — Privacidad + borrado (ES). WAVE B: accents restored.
module.exports = {
  privacy: `<h1>Política de privacidad</h1>
<p class="meta">Actualizado: 5 de octubre de 2026. Traducción de cortesía. Prima el texto inglés.</p>
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
<h2>5. Conservación y supresión</h2>
<p>Puede borrar la cuenta en cualquier momento en la app en <strong>Ajustes, luego Borrar cuenta</strong>, o con los pasos de la <a href="delete-account.html">página de borrado</a> (sin la app). El borrado quita cuenta y perfil, análisis y textos de contrato, códigos de uso compartido, recordatorios, asientos de asesor / hogar y briefs, mensajes de soporte e informes de IA. En el dispositivo del borrado in-app también se limpian recordatorios programados, cachés locales y archivos exportados.</p>
<p>Tras el borrado, el identificador del dispositivo y el teléfono usados para el cupo gratuito se conservan sin vínculo con su cuenta, solo para impedir solicitudes gratuitas repetidas.</p>
<p>Una suscripción activa de App Store / Google Play no se cancela automáticamente al borrar la cuenta; cancélela en la cuenta de la tienda. Los códigos de brief caducan solos al terminar su plazo.</p>
<h2>6. Aviso legal</h2>
<p><strong>NexuLex AI no es un despacho de abogados y no presta asesoramiento jurídico.</strong> Las salidas son herramientas de información general. Las decisiones son suyas; consulte a un abogado habilitado para su asunto.</p>
<h2 data-sec="signup">7. Datos de registro</h2>
<p>Al registrarse facilita un correo electrónico y un número de teléfono. El número de teléfono y un identificador del dispositivo se usan para reclamar el cupo gratuito de análisis y evitar abusos repetidos. No se usan para publicidad ni se venden.</p>
<h2 data-sec="voice">8. Entrada de voz</h2>
<p>La entrada de voz es opcional. Al usar el micrófono, el reconocimiento de voz lo realiza el servicio de voz integrado en su teléfono (Apple o Google), con las condiciones de privacidad de ese proveedor. NexuLex AI no graba ni guarda su audio; solo recibe el texto que decide usar.</p>
<h2 data-sec="transfer">9. Proveedores y transferencias internacionales</h2>
<p>Usamos Supabase (base de datos en la nube e inicio de sesión), un proveedor de IA de terceros al que se accede a través de nuestro servidor (análisis y respuestas), RevenueCat (estado de compra) y las tiendas de Apple y Google. Estos proveedores pueden tratar datos en países distintos del suyo, incluidos países fuera del Espacio Económico Europeo, el Reino Unido y Suiza. Cuando la ley exija garantías para esas transferencias, nos apoyamos en los mecanismos de transferencia que ofrecen esos proveedores.</p>
<h2 data-sec="rights">10. Sus derechos</h2>
<p>Según dónde viva (por ejemplo, conforme al RGPD / UK GDPR, la LPD suiza, la DSG austriaca, la KVKK turca, la ley DPDP de la India, la PIPEDA canadiense y las leyes provinciales o la Privacy Act australiana), puede tener derecho a acceder a sus datos, rectificarlos, suprimirlos, portarlos, limitar su tratamiento u oponerse a él, y a retirar su consentimiento. Puede borrar su cuenta en la app. Para otras solicitudes escriba a nexulexai@gmail.com desde su correo registrado; respondemos en el plazo que exija la ley. También puede reclamar ante la autoridad de protección de datos de su país.</p>
<h2 data-sec="children">11. Menores, publicidad y seguimiento</h2>
<p>NexuLex AI está pensada para adultos de 18 años o más y no se dirige a menores. No recogemos a sabiendas datos de menores; contáctenos y los borraremos. La app no contiene publicidad ni seguimiento entre apps, y no vendemos datos personales.</p>
<h2 data-sec="analytics">12. Informes anónimos de uso y errores</h2>
<p>Para mantener la app fiable y mejorarla, NexuLex AI puede enviar eventos anónimos breves: por ejemplo qué áreas se usan, si un análisis terminó o falló, los resultados de la pantalla de suscripción y de las compras, y el tipo de error. Cada informe incluye un ID de instalación aleatorio creado en tu dispositivo (no el ID de hardware), la versión de la app, la plataforma y el idioma de la app. Los informes nunca contienen tus contratos, textos, imágenes, correo electrónico, número de teléfono ni ID de cuenta, y no se usan para publicidad ni se venden.</p>
<p>En el Espacio Económico Europeo, el Reino Unido, Suiza, Turquía, Brasil, India, Corea del Sur y Sudáfrica no se envía nada salvo que lo permitas. En el resto del mundo está activado por defecto. Puedes cambiarlo en cualquier momento en <strong>Ajustes → Privacidad</strong>; al desactivarlo se borran los informes que sigan pendientes en tu dispositivo. Los informes se guardan en Supabase y se eliminan como máximo a los 180 días.</p>
<h2>13. Contacto</h2>
<p>Preguntas de privacidad: use la pantalla de Soporte en la app o contacte al editor indicado en la ficha de la tienda.</p>`,

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
<p>El identificador del dispositivo y el teléfono usados para el cupo gratuito de análisis se conservan sin vínculo con su cuenta, solo para impedir solicitudes gratuitas repetidas. Las compras en Apple, Google y RevenueCat siguen sus propias normas.</p>
<p>Vea también la <a href="privacy.html">política de privacidad</a>.</p>`,

  terms: `<h1>Condiciones de uso (EULA)</h1>
<p class="meta">Actualizado: 5 de octubre de 2026. Traducción de cortesía. Prima el texto inglés.</p>
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
<h2>13. Contacto</h2>
<p>Para cuenta o producto use la pantalla de Soporte en la app. Para reclamaciones de consumidores valen los datos del editor en la ficha de la tienda.</p>`,
};
