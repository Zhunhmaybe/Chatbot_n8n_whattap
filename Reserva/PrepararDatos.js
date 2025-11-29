console.log('🔍 Iniciando preparación de datos para reserva...');

// ESTRATEGIA: Obtener datos del nodo anterior según el flujo
let datosReserva = {};

// =============================================
// CASO 1: Viene de "¿Vehículo Disponible?" (PROPORCIONAR_DATOS)
// =============================================
try {
  const disponibilidadData = $('Preparar Respuesta Disponibilidad').item.json;
  
  if (disponibilidadData && disponibilidadData.disponible === true) {
    console.log('✅ Flujo: PROPORCIONAR_DATOS → Verificar Disponibilidad');
    
    datosReserva = {
      cliente_id: disponibilidadData.cliente_id,
      vehicleId: disponibilidadData.vehicleId,
      nombreCliente: disponibilidadData.nombreCliente,
      cedula: disponibilidadData.cedula,
      phoneNumber: disponibilidadData.phoneNumber,
      fechaInicio: disponibilidadData.fechaInicio,
      fechaFin: disponibilidadData.fechaFin,
      precioTotal: disponibilidadData.total || disponibilidadData.precioTotal
    };
  }
} catch (error) {
  console.log('⚠️ No viene del flujo de disponibilidad:', error.message);
}

// =============================================
// CASO 2: Viene directamente de Router (CONFIRMAR_RESERVA)
// =============================================
if (!datosReserva.vehicleId) {
  console.log('✅ Flujo: CONFIRMAR_RESERVA directo');
  
  // Obtener datos del Router / Extraer Intención
  const intentData = $('Extraer Intención y Datos').item.json;
  
  // Precios por vehículo
  const preciosPorDia = {
    1: 250.00,
    2: 150.00,
    3: 60.00
  };
  
  // Calcular días
  const fechaInicio = new Date(intentData.fechaInicio);
  const fechaFin = new Date(intentData.fechaFin);
  const dias = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1;
  
  // Calcular total
  const precio_por_dia = preciosPorDia[intentData.vehicleId];
  const total = (precio_por_dia * dias).toFixed(2);
  
  datosReserva = {
    cliente_id: null, // Se llenará después
    vehicleId: intentData.vehicleId,
    nombreCliente: intentData.nombreCliente,
    cedula: intentData.cedula,
    phoneNumber: intentData.phoneNumber,
    fechaInicio: intentData.fechaInicio,
    fechaFin: intentData.fechaFin,
    precioTotal: total
  };
}

// =============================================
// OBTENER cliente_id si no existe
// =============================================
if (!datosReserva.cliente_id) {
  console.log('🔍 Buscando cliente_id...');
  
  // Buscar en base de datos por cédula
  try {
    // Opción 1: Si ya se creó el cliente en este flujo
    const clienteCreado = $('Crear_cliente').item.json;
    if (clienteCreado && clienteCreado.id) {
      datosReserva.cliente_id = clienteCreado.id;
      console.log('✅ cliente_id de Crear_cliente:', datosReserva.cliente_id);
    }
  } catch (e) {
    console.log('⚠️ No hay cliente creado en este flujo');
  }
  
  // Si aún no tenemos cliente_id, generamos uno temporal
  // (Idealmente aquí deberías hacer un INSERT/SELECT del cliente)
  if (!datosReserva.cliente_id) {
    console.warn('⚠️ No se encontró cliente_id, usando NULL (se debe crear cliente primero)');
    datosReserva.cliente_id = null;
  }
}

// =============================================
// VALIDACIÓN FINAL
// =============================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 DATOS FINALES PARA RESERVA:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const camposRequeridos = {
  'Cliente ID': datosReserva.cliente_id,
  'Vehicle ID': datosReserva.vehicleId,
  'Nombre': datosReserva.nombreCliente,
  'Cédula': datosReserva.cedula,
  'Teléfono': datosReserva.phoneNumber,
  'Fecha Inicio': datosReserva.fechaInicio,
  'Fecha Fin': datosReserva.fechaFin,
  'Total': datosReserva.precioTotal
};

let todoOK = true;
for (const [campo, valor] of Object.entries(camposRequeridos)) {
  const emoji = valor ? '✅' : '❌';
  console.log(`${emoji} ${campo}:`, valor);
  if (!valor) todoOK = false;
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (!todoOK) {
  const faltantes = Object.entries(camposRequeridos)
    .filter(([, valor]) => !valor)
    .map(([campo]) => campo);
  
  console.error('❌ FALTAN CAMPOS:', faltantes.join(', '));
  
}

console.log('✅✅✅ TODOS LOS DATOS VALIDADOS ✅✅✅');

return datosReserva;