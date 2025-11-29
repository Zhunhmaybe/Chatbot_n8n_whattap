
const disponibilidadData = $input.item.json;
const intentData = $('Extraer Intención y Datos').item.json;

console.log('📋 Datos de disponibilidad:', disponibilidadData);
console.log('📋 Datos de intención:', intentData);

// Extraer información de disponibilidad
const vehicleId = disponibilidadData.id || intentData.vehicleId;
const vehicleName = disponibilidadData.nombre || 'Vehículo';
const capacidad = disponibilidadData.capacidad || 0;
const precioPorDia = disponibilidadData.precio_por_dia || 0; // ← CORREGIDO
const reservasConflicto = disponibilidadData.reservas_conflicto || 0; // ← CORREGIDO

// Extraer fechas
const fechaInicio = intentData.fechaInicio;
const fechaFin = intentData.fechaFin;

// Formatear fechas para mostrar (DD/MM/YYYY)
function formatearFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

const fechaInicioFormato = formatearFecha(fechaInicio);
const fechaFinFormato = formatearFecha(fechaFin);

// Calcular días totales
let totalDias = 1;
if (fechaInicio && fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffTime = Math.abs(fin - inicio);
  totalDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  if (totalDias < 1) totalDias = 1;
}

// Calcular precio total
const precioTotal = precioPorDia * totalDias;

// Determinar disponibilidad (si no hay conflictos, está disponible)
const disponible = reservasConflicto === 0;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 ANÁLISIS DE DISPONIBILIDAD:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚗 Vehículo:', vehicleName);
console.log('📅 Fechas:', fechaInicioFormato, 'al', fechaFinFormato);
console.log('⏱️ Días:', totalDias);
console.log('💰 Precio/día: $', precioPorDia);
console.log('💵 Total: $', precioTotal);
console.log('🔍 Reservas en conflicto:', reservasConflicto);
console.log('✅ Disponible:', disponible ? 'SÍ' : 'NO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Generar mensaje formateado para WhatsApp
let mensaje = '';

if (disponible) {
  mensaje = `✅ ¡Excelente noticia! El **${vehicleName}** está disponible para las fechas solicitadas.\n\n`;
  mensaje += `📋 **Resumen:**\n`;
  mensaje += `🚐 Vehículo: ${vehicleName} (${capacidad} personas)\n`;
  mensaje += `📅 Fechas: ${fechaInicioFormato} al ${fechaFinFormato}\n`;
  mensaje += `⏱️ Duración: ${totalDias} día${totalDias > 1 ? 's' : ''}\n`;
  mensaje += `💰 Precio por día: $${precioPorDia}\n`;
  mensaje += `💵 **TOTAL: $${precioTotal}**\n\n`;
  mensaje += `Para continuar con la reserva, por favor envíame tus datos en este formato:\n\n`;
  mensaje += `**Nombre completo**\n`;
  mensaje += `**Número de cédula**\n`;
  mensaje += `**Número de teléfono**\n\n`;
  mensaje += `Ejemplo:\n`;
  mensaje += `Juan Pérez García\n`;
  mensaje += `1234567890\n`;
  mensaje += `0987654321`;
  
} else {
  mensaje = `❌ Lo sentimos, el **${vehicleName}** NO está disponible para las fechas ${fechaInicioFormato} al ${fechaFinFormato}.\n\n`;
  mensaje += `Ya hay ${reservasConflicto} reserva${reservasConflicto > 1 ? 's' : ''} confirmada${reservasConflicto > 1 ? 's' : ''} en ese período. 😔\n\n`;
  mensaje += `¿Te gustaría:\n`;
  mensaje += `1️⃣ Consultar otro vehículo\n`;
  mensaje += `2️⃣ Seleccionar diferentes fechas\n\n`;
  mensaje += `¿Qué prefieres? 🚐`;
}

return {
  json: {
    output: mensaje,
    disponible: disponible,
    vehicleId: vehicleId,
    vehicleName: vehicleName,
    capacidad: capacidad,
    fechaInicio: fechaInicio,
    fechaFin: fechaFin,
    fechaInicioFormato: fechaInicioFormato,
    fechaFinFormato: fechaFinFormato,
    totalDias: totalDias,
    precioPorDia: precioPorDia,
    precioTotal: precioTotal,
    reservasConflicto: reservasConflicto
  }
};