Proyecto de n8n-whattap business

**Recursos utilizados**
  n8n-supabase-api OPEN IA
  Gmail contraseña de gmail aplicaciones
  Whattap Business

**Intrucciones**
  # SISTEMA DE RESERVA DE VEHÍCULOS - WHATSAPP BUSINESS
  
  ## FLUJO DEL CLIENTE
  1. Selección de vehículo
  2. Calendario de disponibilidad
  3. Generación de proforma PDF
  4. Proceso de pago
  5. Confirmación y notificaciones
  
  ## TIPOS DE VEHÍCULOS Y PRECIOS
  - 🚐 Vehículo 40 personas: $250/día
  - 🚗 Vehículo 20 personas: $150/día
  - 🚙 Vehículo 4 personas: $60/día
  
  ## REQUERIMIENTOS FUNCIONALES
  - ChatBot en WhatsApp Business
  - Selección interactiva de vehículo
  - Calendario con fechas disponibles
  - Validación: no fechas pasadas
  - Rango: mínimo 1 día, máximo 7 días
  - Proforma PDF con:
    * Nombre completo
    * Cédula de identidad
    * Vehículo seleccionado
    * Fechas de reserva
    * Costo total
  - Vigencia proforma: 24 horas
  - Liberación automática si no se confirma
  - Sistema de pago por depósito bancario (simulado)
  - Registro en cuenta de reserva
  - Política: primero en pagar gana
  - Notificaciones por correo y WhatsApp
  
  ## VALIDACIONES
  - Fechas no pasadas
  - Disponibilidad real-time
  - Límite de 7 días máximo
  - Verificación de cédula
  - Control de duplicados de pago
  
  ## ENTIDADES PRINCIPALES
  - Vehículo (tipo, precio, disponibilidad)
  - Reserva (cliente, fechas, estado, proforma)
  - Pago (monto, fecha, método, estado)
  - Cliente (nombre, cédula, contacto)
  
  ## CONFIGURACIÓN WHATSAPP BUSINESS
  - API de WhatsApp Business
  - Mensajes automatizados
  - Gestión de conversaciones
  - Notificaciones push
