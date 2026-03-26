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

- [ ] **Categorías como strings** — `RecurringExpense.category` y `Expense.category` son `String?` en vez de un enum de Prisma. Permite valores inválidos en BD.
- [ ] **`DistributionDetail` sin constraints** — `destinationType` y `destinationId` son strings libres sin validación de que apuntan a una entidad real.
- [ ] **Índices faltantes** — No hay índices compuestos explícitos. Queries filtradas por `userId` + otros campos se beneficiarían de índices como `(userId, active)` o `(userId, date)`.

## Performance

- [ ] **9 queries por carga de dashboard** — `getDashboardStats` llama a `getCalendarEvents` (5 queries) + 4 queries propias. Sin caching.
- [ ] **Sin caching** — No usa `unstable_cache` ni `revalidateTag`. Cada visita recalcula todo.

## UX / Código

- [ ] **SVGs inline en dashboard** — 9 iconos SVG inline (~50 líneas) en `page.tsx`. Podrían usar Lucide (ya es dependencia).
- [ ] **`fmt()` duplicado** — El formateador de moneda se define localmente en múltiples archivos en vez de estar centralizado en utils.
