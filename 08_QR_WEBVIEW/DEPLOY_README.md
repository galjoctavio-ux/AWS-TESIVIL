# Guía de Despliegue - QR Web View (08_QR_WEBVIEW)

Sigue estos pasos para desplegar la aplicación en tu VM AWS.

## 1. Preparación del Entorno

Asegúrate de estar en la carpeta del proyecto `08_QR_WEBVIEW`.

1. **Configurar variables de entorno:**
   Renombra el archivo de configuración generado:
   ```bash
   mv setup_env.txt .env.production
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Construir la aplicación:**
   ```bash
   npm run build
   ```

## 2. Gestión del Proceso (PM2)

Usaremos PM2 para mantener la aplicación corriendo en segundo plano.

1. **Iniciar la aplicación:**
   ```bash
   pm2 start ecosystem.config.js
   ```

2. **Guardar la lista de procesos:**
   ```bash
   pm2 save
   ```

3. **Configurar inicio automático (si no lo has hecho antes):**
   ```bash
   pm2 startup
   ```
   (Copia y ejecuta el comando que te muestre la terminal).

## 3. Configuración del Proxy Inverso (Nginx)

Ya tienes DNS configurado, ahora conectamos el dominio al puerto 3002.

1. **Crear archivo de configuración:**
   (Usa el contenido de `nginx_setup.txt` como base, RECUERDA CAMBIAR `TU_DOMINIO.com` por tu dominio real, ej: `qr.tesivil.com`)

   ```bash
   sudo nano /etc/nginx/sites-available/qr-webview
   ```
   *Pega el contenido y guarda (Ctrl+O, Enter, Ctrl+X).*

2. **Activar el sitio:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/qr-webview /etc/nginx/sites-enabled/
   ```

3. **Verificar configuración:**
   ```bash
   sudo nginx -t
   ```
   (Si dice "syntax is ok", continúa).

4. **Reiniciar Nginx:**
   ```bash
   sudo systemctl restart nginx
   ```

## 4. Certificado SSL (HTTPS)

Finalmente, asegura tu sitio con Certbot.

```bash
sudo certbot --nginx -d TU_DOMINIO.com
```

¡Listo! Tu aplicación debería estar accesible en `https://TU_DOMINIO.com`.
