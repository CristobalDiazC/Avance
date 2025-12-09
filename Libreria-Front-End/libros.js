const API_BASE = "http://127.0.0.1:8000";

/* ============================================================
   ELIMINAR LIBRO (IGUAL QUE TU VERSIÓN)
============================================================ */
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
};

/* ============================================================
   *** NUEVA LÓGICA REAL DE MODIFICAR LIBRO ***
============================================================ */

// 🟦 1. Llamada desde la tabla
window.modificarLibro = async function (libroId) {
    try {
        const res = await fetch(`${API_BASE}/libros/${libroId}`);
        if (!res.ok) throw new Error("No se pudo obtener el libro");

        const libro = await res.json();
        abrirModalEditarLibro(libro);
    } catch (err) {
        console.error(err);
        alert("Error al cargar los datos del libro.");
    }
};

// 🟦 2. Abrir modal con datos cargados
function abrirModalEditarLibro(libro) {
    document.getElementById("editar-libro-id").value = libro.id_libro;
    document.getElementById("editar-libro-nombre").value = libro.nombre;
    document.getElementById("editar-libro-precio").value = libro.precio;

    const modal = document.getElementById("modal-editar-libro");
    modal.classList.remove("hidden");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

// PATCH corregido
document.getElementById("form-editar-libro").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("editar-libro-id").value;

    const data = {
        nombre: document.getElementById("editar-libro-nombre").value,
        precio: parseInt(document.getElementById("editar-libro-precio").value)
    };

    try {
        const res = await fetch(`${API_BASE}/libros/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Error desconocido.");
        }

        alert("✔ Libro actualizado correctamente.");
        cerrarModalEditarLibro();
        cargarLibros();

    } catch (err) {
        console.error(err);
        alert("❌ Error al actualizar el libro: " + err.message);
    }
});

// 🟦 3. Cerrar modal
window.cerrarModalEditarLibro = function () {
    const modal = document.getElementById("modal-editar-libro");
    if (!modal) return;

    modal.classList.add("hidden");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
};


/* ============================================================
   CARGAR LIBROS (SIN CAMBIOS IMPORTANTES)
============================================================ */
async function cargarLibros(q = "") {
    const tbody = document.getElementById("tabla-libros-gestion");
    if (!tbody) return;

    tbody.innerHTML = "<tr><td colspan='5'>Cargando libros...</td></tr>";

    let url = `${API_BASE}/libros/`;
    if (q) url += `?q=${encodeURIComponent(q)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al obtener los libros");

        const libros = await res.json();
        tbody.innerHTML = "";

        if (!libros.length) {
            tbody.innerHTML = "<tr><td colspan='5'>No hay libros registrados</td></tr>";
            return;
        }

        libros.forEach((libro, index) => {
            const idVisual = index + 1;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${idVisual}</td>
                <td>${libro.nombre}</td>
                <td>${libro.stock_total ?? 0}</td>
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

/* ============================================================
   MODAL "NUEVO LIBRO" – SIN CAMBIOS
============================================================ */
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

    modalNuevoLibro.style.display = "flex";
    document.body.style.overflow = "hidden";
    await cargarMateriasPrimasFormulario();
};

window.cerrarModalNuevoLibro = function () {
    modalNuevoLibro.style.display = "none";
    document.body.style.overflow = "auto";
    formNuevoLibro.reset();
    materiasPrimasList.innerHTML = '<p class="muted small">Cargando materias primas...</p>';
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
    materiasPrimasList.querySelectorAll("input[type='number']").forEach(input => {
        const mpId = input.name.split("_")[1];
        const cantidad = parseInt(input.value);
        if (mpId && cantidad > 0) {
            materialesPrima.push({
                id_materia_prima: parseInt(mpId),
                cantidad: cantidad
            });
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
        nombre,
        precio,
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

/* ============================================================
   INICIALIZACIÓN
============================================================ */
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
