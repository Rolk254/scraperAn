import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", url: "" });
  const [loading, setLoading] = useState(false);

  // Cargar productos al inicio
  useEffect(() => {
    axios
      .get("http://localhost:3000/products")
      .then((response) => setProducts(response.data.products))
      .catch((error) => console.error("Error al cargar productos", error));
  }, []);

  // Función para obtener el precio y la fuente (Amazon/MediaMarkt)
  const fetchPrice = async (url) => {
    try {
      const response = await axios.get(`http://localhost:3000/precio?url=${url}`);
      const price = response.data.price || "No disponible";
      const source = url.includes("mediamarkt") ? "MediaMarkt" : url.includes("amazon") ? "Amazon" : "Desconocido";
      return { price, source };
    } catch (error) {
      console.error("Error al obtener precio", error);
      return { price: "Error al obtener precio", source: "Desconocido" };
    }
  };

  // Añadir un nuevo producto
  const handleAddProduct = async () => {
    setLoading(true);
    try {
      const { price, source } = await fetchPrice(newProduct.url);
      const newProductWithPrice = { ...newProduct, price, source };
      setProducts((prevProducts) => [...prevProducts, newProductWithPrice]);
      setNewProduct({ name: "", url: "" }); // Limpiar formulario
    } catch (error) {
      console.error("Error al añadir producto", error);
    }
    setLoading(false);
  };

  // Limpiar productos
  const handleClearProducts = async () => {
    try {
      await axios.delete("http://localhost:3000/clear-products");
      setProducts([]);
    } catch (error) {
      console.error("Error al limpiar productos", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gestión de Productos</h1>
        <div className="form-container">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="input-field"
          />
          <input
            type="text"
            placeholder="URL del producto"
            value={newProduct.url}
            onChange={(e) => setNewProduct({ ...newProduct, url: e.target.value })}
            className="input-field"
          />
          <button onClick={handleAddProduct} disabled={loading} className="add-btn">
            {loading ? "Cargando..." : "Añadir Producto"}
          </button>
        </div>

        <h2>Lista de Productos</h2>
        <div className="product-list">
          {products.map((product, index) => (
            <div key={index} className="product-card">
              <h3>{product.name}</h3>
              <p><strong>Precio:</strong> {product.price}</p>
              <p><strong>Fuente:</strong> {product.source}</p>
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="product-link">
                Ver Producto
              </a>
            </div>
          ))}
        </div>
        <button onClick={handleClearProducts} className="clear-btn">
          Limpiar Productos
        </button>
      </header>
    </div>
  );
}

export default App;
