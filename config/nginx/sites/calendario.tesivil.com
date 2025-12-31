server {
    server_name calendario.tesivil.com;
    root /home/galj_octavio/TESIVIL_STACK/04_AGENDAMIENTO/easy_appointments_src;

    index index.php;

    # Regla específica para Certbot (debe ir antes de la regla general)
    location ~ /.well-known/acme-challenge/ {
        allow all;
        default_type "text/plain";
    }

    # Regla de reescritura principal de Easy!Appointments
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Pasar scripts PHP a FastCGI
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        
        # ¡IMPORTANTE! Verifica esta ruta
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock; 
        
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Denegar acceso a archivos sensibles
    location ~ /config.php {
        deny all;
    }
    location ~ /storage {
        deny all;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/calendario.tesivil.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/calendario.tesivil.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = calendario.tesivil.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name calendario.tesivil.com;
    return 404; # managed by Certbot


}
