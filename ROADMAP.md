# Roadmap Perunor ERP

## Fase 1: Maestros (En progreso ✅)

- [x] Artículo
- [x] Almacén
- [x] Proceso
- [x] Proveedor
- [x] Cliente
- [ ] **Conductor** (próximo)
- [ ] **Usuario** (gestión desde UI)

Estado: 5/7 maestros completados.

## Fase 2: Documento Polimórfico (Q2 2026)

El core del ERP: un documento que puede ser:
- **Compra**: RUC proveedor → artículos → almacén
- **Procesamiento**: artículos entrada + proceso → salida
- **Salida**: almacén → cantidad → cliente
- **Factura**: documento legal SUNAT-ready

Diseño:
- Tabla `documento` con type enum
- Polymorphic: `documento_compra`, `documento_proceso`, etc.
- O: JSONB `detalles` flexibility
- Línea de detalle con `documento_id`, `articulo_id`, cantidad, precio

Decisión: JSONB vs tablas separadas → evaluar en diseño.

## Fase 3: Kardex e Inventario (Q2-Q3 2026)

- Saldo actual por almacén
- Movimientos (entrada/salida/ajuste)
- Reporte de existencias
- Alertas de stock bajo

## Fase 4: Reportes Operativos (Q3 2026)

- Compras por período
- Procesamiento: rendimiento, merma
- Ventas por cliente
- Kardex detallado

## Fase 5: SUNAT (Post-MVP, Q4 2026)

Integración con SUNAT:
- Generación de XML de facturas
- Envío automático
- Validación de RUC/DNI
- Consulta de estado

**Nota**: diseño post-MVP, no incorporar aún.

## Decisiones pendientes

- [ ] Modelo de costos (FIFO, promedio ponderado)
- [ ] Multi-moneda
- [ ] Presupuestos y órdenes
- [ ] Dashboards en tiempo real
