import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/products");
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("Se esperaba un arreglo");
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!name.trim()) return alert("Ingresa un nombre válido");
    if (!url.trim() || !isValidUrl(url)) return alert("Ingresa una URL válida");

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/precio?url=${encodeURIComponent(url)}`);
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
      };

      const postResponse = await fetch("http://localhost:3000/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      const postData = await postResponse.json();
      if (!postResponse.ok) {
        alert(postData.error);
        return;
      }

      setProducts([...products, postData.product]);
    } catch (error) {
      console.error("Error al añadir producto:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await fetch(`http://localhost:3000/delete-product/${id}`, {
          method: "DELETE",
        });

        setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      }
    }
  };

  const isValidUrl = (url) => {
    const regex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/;
    return regex.test(url);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="App">
      <h1>Scraper de Precios</h1>

      {loading && <div className="loading-indicator">Cargando...</div>}

      <div className="form-container">
        <input
          className="input-field"
          type="text"
          placeholder="Nombre del producto"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input-field"
          type="text"
          placeholder="URL del producto"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="add-btn" onClick={handleAddProduct}>
          Añadir Producto
        </button>
      </div>

      <input
        type="text"
        className="search-bar"
        placeholder="Buscar producto..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="product-list">
        {currentProducts.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-image"
            />
            <h3 className="card-header">
              {product.name}
              <p className="price">{product.price}</p>
            </h3>
            <p>{product.source}</p>
            <p className="timestamp">Añadido el: {new Date(product.createdAt).toLocaleString()}</p> {/* Mostrar timestamp */}
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="product-link"
            >
              Ver Producto
            </a>
            <button
              className="delete-btn"
              onClick={() => handleDeleteProduct(product.id)}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <div className="pagination">
        {[...Array(Math.ceil(filteredProducts.length / productsPerPage))].map(
          (_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default App;
