const API_BASE = "http://127.0.0.1:8000";
const selectPV = document.getElementById("selectPV");

// PANEL Y MODAL
const panelAgregarPV = document.getElementById("panelAgregarPV");
const modal = document.getElementById("modalAgregar");
const libroSelect = document.getElementById("libroSelect");

// ===================================================
// CARGAR PUNTOS DE VENTA
// ===================================================
async function cargarPuntosVenta() {
  const res = await fetch(`${API_BASE}/puntos-venta/`);
  const pvs = await res.json();

  pvs.forEach((pv) => {
    selectPV.innerHTML += `<option value="${pv.id_punto_venta}">${pv.nombre}</option>`;
  });
}

// ===================================================
// CARGAR INVENTARIO (GLOBAL O POR PV)
// ===================================================
async function cargarInventario(q = "") {
  const tbody = document.getElementById("tabla-libros");
  tbody.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";

  const pvId = selectPV.value;
  let url = "";

  if (pvId) {
    // ⚡ Inventario solo del punto de venta seleccionado
    url = `${API_BASE}/inventario-pv/por-pv/${pvId}`;
    panelAgregarPV.style.display = "block";

  } else {
    // ⚡ Inventario global (TODOS LOS PUNTOS DE VENTA)
    url = `${API_BASE}/inventario-pv/`;
    panelAgregarPV.style.display = "none";
  }

  const res = await fetch(url);
  const items = await res.json();

  tbody.innerHTML = "";

  if (!items.length) {
    tbody.innerHTML = "<tr><td colspan='6'>Sin resultados</td></tr>";
    return;
  }

  items.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.id_inventario}</td>
      <td>${item.libro || item.nombre}</td>
      <td>${item.punto_venta || (pvId ? "Este PV" : "Global")}</td>
      <td>${item.stock}</td>
      <td>${item.stock_minimo || "-"}</td>
      <td>
        <a class="link" href="#" onclick="venderLibro(${item.id_inventario})">Vender</a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}


// ===================================================
// MODAL — ABRIR
// ===================================================
async function abrirModalAgregar() {
  const res = await fetch(`${API_BASE}/libros/`);
  const libros = await res.json();

  libroSelect.innerHTML = "";
  libros.forEach((l) => {
    libroSelect.innerHTML += `<option value="${l.id_libro}">${l.nombre}</option>`;
  });

  modal.style.display = "flex";
}

function cerrarModal() {
  modal.style.display = "none";
}

// ===================================================
// CONFIRMAR AGREGAR INVENTARIO PV
// ===================================================
async function confirmarAgregar() {
  const id_punto_venta = parseInt(selectPV.value, 10);
  const id_libro = parseInt(libroSelect.value, 10);
  const stock = parseInt(document.getElementById("stockInicial").value, 10);
  const stock_minimo = parseInt(document.getElementById("stockMinimo").value, 10);

  const payload = { 
    id_libro, 
    id_punto_venta, 
    stock 
  };


  const res = await fetch(`${API_BASE}/inventario-pv/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const data = await res.json();
    alert("❌ " + (data.detail || "Error al agregar libro."));
    return;
  }

  alert("✅ Libro agregado correctamente.");
  cerrarModal();
  cargarInventario();
}

// ===================================================
// VENDER LIBRO
// ===================================================
async function venderLibro(idInventario) {
  const cant = prompt("Cantidad a vender:");
  if (!cant) return;

  const cantidad = parseInt(cant, 10);
  if (isNaN(cantidad) || cantidad <= 0) return;

  const usuario_id = parseInt(localStorage.getItem("userId") || "1", 10);

  const movimiento = {
    inventario_id: idInventario,
    tipo: "venta",
    cantidad,
    usuario_id,
    fecha_movimiento: new Date().toISOString()
  };

  const res = await fetch(`${API_BASE}/movimientos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movimiento)
  });

  if (!res.ok) {
    alert("❌ Error registrando venta.");
    return;
  }

  alert("✅ Venta registrada.");
  cargarInventario();
}

// ===================================================
// INICIALIZAR
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
  cargarPuntosVenta();
  cargarInventario();

  selectPV.addEventListener("change", () => cargarInventario());

  const formFiltro = document.getElementById("filterForm");
  formFiltro.addEventListener("submit", (e) => {
    e.preventDefault();
    cargarInventario(formFiltro.q.value.trim());
  });
});