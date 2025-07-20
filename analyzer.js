const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');
const { Client } = require('@notionhq/client');

// Cargar variables de entorno
require('dotenv').config();

// Configuración
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

// Configuración desde archivo .env
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Cliente de Notion
const notion = new Client({ auth: NOTION_TOKEN });

// Reglas de clasificación
function analizarCorreo(email) {
  const remitente = email.from?.toLowerCase() || '';
  const asunto = email.subject?.toLowerCase() || '';
  
  console.log(`Analizando: ${email.from} - ${email.subject}`);
  
  // 1. Correos Personales (alta prioridad)
  if (esCorreoPersonal(remitente, asunto)) {
    return {
      categoria: 'Personal',
      prioridad: 'Alta',
      accion: 'Leer Ya',
      razon: 'Correo personal detectado'
    };
  }
  
  // 2. Ofertas Selectivas (Adidas, Vans, etc.)
  if (esOfertaSelectiva(remitente, asunto)) {
    return {
      categoria: 'Ofertas Selectivas',
      prioridad: 'Media',
      accion: 'Revisar Después',
      razon: 'Oferta de tienda prioritaria'
    };
  }
  
  // 3. LinkedIn Directo
  if (esLinkedInDirecto(remitente, asunto)) {
    return {
      categoria: 'LinkedIn Directo',
      prioridad: 'Media',
      accion: 'Revisar Después',
      razon: 'Contacto directo de LinkedIn'
    };
  }
  
  // 4. Notificaciones Importantes
  if (esNotificacionImportante(remitente, asunto)) {
    return {
      categoria: 'Importante',
      prioridad: 'Alta',
      accion: 'Leer Ya',
      razon: 'Notificación importante (pedidos, facturas, etc.)'
    };
  }
  
  // 5. Todo lo demás es Spam
  return {
    categoria: 'Spam',
    prioridad: 'Baja',
    accion: 'Ignorar',
    razon: 'Correo masivo o sin relevancia'
  };
}

// Detectar correos personales
function esCorreoPersonal(remitente, asunto) {
  // Asunto corto y directo (como "Imprimir", "Favor", etc.)
  if (asunto.length <= 15 && asunto.split(' ').length <= 2) {
    return true;
  }
  
  // Dominios personales comunes
  const dominiosPersonales = ['@gmail.com', '@hotmail.com', '@yahoo.com', '@outlook.com'];
  const tienePersonal = dominiosPersonales.some(dominio => remitente.includes(dominio));
  
  // No contiene palabras típicas de marketing
  const palabrasMarketing = ['newsletter', 'promoción', 'oferta', 'descuento', 'unsubscribe'];
  const noEsMarketing = !palabrasMarketing.some(palabra => asunto.includes(palabra));
  
  return tienePersonal && noEsMarketing && asunto.length < 50;
}

// Detectar ofertas de tiendas selectivas
function esOfertaSelectiva(remitente, asunto) {
  // PERSONALIZABLE: Agrega aquí las tiendas de las que quieres recibir ofertas
  const tiendasPrioritarias = ['adidas', 'vans'];
  const palabrasOferta = ['descuento', 'oferta', 'sale', '%', 'promoción', 'rebaja'];
  
  const esTiendaPrioritaria = tiendasPrioritarias.some(tienda => remitente.includes(tienda));
  const tieneOferta = palabrasOferta.some(palabra => asunto.includes(palabra));
  
  return esTiendaPrioritaria && tieneOferta;
}

// Detectar LinkedIn directo vs masivo
function esLinkedInDirecto(remitente, asunto) {
  if (!remitente.includes('linkedin')) return false;
  
  // Indicadores de mensaje directo
  const indicadoresDirectos = [
    'invitación a conectar',
    'mensaje de',
    'te ha enviado',
    'quiere conectar',
    'solicitud de conexión'
  ];
  
  // Indicadores de spam de LinkedIn
  const indicadoresSpam = [
    'empleos que podrían interesarte',
    'actualización semanal',
    'noticias de tu red',
    'personas que podrías conocer'
  ];
  
  const esDirecto = indicadoresDirectos.some(indicador => asunto.includes(indicador));
  const esSpam = indicadoresSpam.some(indicador => asunto.includes(indicador));
  
  return esDirecto && !esSpam;
}

// Detectar notificaciones importantes
function esNotificacionImportante(remitente, asunto) {
  // PERSONALIZABLE: Agrega aquí servicios importantes para ti
  const remitentesPrioritarios = ['temu', 'amazon', 'mercadolibre', 'paypal', 'banco', 'github'];
  const palabrasPrioritarias = ['pedido', 'envío', 'factura', 'recibo', 'confirmación', 'entrega', 'invited you', 'pull request', 'issue'];
  
  const esRemitenteImportante = remitentesPrioritarios.some(rem => remitente.includes(rem));
  const tienePalabraPrioritaria = palabrasPrioritarias.some(palabra => asunto.includes(palabra));
  
  return esRemitenteImportante || tienePalabraPrioritaria;
}

// Autenticación con Gmail - versión mejorada
async function authorize() {
  let credentials;
  try {
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  } catch (err) {
    console.log('Error cargando credenciales:', err);
    console.log('Asegúrate de tener el archivo credentials.json en la raíz del proyecto');
    return;
  }

  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Verificar si ya tenemos un token guardado
  try {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (err) {
    return getNewToken(oAuth2Client);
  }
}

// Obtener nuevo token de autorización - versión mejorada
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  console.log('Autoriza esta app visitando esta URL:', authUrl);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve, reject) => {
    rl.question('Ingresa el código de autorización aquí: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        
        // Guardar el token para uso futuro
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log('Token guardado en', TOKEN_PATH);
        
        resolve(oAuth2Client);
      } catch (error) {
        console.error('Error obteniendo token:', error);
        reject(error);
      }
    });
  });
}

// Obtener emails de Gmail con detección de duplicados
async function getEmails(auth, maxResults = 100) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
      q: 'in:inbox' // Solo emails de la bandeja de entrada
    });

    const messages = response.data.messages || [];
    const emails = [];
    const emailsExistentes = new Set(); // Para detectar duplicados

    // Verificar si ya tenemos algunos correos en Notion
    const emailsEnNotion = await obtenerEmailsExistentesEnNotion();
    emailsEnNotion.forEach(email => emailsExistentes.add(email));

    for (const message of messages) {
      // Evitar procesar si ya existe
      if (emailsExistentes.has(message.id)) {
        console.log(`⏭️  Email ya procesado: ${message.id}`);
        continue;
      }

      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const headers = email.data.payload.headers;
      const fromHeader = headers.find(h => h.name === 'From');
      const subjectHeader = headers.find(h => h.name === 'Subject');
      const dateHeader = headers.find(h => h.name === 'Date');

      const emailData = {
        id: message.id,
        from: fromHeader?.value || 'Sin remitente',
        subject: subjectHeader?.value || 'Sin asunto',
        date: dateHeader?.value || new Date().toISOString(),
        timestamp: new Date(dateHeader?.value || Date.now())
      };

      emails.push(emailData);
      emailsExistentes.add(message.id); // Marcar como procesado
    }

    return emails;
  } catch (error) {
    console.error('Error obteniendo emails:', error);
    return [];
  }
}

// Obtener IDs de emails ya procesados en Notion
async function obtenerEmailsExistentesEnNotion() {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 100
    });

    const emailIds = [];
    for (const page of response.results) {
      // Buscar en las notas si hay un ID de Gmail
      const notas = page.properties.Notas?.rich_text?.[0]?.text?.content || '';
      const idMatch = notas.match(/ID: ([a-zA-Z0-9]+)/);
      if (idMatch) {
        emailIds.push(idMatch[1]);
      }
    }

    return emailIds;
  } catch (error) {
    console.log('⚠️  No se pudieron obtener emails existentes, continuando...');
    return [];
  }
}

// Enviar a Notion - versión funcional
async function enviarANotion(email, analisis) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        'Asunto': {
          title: [
            {
              text: {
                content: email.subject
              }
            }
          ]
        },
        'Remitente': {
          rich_text: [
            {
              text: {
                content: email.from
              }
            }
          ]
        },
        'Categoría': {
          select: {
            name: analisis.categoria
          }
        },
        'Prioridad': {
          select: {
            name: analisis.prioridad
          }
        },
        'Acción': {
          select: {
            name: analisis.accion
          }
        },
        'Fecha': {
          date: {
            start: new Date(email.timestamp).toISOString().split('T')[0]
          }
        },
        'Notas': {
          rich_text: [
            {
              text: {
                content: `${analisis.razon} | ID: ${email.id}`
              }
            }
          ]
        }
      }
    });

    console.log(`✅ Enviado a Notion: ${email.subject} (${analisis.categoria})`);
    return response;
  } catch (error) {
    console.error(`❌ Error enviando a Notion: ${error.message}`);
    console.log('\n=== EMAIL ANALIZADO (solo consola) ===');
    console.log(`De: ${email.from}`);
    console.log(`Asunto: ${email.subject}`);
    console.log(`Categoría: ${analisis.categoria}`);
    console.log(`Prioridad: ${analisis.prioridad}`);
    console.log(`Acción: ${analisis.accion}`);
    console.log(`Razón: ${analisis.razon}`);
    console.log('=====================================\n');
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando análisis de Gmail...\n');
  
  // Verificar configuración
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    console.error('❌ Error: Falta configuración en archivo .env');
    console.log('Copia .env.example a .env y configura las variables');
    return;
  }
  
  const auth = await authorize();
  if (!auth) {
    console.log('❌ No se pudo autenticar con Gmail');
    return;
  }

  console.log('✅ Autenticado con Gmail');
  console.log('📥 Obteniendo emails...\n');

  const emails = await getEmails(auth, 100); // Obtener últimos 100 emails
  
  console.log(`📧 Se encontraron ${emails.length} emails nuevos\n`);

  for (const email of emails) {
    const analisis = analizarCorreo(email);
    await enviarANotion(email, analisis);
  }

  console.log('✅ Análisis completado!');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, analizarCorreo };