// =============================================
// Preparar Respuesta Cliente - CORREGIDO
// Este código va en el nodo "Preparar Respuesta Cliente"
// Ubicación: DESPUÉS de "Crear_cliente"
// =============================================

const clienteData = $input.item.json; // Datos del cliente recién creado
const intentData = $('Extraer Intención y Datos').item.json; // Datos extraídos

console.log('📋 Cliente creado:', clienteData);
console.log('📋 Datos de intención:', intentData);

// Precios por vehículo
const preciosPorDia = {
  1: 250.00, // Bus Grande
  2: 150.00, // Van Mediana
  3: 60.00   // Auto Pequeño
};

const vehiculoNombres = {
  1: 'Bus Grande (40 personas)',
  2: 'Van Mediana (20 personas)',
  3: 'Auto Pequeño (4 personas)'
};

// Obtener precio y nombre del vehículo
const vehicleId = intentData.vehicleId;
const precio_por_dia = preciosPorDia[vehicleId];
const vehiculo_nombre = vehiculoNombres[vehicleId];

if (!precio_por_dia) {
  throw new Error(`❌ Vehículo ID ${vehicleId} no válido`);
}

// Calcular días totales
const fechaInicio = new Date(intentData.fechaInicio);
const fechaFin = new Date(intentData.fechaFin);
const diasTotales = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1;

// Calcular total
const total = precio_por_dia * diasTotales;

// Formatear fechas para mostrar (DD/MM/YYYY)
function formatearFecha(fecha) {
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

const fechaInicioFormato = formatearFecha(intentData.fechaInicio);
const fechaFinFormato = formatearFecha(intentData.fechaFin);

// Preparar todos los datos necesarios para crear la reserva
const datosParaReserva = {
  // Datos del cliente (del nodo anterior)
  cliente_id: clienteData.id,
  cedula: clienteData.cedula,
  nombreCliente: clienteData.nombre,
  phoneNumber: clienteData.telefono,
  
  // Datos del vehículo
  vehicleId: vehicleId,
  vehiculo_nombre: vehiculo_nombre,
  precio_por_dia: precio_por_dia,
  
  // Fechas (formato YYYY-MM-DD para Postgres)
  fechaInicio: intentData.fechaInicio,
  fechaFin: intentData.fechaFin,
  
  // Fechas formateadas para mostrar
  fechaInicioFormato: fechaInicioFormato,
  fechaFinFormato: fechaFinFormato,
  
  // Cálculos
  dias_totales: diasTotales,
  total: total.toFixed(2)
};

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ DATOS PREPARADOS PARA RESERVA:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('👤 Cliente ID:', datosParaReserva.cliente_id);
console.log('👤 Nombre:', datosParaReserva.nombreCliente);
console.log('🆔 Cédula:', datosParaReserva.cedula);
console.log('🚗 Vehículo:', datosParaReserva.vehiculo_nombre);
console.log('📅 Desde:', datosParaReserva.fechaInicioFormato);
console.log('📅 Hasta:', datosParaReserva.fechaFinFormato);
console.log('📊 Días:', datosParaReserva.dias_totales);
console.log('💰 Precio/día: $', datosParaReserva.precio_por_dia);
console.log('💵 TOTAL: $', datosParaReserva.total);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

return {
  json: datosParaReserva
};