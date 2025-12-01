console.log("Inventario User JS cargado ✔");

const API_BASE = "http://127.0.0.1:8000";

// Obtener el punto de venta asignado al usuario
const puntoVentaID = localStorage.getItem("punto_venta_id");

// Si no hay punto de venta → error
if (!puntoVentaID) {
  alert("Error: No se encontró punto de venta para este usuario.");
}


// Cargar inventario
async function cargarInventarioUser(q = "") {
  const tbody = document.getElementById("tabla-inventario-user");
  tbody.innerHTML = "<tr><td colspan='4'>Cargando...</td></tr>";

  try {
    let url = `${API_BASE}/inventario?punto_venta=${puntoVentaID}`;
    if (q) url += `&q=${encodeURIComponent(q)}`;

    const resp = await fetch(url);
    if (!resp.ok) {
      tbody.innerHTML = "<tr><td colspan='4'>Error al cargar inventario</td></tr>";
      return;
    }

    const data = await resp.json();

    if (!data.length) {
      tbody.innerHTML = "<tr><td colspan='4'>No hay stock registrado</td></tr>";
      return;
    }

    tbody.innerHTML = "";

    data.forEach(item => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.libro}</td>
        <td>${item.stock}</td>
        <td>${item.stock_minimo}</td>
        <td>
          <button class="btn-sm primary" onclick="vender(${item.id_inventario}, ${item.stock})">
            Vender (-1)
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='4'>Error de conexión</td></tr>";
  }
}


// Registrar una venta (restar 1 stock)
async function vender(idInventario, stockActual) {
  if (stockActual <= 0) {
    alert("No queda stock disponible.");
    return;
  }

  try {
    const resp = await fetch(`${API_BASE}/inventario/${idInventario}/vender`, {
      method: "PATCH",
    });

    if (!resp.ok) {
      alert("Error al registrar la venta.");
      return;
    }

    alert("Venta registrada. Stock actualizado.");
    cargarInventarioUser();

  } catch (error) {
    console.error(error);
    alert("Error al conectar con el servidor.");
  }
}


// Filtro
document.getElementById("filterFormUser").addEventListener("submit", e => {
  e.preventDefault();
  const q = e.target.q.value.trim();
  cargarInventarioUser(q);
});


// Al cargar
document.addEventListener("DOMContentLoaded", () => {
  cargarInventarioUser();
});
