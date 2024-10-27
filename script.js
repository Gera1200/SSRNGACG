let registros = [];

// Función para agregar un registro nuevo
function agregarRegistro() {
    const clave = document.getElementById('clave').value;
    const fechaIngreso = document.getElementById('fechaIngreso').value;
    const fechaEgreso = document.getElementById('fechaEgreso').value;
    const tipo = document.getElementById('tipo').value;

    registros.push({ clave, fechaIngreso, fechaEgreso, tipo });
    mostrarRegistros();
}

// Mostrar registros en la tabla
function mostrarRegistros() {
    const tablaRegistros = document.getElementById('tablaRegistros');
    tablaRegistros.innerHTML = '';
    registros.forEach((registro, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${registro.clave}</td>
            <td>${registro.fechaIngreso}</td>
            <td>${registro.fechaEgreso}</td>
            <td>${registro.tipo === '1' ? 'Activo' : 'Licencia'}</td>
            <td>
                <button onclick="eliminarRegistro(${index})">Eliminar</button>
            </td>
        `;
        tablaRegistros.appendChild(fila);
    });
}

// Eliminar registro individual
function eliminarRegistro(index) {
    registros.splice(index, 1);
    mostrarRegistros();
}

// Eliminar todos los registros
function eliminarTodo() {
    registros = [];
    mostrarRegistros();
}

// Calcular tiempo total en activo y en licencia, respetando los periodos y eliminando duplicidades
function calcular() {
    let tiempoActivo = { años: 0, meses: 0, días: 0 };
    let tiempoLicencia = { años: 0, meses: 0, días: 0 };

    // Organizar registros por fecha
    const periodos = registros.map(registro => ({
        fechaInicio: new Date(registro.fechaIngreso),
        fechaFin: new Date(registro.fechaEgreso),
        tipo: registro.tipo
    }));
    periodos.sort((a, b) => a.fechaInicio - b.fechaInicio);

    // Recorrer periodos para sumar tiempo en activo o en licencia sin duplicidad
    let periodoActivo = null;
    let periodoLicencia = null;

    periodos.forEach(periodo => {
        if (periodo.tipo === '1') { // Activo
            if (periodoActivo === null || periodo.fechaInicio > periodoActivo.fechaFin) {
                // Añadir tiempo de periodo activo y actualizar periodoActivo
                if (periodoActivo) tiempoActivo = sumarTiempo(tiempoActivo, calcularTiempo(periodoActivo.fechaInicio, periodoActivo.fechaFin));
                periodoActivo = { fechaInicio: periodo.fechaInicio, fechaFin: periodo.fechaFin };
            } else if (periodo.fechaFin > periodoActivo.fechaFin) {
                // Ampliar el periodo activo si es necesario
                periodoActivo.fechaFin = periodo.fechaFin;
            }
        } else if (periodo.tipo === '2' && periodoActivo === null) {
            // Licencia (solo si no hay periodo activo en el mismo rango)
            if (periodoLicencia === null || periodo.fechaInicio > periodoLicencia.fechaFin) {
                if (periodoLicencia) tiempoLicencia = sumarTiempo(tiempoLicencia, calcularTiempo(periodoLicencia.fechaInicio, periodoLicencia.fechaFin));
                periodoLicencia = { fechaInicio: periodo.fechaInicio, fechaFin: periodo.fechaFin };
            } else if (periodo.fechaFin > periodoLicencia.fechaFin) {
                periodoLicencia.fechaFin = periodo.fechaFin;
            }
        }
    });

    // Añadir último periodo activo o de licencia
    if (periodoActivo) tiempoActivo = sumarTiempo(tiempoActivo, calcularTiempo(periodoActivo.fechaInicio, periodoActivo.fechaFin));
    if (periodoLicencia) tiempoLicencia = sumarTiempo(tiempoLicencia, calcularTiempo(periodoLicencia.fechaInicio, periodoLicencia.fechaFin));

    mostrarResultados(tiempoActivo, tiempoLicencia);
}

// Calcula el tiempo entre dos fechas considerando años bisiestos
function calcularTiempo(fechaInicio, fechaFin) {
    let años = fechaFin.getFullYear() - fechaInicio.getFullYear();
    let meses = fechaFin.getMonth() - fechaInicio.getMonth();
    let días = fechaFin.getDate() - fechaInicio.getDate();

    if (días < 0) {
        meses--;
        días += díasDelMes(fechaInicio.getFullYear(), fechaInicio.getMonth() + 1);
    }
    if (meses < 0) {
        años--;
        meses += 12;
    }

    return { años, meses, días };
}

// Valida los días en un mes teniendo en cuenta los años bisiestos
function díasDelMes(año, mes) {
    return new Date(año, mes, 0).getDate();
}

// Suma dos periodos de tiempo
function sumarTiempo(tiempo1, tiempo2) {
    let años = tiempo1.años + tiempo2.años;
    let meses = tiempo1.meses + tiempo2.meses;
    let días = tiempo1.días + tiempo2.días;

    if (días >= 30) {
        meses += Math.floor(días / 30);
        días %= 30;
    }
    if (meses >= 12) {
        años += Math.floor(meses / 12);
        meses %= 12;
    }

    return { años, meses, días };
}

// Mostrar los resultados en la interfaz
function mostrarResultados(tiempoActivo, tiempoLicencia) {
    document.getElementById('tiempoActivo').innerText = 
        `Tiempo Activo en años, meses y días: ${tiempoActivo.años} años, ${tiempoActivo.meses} meses, ${tiempoActivo.días} días`;
    document.getElementById('tiempoLicencia').innerText = 
        `Tiempo en Licencia en años, meses y días: ${tiempoLicencia.años} años, ${tiempoLicencia.meses} meses, ${tiempoLicencia.días} días`;
}
