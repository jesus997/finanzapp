# Convenciones del Proyecto — FinanzApp

## Idioma

- **Código fuente**: Todo en inglés — variables, funciones, métodos, clases, interfaces, tipos, enums, constantes, etc.
- **Base de datos**: Todo en inglés — nombres de tablas, columnas, índices, relaciones, seeds, migraciones.
- **Comentarios en código**: En inglés.
- **Documentación** (README, DESIGN, CONTRIBUTING, etc.): En español.
- **UI / textos visibles al usuario**: En español (con posibilidad de i18n a futuro).
- **Commits**: En inglés.

## Ejemplos

| Concepto | ❌ Incorrecto | ✅ Correcto |
|---|---|---|
| Tabla | `gastos_periodicos` | `recurring_expenses` |
| Columna | `fecha_inicio` | `start_date` |
| Variable | `montoTotal` | `totalAmount` |
| Función | `calcularDispersion()` | `calculateDistribution()` |
| Enum | `TARJETA_CREDITO` | `CREDIT_CARD` |
| Tipo | `FuenteIngreso` | `IncomeSource` |
| Componente | `TarjetaCredito` | `CreditCard` |

## Nomenclatura

- **Variables y funciones**: camelCase (`totalAmount`, `calculateDistribution`)
- **Tipos, interfaces, clases, componentes**: PascalCase (`CreditCard`, `IncomeSource`)
- **Constantes y enums**: UPPER_SNAKE_CASE (`CREDIT_CARD`, `MONTHLY`)
- **Tablas de BD (Prisma models)**: PascalCase singular (`RecurringExpense`, `CreditCard`)
- **Columnas de BD**: camelCase (Prisma default)
- **Archivos de componentes**: kebab-case (`credit-card-form.tsx`)
- **Archivos de utilidades/lib**: kebab-case (`calculate-distribution.ts`)

## Commits

Se recomienda (no obligatorio) usar [Conventional Commits](https://www.conventionalcommits.org/) en inglés:

```
feat: add credit card CRUD
fix: correct distribution calculation
refactor: extract payment calendar logic
test: add recurring expense service tests
docs: update design document
```

## Testing

- Todo código debe tener tests asociados.
- Tests unitarios para lógica de negocio (cálculos, distribuciones, validaciones).
- Tests de integración para API routes y operaciones de BD.
- Tests de componentes para UI crítica.
- Nombrar archivos de test junto al archivo que prueban: `calculate-distribution.test.ts`.

## Manejo de Errores

Seguir los estándares de Next.js:

- **`error.tsx`**: Componente de error por ruta (Error Boundary). Cada segmento de ruta puede tener su propio `error.tsx` para errores de renderizado.
- **`not-found.tsx`**: Para recursos no encontrados, usar `notFound()` de `next/navigation`.
- **`global-error.tsx`**: Error boundary global en `app/global-error.tsx` para errores no capturados.
- **`loading.tsx`**: Estados de carga por ruta con Suspense.
- **API Routes / Server Actions**: Retornar respuestas estructuradas con status codes HTTP apropiados. No lanzar excepciones sin capturar.
- **Validación**: Validar inputs tanto en cliente como en servidor. Usar Zod para schemas de validación.
