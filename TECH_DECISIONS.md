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

## 13. Amortización con IVA sobre intereses

**16% IVA sobre intereses de crédito**

- **Decisión**: La tabla de amortización aplica 16% de IVA sobre el componente de interés de cada periodo, reflejando el impuesto mexicano sobre intereses de crédito.
- **Alternativas descartadas**:
  - Ignorar IVA: Montos no coincidirían con estados de cuenta reales.
  - IVA configurable: Sobreingeniería para el caso de uso actual (solo México).
- **Razón**: Los bancos mexicanos cobran IVA sobre intereses. Sin esto, la tabla de amortización no coincide con la realidad. La constante `INTEREST_TAX_RATE` permite ajustar si cambia la tasa.

## 14. Frecuencia de pago variable en préstamos

**paymentFrequency con soporte DAILY/WEEKLY/BIWEEKLY/MONTHLY**

- **Decisión**: Los préstamos soportan 4 frecuencias de pago. La función `periodsPerYear()` mapea: DAILY=360, WEEKLY=52, BIWEEKLY=24, MONTHLY=12.
- **Razón**: Préstamos de nómina suelen ser quincenales, microcréditos pueden ser semanales o diarios. La dispersión convierte el pago a equivalente mensual según la frecuencia.

## 15. Estimación automática de fecha de fin de préstamo

**endDate opcional con cálculo automático**

- **Decisión**: Si el usuario no proporciona `endDate`, se estima con `estimateEndDate()` dividiendo `remainingBalance / paymentAmount` y sumando los periodos correspondientes a la frecuencia.
- **Razón**: Muchos usuarios no conocen la fecha exacta de término. La estimación da una referencia útil sin requerir el dato.

## 16. Dashboard con estadísticas rápidas

**Resumen del mes + próximos eventos reutilizando calendario**

- **Decisión**: El dashboard calcula totales mensuales (ingresos, gastos, préstamos) reutilizando `getCalendarEvents()` del módulo de calendario, más queries directas para ahorro acumulado y deuda total.
- **Alternativas descartadas**:
  - Queries separadas por entidad: Duplicación de lógica de cálculo de frecuencias.
  - Cache/materialización: Sobreingeniería para el volumen actual.
- **Razón**: Reutilizar el calendario evita duplicar la lógica de "qué eventos caen este mes". Los próximos 5 eventos desde hoy dan visibilidad inmediata al abrir la app.

## 17. Gastos diarios separados de gastos periódicos

**Modelo `Expense` independiente de `RecurringExpense`**

- **Decisión**: Dos modelos separados — `RecurringExpense` para compromisos periódicos (suscripciones, servicios, seguros) y `Expense` para gastos únicos/diarios (supermercado, restaurante, compras).
- **Alternativas descartadas**:
  - Un solo modelo con frecuencia `ONE_TIME`: Mezcla conceptos distintos. Los periódicos participan en dispersión y prorrateo; los diarios son registros históricos.
- **Razón**: Los gastos periódicos son compromisos futuros que se prorratan en la dispersión. Los gastos diarios son registros de gastos ya realizados. Separarlos simplifica ambos flujos y evita contaminar la dispersión con gastos puntuales.

## 18. OCR de tickets con Tesseract.js y provider abstracto

**Tesseract.js en browser + interfaz para swap a OpenAI Vision**

- **Decisión**: OCR con Tesseract.js (WebAssembly, corre en el browser) detrás de una interfaz `OcrProvider`. Factory `getOcrProvider()` retorna Tesseract por defecto, preparado para retornar Vision cuando exista `OPENAI_API_KEY`.
- **Alternativas descartadas**:
  - OpenAI Vision directamente: Requiere API key, el usuario quiere funcionalidad sin IA primero.
  - OCR.space API: Dependencia externa con límites de uso.
  - Google Cloud Vision: Requiere cuenta GCP.
- **Razón**: Zero backend, sin API key, sin costos, funciona offline. La precisión no es perfecta pero el usuario siempre confirma/edita antes de guardar (funciona como "autocompletado inteligente"). El parser heurístico (`receipt-parser.ts`) extrae nombre, total y fecha de tickets mexicanos comunes.

## 19. Onboarding tour con Driver.js

**Driver.js para tutorial guiado de nuevos usuarios**

- **Decisión**: Driver.js (~5KB) para tour paso a paso con spotlight/overlay. Flag `onboardingCompleted` en BD para persistir estado.
- **Alternativas descartadas**:
  - React Joyride (~15KB): Más pesada, API más compleja.
  - Shepherd.js (~25KB): Overkill para un tour simple.
  - Intro.js: Licencia comercial de pago.
  - localStorage: Se pierde entre dispositivos/browsers.
- **Razón**: La más ligera, zero dependencias, API simple, MIT license. El flag en BD garantiza que el tour no reaparece aunque el usuario cambie de dispositivo.

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
| OCR | Tesseract.js | 6 |
| Onboarding | Driver.js | 1 |
| IA (opcional) | OpenAI API | — |
