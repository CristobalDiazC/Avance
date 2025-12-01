const API_BASE = "http://127.0.0.1:8000";

// Cargar materias primas
async function cargarMateriasPrimas() {
  const cont = document.getElementById("materias-primas-list");
  cont.innerHTML = "<p class='muted small'>Cargando materias primas...</p>";

  try {
    const res = await fetch("http://127.0.0.1:8000/materias_primas/");
    if (!res.ok) throw new Error("Error al obtener materias primas");

    const materias = await res.json();

    if (!Array.isArray(materias)) {
      throw new Error("Respuesta inválida del servidor");
    }

    cont.innerHTML = ""; // Limpia lista

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


// Guardar libro
document.getElementById("formNuevoLibro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;

  const nombre = form.nombre.value.trim();
  const precio = Number(form.precio.value);
  const cantidadLibros = Number(document.getElementById("cantidad-libros").value);

  // Tomar materias primas
  const materias = Array.from(document.querySelectorAll("#lista-mp input"))
    .map(input => ({
      id_mp: Number(input.dataset.id),
      cantidad: Number(input.value)
    }))
    .filter(m => m.cantidad > 0);

  const payload = {
    nombre,
    precio,
    paginas_por_libro: 1, // Temporal hasta que recibamos el valor real
    cantidad_libros: cantidadLibros, // Extra
    materias
  };

  try {
    const res = await fetch(`${API_BASE}/libros/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json();
      alert("❌ Error: " + JSON.stringify(errData));
      return;
    }

    alert("✅ Libro creado correctamente");
    window.location.href = "libros.html";

  } catch (err) {
    alert("❌ Error de conexión");
  }
});


document.addEventListener("DOMContentLoaded", cargarMateriasPrimas);
