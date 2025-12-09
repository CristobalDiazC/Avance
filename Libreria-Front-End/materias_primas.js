const API_BASE = "http://127.0.0.1:8000";

// ================================
// CARGAR MATERIAS PRIMAS
// ================================
async function cargarMateriasPrimas(q = "") {
  const tbody = document.getElementById("tabla-materias-primas");
  tbody.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";

  let url = `${API_BASE}/materias_primas/`;
  if (q) url += `?q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url);
    const items = await res.json();
    mostrarMateriasPrimas(items, tbody);
  } catch (err) {
    console.error("Error al cargar materias primas", err);
    tbody.innerHTML = "<tr><td colspan='5'>Error al cargar datos</td></tr>";
  }
}

// ================================
// MOSTRAR EN TABLA
// ================================
function mostrarMateriasPrimas(items, tbody) {
  tbody.innerHTML = "";

  if (!items.length) {
    tbody.innerHTML = "<tr><td colspan='5'>No hay materias primas registradas</td></tr>";
    return;
  }

  items.forEach((mp, index) => {   // ← index = ID visual
    const idVisual = index + 1;    // ← 1, 2, 3...

    const stockColor = mp.stock_actual < mp.stock_minimo
      ? 'style="color: #dc2626; font-weight: 600;"'
      : '';

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idVisual}</td>                     <!-- ID VISUAL -->
      <td>${mp.nombre}</td>
      <td ${stockColor}>${mp.stock_actual.toLocaleString()}</td>
      <td>${mp.stock_minimo.toLocaleString()}</td>
      <td>
        <a class="link" href="#" onclick="abrirModalAjuste(${mp.id_mp})">Editar</a>
        <a class="link" href="#" onclick="eliminarMateriaPrima(${mp.id_mp})">Eliminar</a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}


// ================================
// MODAL: REGISTRAR ENTRADA
// ================================
function abrirModalEntrada() {
  const modal = document.getElementById("modal-entrada");
  modal.classList.remove("hidden");

  fetch(`${API_BASE}/materias_primas/`)
    .then(res => res.json())
    .then(items => {
      const sel = document.getElementById("entrada-mp");
      sel.innerHTML = "";
      items.forEach(mp => {
        sel.innerHTML += `<option value="${mp.id_mp}">${mp.nombre}</option>`;
      });
    })
    .catch(err => {
      console.error("Error cargando materias primas", err);
    });
}

function cerrarModalEntrada() {
  document.getElementById("modal-entrada").classList.add("hidden");
}

document.getElementById("form-entrada").addEventListener("submit", async (e) => {
  e.preventDefault();

  const mpId = document.getElementById("entrada-mp").value;
  const cantidad = parseInt(document.getElementById("entrada-cantidad").value);
  const observaciones = document.getElementById("entrada-observaciones").value;

  if (isNaN(cantidad) || cantidad <= 0) {
    alert("⚠ La cantidad debe ser un número positivo");
    return;
  }

  const payload = {
    cantidad,
    usuario_id: 1, // Reemplazar con el ID del usuario logueado
    observaciones
  };

  try {
    const res = await fetch(`${API_BASE}/materias_primas/${mpId}/entrada`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      alert("❌ Error al registrar entrada");
      return;
    }

    alert("✅ Entrada registrada");
    cerrarModalEntrada();
    cargarMateriasPrimas();
  } catch (err) {
    alert("⚠ Error de conexión");
    console.error(err);
  }
});

// ================================
// MODAL: AJUSTAR MATERIA PRIMA
// ================================
function abrirModalAjuste(id_mp) {
  fetch(`${API_BASE}/materias_primas/${id_mp}`)
    .then(res => res.json())
    .then(mp => {
      document.getElementById("ajuste-id").value = mp.id_mp;
      document.getElementById("ajuste-nombre").value = mp.nombre;
      document.getElementById("ajuste-unidad").value = mp.unidad;
      document.getElementById("ajuste-minimo").value = mp.stock_minimo;

      document.getElementById("modal-ajuste").classList.remove("hidden");
    })
    .catch(err => {
      console.error("Error cargando materia prima", err);
      alert("❌ No se pudo cargar la materia prima");
    });
}

function cerrarModalAjuste() {
  document.getElementById("modal-ajuste").classList.add("hidden");
}

document.getElementById("form-ajuste").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("ajuste-id").value;
  const payload = {
    nombre: document.getElementById("ajuste-nombre").value,
    unidad: document.getElementById("ajuste-unidad").value,
    stock_minimo: parseInt(document.getElementById("ajuste-minimo").value)
  };

  try {
    const res = await fetch(`${API_BASE}/materias_primas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      alert("❌ Error al editar materia prima");
      return;
    }

    alert("✅ Materia prima editada correctamente");
    cerrarModalAjuste();
    cargarMateriasPrimas();
  } catch (err) {
    alert("⚠ Error de conexión");
    console.error(err);
  }
});

// ================================
// MODAL: CREAR MATERIA PRIMA
// ================================
function abrirModalCrearMP() {
  document.getElementById("modal-crear-mp").classList.remove("hidden");
}

function cerrarModalCrearMP() {
  document.getElementById("modal-crear-mp").classList.add("hidden");
}

document.getElementById("form-crear-mp").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nombre: document.getElementById("crear-nombre").value.trim(),
    unidad: document.getElementById("crear-unidad").value.trim(),
    stock_minimo: parseInt(document.getElementById("crear-minimo").value),
    stock_actual: parseInt(document.getElementById("crear-stock").value)
  };

  try {
    const res = await fetch(`${API_BASE}/materias_primas/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      alert("❌ Error al crear materia prima");
      return;
    }

    alert("✅ Materia prima creada");
    cerrarModalCrearMP();
    cargarMateriasPrimas();
  } catch (err) {
    alert("⚠ Error de conexión");
    console.error(err);
  }
});

// ================================
// ELIMINAR MATERIA PRIMA
// ================================
async function eliminarMateriaPrima(id) {
  if (!confirm("¿Seguro que deseas eliminar esta materia prima?")) return;

  try {
    const res = await fetch(`${API_BASE}/materias_primas/${id}`, {
      method: "DELETE"
    });

    if (res.status === 204) {
      alert("🗑 Materia prima eliminada");
      cargarMateriasPrimas();
    } else {
      alert("❌ Error al eliminar");
    }
  } catch (err) {
    alert("⚠ Error de conexión");
    console.error(err);
  }
}

// ================================
// FILTRO Y CARGA INICIAL
// ================================
document.addEventListener("DOMContentLoaded", () => {
  cargarMateriasPrimas();

  const formFiltro = document.getElementById("filterFormMP");
  if (formFiltro) {
    formFiltro.addEventListener("submit", function (e) {
      e.preventDefault();
      const q = this.q.value.trim();
      cargarMateriasPrimas(q);
    });
  }
});

function cerrarModalEntrada() {
  document.getElementById("modal-entrada").classList.add("hidden");
  document.getElementById("form-entrada").reset(); // ← Limpia campos
}
