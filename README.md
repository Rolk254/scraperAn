# ScraperAn: Tracking Price

Este es un proyecto que permite hacer un seguimiento de los precios de productos de diferentes tiendas online, como Amazon y MediaMarkt. Los usuarios pueden añadir productos mediante su nombre y URL, y la aplicación obtiene y muestra el precio actual de esos productos. Los productos se almacenan en un servidor backend, permitiendo su gestión (añadir, ver, y limpiar).

## Tecnologías utilizadas

- **Frontend**:
  - React.js
  - Axios
  - CSS (estilos personalizados)
  
- **Backend**:
  - Node.js
  - Express.js
  - Axios para hacer scraping de las páginas de productos

## Características

1. **Añadir Productos**:
   Los usuarios pueden añadir productos proporcionando el nombre y la URL del producto.
   
2. **Ver Precio y Fuente**:
   Los precios de los productos son obtenidos automáticamente desde Amazon o MediaMarkt, y se muestra la fuente del precio.

3. **Limpiar Productos**:
   Los usuarios pueden limpiar la lista de productos en el backend.

## Instalación

### Clonación del repositorio

Clona este repositorio a tu máquina local:

```bash
git clone https://github.com/tuusuario/scraperAn.git
