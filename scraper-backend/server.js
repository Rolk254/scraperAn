const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let products = [];  // Aquí guardamos los productos añadidos

// Ruta para obtener los precios
app.get("/precio", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL requerida" });

  try {
    // Usamos Puppeteer para obtener el HTML renderizado
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    
    // Obtenemos el HTML de la página renderizada
    const content = await page.content();
    const $ = cheerio.load(content);

    // Lógica para MediaMarkt
    if (url.includes("mediamarkt")) {
      // Buscamos los elementos que contienen el precio
      const priceWhole = $("span[data-test='branded-price-whole-value']").text().trim();
      const priceDecimal = $("span[data-test='branded-price-decimal-value']").text().trim();
      const currency = $("span[data-test='branded-price-currency']").text().trim();

      const price = priceWhole && currency ? `${priceWhole}${priceDecimal}${currency}` : "No encontrado";
      
      await browser.close();
      return res.json({ price, source: "MediaMarkt" });
    }

    // Lógica para Amazon
    if (url.includes("amazon")) {
      const price =
        $("#priceblock_ourprice").text().trim() ||
        $("#priceblock_dealprice").text().trim() ||
        $(".a-price .a-offscreen").first().text().trim();

      await browser.close();
      return res.json({ price: price || "No encontrado", source: "Amazon" });
    }

    await browser.close();
    return res.status(400).json({ error: "URL no compatible" });
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    res.status(500).json({ error: "Error en el scraping" });
  }
});

// Ruta para obtener todos los productos
app.get("/products", (req, res) => {
  res.json({ products });
});

// Ruta para añadir un producto
app.post("/add-product", (req, res) => {
  const { name, url, price, source } = req.body;

  if (!name || !url || !price || !source) {
    return res.status(400).json({ error: "Datos del producto incompletos" });
  }

  const newProduct = { name, url, price, source };
  products.push(newProduct);

  res.status(201).json({ message: "Producto añadido", product: newProduct });
});

// Ruta para limpiar los productos
app.delete("/clear-products", (req, res) => {
  products = [];
  res.status(200).json({ message: "Productos limpiados" });
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
