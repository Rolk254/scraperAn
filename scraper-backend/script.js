document.getElementById("priceForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    const url = document.getElementById("url").value;
    const resultElement = document.getElementById("result");
    const priceElement = document.getElementById("price");
    const loadingElement = document.getElementById("loading");

    resultElement.style.display = "none"; // Ocultar resultado mientras se carga
    loadingElement.style.display = "block"; // Mostrar mensaje de carga

    try {
        // Realizamos la petición a la API
        const response = await fetch(`http://localhost:3050/precio?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        // Ocultamos el mensaje de carga y mostramos el resultado
        loadingElement.style.display = "none"; // Ocultar "Cargando..."
        resultElement.style.display = "block"; // Mostrar resultado

        // Mostrar el resultado
        if (data.price) {
            priceElement.textContent = `El precio es: ${data.price}`;
        } else {
            priceElement.textContent = "Precio no encontrado";
        }
    } catch (error) {
        console.error("Error:", error);
        loadingElement.style.display = "none"; // Ocultar "Cargando..."
        resultElement.style.display = "block"; // Mostrar mensaje de error
        priceElement.textContent = "Hubo un error al obtener el precio. Intenta de nuevo.";
    }
});
