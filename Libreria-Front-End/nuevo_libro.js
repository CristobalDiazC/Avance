const API_BASE = "http://127.0.0.1:8000";

// ================================
// CARGAR MATERIAS PRIMAS
// ================================
async function cargarMateriasPrimas() {
  const cont = document.getElementById("materias-primas-list");
  cont.innerHTML = "<p class='muted small'>Cargando materias primas...</p>";

  try {
    const res = await fetch(`${API_BASE}/materias_primas/`);
    if (!res.ok) throw new Error("Error al obtener materias primas");

    const materias = await res.json();
    if (!Array.isArray(materias)) throw new Error("Respuesta inválida del servidor");

    cont.innerHTML = "";

    materias.forEach(mp => {
      cont.innerHTML += `
        <div class="mp-item">
          <label>
            ${mp.nombre}
            <input 
              type="number"
              data-id="${mp.id_mp}"
              min="0"
              value="0"
              step="1"
              style="margin-left: 10px; width: 80px;"
            >
          </label>
        </div>
      `;
    });

  } catch (error) {
    console.error(error);
    cont.innerHTML = "<p style='color:red'>❌ Error cargando materias primas.</p>";
  }
}

// ================================
// CARGAR OPCIONES DE PÁGINAS (papel)
// ================================
async function cargarOpcionesPaginas() {
  const select = document.querySelector("select[name='paginas_por_libro']");
  select.innerHTML = `<option value="">Cargando...</option>`;

  try {
    const res = await fetch(`${API_BASE}/papel/`);
    if (!res.ok) throw new Error("Error al obtener páginas");

    const paginas = await res.json();
    select.innerHTML = `<option value="">Selecciona páginas</option>`;
    paginas.forEach(p => {
      // Si el endpoint devuelve solo números, mostramos "X páginas"
      // Si devuelve objetos con nombre, mostramos ambos
      if (typeof p === "object" && p.paginas) {
        select.innerHTML += `<option value="${p.paginas}">${p.paginas} páginas — ${p.nombre}</option>`;
      } else {
        select.innerHTML += `<option value="${p}">${p} páginas</option>`;
      }
    });

  } catch (err) {
    console.error(err);
    select.innerHTML = `<option value="">❌ Error al cargar páginas</option>`;
  }
}

// ================================
// GUARDAR LIBRO
// ================================
document.getElementById("formNuevoLibro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const nombre = form.nombre.value.trim();
  const precio = Number(form.precio.value);
  const paginas_por_libro = Number(form.paginas_por_libro.value);

  if (!nombre) return alert("⚠ Ingresa un nombre válido");
  if (isNaN(precio) || precio < 0) return alert("⚠ Ingresa un precio válido");
  if (isNaN(paginas_por_libro) || paginas_por_libro < 1) return alert("⚠ Selecciona un número válido de páginas");

  // Tomar materias primas necesarias
  const materias = Array.from(document.querySelectorAll("#materias-primas-list input"))
    .map(input => ({
      id_mp: Number(input.dataset.id),
      cantidad: Number(input.value)
    }))
    .filter(m => m.cantidad > 0);

  const payload = {
    nombre,
    precio,
    paginas_por_libro,
    materias
  };

  console.log("Payload enviado:", payload); // 👀 depuración

  try {
    const res = await fetch(`${API_BASE}/libros/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      alert("❌ Error: " + JSON.stringify(errData));
      return;
    }

    alert("✅ Libro creado correctamente");
    window.location.href = "libros.html";

  } catch (err) {
    console.error(err);
    alert("❌ Error de conexión");
  }
});

// ================================
// INICIALIZAR
// ================================
document.addEventListener("DOMContentLoaded", () => {
  cargarMateriasPrimas();
  cargarOpcionesPaginas();
});
