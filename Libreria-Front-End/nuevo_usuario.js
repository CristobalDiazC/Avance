const API = "http://127.0.0.1:8000";

// Cargar puntos de venta
async function cargarPuntosVenta() {
  const sel = document.getElementById("selectPV");
  sel.innerHTML = `<option value="">Seleccionar...</option>`;

  const res = await fetch(`${API}/puntos-venta/`);
  const data = await res.json();

  data.forEach(pv => {
    sel.innerHTML += `<option value="${pv.id_punto_venta}">${pv.nombre}</option>`;
  });
}

// Enviar usuario
document.getElementById("formNuevoUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;

  const payload = {
    nombre: form.nombre.value,
    email: form.email.value,
    contrasena: form.contrasena.value,
    rol: form.rol.value,
    punto_venta_id: form.punto_venta_id.value || null
  };

  const res = await fetch(`${API}/usuarios/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await res.json();

  if (!res.ok) {
    alert("❌ " + (result.detail || "Error al crear usuario"));
    return;
  }

  alert("✅ Usuario creado correctamente");
  window.location.href = "crear_usuario.html";
});

// Al cargar
document.addEventListener("DOMContentLoaded", () => {
  cargarPuntosVenta();
});
