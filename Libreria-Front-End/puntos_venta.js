const API_BASE = "http://127.0.0.1:8000";

// ==================================================
// CARGAR Y MOSTRAR PUNTOS DE VENTA
// ==================================================

// Carga y muestra la lista de puntos de venta
async function cargarPuntosVenta(q = "") {
  const tbody = document.getElementById("tabla-puntos-venta");
  // 5 columnas: ID, Nombre, Ubicación, Tipo, Acciones
  tbody.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";

  let url = `${API_BASE}/puntos-venta/`;
  if (q) {
    url += `?q=${encodeURIComponent(q)}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Manejo de error si la API no está disponible o falla, sin usar datos de ejemplo.
      throw new Error(`Error al obtener datos: ${res.status}`);
    }

    const puntosVenta = await res.json();
    mostrarPuntosVenta(puntosVenta, tbody);

  } catch (e) {
    console.error(e);
    tbody.innerHTML = "<tr><td colspan='5'>Error al conectar con la API de puntos de venta o al cargar datos.</td></tr>";
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
        <td>${index + 1}</td>   <td>${pv.nombre}</td>
        <td>${pv.ubicacion || "—"}</td>
        <td>${pv.tipo}</td>
        <td>
          <a class="link" href="#" onclick="abrirModalEditarPV(${pv.id_punto_venta}); return false;">Editar</a>
          <a class="link" href="#" onclick="eliminarPuntoVenta(${pv.id_punto_venta}); return false;">Eliminar</a>
        </td>
      `;

      tbody.appendChild(tr);
    });
}


// ==================================================
// MODAL DE EDICIÓN
// ==================================================

// Abre el modal y carga los datos actuales del PV
window.abrirModalEditarPV = async function (pvId) {
    try {
        const res = await fetch(`${API_BASE}/puntos-venta/${pvId}`);
        if (!res.ok) throw new Error('No se pudo cargar el PV');
        
        const pv = await res.json();

        // Rellenar formulario
        document.getElementById("editar-pv-id").value = pv.id_punto_venta;
        document.getElementById("editar-pv-nombre").value = pv.nombre;
        document.getElementById("editar-pv-ubicacion").value = pv.ubicacion;
        document.getElementById("editar-pv-tipo").value = pv.tipo;

        document.getElementById("modalEditarPV").classList.remove("hidden");

    } catch (error) {
        console.error(error);
        alert("❌ Error al cargar datos del punto de venta.");
    }
};

window.cerrarModalEditarPV = function () {
    document.getElementById("modalEditarPV").classList.add("hidden");
};


// LÓGICA DE ACTUALIZACIÓN (PATCH)
document.addEventListener("DOMContentLoaded", () => {
    const formEditarPV = document.getElementById("formEditarPV");
    if (!formEditarPV) return;

    formEditarPV.addEventListener("submit", async (e) => {
        e.preventDefault();

        const pvId = document.getElementById("editar-pv-id").value;

        const payload = {
            nombre: document.getElementById("editar-pv-nombre").value.trim(),
            ubicacion: document.getElementById("editar-pv-ubicacion").value.trim(),
            tipo: document.getElementById("editar-pv-tipo").value,
        };

        try {
            const resp = await fetch(`${API_BASE}/puntos-venta/${pvId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                const err = await resp.json();
                alert("❌ Error al actualizar: " + (err.detail || "Error desconocido."));
                return;
            }

            alert("✅ Punto de venta actualizado correctamente.");
            cerrarModalEditarPV();
            cargarPuntosVenta(); // Recargar tabla
        } catch (error) {
            console.error(error);
            alert("⚠ Error al conectar con el servidor.");
        }
    });
});


// ==================================================
// FUNCIÓN DE ELIMINACIÓN
// ==================================================

// Función para manejar la eliminación de un punto de venta
window.eliminarPuntoVenta = async function (pvId) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el Punto de Venta ID: ${pvId}?`)) {
        return;
    }

    try {
        const resp = await fetch(`${API_BASE}/puntos-venta/${pvId}`, {
            method: "DELETE"
        });

        if (resp.status === 204) {
            alert("🗑 Punto de venta eliminado correctamente.");
            cargarPuntosVenta(); // Recargar tabla
            return;
        }

        // Si la respuesta no es 204, intentamos leer el cuerpo del error (JSON)
        // PERO primero debemos asegurarnos de que la promesa NO FALLE antes de leer el cuerpo.
        
        const contentType = resp.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            // La respuesta es JSON, leemos el cuerpo para obtener el detalle del error.
            const errorData = await resp.json();
            
            let errorMessage = "❌ Error al eliminar el punto de venta.";

            // ⚠️ CHEQUEO DE CLAVE FORÁNEA (Asumiendo que el backend envía este texto)
            if (errorData.detail && errorData.detail.includes("FOREIGN KEY constraint")) {
                 errorMessage = "🚫 No se puede eliminar este Punto de Venta porque tiene registros asociados (usuarios o inventario). Elimine primero los usuarios y el stock de este PV.";
            } else if (resp.status === 404) {
                 errorMessage = "Punto de venta no encontrado.";
            } else if (errorData.detail) {
                 errorMessage = `❌ Error: ${errorData.detail}`;
            } else {
                 errorMessage = `❌ Error desconocido (Código: ${resp.status}).`;
            }
            
            alert(errorMessage);
        } else {
            // La respuesta NO es JSON (ej. un error 500 genérico de servidor web o backend)
            alert(`❌ Error del Servidor (Código: ${resp.status}). Revise los logs del backend para más detalles.`);
        }

    } catch (error) {
        console.error(error);
        // Este bloque ahora solo se ejecuta si hay un fallo de red o la promesa fetch no se completa.
        alert("⚠ Error al conectar con el servidor.");
    }
};


// ==================================================
// INICIALIZACIÓN
// ==================================================

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