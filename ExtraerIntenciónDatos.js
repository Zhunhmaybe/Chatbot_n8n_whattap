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

return result;