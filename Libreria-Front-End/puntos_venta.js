const API_BASE = "http://127.0.0.1:8000";

// Carga y muestra la lista de puntos de venta
async function cargarPuntosVenta(q = "") {
  const tbody = document.getElementById("tabla-puntos-venta");
  // 5 columnas: ID, Nombre, Ubicación, Tipo, Acciones
  tbody.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";

  let url = `${API_BASE}/puntos-venta/`;
  if (q) {
    // ⚠️ Nota: Esta URL ASUME que el backend implementa el endpoint /puntos_venta
    // con capacidad de filtrado por 'q'.
    url += `?q=${encodeURIComponent(q)}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // ⚠️ ADVERTENCIA: Este error es probable ya que el endpoint /puntos_venta/ no está implementado
      // en los routers que proporcionaste. Se usará un ejemplo de datos hasta que se implemente.
      console.warn("API /puntos_venta/ no implementada. Usando datos de ejemplo.");
      
      const datosEjemplo = [
        { id_punto_venta: 1, nombre: "Librería Centro", ubicacion: "Santiago", tipo: "tienda" },
        { id_punto_venta: 2, nombre: "Metro Tobalaba", ubicacion: "Providencia", tipo: "metro" },
        { id_punto_venta: 3, nombre: "Ventas Web", ubicacion: "N/A", tipo: "online" }
      ];
      
      mostrarPuntosVenta(datosEjemplo, tbody);
      return;
    }

    const puntosVenta = await res.json();
    mostrarPuntosVenta(puntosVenta, tbody);

  } catch (e) {
    console.error(e);
    tbody.innerHTML = "<tr><td colspan='5'>Error al conectar con la API de puntos de venta</td></tr>";
  }
}

// Función auxiliar para renderizar los datos
function mostrarPuntosVenta(items, tbody) {
    tbody.innerHTML = "";
    
    if (!items.length) {
      tbody.innerHTML = "<tr><td colspan='5'>No hay puntos de venta registrados</td></tr>";
      return;
    }

    items.forEach((pv, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${index + 1}</td>   <!-- ID visual -->
        <td>${pv.nombre}</td>
        <td>${pv.ubicacion || "—"}</td>
        <td>${pv.tipo}</td>
        <td>
          <a class="link" href="#" onclick="alert('Editar punto de venta ${pv.id_punto_venta}')">Editar</a>
          <a class="link" href="#" onclick="eliminarPuntoVenta(${pv.id_punto_venta}); return false;">Eliminar</a>
        </td>
      `;

      tbody.appendChild(tr);
    });
}



// Función para manejar la eliminación (simulada) de un punto de venta
window.eliminarPuntoVenta = async function (pvId) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el Punto de Venta ID: ${pvId}?`)) {
        return;
    }

    try {
        const resp = await fetch(`http://127.0.0.1:8000/puntos-venta/${pvId}`, {
            method: "DELETE"
        });

        if (!resp.ok) {
            const msg = await resp.text();
            console.error(msg);
            alert("❌ Error al eliminar el punto de venta.");
            return;
        }

        alert("🗑 Punto de venta eliminado correctamente.");
        cargarPuntosVenta(); // Recargar tabla

    } catch (error) {
        console.error(error);
        alert("⚠ Error al conectar con el servidor.");
    }
};


// Cuando carga la página
document.addEventListener("DOMContentLoaded", () => {
  // Cargar puntos de venta inicial
  cargarPuntosVenta();

  // Listener para el formulario de filtro/búsqueda
  const formFiltro = document.getElementById("filterFormPV");

  if (formFiltro) {
    formFiltro.addEventListener("submit", function (e) {
      e.preventDefault();
      const q = this.q.value.trim();
      cargarPuntosVenta(q);
    });
  }
});