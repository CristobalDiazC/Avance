const API_BASE = "http://127.0.0.1:8000";

// ================================
// CARGAR PUNTOS DE VENTA (CREAR)
// ================================
async function cargarPuntosVentaEnSelect() {
  const sel = document.getElementById("crear-pv");
  sel.innerHTML = `<option value="">Seleccionar...</option>`;

  try {
    const res = await fetch(`${API_BASE}/puntos-venta/`);  // FIX ✔
    const tiendas = await res.json();
    tiendas.forEach(t => {
      sel.innerHTML += `<option value="${t.id_punto_venta}">${t.nombre}</option>`;
    });
  } catch (err) {
    console.error(err);
  }
}

// ================================
// CARGAR PUNTOS DE VENTA (EDITAR)
// ================================
async function cargarPuntosVentaEnSelectEditar() {
  const sel = document.getElementById("editar-pv");
  sel.innerHTML = `<option value="">Seleccionar...</option>`;

  try {
    const res = await fetch(`${API_BASE}/puntos-venta/`); // FIX ✔
    const tiendas = await res.json();
    tiendas.forEach(t => {
      sel.innerHTML += `<option value="${t.id_punto_venta}">${t.nombre}</option>`;
    });
  } catch (err) {
    console.error(err);
  }
}

// ================================
// LISTAR USUARIOS
// ================================
async function cargarUsuarios(q = "") {
  const tbody = document.getElementById("tabla-usuarios");
  tbody.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";

  let url = `${API_BASE}/usuarios/`;
  if (q) url += `?q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    tbody.innerHTML = "";

    if (!data.length) {
      tbody.innerHTML = "<tr><td colspan='6'>No hay usuarios registrados</td></tr>";
      return;
    }

    data.forEach(user => {
      tbody.innerHTML += `
        <tr>
          <td>${user.id_usuario}</td>
          <td>${user.nombre}</td>
          <td>${user.email || "—"}</td>
          <td>${user.rol}</td>
          <td class="pv-col" data-pv="${user.punto_venta_id || ""}">Cargando...</td>
          <td>
            <a href="#" class="link" onclick="abrirModalEditar(${user.id_usuario})">Editar</a>
            <a href="#" class="link" onclick="eliminarUsuario(${user.id_usuario})">Eliminar</a>
          </td>
        </tr>
      `;
    });

    // 🔥 Llamar al reemplazo de ID → nombre
    reemplazarPuntosDeVentaPorNombre();

  } catch (err) {
    tbody.innerHTML = "<tr><td colspan='6'>Error al cargar usuarios</td></tr>";
    console.error(err);
  }
}

// ================================
// CAMBIAR ID → NOMBRE DE PUNTO DE VENTA
// ================================
async function reemplazarPuntosDeVentaPorNombre() {
  const celdas = document.querySelectorAll(".pv-col");

  if (!celdas.length) return;

  for (const celda of celdas) {
    const id = celda.dataset.pv;

    if (!id) {
      celda.innerText = "—";
      continue;
    }

    try {
      const res = await fetch(`${API_BASE}/puntos-venta/${id}`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      celda.innerText = data.nombre;

    } catch (err) {
      celda.innerText = "Error";
    }
  }
}


// ================================
// CREAR USUARIO
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const formCrear = document.getElementById("form-crear-usuario");

  formCrear.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      nombre: document.getElementById("crear-nombre").value.trim(),
      email: document.getElementById("crear-email").value.trim(),
      contrasena: document.getElementById("crear-pass").value.trim(),
      rol: document.getElementById("crear-rol").value,
      punto_venta_id:
        document.getElementById("crear-rol").value === "vendedor"
          ? parseInt(document.getElementById("crear-pv").value)
          : null
    };

    try {
      const res = await fetch(`${API_BASE}/usuarios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        alert("❌ Error al crear usuario");
        return;
      }

      alert("✅ Usuario creado correctamente");
      cerrarModal();
      cargarUsuarios();

    } catch (err) {
      alert("⚠ Error de conexión");
      console.error(err);
    }
  });

  // Buscador
  const formFiltro = document.getElementById("filterFormUsuarios");
  formFiltro.addEventListener("submit", (e) => {
    e.preventDefault();
    cargarUsuarios(formFiltro.q.value.trim());
  });

  // Cargar lista inicial
  cargarUsuarios();
});

// ================================
// EDITAR USUARIO
// ================================

async function cargarUsuarioParaEditar(id) {
  try {
    const res = await fetch(`${API_BASE}/usuarios/${id}`);
    const u = await res.json();

    document.getElementById("editar-id").value = u.id_usuario;
    document.getElementById("editar-nombre").value = u.nombre;
    document.getElementById("editar-email").value = u.email;
    document.getElementById("editar-rol").value = u.rol;
    document.getElementById("editar-pv").value = u.punto_venta_id || "";

  } catch (err) {
    alert("Error cargando usuario");
  }
}

// ================================
// EDITAR USUARIO (enviar PATCH al backend)
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const formEditar = document.getElementById("form-editar-usuario");

  formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editar-id").value;

    const payload = {
      nombre: document.getElementById("editar-nombre").value.trim(),
      email: document.getElementById("editar-email").value.trim(),
      rol: document.getElementById("editar-rol").value,
      punto_venta_id:
        document.getElementById("editar-rol").value === "vendedor"
          ? parseInt(document.getElementById("editar-pv").value)
          : null
    };

    try {
      const res = await fetch(`${API_BASE}/usuarios/${id}`, {
        method: "PATCH", // coincide con tu backend
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        alert("❌ Error al actualizar usuario");
        return;
      }

      alert("✅ Usuario actualizado correctamente");
      cerrarModalEditar();
      cargarUsuarios();

    } catch (err) {
      alert("⚠ Error de conexión");
      console.error(err);
    }
  });
});


// ================================
// ELIMINAR USUARIO
// ================================
async function eliminarUsuario(id) {
  if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

  try {
    const res = await fetch(`${API_BASE}/usuarios/${id}`, {
      method: "DELETE"
    });

    if (res.status === 204) {
      alert("🗑 Usuario eliminado");
      cargarUsuarios();
    } else {
      alert("❌ Error al eliminar usuario");
    }
  } catch (err) {
    alert("⚠ Error de conexión");
  }
}

// ================================
// FUNCIONES PARA ABRIR/CERRAR MODALES
// ================================

// Abrir modal de crear usuario
function abrirModalCrear() {
  cargarPuntosVentaEnSelect(); // cargar PV en el select
  document.getElementById("modal-crear").classList.remove("hidden");
}

// Cerrar modal de crear usuario
function cerrarModal() {
  document.getElementById("modal-crear").classList.add("hidden");
}

// Abrir modal de editar usuario
async function abrirModalEditar(id) {
  await cargarUsuarioParaEditar(id);
  cargarPuntosVentaEnSelectEditar();
  document.getElementById("modal-editar").classList.remove("hidden");
}

// Cerrar modal de editar usuario
function cerrarModalEditar() {
  document.getElementById("modal-editar").classList.add("hidden");
}
