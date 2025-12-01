console.log("JS CARGADO OK");

// URL del backend (FastAPI)
const API_PV = "http://127.0.0.1:8000/puntos-venta/";

// Referencias al formulario y botón
const formPV = document.getElementById("formPV");
const btnCancelarPV = document.getElementById("btnCancelarPV");

// ACEPTAR
formPV.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = formPV.querySelector("[name='nombre']").value.trim();
  const ubicacion = formPV.querySelector("[name='ubicacion']").value.trim();
  const tipo = formPV.querySelector("[name='tipo']").value;

  if (!nombre || !ubicacion || !tipo) {
    alert("Debes completar todos los campos.");
    return;
  }

  const payload = { nombre, ubicacion, tipo };

  try {
    const resp = await fetch(API_PV, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error("Error backend:", err);
      alert("❌ Error al crear el punto de venta.");
      return;
    }

    alert("✅ Punto de venta creado correctamente.");
    window.location.href = "puntos_venta.html";

  } catch (error) {
    console.error(error);
    alert("⚠ Error al conectar con el servidor.");
  }
});

// CANCELAR
btnCancelarPV.addEventListener("click", () => {
  window.location.href = "puntos_venta.html";
});
