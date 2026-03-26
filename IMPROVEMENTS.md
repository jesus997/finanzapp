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

- [ ] **9 queries por carga de dashboard** — `getDashboardStats` llama a `getCalendarEvents` (5 queries) + 4 queries propias. Sin caching.
- [ ] **Sin caching** — No usa `unstable_cache` ni `revalidateTag`. Cada visita recalcula todo.

## UX / Código

- [x] **SVGs inline en dashboard** — 9 iconos SVG inline (~50 líneas) en `page.tsx`. Reemplazados por iconos de Lucide (ya era dependencia).
- [x] **`fmt()` duplicado** — El formateador de moneda se definía en 14 archivos. Centralizado como `formatCurrency` en `src/lib/utils.ts`, importado con alias `fmt`.
