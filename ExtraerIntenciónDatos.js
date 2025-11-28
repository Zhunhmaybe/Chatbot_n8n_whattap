// Extraer Intención y Datos del AI Agent
const aiOutput = $input.item.json.output || '';
const chatData = $('Chat Recibido').item.json;

// Inicializar objeto de resultado
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

// Buscar marcadores de intención en el texto
const intentPatterns = [
  {
    regex: /\[INTENCION:CONSULTAR_VEHICULOS\]/i,
    handler: () => {
      result.intent = 'CONSULTAR_VEHICULOS';
    }
  },
  {
    regex: /\[INTENCION:SELECCIONAR_VEHICULO:(\d+)\]/i,
    handler: (match) => {
      result.intent = 'SELECCIONAR_VEHICULO';
      result.vehicleId = parseInt(match[1]);
    }
  },
  {
    regex: /\[INTENCION:PROPORCIONAR_FECHAS:([\d\/]+):([\d\/]+)\]/i,
    handler: (match) => {
      result.intent = 'PROPORCIONAR_FECHAS';
      result.fechaInicio = match[1];
      result.fechaFin = match[2];
    }
  },
  {
    regex: /\[INTENCION:PROPORCIONAR_DATOS:([^:]+):([^\]]+)\]/i,
    handler: (match) => {
      result.intent = 'PROPORCIONAR_DATOS';
      result.nombreCliente = match[1].trim();
      result.cedula = match[2].trim();
    }
  },
  {
    regex: /\[INTENCION:CONFIRMAR_RESERVA\]/i,
    handler: () => {
      result.intent = 'CONFIRMAR_RESERVA';
      
      // ⭐ NUEVO: Extraer datos del resumen del AI
      // El AI ya generó un resumen completo con todos los datos
      // Los parseamos del mensaje
      
      // Extraer vehículo por capacidad
      const capacidadMatch = aiOutput.match(/\*\*Capacidad:\*\*\s*(\d+)/i);
      if (capacidadMatch) {
        const capacidad = parseInt(capacidadMatch[1]);
        if (capacidad === 40) result.vehicleId = 1; // Bus Grande
        else if (capacidad === 20) result.vehicleId = 2; // Van Mediana
        else if (capacidad === 4) result.vehicleId = 3; // Auto Pequeño
      }
      
      // Si no se encontró por capacidad, buscar por nombre
      if (!result.vehicleId) {
        if (aiOutput.match(/Bus Grande/i)) result.vehicleId = 1;
        else if (aiOutput.match(/Van Mediana/i)) result.vehicleId = 2;
        else if (aiOutput.match(/Auto Pequeño/i)) result.vehicleId = 3;
      }
      
      // Extraer fechas (varios formatos posibles)
      const fechasMatch1 = aiOutput.match(/Desde el \*\*(\d{2}\/\d{2}\/\d{4})\*\* hasta el \*\*(\d{2}\/\d{2}\/\d{4})\*\*/i);
      const fechasMatch2 = aiOutput.match(/\*\*Fechas:\*\*.*?(\d{2}\/\d{2}\/\d{4}).*?(\d{2}\/\d{2}\/\d{4})/i);
      const fechasMatch3 = aiOutput.match(/(\d{2}\/\d{2}\/\d{4})\s+hasta\s+(\d{2}\/\d{2}\/\d{4})/i);
      
      if (fechasMatch1) {
        result.fechaInicio = fechasMatch1[1];
        result.fechaFin = fechasMatch1[2];
      } else if (fechasMatch2) {
        result.fechaInicio = fechasMatch2[1];
        result.fechaFin = fechasMatch2[2];
      } else if (fechasMatch3) {
        result.fechaInicio = fechasMatch3[1];
        result.fechaFin = fechasMatch3[2];
      }
      
      // Extraer nombre del cliente
      const nombreMatch1 = aiOutput.match(/\*\*Cliente:\*\*\s*([^\n*]+)/i);
      const nombreMatch2 = aiOutput.match(/(?:Perfecto|Excelente),\s*([A-Za-zÁ-ú\s]+)!/i);
      
      if (nombreMatch1) {
        result.nombreCliente = nombreMatch1[1].replace(/\*/g, '').trim();
      } else if (nombreMatch2) {
        result.nombreCliente = nombreMatch2[1].trim();
      }
      
      // Extraer cédula
      const cedulaMatch = aiOutput.match(/\*\*Cédula:\*\*\s*([0-9]+)/i);
      if (cedulaMatch) {
        result.cedula = cedulaMatch[1];
      }
    }
  },
  {
    regex: /\[INTENCION:CONSULTAR_PAGO\]/i,
    handler: () => {
      result.intent = 'CONSULTAR_PAGO';
    }
  }
];

// Buscar y procesar la primera intención encontrada
for (const pattern of intentPatterns) {
  const match = aiOutput.match(pattern.regex);
  if (match) {
    pattern.handler(match);
    break;
  }
}

// Si no se encontró intención, marcar como conversación general
if (!result.intent) {
  result.intent = 'CONVERSACION_GENERAL';
}

// Limpiar la respuesta del AI removiendo los marcadores
result.aiResponse = aiOutput.replace(/\[INTENCION:[^\]]+\]/gi, '').trim();

// Debug: Log para verificar extracción
console.log('🔍 Datos extraídos:', {
  intent: result.intent,
  vehicleId: result.vehicleId,
  fechaInicio: result.fechaInicio,
  fechaFin: result.fechaFin,
  nombreCliente: result.nombreCliente,
  cedula: result.cedula
});

return result;