
SELECT 
    v.id,
    v.nombre,
    v.capacidad,
    v.precio_por_dia,
    COUNT(r.id) as reservas_conflicto
FROM vehiculos v
LEFT JOIN reservas r ON v.id = r.vehiculo_id 
    AND r.estado = 'confirmada' 
    AND (
        (r.fecha_inicio BETWEEN '{{ $json.fechaInicio }}'::DATE AND '{{ $json.fechaFin }}'::DATE)
        OR (r.fecha_fin BETWEEN '{{ $json.fechaInicio }}'::DATE AND '{{ $json.fechaFin }}'::DATE)
        OR (r.fecha_inicio <= '{{ $json.fechaInicio }}'::DATE AND r.fecha_fin >= '{{ $json.fechaFin }}'::DATE)
    )
WHERE v.id = {{ $json.vehicleId }}
    AND v.activo = true
GROUP BY v.id, v.nombre, v.capacidad, v.precio_por_dia;

-- =============================================
-- EXPLICACIÓN:
-- - Si reservas_conflicto = 0, el vehículo está DISPONIBLE
-- - Si reservas_conflicto > 0, el vehículo está OCUPADO
-- - También valida el caso donde una reserva abarca todo el periodo
-- =============================================