const API_BASE = "http://127.0.0.1:8000";

// ===============================
// CARGAR RESUMEN GLOBAL
// ===============================
async function cargarResumen() {
  try {
    const resPV = await fetch(`${API_BASE}/puntos-venta/`);
    const puntos = await resPV.json();

    const resUsers = await fetch(`${API_BASE}/usuarios/`);
    const users = await resUsers.json();

    const resInv = await fetch(`${API_BASE}/inventario/`);
    const inventario = await resInv.json();

    // Calcular la suma total del stock
    const stockTotal = inventario.reduce((sum, item) => sum + item.stock, 0);

    document.getElementById("resumen-locales").textContent = puntos.length;
    document.getElementById("resumen-usuarios").textContent = users.length;
    
    // Usar el stock total calculado
    document.getElementById("resumen-stock").textContent = stockTotal; 

  } catch (e) {
    console.error("Error cargando resumen:", e);
  }
}

// ===============================
// CARGAR ALERTAS DE STOCK BAJO
// ===============================
async function cargarAlertas() {
  try {
    const res = await fetch(`${API_BASE}/inventario/stock-bajo`);
    const alertas = await res.json();

    const ul = document.getElementById("alerta-libros");
    ul.innerHTML = "";

    if (!alertas.length) {
      ul.innerHTML = "<li>No hay alertas de stock.</li>";
      return;
    }

    alertas.forEach(a => {
      ul.innerHTML += `
        <li>${a.libro} — Stock: ${a.stock} (Min: ${a.stock_minimo})</li>
      `;
    });

  } catch (e) {
    console.error("Error cargando alertas:", e);
  }
}

// ===============================
// CARGAR TABLA DE PUNTOS DE VENTA
// ===============================
async function cargarPuntosVentaAdmin() {
  try {
    const res = await fetch(`${API_BASE}/puntos-venta/`);
    const data = await res.json();

    const tbody = document.getElementById("tabla-admin-pv");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.forEach(pv => {
      tbody.innerHTML += `
        <tr>
          <td>${pv.id_punto_venta}</td>
          <td>${pv.nombre}</td>
          <td>${pv.ubicacion}</td>
          <td>${pv.tipo}</td>
          <td>
            <a class="link" href="inventario.html?pv=${pv.id_punto_venta}">Inventario</a>
            <a class="link" href="editar_punto_venta.html?id=${pv.id_punto_venta}">Editar</a>
          </td>
        </tr>
      `;
    });

  } catch (e) {
    console.error("Error cargando puntos de venta:", e);
  }
}

// ===============================
// PROTEGER RUTA ADMIN
// ===============================
function protegerAdmin() {
  const rol = localStorage.getItem("userRole");
  if (rol !== "admin") {
    window.location.href = "index.html";
  }
}

// ===============================
// INICIO AUTOMÁTICO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  protegerAdmin();
  cargarResumen();
  cargarAlertas();
  cargarPuntosVentaAdmin();
});
