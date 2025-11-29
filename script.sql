
-- 1. CLIENTES (NUEVA TABLA)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(200),
    fecha_registro TIMESTAMP DEFAULT NOW(),
    activo BOOLEAN DEFAULT true
);

-- 2. VEHÍCULOS (IGUAL QUE ANTES)
CREATE TABLE vehiculos (
    id SERIAL PRIMARY KEY,
    capacidad INT NOT NULL,
    precio_por_dia DECIMAL(10,2) NOT NULL,
    nombre VARCHAR(100),
    descripcion TEXT,
    activo BOOLEAN DEFAULT true
);

-- Insertar los 3 vehículos
INSERT INTO vehiculos (capacidad, precio_por_dia, nombre, descripcion) VALUES
(40, 250.00, 'Bus Grande', 'Bus para 40 personas'),
(20, 150.00, 'Van Mediana', 'Van para 20 personas'),
(4, 60.00, 'Auto Pequeño', 'Auto para 4 personas');

-- 3. RESERVAS (MEJORADA)
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    vehiculo_id INT NOT NULL REFERENCES vehiculos(id),
    cliente_id INT NOT NULL REFERENCES clientes(id),    
    -- Datos denormalizados para histórico
    cliente_nombre VARCHAR(200) NOT NULL,
    cliente_cedula VARCHAR(20) NOT NULL,
    cliente_telefono VARCHAR(20),    
    -- Fechas
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_totales INT NOT NULL,    
    -- Precios
    precio_por_dia DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,    
    -- Estado
    estado VARCHAR(50) DEFAULT 'pendiente' NOT NULL,
    -- Estados: pendiente, confirmada, expirada, cancelada, completada    
    -- Archivos
    proforma_url TEXT,
    comprobante_pago_url TEXT,    
    -- Timestamps
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_expiracion TIMESTAMP NOT NULL, -- fecha_creacion + 24 horas
    fecha_pago TIMESTAMP,
    fecha_confirmacion TIMESTAMP,    
    -- Notas
    notas TEXT,
    CONSTRAINT chk_fechas CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT chk_dias_max CHECK (dias_totales >= 1 AND dias_totales <= 7)
);

-- 4. PAGOS (IGUAL QUE ANTES CON PEQUEÑA MEJORA)
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    reserva_id INT NOT NULL REFERENCES reservas(id),
    cliente_id INT NOT NULL REFERENCES clientes(id),    
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'deposito_bancario',
    referencia VARCHAR(100),
    comprobante_url TEXT,    
    verificado BOOLEAN DEFAULT false,
    fecha_pago TIMESTAMP DEFAULT NOW(),
    fecha_verificacion TIMESTAMP,
    
    notas TEXT,
    
    CONSTRAINT chk_monto_positivo CHECK (monto > 0)
);

-- 5. DISPONIBILIDAD (IGUAL QUE ANTES)
CREATE TABLE disponibilidad (
    id SERIAL PRIMARY KEY,
    vehiculo_id INT NOT NULL REFERENCES vehiculos(id),
    fecha DATE NOT NULL,
    disponible BOOLEAN DEFAULT true,
    reserva_id INT REFERENCES reservas(id),
    tipo_bloqueo VARCHAR(50) DEFAULT 'reserva',
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    UNIQUE(vehiculo_id, fecha)
);
