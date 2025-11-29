// =============================================
// Extraer Intención y Datos - DETECCIÓN MEJORADA
// Detecta formato: Nombre\nCédula\nTeléfono
// =============================================

const aiOutput = $('AI Agent').item.json.output || '';
const chatData = $('Chat Recibido').item.json;

// Obtener historial del nodo HTTP Request anterior
let historialArray = [];
try {
  historialArray = $('HTTP Request').all();
  console.log('✅ Historial obtenido:', historialArray.length, 'items');
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
  email: null,
  aiResponse: aiOutput,
  phoneNumber: chatData.messages?.[0]?.from || null,
  metadata: chatData.metadata || null
};

// =============================================
// PASO 1: Construir historial completo
// =============================================

let todosLosMensajes = '';
let mensajesDelUsuario = [];

for (const item of historialArray) {
  try {
    const content = item.json?.content || 
                   item.json?.body?.content || 
                   item.json?.output || 
                   '';
    
    if (content) {
      todosLosMensajes += content + '\n';
      
      const role = item.json?.role || '';
      if (role === 'user' || content.startsWith('Usuario:') || !role) {
        mensajesDelUsuario.push(content);
      }
    }
  } catch (e) {
    console.warn('⚠️ Error procesando item');
  }
}

// Agregar mensajes actuales de WhatsApp
if (chatData.messages && Array.isArray(chatData.messages)) {
  for (const msg of chatData.messages) {
    const texto = msg.text?.body || msg.body || '';
    if (texto) {
      todosLosMensajes += texto + '\n';
      mensajesDelUsuario.push(texto);
    }
  }
}

// Agregar output del AI
todosLosMensajes += '\n' + aiOutput;

console.log('📜 Total mensajes:', todosLosMensajes.length, 'caracteres');
console.log('👤 Mensajes del usuario:', mensajesDelUsuario.length);

// Log de los últimos 3 mensajes
console.log('🔍 Últimos 3 mensajes del usuario:');
mensajesDelUsuario.slice(-3).forEach((msg, i) => {
  console.log(`  ${i + 1}. "${msg.substring(0, 150)}"`);
});

// =============================================
// PASO 2: DETECTAR INTENCIÓN
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
    console.log('✅ Datos desde TAG del AI:', result.nombreCliente, '|', result.cedula);
  }
  
} else {
  result.intent = 'CONVERSACION_GENERAL';
}

console.log('🎯 Intent:', result.intent);

// =============================================
// PASO 3: EXTRAER DATOS EN FORMATO MULTILINEA
// Formato esperado: Nombre\nCédula\nTeléfono
// =============================================

console.log('\n🔍 BUSCANDO FORMATO MULTILINEA (Nombre\\nCédula\\nTeléfono)...');

if (!result.nombreCliente || !result.cedula) {
  // Buscar en los últimos 3 mensajes
  const ultimosTres = mensajesDelUsuario.slice(-3);
  
  for (const mensaje of ultimosTres) {
    const lineas = mensaje.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Buscar patrón: 3 líneas consecutivas (Nombre, Cédula, Teléfono)
    if (lineas.length >= 3) {
      console.log('  📄 Mensaje con múltiples líneas detectado:', lineas);
      
      // Primera línea: debería ser el nombre (solo letras y espacios)
      const posibleNombre = lineas[0];
      const esNombre = /^[A-ZÁÉÍÓÚÑa-záéíóúñ\s]{4,50}$/.test(posibleNombre);
      
      // Segunda línea: debería ser cédula (10 dígitos)
      const posibleCedula = lineas[1];
      const esCedula = /^\d{10}$/.test(posibleCedula);
      
      // Tercera línea: debería ser email
      const posibleEmail = lineas[2];
      const esEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(posibleEmail);
      
      if (esNombre && esCedula) {
        result.nombreCliente = posibleNombre;
        result.cedula = posibleCedula;
        result.email = posibleEmail;
        console.log('  ✅ FORMATO MULTILINEA DETECTADO:');
        console.log('     👤 Nombre:', result.nombreCliente);
        console.log('     🆔 Cédula:', result.cedula);
        console.log('     📧 Email:', result.email);
        break;
      }
    }
    
    // Buscar patrón: 2 líneas (Nombre, Cédula)
    if (lineas.length >= 2 && !result.nombreCliente) {
      const posibleNombre = lineas[0];
      const posibleCedula = lineas[1];
      
      const esNombre = /^[A-ZÁÉÍÓÚÑa-záéíóúñ\s]{4,50}$/.test(posibleNombre);
      const esCedula = /^\d{10}$/.test(posibleCedula);
      
      if (esNombre && esCedula) {
        result.nombreCliente = posibleNombre;
        result.cedula = posibleCedula;
        console.log('  ✅ FORMATO 2 LÍNEAS DETECTADO:');
        console.log('     👤 Nombre:', result.nombreCliente);
        console.log('     🆔 Cédula:', result.cedula);
        break;
      }
    }
  }
}

// =============================================
// PASO 4: EXTRAER CÉDULA (si no se encontró antes)
// =============================================

if (!result.cedula) {
  console.log('\n🔍 BUSCANDO CÉDULA (10 dígitos)...');
  
  // Buscar en el último mensaje
  const ultimoMensaje = mensajesDelUsuario[mensajesDelUsuario.length - 1] || '';
  let cedulaMatch = ultimoMensaje.match(/\b([0-9]{10})\b/);
  
  if (cedulaMatch) {
    result.cedula = cedulaMatch[1];
    console.log('  ✅ Cédula en último mensaje:', result.cedula);
  }
  
  // Buscar en los últimos 3 mensajes
  if (!result.cedula) {
    const ultimosTres = mensajesDelUsuario.slice(-3).join(' ');
    cedulaMatch = ultimosTres.match(/\b([0-9]{10})\b/);
    
    if (cedulaMatch) {
      result.cedula = cedulaMatch[1];
      console.log('  ✅ Cédula en últimos 3 mensajes:', result.cedula);
    }
  }
  
  // Buscar en todo el historial
  if (!result.cedula) {
    cedulaMatch = todosLosMensajes.match(/\b([0-9]{10})\b/);
    
    if (cedulaMatch) {
      result.cedula = cedulaMatch[1];
      console.log('  ✅ Cédula en historial completo:', result.cedula);
    }
  }
  
  if (!result.cedula) {
    console.log('  ❌ NO SE ENCONTRÓ CÉDULA');
  }
}

// =============================================
// PASO 5: EXTRAER NOMBRE (si no se encontró antes)
// =============================================

if (!result.nombreCliente) {
  console.log('\n🔍 BUSCANDO NOMBRE...');
  
  // ESTRATEGIA 1: Patrón "me llamo X", "mi nombre es X"
  const ultimoMensaje = mensajesDelUsuario[mensajesDelUsuario.length - 1] || '';
  let nombreMatch = ultimoMensaje.match(/(?:me\s+llamo|mi\s+nombre\s+es|soy|nombre:?)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i);
  
  if (nombreMatch) {
    result.nombreCliente = nombreMatch[1].trim();
    console.log('  ✅ Nombre (patrón "me llamo"):', result.nombreCliente);
  }
  
  // ESTRATEGIA 2: Línea que es solo un nombre
  if (!result.nombreCliente) {
    const ultimosTres = mensajesDelUsuario.slice(-3);
    
    for (let i = ultimosTres.length - 1; i >= 0; i--) {
      const mensaje = ultimosTres[i].trim();
      const lineas = mensaje.split('\n').map(l => l.trim());
      
      for (const linea of lineas) {
        // Buscar nombres propios (Primera letra mayúscula)
        const nombreSoloMatch = linea.match(/^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})$/);
        
        if (nombreSoloMatch && nombreSoloMatch[1].length >= 4 && nombreSoloMatch[1].length < 50) {
          if (!/^\d+$/.test(nombreSoloMatch[1])) {
            result.nombreCliente = nombreSoloMatch[1].trim();
            console.log('  ✅ Nombre (línea individual):', result.nombreCliente);
            break;
          }
        }
      }
      
      if (result.nombreCliente) break;
    }
  }
  
  // ESTRATEGIA 3: Buscar en los últimos 5 mensajes
  if (!result.nombreCliente) {
    const ultimosCinco = mensajesDelUsuario.slice(-5).join('\n');
    nombreMatch = ultimosCinco.match(/(?:me\s+llamo|mi\s+nombre\s+es|soy|nombre:?)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i);
    
    if (nombreMatch) {
      result.nombreCliente = nombreMatch[1].trim();
      console.log('  ✅ Nombre en últimos 5 mensajes:', result.nombreCliente);
    }
  }
  
  // ESTRATEGIA 4: Buscar en respuesta del AI
  if (!result.nombreCliente) {
    const nombreAIMatch = aiOutput.match(/(?:Perfecto|Excelente|Genial|Gracias|Entiendo),?\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)[!.,]/i);
    
    if (nombreAIMatch) {
      result.nombreCliente = nombreAIMatch[1].trim();
      console.log('  ✅ Nombre en respuesta AI:', result.nombreCliente);
    }
  }
  
  if (!result.nombreCliente) {
    console.log('  ❌ NO SE ENCONTRÓ NOMBRE');
  }
}

// =============================================
// PASO 6: Extraer FECHAS
// =============================================

console.log('\n🔍 BUSCANDO FECHAS...');

if (!result.fechaInicio || !result.fechaFin) {
  const fechasArray = todosLosMensajes.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g);
  
  if (fechasArray && fechasArray.length >= 2) {
    result.fechaInicio = fechasArray[0];
    result.fechaFin = fechasArray[1];
    console.log('  ✅ Fechas:', result.fechaInicio, '-', result.fechaFin);
  } else if (fechasArray && fechasArray.length === 1) {
    result.fechaInicio = fechasArray[0];
    result.fechaFin = fechasArray[0];
    console.log('  ✅ Una fecha (mismo día):', result.fechaInicio);
  }
}

// =============================================
// PASO 7: Extraer VEHÍCULO
// =============================================

console.log('\n🔍 BUSCANDO VEHÍCULO...');

if (!result.vehicleId) {
  const vehiculoPatterns = [
    { regex: /(?:bus\s*grande|bus.*40|40\s*personas?)/i, id: 1, nombre: 'Bus Grande' },
    { regex: /(?:van\s*mediana|van.*20|20\s*personas?)/i, id: 2, nombre: 'Van Mediana' },
    { regex: /(?:auto\s*pequeño|auto.*4|4\s*personas?|carro)/i, id: 3, nombre: 'Auto Pequeño' }
  ];
  
  for (const veh of vehiculoPatterns) {
    if (todosLosMensajes.match(veh.regex)) {
      result.vehicleId = veh.id;
      console.log('  ✅ Vehículo:', veh.nombre);
      break;
    }
  }
  
  if (!result.vehicleId) {
    const opcionMatch = todosLosMensajes.match(/(?:opción|opcion|selecciono|quiero|escojo)?\s*[:\s]*([123])\b/i);
    if (opcionMatch) {
      result.vehicleId = parseInt(opcionMatch[1]);
      console.log('  ✅ Vehículo por número:', result.vehicleId);
    }
  }
}

// =============================================
// PASO 8: Convertir fechas DD/MM/YYYY → YYYY-MM-DD
// =============================================

function convertirFecha(fecha) {
  if (!fecha || typeof fecha !== 'string') return null;
  if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) return fecha;
  
  const match = fecha.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  
  const dia = match[1].padStart(2, '0');
  const mes = match[2].padStart(2, '0');
  const anio = match[3];
  
  return `${anio}-${mes}-${dia}`;
}

const fechaInicioOriginal = result.fechaInicio;
const fechaFinOriginal = result.fechaFin;

result.fechaInicio = convertirFecha(result.fechaInicio);
result.fechaFin = convertirFecha(result.fechaFin);

if (fechaInicioOriginal) {
  console.log('📅 Fecha inicio:', fechaInicioOriginal, '→', result.fechaInicio);
}
if (fechaFinOriginal) {
  console.log('📅 Fecha fin:', fechaFinOriginal, '→', result.fechaFin);
}

// =============================================
// PASO 9: Limpiar respuesta del AI
// =============================================

result.aiResponse = aiOutput
  .replace(/\[INTENCION:[^\]]+\]/gi, '')
  .replace(/\[CONTEXTO:[^\]]+\]/gi, '')
  .trim();

// =============================================
// PASO 10: Validación Final
// =============================================

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 RESUMEN FINAL:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 Intent:', result.intent || '❌ NO DETECTADO');
console.log('🚗 Vehicle ID:', result.vehicleId || '❌ NO DETECTADO');
console.log('📅 Fecha Inicio:', result.fechaInicio || '❌ NO DETECTADO');
console.log('📅 Fecha Fin:', result.fechaFin || '❌ NO DETECTADO');
console.log('👤 Nombre:', result.nombreCliente || '❌ NO DETECTADO');
console.log('🆔 Cédula:', result.cedula || '❌ NO DETECTADO');
console.log('📱 Teléfono:', result.phoneNumber || '❌ NO DETECTADO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
    console.error('\n❌ DATOS FALTANTES:', faltantes.join(', '));
    result.datosIncompletos = faltantes;
    result.error = `Faltan: ${faltantes.join(', ')}`;
  } else {
    console.log('\n✅✅✅ TODOS LOS DATOS COMPLETOS ✅✅✅');
  }
}

console.log('\n📤 JSON FINAL:');
console.log(JSON.stringify(result, null, 2));

return result;