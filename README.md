# Gmail to Notion Analyzer

Un analizador inteligente que clasifica automáticamente tus correos de Gmail y los organiza en una base de datos de Notion. Perfecto para mantener tu bandeja de entrada limpia y priorizar lo que realmente importa.

## Características

- **Clasificación automática** de correos en categorías personalizables
- **Detección de correos personales** vs correos masivos
- **Filtrado inteligente** de ofertas y promociones relevantes
- **Integración con GitHub** para notificaciones de repositorios
- **Prevención de duplicados** con sistema de seguimiento por ID
- **Procesamiento masivo** de hasta 100 correos por ejecución

## Categorías de clasificación

- **Personal**: Correos de personas reales con asuntos cortos y directos
- **Importante**: Notificaciones de pedidos, facturas, GitHub, bancos
- **Ofertas Selectivas**: Descuentos de tiendas específicas que te interesan
- **LinkedIn Directo**: Invitaciones y mensajes personalizados (no spam)
- **Spam**: Newsletters genéricas, promociones masivas, notificaciones automáticas

## Requisitos previos

- Node.js 14 o superior
- Cuenta de Gmail con API habilitada
- Workspace de Notion con integración configurada

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/JorgeIzarra/gmail-notion-analyzer.git
cd gmail-notion-analyzer
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las credenciales:
```bash
cp .env.example .env
```

4. Edita el archivo `.env` con tus credenciales:
```
NOTION_TOKEN=tu_token_de_notion
NOTION_DATABASE_ID=id_de_tu_base_de_datos
```

## Configuración

### 1. Configurar Gmail API

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Gmail API
4. Crea credenciales OAuth 2.0
5. Descarga el archivo `credentials.json` y colócalo en la raíz del proyecto

Para más detalles, consulta [docs/setup-gmail.md](docs/setup-gmail.md)

### 2. Configurar Notion

1. Ve a [Notion Integrations](https://www.notion.so/my-integrations)
2. Crea una nueva integración
3. Copia el token de integración
4. Crea una base de datos con las propiedades requeridas
5. Conecta la integración a tu base de datos

Para más detalles, consulta [docs/setup-notion.md](docs/setup-notion.md)

## Uso

Ejecutar el analizador una vez:
```bash
node analyzer.js
```

### Personalización

Puedes modificar las reglas de clasificación editando las funciones en `analyzer.js`:

- `esCorreoPersonal()`: Define qué constituye un correo personal
- `esOfertaSelectiva()`: Configura las tiendas de las que quieres recibir ofertas
- `esLinkedInDirecto()`: Distingue mensajes directos del spam de LinkedIn
- `esNotificacionImportante()`: Define qué servicios son prioritarios

### Ejemplo de configuración para ofertas selectivas

```javascript
const tiendasPrioritarias = ['adidas', 'vans', 'nike']; // Agrega tus tiendas favoritas
```

## Estructura de la base de datos de Notion

La base de datos debe tener las siguientes propiedades:

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| Asunto | Título | Asunto del correo |
| Remitente | Texto | Dirección del remitente |
| Categoría | Selección | Personal, Importante, Ofertas Selectivas, LinkedIn Directo, Spam |
| Prioridad | Selección | Alta, Media, Baja |
| Acción | Selección | Leer Ya, Revisar Después, Archivar, Ignorar |
| Fecha | Fecha | Fecha del correo |
| Notas | Texto | Razón de la clasificación + ID único |

## Automatización

Para ejecutar automáticamente cada hora, puedes usar cron:

```bash
# Abrir crontab
crontab -e

# Agregar línea para ejecutar cada hora
0 * * * * cd /ruta/a/gmail-notion-analyzer && node analyzer.js
```

## Prevención de duplicados

El sistema incluye detección automática de duplicados:
- Cada correo se identifica con su ID único de Gmail
- Los correos ya procesados se saltan automáticamente
- El ID se guarda en las notas para seguimiento

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Roadmap

- [ ] Dashboard con estadísticas de correos
- [ ] Aprendizaje automático basado en feedback
- [ ] Integración con Slack para notificaciones
- [ ] API REST para integrar con otras herramientas
- [ ] Interfaz web para configuración
- [ ] Análisis de sentimiento de correos

## Licencia

MIT License. Ver [LICENSE](LICENSE) para más detalles.

## Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa los [issues existentes](https://github.com/JorgeIzarra/gmail-notion-analyzer/issues)
2. Crea un nuevo issue con detalles del problema
3. Incluye logs relevantes y pasos para reproducir

## Agradecimientos

- Gmail API de Google para el acceso a correos
- Notion API para la integración con bases de datos
- Comunidad de desarrolladores por feedback y contribuciones

## Contacto

¿Preguntas sobre la implementación? ¿Interesado en colaborar?

- GitHub: [@tuusername](https://github.com/tuusername)
- LinkedIn: [Tu Perfil](https://linkedin.com/in/tuperfil)
- Email: tu.email@ejemplo.com
