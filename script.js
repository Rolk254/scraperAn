let isAuthenticated = false;
const serverIp = "http://192.168.2.76:3000";
let currentPage = 1;
const productsPerPage = 5;

let products = []; // Asegúrate de que 'products' esté inicializado correctamente

async function fetchProducts() {
    document.getElementById('progress-bar-container').style.display = 'block'; // Mostrar la barra de progreso
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%';  // Comienza en 0%

    try {
        const response = await fetch(`${serverIp}/products`);

        if (!response.ok) {
            throw new Error("Error al obtener productos");
        }

        // Tamaño total de la respuesta
        const totalSize = response.headers.get('Content-Length');
        let loaded = 0;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';
        
        // Crear un ciclo para leer la respuesta en fragmentos
        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            // Decodificar los datos y concatenarlos
            result += decoder.decode(value, { stream: true });

            // Actualizar el progreso
            loaded += value.length;
            const progress = (loaded / totalSize) * 100;
            progressBar.style.width = `${progress.toFixed(2)}%`; // Establecer el porcentaje

        }

        // Finalmente, procesar los datos una vez que se haya leído todo el cuerpo
        const data = JSON.parse(result);

        if (Array.isArray(data)) {
            products = [...data];
        } else {
            console.error("Se esperaba un arreglo de productos.");
            products = [];
        }
    } catch (error) {
        console.error("Error al obtener productos:", error);
        products = [];
    } finally {
        renderProducts();  // Llama a renderProducts siempre, incluso si hay un error
        renderPagination(); // Llama a renderPagination siempre, incluso si hay un error
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('progress-bar-container').style.display = 'none'; // Ocultar la barra de progreso al final
    }
}

// Manejador de búsqueda avanzada
function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;

    // Filtra los productos por nombre y precio
    const filteredProducts = products.filter(product => {
        const matchesName = product.name.toLowerCase().includes(searchTerm);
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        return matchesName && matchesPrice;
    });

    // Re-renderiza los productos con los resultados de la búsqueda
    renderProducts(filteredProducts);
    renderPagination(filteredProducts);
}

function renderProducts(filteredProducts = products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    const selectedSource = document.getElementById("filter-source").value;

    if (selectedSource !== "all") {
        filteredProducts = filteredProducts.filter(product => product.source === selectedSource);
    }

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = currentPage * productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    currentProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <button class="favorite-btn" onclick="toggleFavorite(${product.id})">
                ${isProductFavorited(product.id) ? '★' : '☆'}
            </button>
            <div class="product-image">
                <img src="${product.imageUrl}" alt="${product.name}" onclick="handleImageClick('${product.imageUrl}')">
            </div>
            <h3 class="card-header">${product.name}<p class="price">${product.price}</p></h3>
            <p>${product.source}</p>
            <p>Añadido el: ${new Date(product.createdAt).toLocaleString()}</p>
            <a href="${product.url}" target="_blank" class="product-link">Ver Producto</a>
            <button class="delete-btn" onclick="openDeleteModal(${product.id})">Eliminar</button>
        `;
        productList.appendChild(productCard);
    });
}

// Renderizar paginación
function renderPagination(filteredProducts = products) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const selectedSource = document.getElementById("filter-source").value;

    // Filtrar productos por fuente si es necesario
    if (selectedSource !== "all") {
        filteredProducts = filteredProducts.filter(product => product.source === selectedSource);
    }

    // Calcular las páginas necesarias
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = (i === currentPage) ? 'active' : '';
        button.onclick = () => changePage(i);
        pagination.appendChild(button);
    }
}

// Cambiar de página
function changePage(pageNumber) {
    currentPage = pageNumber;
    handleSearch(); // Llamar a handleSearch para aplicar los filtros cuando se cambie de página
}

function handleImageClick(imageUrl) {
    const imageModal = document.createElement('div');
    imageModal.className = 'image-modal';
    imageModal.innerHTML = `
        <div class="image-modal-content">
            <span class="close-btn" onclick="closeImageModal()">&times;</span>
            <div class="modal-image-container">
                <img src="${imageUrl}" alt="Imagen del producto" class="expanded-image">
            </div>
        </div>
    `;
    document.body.appendChild(imageModal);
}

function closeImageModal() {
    const imageModal = document.querySelector('.image-modal');
    if (imageModal) {
        imageModal.remove();
    }
}

let currentProductId = null; // Variable global para almacenar el id del producto que se va a eliminar

// Función para abrir el modal y pasar el ID del producto
function openDeleteModal(productId) {
    currentProductId = productId; // Guardar el ID del producto a eliminar
    document.getElementById('delete-modal').style.display = 'block'; // Mostrar el modal
}

// Función para cerrar el modal
function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none'; // Ocultar el modal
    currentProductId = null; // Limpiar el ID del producto
}

// Función para confirmar la eliminación
async function confirmDelete() {
    if (currentProductId !== null) {
        await handleDelete(currentProductId); // Llamar a handleDelete con el ID del producto
    }
    closeDeleteModal(); // Cerrar el modal después de eliminar
}

// Función para eliminar el producto
async function handleDelete(productId) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert("Debes iniciar sesión para eliminar productos.");
        return;
    }

    const response = await fetch(`${serverIp}/delete-product/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`, // Enviar el token en el encabezado Authorization
        },
    });

    if (response.ok) {
        alert("Producto eliminado exitosamente.");
        fetchProducts(); // Volver a cargar los productos después de eliminar
    } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al eliminar el producto.");
    }
}


function toggleAuthForm(form) {
    if (form === 'login') {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
    } else {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email.trim() || !password.trim()) {
        alert("Por favor ingresa ambos campos.");
        return;
    }

    const response = await fetch(`${serverIp}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.error) {
        alert("Credenciales incorrectas.");
    } else {
        // Guardar el token y el nombre de usuario en el localStorage
        localStorage.setItem('authToken', data.token); // Guardar token
        localStorage.setItem('isAuthenticated', 'true'); // Marcar autenticación
        localStorage.setItem('username', data.username); // Guardar el nombre del usuario

        // Mostrar el nombre de usuario al lado de "Cerrar sesión"
        document.getElementById("username-display").style.display = "inline";
        document.getElementById("username-display").innerText = `Hola, ${data.username}`;

        showApp(); // Mostrar la app correctamente
    }
}

async function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (!name.trim() || !email.trim() || !password.trim()) {
        alert("Por favor ingresa todos los campos.");
        return;
    }

    const response = await fetch(`${serverIp}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (data.error) {
        alert("Error al registrarse.");
    } else {
        alert("Registrado exitosamente. Ahora puedes iniciar sesión.");
        toggleAuthForm('login');
    }
}

async function handleAddProduct() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert("Debes iniciar sesión para agregar productos.");
        return;
    }

    const name = document.getElementById('product-name').value;
    const url = document.getElementById('product-url').value;

    if (!name.trim() || !url.trim() || !isValidUrl(url)) {
        alert("Nombre o URL inválidos.");
        return;
    }

    const response = await fetch(`${serverIp}/precio?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.error) {
        alert("No se pudo obtener el precio");
        return;
    }

    const newProduct = {
        name: name.trim(),
        url: url.trim(),
        price: data.price,
        source: data.source,
        imageUrl: data.imageUrl,
        createdAt: new Date().toISOString(),
    };

    // Aquí se envía el token en el encabezado Authorization para agregar el producto
    await fetch(`${serverIp}/add-product`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Enviar el token
        },
        body: JSON.stringify(newProduct),
    });

    fetchProducts(); // Volver a cargar los productos después de agregar
}

function isValidUrl(url) {
    const regex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/;
    return regex.test(url);
}

function handleFilter() {
    const selectedSource = document.getElementById("filter-source").value;
    currentPage = 1; // Volver a la primera página cuando cambias el filtro

    // Filtrar productos según la fuente seleccionada
    const filteredProducts = selectedSource === "all" 
        ? products 
        : products.filter(product => product.source === selectedSource);

    renderProducts(filteredProducts);
    renderPagination(filteredProducts);
}

function handleLogout() {
    // Eliminar el token y el nombre del usuario del localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');

    // Ocultar el nombre del usuario
    document.getElementById("username-display").style.display = "none";

    // Volver a mostrar la sección de login
    showLogin();
}

// Función para mostrar la vista de login nuevamente
function showLogin() {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("app-section").style.display = "none";
}

function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const authState = localStorage.getItem('isAuthenticated');

    if (token && authState === 'true') {
        showApp(); // Si hay un token válido, mostrar la app
    }
}

function showApp() {
    isAuthenticated = true;
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    fetchProducts(); // Cargar productos tras autenticación
}

// Ejecutar al cargar la página
window.onload = checkAuthStatus;

// Obtener los productos favoritos desde localStorage
function getFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites;
}

// Verificar si un producto es favorito
function isProductFavorited(productId) {
    const favorites = getFavorites();
    return favorites.includes(productId);
}

// Alternar el estado de favorito
function toggleFavorite(productId) {
    let favorites = getFavorites();

    if (favorites.includes(productId)) {
        // Eliminar de favoritos
        favorites = favorites.filter(id => id !== productId);
    } else {
        // Agregar a favoritos
        favorites.push(productId);
    }

    // Guardar los favoritos actualizados en localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // Re-renderizar los productos después de agregar o quitar de favoritos
    renderProducts(products); // Recargar los productos con la lista de favoritos actualizada
}

// Mostrar solo los productos favoritos
function showFavorites() {
    const favorites = getFavorites();
    const favoriteProducts = products.filter(product => favorites.includes(product.id));
    renderProducts(favoriteProducts);
    renderPagination(favoriteProducts);
}

// Mostrar todos los productos
function showAllProducts() {
    renderProducts(products);
    renderPagination(products);
}

window.onload = function() {
    const token = localStorage.getItem("authToken");
    const username = localStorage.getItem("username");
    if (token && username) {
        // Si el token y el nombre del usuario están presentes, mostramos el nombre
        document.getElementById("username-display").style.display = "inline";
        document.getElementById("username-display").innerText = `Hola, ${username}`;
        showApp();
    }
};
