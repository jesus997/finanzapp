# Áreas de Mejora — FinanzApp

Registro de mejoras identificadas durante el análisis del proyecto. Se van tachando conforme se implementan.

## Seguridad

- [x] **`getAuthUserId()` centralizado** — La función se repetía en 12 archivos de server actions. Ahora está en `src/lib/auth-utils.ts` y se importa desde ahí. Elimina el riesgo de olvidar el check de auth en un action nuevo.
- [x] **Validación de referencias polimórficas** — `paymentMethodType` + `paymentMethodId` no tenían foreign key en BD. Se agregó `validatePaymentMethod()` en `src/lib/actions/validate-payment-method.ts` que verifica que el ID existe y pertenece al usuario antes de escribir. Se aplica en: `createRecurringExpense`, `updateRecurringExpense`, `createExpense`, `updateExpense`, `completeShoppingSession`.
- [ ] **Admin check frágil** — `ADMIN_EMAILS` usa comparación de strings. Si el email cambia, se pierde acceso admin. Considerar campo `role` en BD.

## Testing

- [ ] **Sin tests de server actions** — La lógica más crítica (distribución, calendario, dashboard) no tiene tests. Solo hay tests de validaciones Zod y utilidades puras.
- [ ] **Sin tests de componentes** — Formularios complejos (230-440 LOC) sin cobertura.
- [ ] **Sin tests de API routes** — Shopping items API sin tests.
- [ ] **Cobertura real ~15%** — La convención dice "tests obligatorios" pero la cobertura es baja.

## Complejidad

- [ ] **`shopping-live-list.tsx` (441 LOC)** — Maneja escaneo, formulario manual, edición de precios, eliminación. Candidato a descomposición en subcomponentes.
- [ ] **`getCalendarEvents` (187 LOC)** — Función monolítica con lógica de frecuencia duplicada parcialmente con `monthlyEquivalent` en distribution.ts.

## Modelo de datos

- [x] **Categorías como strings** — `RecurringExpense.category` y `Expense.category` eran `String?`. Migrado a enum `ExpenseCategory` de Prisma con 13 valores. Migración preserva datos existentes. Validaciones Zod actualizadas.
- [ ] **`DistributionDetail` sin constraints** — `destinationType` y `destinationId` son strings libres sin validación de que apuntan a una entidad real.
- [x] **Índices faltantes** — Agregados 6 índices compuestos: `IncomeSource(userId, active)`, `Card(userId, type)`, `Loan(userId)`, `RecurringExpense(userId)`, `Expense(userId, date)`, `ShoppingSession(userId, status)`.

## Performance

- [x] **9 queries por carga de dashboard** — Queries cacheadas con `unstable_cache` (5 min TTL). Calendar y dashboard data se cachean por usuario con tags para invalidación on-demand.
- [x] **Sin caching** — Implementado `unstable_cache` con `revalidateTag` en `src/lib/data/dashboard.ts`. Invalidación automática vía `invalidateUserCache()` en todos los server actions que mutan datos.

## UX / Código

- [x] **SVGs inline en dashboard** — 9 iconos SVG inline (~50 líneas) en `page.tsx`. Reemplazados por iconos de Lucide (ya era dependencia).
- [x] **`fmt()` duplicado** — El formateador de moneda se definía en 14 archivos. Centralizado como `formatCurrency` en `src/lib/utils.ts`, importado con alias `fmt`.

## Módulo de Ahorro

- [x] **Meta/objetivo** — Campos `targetAmount`, `targetDate`, `completedAt` en SavingsFund. La dispersión respeta la meta: skip completados, cap al faltante, auto-completar al alcanzar.
- [x] **Saldo no editable** — `accumulatedBalance` ya no es input en el formulario. Se muestra como solo lectura en edición. Se actualiza solo vía dispersiones y retiros.
- [x] **Barra de progreso** — En la card de `/ahorro` cuando hay `targetAmount`. Badge "✓ Completado" cuando se alcanza.
- [x] **Calendario** — Los ahorros generan eventos púrpura en los días de pago de su fuente de ingreso vinculada. Fondos completados no generan eventos.
- [x] **Preview de porcentaje** — En el formulario, si es porcentaje, muestra "≈ $1,500 por dispersión de Nómina" basado en el ingreso vinculado.
- [x] **Historial de movimientos** — Modelo `SavingsMovement` (DEPOSIT/WITHDRAWAL). Aportes se crean al dispersar (vinculados a Distribution), retiros manualmente. Vista en `/ahorro/[id]`.
- [x] **Retiros parciales** — Acción `withdrawFromSavingsFund` con monto, nota opcional. Decrementa saldo, reabre fondo si baja de meta.
- [x] **Fuente huérfana** — `incomeSourceId` nullable con `onDelete: SetNull`. Si se elimina la fuente, el fondo no queda huérfano.
- [ ] **Categorización de fondos** — Tipos como "emergencia", "vacaciones", "retiro". Cosmético, baja prioridad.
- [ ] **Multi-ingreso por fondo** — Vincular un fondo a más de una fuente de ingreso. Cambio de modelo grande.

## Dispersiones

- [x] **Filtrado por fuente de ingreso** — Gastos periódicos y préstamos se filtran por `incomeSourceId`. Solo aparecen los vinculados a la fuente que se dispersa, o los no vinculados (backward compatible).
- [x] **Auto-resolución de incomeSourceId en gastos** — Al crear/editar gasto periódico: INCOME_SOURCE → directo, DEBIT_CARD → busca fuente con esa depositCard, CREDIT_CARD → selector manual.
- [x] **incomeSourceId en préstamos** — Campo opcional. Si se vincula, solo aparece al dispersar esa fuente. Selector en formulario de préstamos.
- [x] **Ahorros editables en dispersión** — El usuario puede ajustar montos o omitir ahorros individuales antes de confirmar. Totales se recalculan en tiempo real.
- [ ] **Repensar sistema de dispersiones** — El modelo actual de vinculación ingreso→tarjeta→gastos tiene limitaciones. Considerar un rediseño más completo a futuro.
