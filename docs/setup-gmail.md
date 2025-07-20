# Configuración de Gmail API

Esta guía te ayudará a configurar la Gmail API para poder acceder a tus correos.

## Paso 1: Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Si no tienes un proyecto, crea uno nuevo:
   - Clic en "Seleccionar proyecto" → "Nuevo proyecto"
   - Ingresa un nombre (ej: "Gmail Notion Analyzer")
   - Clic en "Crear"

## Paso 2: Habilitar Gmail API

1. En el menú lateral, ve a "APIs y servicios" → "Biblioteca"
2. Busca "Gmail API"
3. Clic en Gmail API
4. Presiona "Habilitar"

## Paso 3: Configurar pantalla de consentimiento OAuth

1. Ve a "APIs y servicios" → "Pantalla de consentimiento de OAuth"
2. Selecciona "Externo" como tipo de usuario
3. Completa la información requerida:
   - **Nombre de la aplicación**: Gmail Notion Analyzer
   - **Correo de soporte del usuario**: tu email
   - **Correo de contacto del desarrollador**: tu email
4. Clic en "Guardar y continuar"
5. En "Alcances", clic en "Agregar o quitar alcances"
6. Busca y selecciona: `https://www.googleapis.com/auth/gmail.readonly`
7. Clic en "Actualizar" → "Guardar y continuar"
8. En "Usuarios de prueba", agrega tu email personal
9. Clic en "Guardar y continuar"

## Paso 4: Crear credenciales OAuth 2.0

1. Ve a "APIs y servicios" → "Credenciales"
2. Clic en "+ Crear credenciales" → "ID de cliente de OAuth 2.0"
3. Configura:
   - **Tipo de aplicación**: Aplicación web
   - **Nombre**: Gmail Notion Analyzer
   - **URIs de redireccionamiento autorizados**: 
     ```
     http://localhost:3000/callback
     ```
4. Clic en "Crear"
5. Descarga el archivo JSON de credenciales
6. Renombra el archivo a `credentials.json`
7. Coloca el archivo en la raíz de tu proyecto

## Paso 5: Primera autenticación

1. Ejecuta el script:
   ```bash
   node analyzer.js
   ```

2. Se abrirá una URL en la consola, cópiala y ábrela en tu navegador

3. Inicia sesión con tu cuenta de Gmail

4. Acepta los permisos solicitados

5. Te redirigirá a localhost (mostrará error, es normal)

6. Copia el código de la URL después de `code=`

7. Pégalo en la consola cuando te lo solicite

8. Se creará un archivo `token.json` automáticamente para futuras ejecuciones

## Solución de problemas

### Error: "Acceso bloqueado"
- Asegúrate de haber agregado tu email en "Usuarios de prueba"
- Verifica que la pantalla de consentimiento esté configurada

### Error: "invalid_grant"
- Borra el archivo `token.json` y vuelve a autenticarte
- Verifica que las credenciales sean correctas

### Error: "access_denied"
- Revisa que hayas aceptado todos los permisos
- Asegúrate de estar usando la cuenta correcta

## Límites de la API

- **Cuota diaria**: 1,000,000,000 unidades
- **Cuota por 100 segundos**: 250,000,000 unidades  
- **Cuota por usuario por 100 segundos**: 15,000,000 unidades

Para uso personal normal, estos límites son más que suficientes.

## Seguridad

- **Nunca subas** `credentials.json` o `token.json` a repositorios públicos
- **Usa `.gitignore`** para excluir estos archivos
- **Revoca acceso** desde [Google Account Settings](https://myaccount.google.com/permissions) si es necesario