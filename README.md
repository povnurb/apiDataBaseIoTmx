# Instalación y Configuración en el VPS

Este documento describe los pasos para desplegar la API en un servidor VPS utilizando Docker.

---

## 1. Acceder al VPS

Conéctate a tu VPS mediante SSH:

```sh
ssh usuario@tu-vps-ip
```

Si aún no tienes Docker y Docker Compose instalados, sigue el siguiente paso.

---

## 2. Instalar Docker y Docker Compose (si no están instalados)

Ejecuta los siguientes comandos:

```sh
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io
sudo systemctl enable --now docker
```

Instala Docker Compose:

```sh
sudo apt install -y docker-compose
```

Verifica la instalación:

```sh
docker --version
docker-compose --version
```

---

## 3. Clonar el Repositorio en el VPS

Si tu código está en un repositorio Git, clónalo en el VPS:

```sh
git clone https://github.com/povnurb/apidatabaseiotmx.git
cd apidatabaseiotmx
```

Si no usas Git, puedes subir los archivos manualmente usando `scp`:

```sh
scp -r ./tu-proyecto usuario@tu-vps-ip:/ruta/destino
```

---

## 4. Configurar el Archivo `.env`

Crea el archivo `.env` en el directorio raíz del proyecto:

```sh
nano .env
```

Añade las variables de entorno necesarias (ajústalas según tu configuración):

```env
PORT=5000
DB_HOST=mysql
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tu_basededatos
```

Guarda y cierra (`CTRL + X`, luego `Y` y `ENTER`).

---

## 5. Construir y Ejecutar los Contenedores

Dentro del directorio del proyecto, ejecuta:

```sh
docker-compose up --build -d
```

Esto:

- Construirá las imágenes si es necesario.
- Levantará los contenedores en segundo plano (`-d`).

Verifica que todo esté corriendo correctamente:

```sh
docker ps
```

Para ver los logs del servidor:

```sh
docker logs -f nombre-del-contenedor
```

---

## 6. Acceder a la API

Si el servidor corre en el puerto 5000, puedes probarlo desde el navegador o con `curl`:

```sh
curl http://tu-vps-ip:5000
```

Si necesitas detener los contenedores:

```sh
docker-compose down
```

Si haces cambios en el código, reconstruye con:

```sh
docker-compose up --build -d
```

---

## 7. Habilitar el Firewall (Opcional)

Si usas `ufw`, permite el puerto de la API:

```sh
sudo ufw allow 5000/tcp
sudo ufw enable
```

---

## ¡Listo!

Tu API ya debería estar corriendo en el VPS. 🚀 Si necesitas actualizar el código, sube los archivos, reconstruye los contenedores y reinicia el servicio.
