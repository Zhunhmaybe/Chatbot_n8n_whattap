// Preparar Respuesta de Disponibilidad
const disponibilidadData = $input.item.json;
const intentData = $('Extraer Intención y Datos').item.json;

// Extraer información de disponibilidad
const vehicleId = disponibilidadData.id || intentData.vehicleId;
const vehicleName = disponibilidadData.nombre || 'Vehículo';
const precioDia = disponibilidadData.precio_dia || 0;
const reservasActivas = disponibilidadData.reservas || 0;

// Extraer fechas
const fechaInicio = intentData.fechaInicio;
const fechaFin = intentData.fechaFin;

// Calcular días totales
let totalDias = 1;
if (fechaInicio && fechaFin) {
  const [diaI, mesI, anioI] = fechaInicio.split('/');
  const [diaF, mesF, anioF] = fechaFin.split('/');
  const inicio = new Date(anioI, mesI - 1, diaI);
  const fin = new Date(anioF, mesF - 1, diaF);
  const diffTime = Math.abs(fin - inicio);
  totalDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (totalDias === 0) totalDias = 1;
}

// Calcular precio total
const precioTotal = precioDia * totalDias;

// Determinar disponibilidad
const disponible = reservasActivas === 0;

// Generar mensaje formateado
let mensaje = '';

if (disponible) {
  mensaje = `✅ ¡Excelente noticia! El ${vehicleName} está disponible para las fechas solicitadas.\n\n`;
  mensaje += `📅 Fechas: ${fechaInicio} al ${fechaFin}\n`;
  mensaje += `⏱️ Duración: ${totalDias} día${totalDias > 1 ? 's' : ''}\n`;
  mensaje += `💰 Precio por día: $${precioDia}\n`;
  mensaje += `💵 Total: $${precioTotal}\n\n`;
  mensaje += `Para continuar con la reserva, por favor proporciona:\n`;
  mensaje += `1️⃣ Tu nombre completo\n`;
  mensaje += `2️⃣ Tu número de cédula`;
} else {
  mensaje = `❌ Lo sentimos, el ${vehicleName} NO está disponible para las fechas ${fechaInicio} al ${fechaFin}.\n\n`;
  mensaje += `Ya hay ${reservasActivas} reserva${reservasActivas > 1 ? 's' : ''} confirmada${reservasActivas > 1 ? 's' : ''} en ese período.\n\n`;
  mensaje += `¿Te gustaría consultar otro vehículo o diferentes fechas? 🚐`;
}

return {
  json: {
    output: mensaje,
    disponible: disponible,
    vehicleId: vehicleId,
    vehicleName: vehicleName,
    fechaInicio: fechaInicio,
    fechaFin: fechaFin,
    totalDias: totalDias,
    precioDia: precioDia,
    precioTotal: precioTotal,
    reservasActivas: reservasActivas
  }
};