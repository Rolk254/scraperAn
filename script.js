let isAuthenticated = false;
const serverIp = "http://localhost:3000";
let currentPage = 1;
const productsPerPage = 5;

let products = [];

async function fetchProducts() {
    document.getElementById('progress-bar-container').style.display = 'block';
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%';

    try {
        const response = await fetch(`${serverIp}/products`);

        if (!response.ok) {
            throw new Error("Error al obtener productos");
        }

        const totalSize = response.headers.get('Content-Length');
        let loaded = 0;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';
        
        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            result += decoder.decode(value, { stream: true });

            loaded += value.length;
            const progress = (loaded / totalSize) * 100;
            requestAnimationFrame(() => {
                progressBar.style.width = `${progress.toFixed(2)}%`;
            });

        }

        const data = JSON.parse(result);

        if (Array.isArray(data)) {
            products = [...data];
        } else {
            console.error("Se esperaba un arreglo de productos.");
            products = [];
        }
    } catch (error) {
        console.error("Error al obtener productos");
        products = [];
    } finally {
        renderProducts();
        renderPagination();
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('progress-bar-container').style.display = 'none';
    }
}

function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;

    const filteredProducts = products.filter(product => {
        const matchesName = product.name.toLowerCase().includes(searchTerm);
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        return matchesName && matchesPrice;
    });

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
            <h3 class="card-header">${product.name}<p class="price">${product.price} €</p></h3>
            <p>${product.source}</p>
            <p>Añadido el: ${new Date(product.createdAt).toLocaleString()}</p>
            <a href="${product.url}" target="_blank" class="product-link">Ver Producto</a>
            <button class="delete-btn" onclick="openDeleteModal(${product.id})">Eliminar</button>
        `;
        productList.appendChild(productCard);
    });
}

function renderPagination(filteredProducts = products) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const selectedSource = document.getElementById("filter-source").value;

    if (selectedSource !== "all") {
        filteredProducts = filteredProducts.filter(product => product.source === selectedSource);
    }

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = (i === currentPage) ? 'active' : '';
        button.onclick = () => changePage(i);
        pagination.appendChild(button);
    }
}

function changePage(pageNumber) {
    currentPage = pageNumber;
    handleSearch();
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
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc") {
        closeImageModal();
    }
});

let currentProductId = null;

function openDeleteModal(productId) {
    currentProductId = productId;
    document.getElementById('delete-modal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    currentProductId = null;
}

async function confirmDelete() {
    if (currentProductId !== null) {
        await handleDelete(currentProductId);
    }
    closeDeleteModal();
}

async function handleDelete(productId) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        abrirPopup("Debes iniciar sesión para eliminar productos.");
        return;
    }

    const response = await fetch(`${serverIp}/delete-product/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (response.ok) {
        fetchProducts();
    } else {
        const errorData = await response.json();
        abrirPopup(errorData.error || "Error al eliminar el producto.");
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
        abrirPopup("Por favor ingresa ambos campos.");
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
        abrirPopup("Credenciales incorrectas.");
    } else {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', data.username);

        document.getElementById("username-display").style.display = "inline";
        document.getElementById("username-display").innerText = `Hola, ${data.username}`;

        showApp();
    }
}

async function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (!name.trim() || !email.trim() || !password.trim()) {
        abrirPopup("Por favor ingresa todos los campos.");
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
        abrirPopup("Error al registrarse.");
    } else {
        abrirPopup("Registrado exitosamente. Ahora puedes iniciar sesión.");
        toggleAuthForm('login');
    }
}

async function handleAddProduct() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        abrirPopup("Debes iniciar sesión para agregar productos.");
        return;
    }

    const name = document.getElementById('product-name').value;
    const url = document.getElementById('product-url').value;

    if (!name.trim() || !url.trim() || !isValidUrl(url)) {
        abrirPopup("Nombre o URL inválidos.");
        return;
    }

    const response = await fetch(`${serverIp}/precio?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.error) {
        abrirPopup("No se pudo obtener el precio");
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

    await fetch(`${serverIp}/add-product`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
    });

    fetchProducts();
}

function isValidUrl(url) {
    const regex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/;
    return regex.test(url);
}

function handleFilter() {
    const selectedSource = document.getElementById("filter-source").value;
    currentPage = 1;

    const filteredProducts = selectedSource === "all" 
        ? products 
        : products.filter(product => product.source === selectedSource);

    renderProducts(filteredProducts);
    renderPagination(filteredProducts);
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');

    document.getElementById("username-display").style.display = "none";

    showLogin();
}

function showLogin() {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("app-section").style.display = "none";
}

function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const authState = localStorage.getItem('isAuthenticated');

    if (token && authState === 'true') {
        showApp();
    }
}

function showApp() {
    isAuthenticated = true;
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    fetchProducts();
}

window.onload = checkAuthStatus;

function getFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites;
}

function isProductFavorited(productId) {
    const favorites = getFavorites();
    return favorites.includes(productId);
}

function toggleFavorite(productId) {
    let favorites = getFavorites();

    if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
    } else {
        favorites.push(productId);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));

    renderProducts(products);
}

function showFavorites() {
    const favorites = getFavorites();
    const favoriteProducts = products.filter(product => favorites.includes(product.id));
    renderProducts(favoriteProducts);
    renderPagination(favoriteProducts);
}

function showAllProducts() {
    renderProducts(products);
    renderPagination(products);
}

function abrirPopup(mensaje) {
    const popup = document.createElement('div');
    popup.className = 'popup-notificacion';
    popup.innerText = mensaje;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add('mostrar');
    }, 10);

    setTimeout(() => {
        popup.classList.remove('mostrar');
        setTimeout(() => popup.remove(), 500);
    }, 4000);
}

window.onload = function() {
    const token = localStorage.getItem("authToken");
    const username = localStorage.getItem("username");
    if (token && username) {
        document.getElementById("username-display").style.display = "inline";
        document.getElementById("username-display").innerText = `Hola, ${username}`;
        showApp();
    }
};
