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
// CARGAR ALERTAS DE STOCK BAJO (LIBROS)
// ===============================
async function cargarAlertasLibros() { // ➡️ FUNCIÓN RENOMBRADA PARA CLARIDAD
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
      // El enlace lleva a la gestión de inventario
      ul.innerHTML += `
        <li>${a.libro} — Stock: ${a.stock} (Min: ${a.stock_minimo})</li>
      `;
    });

  } catch (e) {
    console.error("Error cargando alertas de libros:", e);
  }
}

// ===============================
// CARGAR ALERTAS DE STOCK BAJO (MATERIAS PRIMAS)
// ===============================
async function cargarAlertasMP() { 
  try {
    const res = await fetch(`${API_BASE}/materias_primas/`);
    const materiasPrimas = await res.json();

    const ul = document.getElementById("alerta-materias-primas");
    ul.innerHTML = "";

    const alertasMP = materiasPrimas.filter(mp => mp.stock_actual < mp.stock_minimo);

    if (!alertasMP.length) {
      ul.innerHTML = "<li>No hay alertas de stock.</li>";
      return;
    }

    alertasMP.forEach(mp => {
      // El enlace lleva a la gestión de materias primas
      ul.innerHTML += `
        <li>${mp.nombre} — Stock: ${mp.stock_actual} (Min: ${mp.stock_minimo})</li>
      `;
    });

  } catch (e) {
    console.error("Error cargando alertas de materias primas:", e);
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
          <td>${pv.nombre}</td>
          <td>${pv.ubicacion}</td>
          <td>${pv.tipo}</td>
          <td>
            <a class="link" href="inventario.html?pv=${pv.id_punto_venta}">Inventario</a>
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
  cargarAlertasLibros(); 
  cargarAlertasMP();
  cargarPuntosVentaAdmin();
});
