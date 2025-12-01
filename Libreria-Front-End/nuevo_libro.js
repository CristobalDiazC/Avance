const API_BASE = "http://127.0.0.1:8000";

// Cargar materias primas
async function cargarMateriasPrimas() {
  const cont = document.getElementById("materias-primas-list");

  const res = await fetch(`${API_BASE}/materias-primas/`);
  const materias = await res.json();

  cont.innerHTML = "";

  materias.forEach(mp => {
    cont.innerHTML += `
      <div class="mp-item">
        <label>
          ${mp.nombre}
          <input type="number" min="0" step="1" data-id="${mp.id_mp}" />
        </label>
      </div>
    `;
  });
}

// Guardar libro
document.getElementById("formNuevoLibro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const nombre = form.nombre.value.trim();
  const precio = parseFloat(form.precio.value);

  const materias = [...document.querySelectorAll("#materias-primas-list input")]
    .map(input => ({
      id_mp: parseInt(input.dataset.id),
      cantidad: parseInt(input.value || "0")
    }))
    .filter(m => m.cantidad > 0);

  const payload = { nombre, precio, materias };

  const res = await fetch(`${API_BASE}/libros/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const data = await res.json();
    alert("❌ Error: " + (data.detail || "No se pudo crear el libro"));
    return;
  }

  alert("📘 Libro creado exitosamente");
  window.location.href = "libros.html";
});

cargarMateriasPrimas();