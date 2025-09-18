// Constante donde quedará el resultado final (arreglo de objetos)
let TRANSFORMADOS = [];
let DATOS_FILTRADOS = [];

const fileInput = document.getElementById('fileInput');
const filtroNombre = document.getElementById('filtroNombre');
const filtroAnio = document.getElementById('filtroAnio');
const tablaContainer = document.getElementById('tablaContainer');
//const tablaResumenNombres = document.getElementById('tablaResumenNombres');
const calendarioContainer = document.getElementById('calendarioContainer');
const tablaAgrupadaContainer = document.getElementById('tablaAgrupadaContainer');

// Paleta de colores para los motivos
const coloresMotivos = [
    '#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', 
    '#00bcd4', '#ffeb3b', '#795548', '#607d8b', '#f44336',
    '#3f51b5', '#009688', '#8bc34a', '#ff5722', '#673ab7'
];

// Establecer fecha de actualización
document.getElementById('ultimaActualizacion').textContent = new Date().toLocaleDateString('es-ES');
//Leer el archivo personal_v4.txt
            fetch('personal_V4.txt')
                .then(response => response.text())
                .then(data => {
                    // Aquí puedes procesar los datos del archivo .txt
                    // Por ejemplo, puedes llamar a la función procesarArchivo() con los datos del archivo
                    procesarArchivo(data);
                })
                .catch(error => {
                    console.error('Error al cargar el archivo:', error);
                });

async function procesarArchivo() {
    const file = fileInput.files?.item(0);
    if (!file) return;

    try {
        const text = await file.text();
        
        // Procesa el contenido
        TRANSFORMADOS = parseAndTransform(text);
        
        // Inicializar con todos los datos
        DATOS_FILTRADOS = [...TRANSFORMADOS];
        
        // Actualizar interfaz
        actualizarFiltros();
        mostrarSinSeleccion(); // Mostrar vacío al inicio
        
        console.log('Procesamiento completado:', TRANSFORMADOS.length, 'filas transformadas');
        
    } catch (err) {
        console.error('Error al procesar archivo:', err);
        alert('Error al procesar el archivo: ' + err.message);
    }
}

function actualizarFiltros() {
    // Limpiar filtros existentes
    filtroNombre.innerHTML = '';
    filtroAnio.innerHTML = '';
    
    // Agregar opción por defecto para nombre
    const optionSeleccionaNombre = document.createElement('option');
    optionSeleccionaNombre.value = '';
    optionSeleccionaNombre.textContent = 'Selecciona un nombre';
    optionSeleccionaNombre.selected = true;
    filtroNombre.appendChild(optionSeleccionaNombre);
    
    // Obtener año actual para el filtro de año
    const añoActual = new Date().getFullYear().toString();
    const optionAñoActual = document.createElement('option');
    optionAñoActual.value = añoActual;
    optionAñoActual.textContent = añoActual;
    optionAñoActual.selected = true;
    filtroAnio.appendChild(optionAñoActual);
    
    // Obtener nombres únicos
    const nombresUnicos = [...new Set(TRANSFORMADOS.map(item => item.nombre).filter(Boolean))].sort();
    nombresUnicos.forEach(nombre => {
        const option = document.createElement('option');
        option.value = nombre;
        option.textContent = nombre;
        filtroNombre.appendChild(option);
    });
    
    // Obtener años únicos y agregarlos al filtro (excepto el año actual que ya está)
    const aniosUnicos = [...new Set(TRANSFORMADOS.map(item => item.añoefectivo).filter(Boolean))].sort().reverse();
    aniosUnicos.forEach(anio => {
        if (anio !== añoActual) {
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            filtroAnio.appendChild(option);
        }
    });
    
    // Agregar event listeners a los filtros
    filtroNombre.addEventListener('change', filtrarDatos);
    filtroAnio.addEventListener('change', filtrarDatos);
}

function filtrarDatos() {
    const nombreSeleccionado = filtroNombre.value;
    const anioSeleccionado = filtroAnio.value;
    
    // Si no se ha seleccionado un nombre, no mostrar nada
    if (!nombreSeleccionado) {
        mostrarSinSeleccion();
        return;
    }
    
    DATOS_FILTRADOS = TRANSFORMADOS.filter(item => {
        const coincideNombre = item.nombre === nombreSeleccionado;
        const coincideAnio = item.añoefectivo === anioSeleccionado;
        return coincideNombre && coincideAnio;
    });
    
    actualizarTablas();
    actualizarCalendario();
}

function mostrarSinSeleccion() {
    tablaAgrupadaContainer.innerHTML = '<p class="sin-seleccion">Seleccione un nombre y año para ver los datos agrupados.</p>';
    calendarioContainer.innerHTML = '<p class="sin-seleccion">Seleccione un nombre y año para ver el calendario.</p>';
    tablaContainer.innerHTML = '<p class="sin-seleccion">Seleccione un nombre y año para ver los datos.</p>';
    
    // Ocultar la tabla de resumen de nombres
    //tablaResumenNombres.style.display = 'none';
    //tablaResumenNombres.innerHTML = '';
}

function actualizarTablas() {
    actualizarTablaPrincipal();
    actualizarTablaAgrupada();
}

function actualizarTablaPrincipal() {
    if (DATOS_FILTRADOS.length === 0) {
        tablaContainer.innerHTML = '<p class="sin-seleccion">No hay datos para mostrar con los filtros seleccionados.</p>';
        return;
    }
    
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Crear encabezado
    const headerRow = document.createElement('tr');
    ['Nombre', 'Fecha', 'Motivo', 'Año Efectivo'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    
    // Crear filas de datos
    DATOS_FILTRADOS.forEach(item => {
        const row = document.createElement('tr');
        
        [item.nombre, item.fecha, item.motivo, item.añoefectivo].forEach(value => {
            const td = document.createElement('td');
            td.textContent = value || '';
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    tablaContainer.innerHTML = '';
    tablaContainer.appendChild(table);
    
    // Añadir enlace de retorno al inicio
    const retornoLink = document.createElement('a');
    retornoLink.href = '#top';
    retornoLink.className = 'retorno-inicio';
    retornoLink.textContent = '↑ Volver al inicio';
    tablaContainer.appendChild(retornoLink);
}

function actualizarTablaAgrupada() {
    if (DATOS_FILTRADOS.length === 0) {
        tablaAgrupadaContainer.innerHTML = '<p class="sin-seleccion">No hay datos para mostrar con los filtros seleccionados.</p>';
        return;
    }
    
    // Agrupar por nombre
    const agrupadoPorNombre = {};
    DATOS_FILTRADOS.forEach(item => {
        if (!agrupadoPorNombre[item.nombre]) {
            agrupadoPorNombre[item.nombre] = [];
        }
        agrupadoPorNombre[item.nombre].push(item);
    });
    
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Encabezado
    const headerRow = document.createElement('tr');
    ['Nombre', 'Detalle de Ausencias'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    
    // Variables para el total general
    let totalGeneral = 0;
    
    // Filas de datos
    Object.entries(agrupadoPorNombre).sort((a, b) => a[0].localeCompare(b[0])).forEach(([nombre, registros]) => {
        // Fila con el nombre
        const nombreRow = document.createElement('tr');
        nombreRow.className = 'fila-nombre';
        
        const tdNombre = document.createElement('td');
        tdNombre.textContent = nombre;
        tdNombre.colSpan = 1;
        
        const tdEspacio = document.createElement('td');
        
        nombreRow.appendChild(tdNombre);
        nombreRow.appendChild(tdEspacio);
        tbody.appendChild(nombreRow);
        
        // Ordenar registros por fecha
        registros.sort((a, b) => a.fecha.localeCompare(b.fecha));
        
        if (registros.length > 0) {
            // Agrupar por motivo y luego por fechas contiguas (considerando festivos)
            const gruposPorMotivo = agruparPorMotivoYFechasContiguas(registros);
            let alternarColor = false;
            let totalPorNombre = 0;
            
            gruposPorMotivo.forEach(grupo => {
                const grupoRow = document.createElement('tr');
                grupoRow.className = alternarColor ? 'fila-grupo-alternativa' : 'fila-grupo';
                alternarColor = !alternarColor;
                
                const tdEspacio = document.createElement('td');
                
                const tdDetalle = document.createElement('td');
                
                const grupoDiv = document.createElement('div');
                grupoDiv.className = 'grupo-fechas';
                
                const rangoSpan = document.createElement('span');
                rangoSpan.className = 'rango-fechas';
                
                if (grupo.fechas.length === 1) {
                    rangoSpan.textContent = `${formatearFecha(grupo.fechas[0])}`;
                } else {
                    rangoSpan.textContent = `${formatearFecha(grupo.fechas[0])} - ${formatearFecha(grupo.fechas[grupo.fechas.length - 1])}`;
                }
                
                const motivoSpan = document.createElement('span');
                motivoSpan.className = 'motivo-grupo';
                motivoSpan.textContent = grupo.motivo || 'No especificado';
                
                const diasSpan = document.createElement('span');
                diasSpan.className = 'dias-count';
                diasSpan.textContent = `${grupo.fechas.length} día${grupo.fechas.length > 1 ? 's' : ''}`;
                
                grupoDiv.appendChild(rangoSpan);
                grupoDiv.appendChild(motivoSpan);
                grupoDiv.appendChild(diasSpan);
                
                tdDetalle.appendChild(grupoDiv);
                
                grupoRow.appendChild(tdEspacio);
                grupoRow.appendChild(tdDetalle);
                tbody.appendChild(grupoRow);
                
                totalPorNombre += grupo.fechas.length;
            });
            
            // Fila de total por nombre
            const totalRow = document.createElement('tr');
            totalRow.className = 'fila-total';
            
            const tdTotalLabel = document.createElement('td');
            tdTotalLabel.textContent = `Total: ${nombre}`;
            tdTotalLabel.style.fontWeight = 'bold';
            
            const tdTotalValue = document.createElement('td');
            tdTotalValue.textContent = `${totalPorNombre} día${totalPorNombre > 1 ? 's' : ''}`;
            tdTotalValue.style.fontWeight = 'bold';
            
            totalRow.appendChild(tdTotalLabel);
            totalRow.appendChild(tdTotalValue);
            tbody.appendChild(totalRow);
            
            totalGeneral += totalPorNombre;
        }
    });
    
    // Fila de total general
    if (Object.keys(agrupadoPorNombre).length > 1) {
        const totalGeneralRow = document.createElement('tr');
        totalGeneralRow.className = 'fila-total';
        totalGeneralRow.style.backgroundColor = '#a5d6a7';
        
        const tdTotalGeneralLabel = document.createElement('td');
        tdTotalGeneralLabel.textContent = 'TOTAL GENERAL';
        tdTotalGeneralLabel.style.fontWeight = 'bold';
        
        const tdTotalGeneralValue = document.createElement('td');
        tdTotalGeneralValue.textContent = `${totalGeneral} día${totalGeneral > 1 ? 's' : ''}`;
        tdTotalGeneralValue.style.fontWeight = 'bold';
        
        totalGeneralRow.appendChild(tdTotalGeneralLabel);
        totalGeneralRow.appendChild(tdTotalGeneralValue);
        tbody.appendChild(totalGeneralRow);
    }
    
    table.appendChild(thead);
    table.appendChild(tbody);
    tablaAgrupadaContainer.innerHTML = '';
    tablaAgrupadaContainer.appendChild(table);
    
    // Añadir enlace de retorno al inicio
    const retornoLink = document.createElement('a');
    retornoLink.href = '#top';
    retornoLink.className = 'retorno-inicio';
    retornoLink.textContent = '↑ Volver al inicio';
    tablaAgrupadaContainer.appendChild(retornoLink);
}

function actualizarCalendario() {
    if (DATOS_FILTRADOS.length === 0) {
        calendarioContainer.innerHTML = '<p class="sin-seleccion">No hay datos para mostrar con los filtros seleccionados.</p>';
        return;
    }
    
    // Obtener todos los motivos únicos
    const motivosUnicos = [...new Set(DATOS_FILTRADOS.map(item => item.motivo).filter(Boolean))].sort();
    
    // Crear mapeo de motivos a colores
    const motivoColorMap = {};
    motivosUnicos.forEach((motivo, index) => {
        motivoColorMap[motivo] = coloresMotivos[index % coloresMotivos.length];
    });
    
    // Crear leyenda de motivos
    const leyenda = document.createElement('div');
    leyenda.className = 'leyenda-motivos';
    
    motivosUnicos.forEach(motivo => {
        const leyendaItem = document.createElement('div');
        leyendaItem.className = 'leyenda-item';
        
        const colorBox = document.createElement('div');
        colorBox.className = 'leyenda-color';
        colorBox.style.backgroundColor = motivoColorMap[motivo];
        
        const texto = document.createElement('span');
        texto.className = 'leyenda-texto';
        texto.textContent = motivo;
        
        leyendaItem.appendChild(colorBox);
        leyendaItem.appendChild(texto);
        leyenda.appendChild(leyendaItem);
    });
    
    // Agrupar fechas por mes y año
    const eventosPorMes = {};
    
    DATOS_FILTRADOS.forEach(item => {
        if (!item.fecha) return;
        
        const fecha = new Date(item.fecha);
        const año = fecha.getFullYear();
        const mes = fecha.getMonth();
        const dia = fecha.getDate();
        
        const claveMes = `${año}-${mes}`;
        
        if (!eventosPorMes[claveMes]) {
            eventosPorMes[claveMes] = {
                año: año,
                mes: mes,
                dias: {}
            };
        }
        
        if (!eventosPorMes[claveMes].dias[dia]) {
            eventosPorMes[claveMes].dias[dia] = [];
        }
        
        eventosPorMes[claveMes].dias[dia].push({
            motivo: item.motivo,
            color: motivoColorMap[item.motivo] || '#cccccc'
        });
    });
    
    // Crear contenedor principal del calendario
    const calendarioVisual = document.createElement('div');
    calendarioVisual.className = 'calendario-visual';
    
    // Añadir leyenda
    calendarioVisual.appendChild(leyenda);
    
    // Crear contenedor para meses
    const mesesContainer = document.createElement('div');
    mesesContainer.className = 'calendario-meses';
    
    // Obtener meses con eventos y ordenarlos
    const mesesConEventos = Object.values(eventosPorMes).sort((a, b) => {
        if (a.año !== b.año) return a.año - b.año;
        return a.mes - b.mes;
    });
    
    // Crear un calendario para cada mes con eventos
    mesesConEventos.forEach(mesInfo => {
        const mesDiv = document.createElement('div');
        mesDiv.className = 'mes-calendario';
        
        const mesTitulo = document.createElement('h3');
        mesTitulo.className = 'mes-titulo';
        mesTitulo.textContent = `${obtenerNombreMes(mesInfo.mes)} ${mesInfo.año}`;
        
        const diasSemana = document.createElement('div');
        diasSemana.className = 'dias-semana';
        
        // Días de la semana (Lunes a Domingo)
        ['L', 'M', 'X', 'J', 'V', 'S', 'D'].forEach(dia => {
            const diaSemana = document.createElement('div');
            diaSemana.className = 'dia-semana';
            diaSemana.textContent = dia;
            diasSemana.appendChild(diaSemana);
        });
        
        const diasMes = document.createElement('div');
        diasMes.className = 'dias-mes';
        
        // Obtener primer día del mes y último día
        const primerDia = new Date(mesInfo.año, mesInfo.mes, 1);
        const ultimoDia = new Date(mesInfo.año, mesInfo.mes + 1, 0);
        
        // Ajustar para que la semana empiece en lunes (0=Lunes, 6=Domingo)
        let diaInicio = primerDia.getDay() - 1;
        if (diaInicio < 0) diaInicio = 6; // Domingo
        
        // Espacios vacíos para los días antes del primer día del mes
        for (let i = 0; i < diaInicio; i++) {
            const diaVacio = document.createElement('div');
            diaVacio.className = 'dia-calendario vacio';
            diasMes.appendChild(diaVacio);
        }
        
        // Crear los días del mes
        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
            const diaElement = document.createElement('div');
            diaElement.className = 'dia-calendario';
            
            // Verificar si es fin de semana
            const fechaActual = new Date(mesInfo.año, mesInfo.mes, dia);
            const esFinDeSemana = fechaActual.getDay() === 0 || fechaActual.getDay() === 6;
            
            // Verificar si es festivo
            const esFestivo = esDiaFestivo(fechaActual);
            
            if (esFinDeSemana) {
                diaElement.classList.add('finde');
            }
            
            if (esFestivo) {
                diaElement.classList.add('festivo');
            }
            
            // Verificar si hay eventos en este día
            if (mesInfo.dias[dia]) {
                diaElement.classList.add('con-evento');
                
                // Usar el color del primer motivo para este día
                const primerMotivo = mesInfo.dias[dia][0];
                diaElement.style.backgroundColor = primerMotivo.color;
                diaElement.style.color = 'white';
                
                // Tooltip con información
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                
                // Agrupar motivos para este día
                const motivosDia = {};
                mesInfo.dias[dia].forEach(evento => {
                    if (!motivosDia[evento.motivo]) {
                        motivosDia[evento.motivo] = 0;
                    }
                    motivosDia[evento.motivo]++;
                });
                
                let tooltipText = `Día ${dia}`;
                Object.entries(motivosDia).forEach(([motivo, count]) => {
                    tooltipText += `\n${motivo}${count > 1 ? ` (${count})` : ''}`;
                });
                
                tooltip.textContent = tooltipText;
                diaElement.appendChild(tooltip);
            }
            
            diaElement.textContent = dia;
            diasMes.appendChild(diaElement);
        }
        
        mesDiv.appendChild(mesTitulo);
        mesDiv.appendChild(diasSemana);
        mesDiv.appendChild(diasMes);
        mesesContainer.appendChild(mesDiv);
    });
    
    calendarioVisual.appendChild(mesesContainer);
    
    // Limpiar contenedor y agregar elementos
    calendarioContainer.innerHTML = '';
    calendarioContainer.appendChild(calendarioVisual);
    
    // Añadir enlace de retorno al inicio
    const retornoLink = document.createElement('a');
    retornoLink.href = '#top';
    retornoLink.className = 'retorno-inicio';
    retornoLink.textContent = '↑ Volver al inicio';
    calendarioContainer.appendChild(retornoLink);
}

// -----------------------------
// FUNCIONES AUXILIARES
// -----------------------------

function obtenerNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes];
}

function esDiaFestivo(fecha) {
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1;
    const año = fecha.getFullYear();
    
    // Festivos fijos
    const festivosFijos = [
        { dia: 1, mes: 1 },   // Año Nuevo
        { dia: 6, mes: 1 },   // Reyes
        { dia: 28, mes: 2 },   // Día de Andalucía
        { dia: 1, mes: 5 },   // Día del Trabajo
        { dia: 15, mes: 8 },  // Asunción
        { dia: 12, mes: 10 }, // Hispanidad
        { dia: 1, mes: 11 },  // Todos los Santos
        { dia: 6, mes: 12 },  // Constitución
        { dia: 8, mes: 12 },  // Inmaculada
        { dia: 25, mes: 12 }, // Navidad
        
        // Festivos locales (08 de septiembre y 24 de octubre)
        { dia: 8, mes: 9 },
        { dia: 24, mes: 10 }
    ];
    
    // Comprobar festivos fijos
    for (const festivo of festivosFijos) {
        if (dia === festivo.dia && mes === festivo.mes) {
            return true;
        }
    }
    
    // Festivos variables (Jueves Santo, Viernes Santo)
    const domingoPascua = calcularDomingoPascua(año);
    
    const juevesSanto = new Date(domingoPascua);
    juevesSanto.setDate(domingoPascua.getDate() - 3);
    
    const viernesSanto = new Date(domingoPascua);
    viernesSanto.setDate(domingoPascua.getDate() - 2);
    
    if (fecha.getTime() === juevesSanto.getTime() || 
        fecha.getTime() === viernesSanto.getTime()) {
        return true;
    }
    
    return false;
}

function agruparPorMotivoYFechasContiguas(registros) {
    if (registros.length === 0) return [];
    
    // Primero agrupar por motivo
    const gruposPorMotivo = {};
    registros.forEach(registro => {
        const motivo = registro.motivo || 'No especificado';
        if (!gruposPorMotivo[motivo]) {
            gruposPorMotivo[motivo] = [];
        }
        gruposPorMotivo[motivo].push(registro.fecha);
    });
    
    const resultados = [];
    
    // Para cada motivo, agrupar fechas contiguas
    Object.entries(gruposPorMotivo).forEach(([motivo, fechas]) => {
        // Convertir a objetos Date y ordenar
        const fechasDate = fechas.map(f => new Date(f)).sort((a, b) => a - b);
        
        const grupos = [];
        let grupoActual = [fechasDate[0]];
        
        for (let i = 1; i < fechasDate.length; i++) {
            const fechaActual = fechasDate[i];
            const ultimaFechaGrupo = grupoActual[grupoActual.length - 1];
            
            // Calcular diferencia en días
            const diffDias = Math.floor((fechaActual - ultimaFechaGrupo) / (1000 * 60 * 60 * 24));
            
            // Si la diferencia es de 1 día (fechas consecutivas)
            if (diffDias === 1) {
                grupoActual.push(fechaActual);
            } else {
                // Verificar si hay días NO festivos intermedios que rompan la continuidad
                let tieneDiasLaborablesIntermedios = false;
                let fechaTemp = new Date(ultimaFechaGrupo);
                
                for (let d = 1; d < diffDias; d++) {
                    fechaTemp.setDate(fechaTemp.getDate() + 1);
                    
                    // Solo considerar días laborables (no festivos, no fines de semana) como rompedores de continuidad
                    const diaSemana = fechaTemp.getDay();
                    const esFinDeSemana = diaSemana === 0 || diaSemana === 6;
                    const esFestivoFijo = esDiaFestivo(fechaTemp);
                    const esJuevesViernesSanto = esJuevesOViernesSanto(fechaTemp);
                    
                    // Si es un día laborable normal (no festivo, no fin de semana), rompe la continuidad
                    if (!esFinDeSemana && !esFestivoFijo && !esJuevesViernesSanto) {
                        tieneDiasLaborablesIntermedios = true;
                        break;
                    }
                }
                
                if (tieneDiasLaborablesIntermedios) {
                    // Si hay días laborables intermedios, es un nuevo grupo
                    grupos.push([...grupoActual]);
                    grupoActual = [fechaActual];
                } else {
                    // Si no hay días laborables intermedios o solo son festivos/fines de semana, sigue siendo el mismo grupo
                    grupoActual.push(fechaActual);
                }
            }
        }
        
        // Añadir el último grupo
        grupos.push(grupoActual);
        
        // Convertir de vuelta a strings YYYY-MM-DD y añadir a resultados
        grupos.forEach(grupo => {
            resultados.push({
                motivo: motivo,
                fechas: grupo.map(fecha => fecha.toISOString().split('T')[0])
            });
        });
    });
    
    return resultados;
}

function esJuevesOViernesSanto(fecha) {
    const año = fecha.getFullYear();
    const domingoPascua = calcularDomingoPascua(año);
    
    // Verificar si la fecha es Jueves Santo (3 días antes del Domingo de Pascua)
    const juevesSanto = new Date(domingoPascua);
    juevesSanto.setDate(domingoPascua.getDate() - 3);
    
    // Verificar si la fecha es Viernes Santo (2 días antes del Domingo de Pascua)
    const viernesSanto = new Date(domingoPascua);
    viernesSanto.setDate(domingoPascua.getDate() - 2);
    
    // Comparar solo día, mes y año (ignorar hora)
    const esJueves = fecha.getDate() === juevesSanto.getDate() && 
                     fecha.getMonth() === juevesSanto.getMonth() && 
                     fecha.getFullYear() === juevesSanto.getFullYear();
    
    const esViernes = fecha.getDate() === viernesSanto.getDate() && 
                      fecha.getMonth() === viernesSanto.getMonth() && 
                      fecha.getFullYear() === viernesSanto.getFullYear();
    
    return esJueves || esViernes;
}

function esDiaLaborable(fecha) {
    const dia = fecha.getDay();
    // Domingo (0) o Sábado (6)
    if (dia === 0 || dia === 6) return false;
    
    // Festivos nacionales y locales
    if (esDiaFestivo(fecha)) return false;
    
    return true;
}

function calcularDomingoPascua(año) {
    // Algoritmo de Butcher para calcular el domingo de Pascua
    const a = año % 19;
    const b = Math.floor(año / 100);
    const c = año % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = Math.floor((h + l - 7 * m + 114) / 31);
    const p = (h + l - 7 * m + 114) % 31;
    
    return new Date(año, n - 1, p + 1);
}

function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES');
}

// -----------------------------
// LÓGICA DE PARSEO Y TRANSFORMACIÓN
// -----------------------------

function parseAndTransform(raw) {
    // Normaliza saltos de línea
    const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

    // Descarta líneas completamente vacías al final
    const nonEmpty = lines.filter(l => l.trim().length > 0);

    if (nonEmpty.length === 0) return [];

    // Detecta encabezados (primera línea)
    const header = nonEmpty[0];
    const headers = splitSemicolon(header);
    
    // Indices esperados
    const idxNombre = headers.findIndex(h => norm(h) === 'nombre');
    const idxFecha = headers.findIndex(h => norm(h) === 'fecha');
    const idxMotivo = headers.findIndex(h => norm(h) === 'motivo');
    const idxAnio = headers.findIndex(h => norm(h) === 'añoefectivo' || norm(h) === 'anioefectivo' || norm(h) === 'anoefectivo');

    if (idxFecha === -1) {
        throw new Error('No se encontró la columna "fecha" en el encabezado.');
    }

    const out = [];
    for (let i = 1; i < nonEmpty.length; i++) {
        const row = nonEmpty[i];
        const cols = splitSemicolon(row);

        // Manejo defensivo: si la fila no tiene tantas columnas como el header, se ignora.
        if (cols.length < headers.length) continue;

        const nombre = idxNombre !== -1 ? cols[idxNombre].trim() : null;
        const fechaRaw = cols[idxFecha].trim();
        const motivo = idxMotivo !== -1 ? cols[idxMotivo].trim() : null;
        const anioEfectivo = idxAnio !== -1 ? cols[idxAnio].trim() : null;

        const fechaISO = toISOFromSpanishLike(fechaRaw);

        // Crear objeto con todas las propiedades, incluyando añoefectivo incluso si es null
        const objetoTransformado = {
            nombre: nombre || null,
            fecha: fechaISO ? fechaISO.split('T')[0] : null,
            motivo: motivo || null,
            añoefectivo: anioEfectivo || null
        };

        out.push(objetoTransformado);
    }

    // Ordenar por fecha ascendente
    return out.sort((a, b) => {
        if (!a.fecha && !b.fecha) return 0;
        if (!a.fecha) return -1;
        if (!b.fecha) return 1;
        return a.fecha.localeCompare(b.fecha);
    });
}

// Divide por punto y coma, sin romper contenido vacío intermedio
function splitSemicolon(line) {
    return line.split(';');
}

// Normaliza nombre de columna
function norm(s) {
    return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, '');
}

// Convierte "5/9/2025 0:00:00" (dd/mm/yyyy hh:mm:ss) a ISO
function toISOFromSpanishLike(fechaStr) {
    const m = fechaStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}):(\d{2}))?$/);
    if (!m) {
        const d = new Date(fechaStr);
        if (!isFinite(d.getTime())) {
            const m2 = fechaStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (m2) {
                const dd = Number(m2[1]);
                const mm = Number(m2[2]);
                const yyyy = Number(m2[3]);
                const d2 = new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0));
                return d2.toISOString();
            }
            return null;
        }
        return d.toISOString();
    }

    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const HH = m[4] !== undefined ? Number(m[4]) : 0;
    const MI = m[5] !== undefined ? Number(m[5]) : 0;
    const SS = m[6] !== undefined ? Number(m[6]) : 0;

    const date = new Date(Date.UTC(yyyy, mm - 1, dd, HH, MI, SS, 0));
    if (!isFinite(date.getTime())) return null;

    return date.toISOString();
}