const API_BASE = "http://127.0.0.1:8000";

let tiendasCache = {};

// Cargar tiendas
async function cargarTiendas() {
  try {
    const res = await fetch(`${API_BASE}/puntos-venta/`);
    const tiendas = await res.json();
    tiendasCache = {};
    tiendas.forEach(t => tiendasCache[t.id_punto_venta] = t.nombre);
  } catch (e) {
    console.error("Error cargando puntos de venta:", e);
  }
}

// Cargar inventario del usuario
async function cargarInventarioUsuario() {
  const pvId = localStorage.getItem("punto_venta_id");

  if (!pvId) {
    alert("Error: No se encontró el Punto de Venta del usuario.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/inventario-pv/por-pv/${pvId}`);
    const data = await res.json();

    const tbody = document.getElementById("tabla-inv-user");
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No hay libros en este punto de venta.</td></tr>';
        return;
    }

    data.forEach(item => {
      // ⚠️ Asumo que el objeto item ya trae el precio del libro para la venta.
      // Si el backend no lo envía, esta línea fallará o mostrará 'undefined'.
      const precio = item.precio || 'N/A';
      
      const botonAccion = item.stock > 0
          ? `<button class="btn primary" onclick="vender(${item.id_inventario}, ${item.stock})">Vender</button>`
          : `<span style="color: red;">AGOTADO</span>`;

      const stockColor = item.stock <= 5 && item.stock > 0 
          ? 'style="color: orange; font-weight: 600;"' 
          : item.stock === 0 ? 'style="color: red; font-weight: 600;"' : '';
          
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.libro}</td>
        <td ${stockColor}>${item.stock}</td>
        <td>$${precio.toLocaleString('es-CL')}</td>
        <td>${botonAccion}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error(error);
    alert("Error cargando inventario");
  }
}

async function vender(idInv, stockActual) {
  if (stockActual <= 0) {
      alert("🚫 Stock agotado. No se puede realizar la venta.");
      return;
  }
  
  if (!confirm(`¿Confirmar venta de 1 unidad?`)) {
      return;
  }

  try {
    // El delta es -1, resta una unidad de stock en el inventario PV
    const res = await fetch(`${API_BASE}/inventario-pv/${idInv}/ajustar`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta: -1 })
    });
    
    if (!res.ok) {
         // Si el backend devuelve un error (por ejemplo, stock negativo)
         const err = await res.json();
         alert("❌ Error al registrar venta: " + (err.detail || "Error desconocido"));
         return;
    }

    alert("✅ Venta registrada con éxito.");
    cargarInventarioUsuario();
  } catch (e) {
    alert("⚠️ Error al conectar con el servidor para registrar venta.");
    console.error(e);
  }
}

// al cargar la página -------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const pvId = localStorage.getItem("punto_venta_id");  // ✅ corregido

  console.log("PV ID guardado:", pvId);

  if (!pvId) {
    alert("Error: No se encontró el Punto de Venta del usuario.");
    return;
  }

  const res = await fetch(`${API_BASE}/puntos-venta/${pvId}`);
  const pv = await res.json();

  console.log("PV recibido del backend:", pv);

  document.getElementById("info-pv").textContent =
    `Estás trabajando en: ${pv.nombre}`;

  cargarInventarioUsuario(); // 🔥 NECESARIO
});
