
# ScraperAn: Sistema de Seguimiento de Precios

**ScraperAn** es una aplicación que permite hacer un seguimiento de los precios de productos en tiendas online populares como Amazon y MediaMarkt. Los usuarios pueden añadir productos a través de un nombre y una URL, y la aplicación extrae el precio actualizado y la fuente del producto. La plataforma se compone de un backend que realiza el scraping de las páginas de los productos y un frontend interactivo para gestionar y visualizar la información de los productos.

## Características

- **Añadir Productos**: Los usuarios pueden introducir productos especificando su nombre y URL.
- **Obtener Precio y Fuente**: Se extrae automáticamente el precio del producto desde la URL proporcionada (Amazon o MediaMarkt).
- **Visualización de Productos**: Los productos se muestran en un formato de tarjetas, con información clara sobre el precio y la fuente.
- **Gestión de Productos**: Los usuarios pueden limpiar la lista de productos almacenados en el servidor backend.
- **Interfaz Intuitiva**: La aplicación frontend está diseñada para ser fácil de usar, con una interfaz limpia y accesible.

## Tecnologías Utilizadas

- **Frontend**:
  - **React.js**: Librería para la creación de interfaces de usuario interactivas.
  - **Axios**: Para realizar solicitudes HTTP al backend.
  - **CSS**: Estilos personalizados para un diseño limpio y atractivo.
  
- **Backend**:
  - **Node.js**: Entorno de ejecución de JavaScript en el servidor.
  - **Express.js**: Framework para crear el servidor backend.
  - **Axios**: Usado en el backend para hacer scraping de las páginas de productos.
  - **Cheerio**: Librería para analizar y extraer datos de páginas HTML (utilizada en el scraping).

## Estructura del Proyecto

El proyecto está dividido en dos partes principales: **frontend** y **backend**.

```
scraperAn/
├── scraper-backend/             # Backend (Node.js y Express)
│   ├── node_modules/            # Dependencias del backend
│   ├── server.js                # Archivo principal del servidor backend
│   ├── package.json             # Dependencias y scripts del backend
│   └── ...
├── tracking-price/              # Frontend (React.js)
│   ├── node_modules/            # Dependencias del frontend
│   ├── src/
│   │   ├── App.js               # Componente principal de React
│   │   ├── App.css              # Estilos de la aplicación
│   │   └── ...
│   ├── package.json             # Dependencias y scripts del frontend
│   └── ...
└── README.md                    # Este archivo
```

## Instalación y Configuración

Para poder ejecutar la aplicación, debes tener configurados tanto el **frontend** como el **backend**. Aquí te explicamos cómo hacerlo paso a paso.

### 1. Clonación del Repositorio

Clona el repositorio en tu máquina local utilizando el siguiente comando:

```bash
git clone https://github.com/tuusuario/scraperAn.git
cd scraperAn
```

### 2. Instalación de Dependencias

Una vez clonado el repositorio, deberás instalar las dependencias para ambos directorios: **frontend** y **backend**.

#### Backend

Accede al directorio `scraper-backend` y ejecuta el siguiente comando para instalar las dependencias:

```bash
cd scraper-backend
npm install
```

#### Frontend

Ahora, accede al directorio `tracking-price` y ejecuta el siguiente comando para instalar las dependencias del frontend:

```bash
cd ../tracking-price
npm install
```

### 3. Ejecutar el Backend

Para que la aplicación funcione, primero debes iniciar el servidor backend. Accede al directorio `scraper-backend` y ejecuta:

```bash
cd scraper-backend
node server.js
```

Este comando levantará un servidor en el puerto **3000**. Asegúrate de que esté funcionando correctamente antes de continuar con el frontend.

### 4. Ejecutar el Frontend

Ahora, ve al directorio `tracking-price` y ejecuta el siguiente comando para iniciar la aplicación frontend:

```bash
cd ../tracking-price
npm start
```

Esto abrirá la aplicación en tu navegador, normalmente en `http://localhost:3000`.

## Uso

### 1. **Añadir Productos**

Para añadir un producto, simplemente ingresa el **nombre** y la **URL** del producto en los campos correspondientes. Cuando hagas clic en "Añadir Producto", la aplicación realizará una solicitud al backend, que extraerá el precio y la fuente (Amazon o MediaMarkt).

### 2. **Ver Productos**

La lista de productos añadidos se muestra en tarjetas dentro de la interfaz. Cada tarjeta contiene:

- El **nombre** del producto.
- El **precio** extraído de la URL.
- La **fuente** de donde se obtuvo el precio (Amazon o MediaMarkt).
- Un enlace para ver el producto en la tienda correspondiente.

### 3. **Limpiar Productos**

Puedes eliminar todos los productos de la base de datos haciendo clic en el botón "Limpiar Productos". Esto eliminará todos los productos almacenados en el servidor backend.

## Contribuir

¡Las contribuciones son bienvenidas! Si deseas contribuir al proyecto, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama para tu característica (`git checkout -b feature/nueva-caracteristica`).
3. Realiza los cambios necesarios y haz commit de ellos (`git commit -am 'Añadir nueva característica'`).
4. Haz push de tu rama (`git push origin feature/nueva-caracteristica`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Si tienes alguna pregunta o sugerencia sobre el proyecto, no dudes en contactarme:

- Correo electrónico: [tuemail@example.com](mailto:tuemail@example.com)
- GitHub: [https://github.com/tuusuario](https://github.com/tuusuario)

---

Gracias por utilizar **ScraperAn**. ¡Esperamos que disfrutes de la experiencia de seguimiento de precios!
