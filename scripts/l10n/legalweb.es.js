// WAVE ST.3 — Privacidad + borrado (ES).
module.exports = {
  privacy: `<h1>Politica de privacidad</h1>
<p class="meta">Actualizado: 25 de septiembre de 2026. Traduccion de cortesia. Prima el texto ingles.</p>
<p>Esta politica explica como NexuLex AI («nosotros», «la app») trata la informacion en la aplicacion movil y en los visores web relacionados.</p>
<h2>1. Datos que tratamos</h2>
<ul>
<li>Datos de cuenta como el correo y los identificadores de autenticacion.</li>
<li>Texto de contrato, imagenes o PDF que sube o pega para analizar.</li>
<li>Fotos y PDF se eligen en el selector del sistema. No se capturan en segundo plano.</li>
<li>Resultados de analisis, briefs, recordatorios y mensajes de soporte que crea.</li>
<li>Estado de compra y derechos de las tiendas via RevenueCat. Nuestro servidor pregunta a RevenueCat que plan (Pro o Professional) tiene su cuenta y guarda solo ese plan y su caducidad en el perfil.</li>
<li>Senales basicas de dispositivo y diagnostico para operar el servicio con seguridad.</li>
</ul>
<h2>2. Almacenamiento en la nube (Supabase)</h2>
<p>Los datos de producto autenticados se guardan en Supabase (PostgreSQL y servicios cloud relacionados). El acceso se limita por autenticacion y politicas de seguridad por fila. Los briefs compartidos usan codigos de corta vida y no incluyen el contrato original.</p>
<h2>3. Como usamos los datos</h2>
<ul>
<li>Analizar contratos, generar informes y operar asientos de asesor / hogar.</li>
<li>Aplicar cupos gratuitos y Pro y restaurar compras.</li>
<li>Enviar recordatorios locales opcionales que programe en el dispositivo.</li>
<li>Responder a las solicitudes de soporte que envie.</li>
</ul>
<h2>4. Tratamiento con IA</h2>
<p>El contenido de contrato que envie puede ir a nuestro proxy de IA en la nube para analizarlo. No vendemos sus contratos. No suba informacion que no este autorizado a tratar.</p>
<p>Preguntas juridicas y las herramientas Professional (cronologia, lista de issues, nota de investigacion): su pregunta, hechos, material del caso y el archivo adjunto (sin pruebas) se envian por conexion cifrada a traves de nuestro servidor al proveedor de IA solo para crear la respuesta. Nuestro servidor guarda solo un recuento diario de preguntas y ejecuciones Professional, no su texto ni la salida de la IA. Respuestas, resultados y expedientes quedan en su dispositivo salvo que los guarde o comparta.</p>
<p>Puede informar una salida de IA desde el informe de analisis, una respuesta del asesor o un borrador pulido. El informe guarda el motivo, su nota opcional, el id, el idioma de la app y el pais elegido. El texto del contrato o la respuesta (hasta 2000 caracteres) solo se adjunta si activa «Incluir contexto del contrato».</p>
<p>Buscar abogado: el primer mensaje y el paquete del caso se crean en su dispositivo sin IA y no se envian a nuestros servidores ni a ningun abogado. Salen del dispositivo solo si usted los copia o comparte. Los enlaces de directorio abren sitios oficiales de colegios y organismos publicos, con sus propias politicas. NexuLex no pasa sus datos a abogados ni cobra comision de derivacion.</p>
<h2>5. Conservacion y supresion</h2>
<p>Puede borrar la cuenta en cualquier momento en la app en <strong>Ajustes, luego Borrar cuenta</strong>, o con los pasos de la <a href="delete-account.html">pagina de borrado</a> (sin la app). El borrado quita cuenta y perfil, analisis y textos de contrato, codigos de uso compartido, recordatorios, asientos de asesor / hogar y briefs, mensajes de soporte e informes de IA. En el dispositivo del borrado in-app tambien se limpian recordatorios programados, caches locales y archivos exportados.</p>
<p>Tras el borrado, el identificador del dispositivo y el telefono usados para el cupo gratuito se conservan sin vinculo con su cuenta, solo para impedir solicitudes gratuitas repetidas.</p>
<p>Una suscripcion activa de App Store / Google Play no se cancela automaticamente al borrar la cuenta; cancelela en la cuenta de la tienda. Los codigos de brief caducan solos al terminar su plazo.</p>
<h2>6. Aviso legal</h2>
<p><strong>NexuLex AI no es un despacho de abogados y no presta asesoramiento juridico.</strong> Las salidas son herramientas de informacion general. Las decisiones son suyas; consulte a un abogado habilitado para su asunto.</p>
<h2>7. Contacto</h2>
<p>Preguntas de privacidad: use la pantalla de Soporte en la app o contacte al editor indicado en la ficha de la tienda.</p>`,

  deleteAccount: `<h1>Borre su cuenta de NexuLex AI</h1>
<p class="meta">Actualizado: 25 de septiembre de 2026. Traduccion de cortesia. Prima el texto ingles.</p>
<h2>En la app (lo mas rapido)</h2>
<ol>
<li>Abra NexuLex AI e inicie sesion.</li>
<li>Vaya a <strong>Ajustes</strong> y pulse <strong>Borrar cuenta</strong>.</li>
<li>Lea el aviso y confirme dos veces. El borrado se ejecuta al momento y se cierra la sesion.</li>
</ol>
<p class="warn"><strong>Las suscripciones no se cancelan automaticamente.</strong> Cancele un plan activo en
<a href="https://apps.apple.com/account/subscriptions">suscripciones de App Store</a> o
<a href="https://play.google.com/store/account/subscriptions">suscripciones de Google Play</a>.</p>
<h2>Sin la app</h2>
<p>Escriba a <a href="mailto:nexulexai@gmail.com?subject=Account%20deletion%20request">nexulexai@gmail.com</a> desde el correo registrado el texto «Delete my account» / «Borrar mi cuenta». Confirmamos por correo y completamos el borrado en 30 dias.</p>
<h2>Que se borra</h2>
<ul>
<li>Cuenta y perfil (correo, identificadores, estado Pro).</li>
<li>Analisis y textos de contrato, codigos de uso compartido, recordatorios, asientos de asesor / hogar y briefs.</li>
<li>Mensajes de soporte e informes de IA que envio.</li>
<li>En el dispositivo del borrado in-app: recordatorios programados, caches locales y archivos exportados.</li>
</ul>
<h2>Que se conserva</h2>
<p>El identificador del dispositivo y el telefono usados para el cupo gratuito de analisis se conservan sin vinculo con su cuenta, solo para impedir solicitudes gratuitas repetidas. Las compras en Apple, Google y RevenueCat siguen sus propias normas.</p>
<p>Vea tambien la <a href="privacy.html">politica de privacidad</a>.</p>`,
};
