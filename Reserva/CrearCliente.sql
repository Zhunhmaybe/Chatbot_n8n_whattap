INSERT INTO clientes (cedula, nombre, telefono)
VALUES (
  '{{ $json.cedula }}',
  '{{ $json.nombreCliente }}',
  '{{ $json.phoneNumber }}'
)
ON CONFLICT (cedula) 
DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  telefono = EXCLUDED.telefono
RETURNING id, cedula, nombre, telefono;