# Guía de Despliegue - QRclima Landing Page
**Dominio:** qrclima.tesivil.com
**Servidor:** AWS VM (Ubuntu/Linux)

## 1. Prerrequisitos en la VM
Asegúrate de tener instalado Node.js (v18+), npm, PM2 y Nginx.

```bash
# Actualizar e instalar básicos
sudo apt update && sudo apt upgrade -y
sudo apt install nginx -y

# Instalar Node.js (si no lo tienes)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2
```

## 2. Preparar la Aplicación
Navega a la carpeta donde clonaste/subiste los archivos (ej. `/var/www/qrclima` o `~/qrclima`).

```bash
# Instalar dependencias
npm install

# Construir para producción
npm run build
```

## 3. Iniciar con PM2
Usaremos el archivo `ecosystem.config.js` que acabo de crear.

```bash
# Iniciar la app
pm2 start ecosystem.config.js

# Guardar la lista de procesos para que reviva al reinicio
pm2 save
pm2 startup
```

## 4. Configurar Nginx (Reverse Proxy)
Copia la configuración que creé en `deployment/nginx-qrclima.conf`.

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/qrclima

# (Pega el contenido de deployment/nginx-qrclima.conf aquí)
# Ajusta la ruta 'alias' si usas caché de estáticos, o bórrala si prefieres simple.
```

O usa este comando directo si estás en la carpeta del proyecto:
```bash
sudo cp deployment/nginx-qrclima.conf /etc/nginx/sites-available/qrclima
```

Activar el sitio:
```bash
sudo ln -s /etc/nginx/sites-available/qrclima /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar sintaxis
sudo systemctl restart nginx
```

## 5. SSL con Certbot (HTTPS)
Para que el candadito funcione y sea seguro (requerido para PWA/SEO).

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d qrclima.tesivil.com
```

¡Listo! Tu sitio debería estar en vivo en `https://qrclima.tesivil.com`.
