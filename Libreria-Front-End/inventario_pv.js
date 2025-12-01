const API = "http://127.0.0.1:8000";

const tablaPV = document.getElementById("tabla-pv");

// ============================
// Cargar inventario PV
// ============================
async function cargarInventarioPV() {
  tablaPV.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";

  try {
    const res = await fetch(`${API}/inventario-pv/`);
    const data = await res.json();

    if (!data.length) {
      tablaPV.innerHTML = "<tr><td colspan='5'>Sin resultados</td></tr>";
      return;
    }

    tablaPV.innerHTML = "";

    data.forEach(item => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.id_inventario}</td>
        <td>${item.libro}</td>
        <td>${item.punto_venta}</td>
        <td>${item.stock}</td>
        <td>
          <button class="link" onclick="abrirAjuste(${item.id_inventario})">Ajustar</button>
        </td>
      `;

      tablaPV.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    tablaPV.innerHTML = "<tr><td colspan='5'>Error al conectar</td></tr>";
  }
}

document.addEventListener("DOMContentLoaded", cargarInventarioPV);

// ============================
// Modal Crear Inventario PV
// ============================
const modalCrear = document.getElementById("modal-crear");
const selLibro = document.getElementById("sel-libro");
const selPV = document.getElementById("sel-pv");

document.getElementById("btn-nuevo-pv").addEventListener("click", abrirModalCrear);

async function abrirModalCrear() {
  modalCrear.classList.remove("hidden");
  await cargarLibros();
  await cargarPuntosVenta();
}

function cerrarModal() {
  modalCrear.classList.add("hidden");
}

// Cargar libros en select
async function cargarLibros() {
  selLibro.innerHTML = "";

  const res = await fetch(`${API}/libros/`);
  const datos = await res.json();

  datos.forEach(l => {
    selLibro.innerHTML += `<option value="${l.id_libro}">${l.nombre}</option>`;
  });
}

// Cargar puntos de venta
async function cargarPuntosVenta() {
  selPV.innerHTML = "";

  const res = await fetch(`${API}/puntos-venta/`);
  const datos = await res.json();

  datos.forEach(p => {
    selPV.innerHTML += `<option value="${p.id_punto_venta}">${p.nombre}</option>`;
  });
}

// Crear inventario PV
document.getElementById("crear-inv-btn").addEventListener("click", async () => {
  const payload = {
    id_libro: Number(selLibro.value),
    id_punto_venta: Number(selPV.value),
    stock: Number(document.getElementById("stock-inicial").value)
  };

  try {
    await fetch(`${API}/inventario-pv/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    cerrarModal();
    cargarInventarioPV();

  } catch (error) {
    alert("Error al crear inventario.");
  }
});

// ============================
// Modal Ajustar stock
// ============================
let inventarioActual = null;

const modalAjustar = document.getElementById("modal-ajustar");
const btnAjustar = document.getElementById("btn-ajustar-stock");

function abrirAjuste(id) {
  inventarioActual = id;
  modalAjustar.classList.remove("hidden");
}

function cerrarModalAjuste() {
  modalAjustar.classList.add("hidden");
  inventarioActual = null;
}

btnAjustar.addEventListener("click", async () => {
  const delta = Number(document.getElementById("ajuste-cantidad").value);

  try {
    await fetch(`${API}/inventario-pv/${inventarioActual}/ajustar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta })
    });

    cerrarModalAjuste();
    cargarInventarioPV();
  } catch (e) {
    alert("Error al ajustar stock");
  }
});
