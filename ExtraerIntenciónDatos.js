// =============================================
// Extraer Intención y Datos - Versión Final
// Usa el historial de "HTTP Request" anterior
// =============================================

const aiOutput = $('AI Agent').item.json.output || '';
const chatData = $('Chat Recibido').item.json;

// Obtener historial del nodo HTTP Request anterior
let historialArray = [];
try {
  historialArray = $('HTTP Request').all();
  console.log('✅ Historial obtenido de HTTP Request');
} catch (error) {
  console.warn('⚠️ No se pudo obtener historial:', error.message);
}

// Inicializar resultado
const result = {
  intent: null,
  vehicleId: null,
  fechaInicio: null,
  fechaFin: null,
  nombreCliente: null,
  cedula: null,
  aiResponse: aiOutput,
  phoneNumber: chatData.messages?.[0]?.from || null,
  metadata: chatData.metadata || null
};

// =============================================
// PASO 1: Construir historial completo
// =============================================

let todosLosMensajes = '';

for (const item of historialArray) {
  const content = item.json?.content || '';
  todosLosMensajes += content + '\n';
}

// Agregar también el output actual del AI
todosLosMensajes += '\n' + aiOutput;

console.log('📜 Historial:', todosLosMensajes.substring(0, 300) + '...');

// =============================================
// PASO 2: Extraer CÉDULA (10 dígitos)
// =============================================

const cedulaMatch = todosLosMensajes.match(/\b([0-9]{10})\b/);
if (cedulaMatch) {
  result.cedula = cedulaMatch[1];
  console.log('✅ Cédula:', result.cedula);
}

// =============================================
// PASO 3: Extraer NOMBRE
// =============================================

// Patrón 1: "me llamo X", "mi nombre es X", "soy X"
let nombreMatch = todosLosMensajes.match(/(?:me llamo|mi nombre es|soy)\s+([A-Za-zÁ-úÑñ\s]{2,50})/i);

// Patrón 2: Buscar nombres propios en líneas del usuario
if (!nombreMatch) {
  const lineas = todosLosMensajes.split('\n');
  for (const linea of lineas) {
    const match = linea.match(/^([A-Z][a-zá-ú]+(?:\s+[A-Z][a-zá-ú]+)*)$/);
    if (match && match[1].length < 40) {
      nombreMatch = match;
      break;
    }
  }
}

// Patrón 3: Buscar en el output del AI "Perfecto, [Nombre]!"
if (!nombreMatch) {
  nombreMatch = aiOutput.match(/(?:Perfecto|Excelente|Genial),\s*([A-Za-zÁ-úÑñ\s]+)!/i);
}

if (nombreMatch) {
  result.nombreCliente = nombreMatch[1].trim();
  console.log('✅ Nombre:', result.nombreCliente);
}

// =============================================
// PASO 4: Extraer FECHAS (DD/MM/YYYY)
// =============================================

const fechasArray = todosLosMensajes.match(/(\d{2}\/\d{2}\/\d{4})/g);

if (fechasArray && fechasArray.length >= 2) {
  // Tomar las dos primeras fechas encontradas
  result.fechaInicio = fechasArray[0];
  result.fechaFin = fechasArray[1];
  console.log('✅ Fechas:', result.fechaInicio, '-', result.fechaFin);
} else if (fechasArray && fechasArray.length === 1) {
  // Si solo hay una, asumir mismo día
  result.fechaInicio = fechasArray[0];
  result.fechaFin = fechasArray[0];
}

// =============================================
// PASO 5: Extraer VEHÍCULO
// =============================================

const vehiculoPatterns = [
  { regex: /(?:bus\s*grande|40\s*personas?|bus de 40)/i, id: 1, nombre: 'Bus Grande' },
  { regex: /(?:van\s*mediana|20\s*personas?|van de 20)/i, id: 2, nombre: 'Van Mediana' },
  { regex: /(?:auto\s*pequeño|4\s*personas?|auto de 4)/i, id: 3, nombre: 'Auto Pequeño' }
];

for (const veh of vehiculoPatterns) {
  if (todosLosMensajes.match(veh.regex)) {
    result.vehicleId = veh.id;
    console.log('✅ Vehículo:', veh.nombre);
    break;
  }
}

// También buscar por capacidad en el AI output
if (!result.vehicleId) {
  const capacidadMatch = aiOutput.match(/capacidad\s*(\d+)\s*personas?/i);
  if (capacidadMatch) {
    const cap = parseInt(capacidadMatch[1]);
    if (cap === 40) result.vehicleId = 1;
    else if (cap === 20) result.vehicleId = 2;
    else if (cap === 4) result.vehicleId = 3;
  }
}

// =============================================
// PASO 6: Detectar INTENCIÓN
// =============================================

if (aiOutput.includes('[INTENCION:CONSULTAR_VEHICULOS]')) {
  result.intent = 'CONSULTAR_VEHICULOS';
  
} else if (aiOutput.includes('[INTENCION:CONFIRMAR_RESERVA]')) {
  result.intent = 'CONFIRMAR_RESERVA';
  
} else if (aiOutput.includes('[INTENCION:PROPORCIONAR_FECHAS')) {
  result.intent = 'PROPORCIONAR_FECHAS';
  const match = aiOutput.match(/\[INTENCION:PROPORCIONAR_FECHAS:([\d\/]+):([\d\/]+)\]/);
  if (match) {
    result.fechaInicio = match[1];
    result.fechaFin = match[2];
  }
  
} else if (aiOutput.includes('[INTENCION:SELECCIONAR_VEHICULO')) {
  result.intent = 'SELECCIONAR_VEHICULO';
  const match = aiOutput.match(/\[INTENCION:SELECCIONAR_VEHICULO:(\d+)\]/);
  if (match) {
    result.vehicleId = parseInt(match[1]);
  }
  
} else if (aiOutput.includes('[INTENCION:PROPORCIONAR_DATOS')) {
  result.intent = 'PROPORCIONAR_DATOS';
  const match = aiOutput.match(/\[INTENCION:PROPORCIONAR_DATOS:([^:]+):([^\]]+)\]/);
  if (match) {
    result.nombreCliente = match[1].trim();
    result.cedula = match[2].trim();
  }
  
} else {
  result.intent = 'CONVERSACION_GENERAL';
}

// =============================================
// PASO 7: Convertir fechas DD/MM/YYYY → YYYY-MM-DD
// =============================================

function convertirFecha(fecha) {
  if (!fecha || !fecha.includes('/')) return null;
  
  const [dia, mes, anio] = fecha.split('/');
  
  // Validar que sean números válidos
  if (!dia || !mes || !anio) return null;
  
  return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

const fechaInicioOriginal = result.fechaInicio;
const fechaFinOriginal = result.fechaFin;

result.fechaInicio = convertirFecha(result.fechaInicio);
result.fechaFin = convertirFecha(result.fechaFin);

console.log('📅 Fechas convertidas:', fechaInicioOriginal, '→', result.fechaInicio);
console.log('📅 Fechas convertidas:', fechaFinOriginal, '→', result.fechaFin);

// =============================================
// PASO 8: Limpiar respuesta del AI
// =============================================

result.aiResponse = aiOutput
  .replace(/\[INTENCION:[^\]]+\]/gi, '')
  .trim();

// =============================================
// PASO 9: Validación Final
// =============================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 DATOS FINALES:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Intent:', result.intent);
console.log('Vehicle ID:', result.vehicleId);
console.log('Fecha Inicio:', result.fechaInicio);
console.log('Fecha Fin:', result.fechaFin);
console.log('Nombre:', result.nombreCliente);
console.log('Cédula:', result.cedula);
console.log('Teléfono:', result.phoneNumber);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Validar datos completos para CONFIRMAR_RESERVA
if (result.intent === 'CONFIRMAR_RESERVA') {
  const datosRequeridos = {
    vehicleId: result.vehicleId,
    fechaInicio: result.fechaInicio,
    fechaFin: result.fechaFin,
    nombreCliente: result.nombreCliente,
    cedula: result.cedula
  };
  
  const faltantes = Object.entries(datosRequeridos)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  if (faltantes.length > 0) {
    console.error('❌ DATOS FALTANTES:', faltantes.join(', '));
    result.datosIncompletos = faltantes;
    result.error = `Faltan los siguientes datos: ${faltantes.join(', ')}`;
  } else {
    console.log('✅ TODOS LOS DATOS COMPLETOS - LISTO PARA CREAR RESERVA');
  }
}

return result;