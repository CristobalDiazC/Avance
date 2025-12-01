const API_BASE = "http://127.0.0.1:8000";

// Reutilizamos la función eliminarLibro existente, pero la hacemos más accesible
window.eliminarLibro = async function (libroId) {
    if (!confirm(`¿Estás seguro de que quieres eliminar el libro ID: ${libroId}? Esto también eliminará su inventario asociado.`)) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/libros/${libroId}`, {
            method: "DELETE"
        });

        if (res.status === 204) {
            alert("✅ Libro eliminado correctamente.");
            cargarLibros(); 
        } else {
            const data = await res.json();
            alert("❌ Error al eliminar: " + (data.detail || "Error desconocido."));
        }
    } catch (error) {
        console.error(error);
        alert("⚠️ Error al conectar con el servidor.");
    }
}

// NUEVA FUNCIÓN: Simulación de Modificar
window.modificarLibro = function (libroId) {
    // Aquí se debería abrir un modal similar al de agregar, pero pre-rellenado.
    alert(`⚙️ Simulación: Abrir modal para modificar el Libro ID: ${libroId}`);
    // En la implementación real, llamarías a una función para cargar datos y abrir el modal:
    // abrirModalModificarLibro(libroId);
};


// Carga y muestra la lista de libros
async function cargarLibros(q = "") {
  const tbody = document.getElementById("tabla-libros-gestion");
  if (!tbody) return; 

  tbody.innerHTML = "<tr><td colspan='5'>Cargando libros...</td></tr>";

  let url = `${API_BASE}/libros/`;
  if (q) {
    url += `?q=${encodeURIComponent(q)}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Error al obtener el catálogo de libros");
    }

    const libros = await res.json();
    tbody.innerHTML = "";

    if (!libros.length) {
      tbody.innerHTML = "<tr><td colspan='5'>No hay libros registrados</td></tr>";
      return;
    }

    libros.forEach((libro) => {
      const stockTotal = libro.stock_total;
      
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${libro.id_libro}</td>
        <td>${libro.nombre}</td>
        <td>${stockTotal}</td>
        <td>${libro.precio != null ? "$" + libro.precio : "—"}</td>
        <td>
            <a class="link" href="#" onclick="modificarLibro(${libro.id_libro}); return false;">Editar</a>
            <a class="link" href="#" onclick="eliminarLibro(${libro.id_libro}); return false;">Eliminar</a>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
    tbody.innerHTML = "<tr><td colspan='5'>Error al cargar libros</td></tr>";
  }
}

/* =========================================
   LÓGICA DEL MODAL "NUEVO LIBRO" (SIN CAMBIOS FUNCIONALES)
   ========================================= */

let modalNuevoLibro, formNuevoLibro, materiasPrimasList;

function inicializarModal() {
    modalNuevoLibro = document.getElementById("modalNuevoLibro");
    formNuevoLibro = document.getElementById("formNuevoLibro");
    materiasPrimasList = document.getElementById("materias-primas-list");

    if (formNuevoLibro) {
        formNuevoLibro.addEventListener("submit", manejarEnvioNuevoLibro);
    }
}

window.abrirModalNuevoLibro = async function () {
    if (!modalNuevoLibro) inicializarModal(); 
    
    if (modalNuevoLibro) {
        modalNuevoLibro.style.display = "flex"; 
        document.body.style.overflow = "hidden"; 
        await cargarMateriasPrimasFormulario();
    } else {
        console.error("Error: Modal no encontrado. Verifica el ID.");
        alert("Error al intentar abrir el formulario.");
    }
};

window.cerrarModalNuevoLibro = function () {
    if (modalNuevoLibro) {
        modalNuevoLibro.style.display = "none"; 
        document.body.style.overflow = "auto"; 
        formNuevoLibro.reset(); 
        if (materiasPrimasList) {
            materiasPrimasList.innerHTML = '<p class="muted small">Cargando materias primas...</p>';
        }
    }
};

async function cargarMateriasPrimasFormulario() {
    if (!materiasPrimasList) return;
    
    materiasPrimasList.innerHTML = ""; 
    const materiasPrimas = MOCK_MATERIAS_PRIMAS; 

    if (materiasPrimas.length === 0) {
        materiasPrimasList.innerHTML = '<p class="muted small">No hay materias primas disponibles.</p>';
        return;
    }

    materiasPrimas.forEach(mp => {
        const div = document.createElement("div");
        div.classList.add("form-label"); 
        div.innerHTML = `
            <span>${mp.nombre} (${mp.unidad})</span>
            <input type="number" name="mp_${mp.id}" min="0" value="0" placeholder="Cantidad" />
        `;
        materiasPrimasList.appendChild(div);
    });
}

async function manejarEnvioNuevoLibro(e) {
    e.preventDefault();

    const nombre = this.nombre.value.trim();
    const precio = parseFloat(this.precio.value);

    const materialesPrima = [];
    materiasPrimasList.querySelectorAll('input[type="number"]').forEach(input => {
        const mpId = input.name.split('_')[1]; 
        const cantidad = parseInt(input.value);
        if (mpId && cantidad > 0) {
            materialesPrima.push({ id_materia_prima: parseInt(mpId), cantidad: cantidad });
        }
    });

    if (!nombre || isNaN(precio) || precio < 0) {
        alert("Por favor, complete el nombre y un precio válido.");
        return;
    }
    if (materialesPrima.length === 0) {
        alert("Por favor, especifique al menos una materia prima necesaria.");
        return;
    }

    const nuevoLibro = {
        nombre: nombre,
        precio: precio,
        paginas_por_libro: 100, 
        materiales_prima_necesarios: materialesPrima 
    };

    try {
        const res = await fetch(`${API_BASE}/libros/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoLibro)
        });

        if (res.ok) {
            alert("✅ Libro guardado correctamente.");
            cerrarModalNuevoLibro();
            cargarLibros();
        } else {
            const errorData = await res.json();
            alert("❌ Error al guardar el libro: " + (errorData.detail || "Error desconocido."));
        }
    } catch (error) {
        console.error("Error al enviar nuevo libro:", error);
        alert("⚠️ Error de conexión al intentar guardar el libro.");
    }
}


// Cuando carga la página
document.addEventListener("DOMContentLoaded", () => {
  inicializarModal(); 
  cargarLibros(); 

  const formFiltro = document.getElementById("filterFormLibros");
  if (formFiltro) {
    formFiltro.addEventListener("submit", function (e) {
      e.preventDefault();
      const q = this.q.value.trim();
      cargarLibros(q);
    });
  }
});