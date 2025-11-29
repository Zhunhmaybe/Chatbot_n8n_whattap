INSERT INTO clientes (cedula, nombre, email, telefono)
VALUES (
  '{{ $json.cedula }}',
  '{{ $json.nombreCliente }}',
  '{{ $json.email }}',
  '{{ $json.phoneNumber }}'
)
ON CONFLICT (cedula) 
DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  telefono = EXCLUDED.telefono
RETURNING id, cedula, nombre, email, telefono;