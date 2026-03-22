# Decisiones Técnicas — FinanzApp

Registro de decisiones técnicas tomadas durante el desarrollo del proyecto. Cada sección explica el qué, por qué y las alternativas consideradas.

## 1. Persistencia

**PostgreSQL + Neon + Prisma**

- **Decisión**: PostgreSQL serverless con Neon (tier gratuito) y Prisma como ORM.
- **Alternativas descartadas**:
  - SQLite + Turso: Más simple pero limitado para queries complejas de reportería.
  - IndexedDB/localStorage (client-side): Sin dependencias externas pero se pierden datos entre dispositivos.
- **Razón**: PostgreSQL facilita queries complejas (agrupaciones, sumas, filtros por fecha). Prisma da type-safety y migraciones. Neon es gratuito y serverless, compatible con Vercel.

## 2. Autenticación

**NextAuth.js v5 + GitHub Provider + Tabla User**

- **Decisión**: NextAuth con adapter de Prisma y GitHub como provider principal.
- **Alternativas descartadas**:
  - Sin auth: Inseguro si se hostea en Vercel público.
  - Auth con contraseña local: Más fricción, menos seguro.
- **Razón**: Mínimo esfuerzo, protege datos en deploy público. La tabla `User` permite perfil personalizable (foto, nombre, moneda). Extensible a otros providers (Google, etc.).

## 3. Moneda

**Configurable sin conversión**

- **Decisión**: Campo `currency` en User (default: MXN). Formateo con `Intl.NumberFormat`.
- **Alternativas descartadas**:
  - Solo MXN hardcoded: Limita forks internacionales.
  - Multi-moneda con conversión: Sobreingeniería para el caso de uso actual.
- **Razón**: Cualquier persona que forkee puede usar su moneda local sin cambiar código.

## 4. UI

**Tailwind CSS v4 + shadcn/ui (base-ui)**

- **Decisión**: Tailwind para estilos utilitarios, shadcn/ui para componentes.
- **Nota**: La versión actual de shadcn/ui usa `@base-ui/react` en vez de Radix. Esto implica:
  - No existe `asChild` en Button. Usar `buttonVariants` con `<Link>` directamente.
  - Los Selects controlados no generan hidden inputs automáticamente. Agregar `<input type="hidden">` explícitos.
  - El componente `Button` tiene `"use client"`, por lo que `buttonVariants` se extrajo a un archivo separado (`button-variants.ts`) para usarse en Server Components.
- **Fuente**: Geist + Geist Mono de Google Fonts, configurada vía `next/font`.

## 5. Testing

**Vitest + React Testing Library**

- **Decisión**: Vitest para unit/integración, React Testing Library para componentes.
- **Configuración**:
  - Archivo: `vitest.config.mts` (ESM, excluido del tsconfig de Next.js).
  - Environment por defecto: `node` (para validaciones y lógica).
  - Environment `jsdom`: Solo para tests de componentes (`src/components/**`, `src/app/**`).
  - Pool: `threads` (evita problemas de ESM con `forks`).
- **Razón**: Vitest es rápido y compatible con el ecosistema. La separación de environments evita problemas de ESM con dependencias de CSS.

## 6. Manejo de Estado

**Server Components + Server Actions**

- **Decisión**: Priorizar Server Components y Server Actions de Next.js App Router. Estado en cliente solo donde es necesario (formularios con campos dinámicos).
- **Alternativas descartadas**:
  - Zustand: No se ha necesitado hasta ahora. Se agregará si surge necesidad real.
- **Razón**: Next.js App Router reduce la necesidad de estado global en cliente.

## 7. Modelo de Tarjetas

**Modelo unificado `Card` (crédito + débito)**

- **Decisión**: Una sola tabla `Card` con campo `type` (CREDIT/DEBIT) en vez de dos tablas separadas.
- **Alternativas descartadas**:
  - Tablas separadas `CreditCard` y `DebitCard`: Duplicación de campos comunes, dos CRUDs.
- **Razón**: Simplifica el código (un solo CRUD, un solo formulario). Los campos exclusivos de crédito (límite, corte, pago, tasa) son opcionales/nullable. El campo `network` (Visa/Mastercard/Amex) permite mostrar iconos visuales.

## 8. Modelo de Ingresos

**IncomeSource con tipos expandidos y frecuencia flexible**

- **Decisión**: 9 tipos de ingreso, 8 frecuencias (incluyendo `ONE_TIME`), soporte para día del mes y día de la semana, campo `isVariable` para montos estimados.
- **Razón**: Cubre casos reales como:
  - Nómina quincenal (2 días de pago)
  - Envíos Mercado Libre (semanal, miércoles)
  - Aguinaldo (anual, 20 de diciembre)
  - Caja de ahorro (semestral, enero y julio)
  - Herencia/donación (ingreso único con fecha específica)

## 9. Catálogo de Bancos

**Lista estática de bancos mexicanos + opción "Otro"**

- **Decisión**: Combobox con búsqueda usando los bancos más comunes en México. Opción "Otro" que despliega un input libre.
- **Alternativas descartadas**:
  - Input libre sin catálogo: Inconsistencia en nombres (BBVA vs bbva vs Bancomer).
  - API externa de bancos: Dependencia innecesaria.
- **Razón**: Balance entre consistencia y flexibilidad. El combobox permite búsqueda rápida y el input libre cubre bancos no listados. Se reutiliza en tarjetas y préstamos. Incluye Infonavit como institución.

## 10. Dispersión con prorrateo por cobro

**Prorrateo automático basado en frecuencia de ingreso**

- **Decisión**: Al dispersar un ingreso, el sistema calcula cuántas veces al mes cobra el usuario (semanal=4, quincenal=2, mensual=1), convierte cada gasto a su equivalente mensual y divide entre los cobros.
- **Alternativas descartadas**:
  - Asignar montos manuales: Más flexible pero tedioso y propenso a errores.
  - Dispersión solo para gastos vinculados a la fuente: Limita la utilidad real.
- **Razón**: Refleja el flujo real de "apartar dinero de cada quincena para cubrir todos los compromisos del mes". Los gastos se agrupan por tarjeta ("bolsas") para saber cuánto separar para pagar cada tarjeta.

## 11. Calendario de pagos con frecuencias

**Cálculo de eventos respetando frecuencia de cada gasto**

- **Decisión**: El calendario calcula si un gasto bimestral/trimestral/etc. cae en el mes actual usando la diferencia en meses desde la fecha de inicio y el intervalo de la frecuencia.
- **Razón**: Evita mostrar gastos bimestrales todos los meses. Los gastos semanales iteran por día de la semana, los quincenales cada 14 días exactos desde la fecha de inicio.

## 12. Categorías de gastos predefinidas

**13 categorías estáticas**

- **Decisión**: Categorías predefinidas en `constants.ts`: Vivienda, Servicios, Suscripciones, Seguros, Transporte, Alimentación, Educación, Salud, Entretenimiento, Cuidado personal, Mascotas, Donaciones, Otro.
- **Alternativas descartadas**:
  - Categorías libres: Inconsistencia en nombres.
  - Categorización solo por IA: Dependencia de API key.
- **Razón**: Cubre los casos más comunes. El campo es opcional, preparado para categorización automática por IA a futuro.

## Resumen del Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16 |
| Lenguaje | TypeScript | 5+ |
| BD | PostgreSQL (Neon) | — |
| ORM | Prisma | 6 |
| Auth | NextAuth.js + GitHub | v5 (beta) |
| UI | Tailwind CSS + shadcn/ui | v4 / base-ui |
| Validación | Zod | 3 |
| Testing | Vitest + RTL | 4 |
| Deploy | Vercel | — |
| IA (opcional) | OpenAI API | — |
