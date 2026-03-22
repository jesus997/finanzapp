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

## Patrones del Proyecto

### Server Actions
- Ubicar en `src/lib/actions/` con un archivo por entidad (ej: `income-source.ts`, `card.ts`).
- Siempre validar con Zod antes de escribir a BD.
- Siempre verificar `userId` del session para seguridad.
- Usar `revalidatePath()` después de mutaciones y `redirect()` para navegación.
- Para eliminar con filtro compuesto (`id` + `userId`), usar `deleteMany` en vez de `delete`.

### Validaciones Zod
- Ubicar en `src/lib/validations/` con un archivo por entidad.
- Cada archivo de validación debe tener su archivo de test junto a él (`*.test.ts`).
- Exportar el schema y el tipo inferido.

### Formularios
- Los formularios son Client Components (`"use client"`).
- Usar `form action={serverAction}` para envío.
- **Importante**: Los Selects controlados (con `value` + `onValueChange`) de shadcn/base-ui no generan inputs en el FormData. Agregar `<input type="hidden">` explícitos para estos campos.
- Reutilizar el mismo componente de formulario para crear y editar, recibiendo la entidad como prop opcional.

### Serialización Server → Client
- Prisma devuelve objetos `Decimal` y `Date` que no son serializables para Client Components.
- Convertir `Decimal` a `number` con `Number()` y `Date` a `string` con `.toISOString()` antes de pasar como props.

### Componentes UI
- `buttonVariants` está en `src/components/ui/button-variants.ts` (sin `"use client"`) para poder usarse en Server Components.
- El componente `Button` en `button.tsx` importa de `button-variants.ts`.
- Para links con estilo de botón en Server Components, usar `<Link className={buttonVariants(...)}>`.
- Para botones de submit en Server Components (ej: delete), usar `<button type="submit">` nativo en vez del componente `Button` de base-ui.

### Constantes y Labels
- Labels en español para la UI se centralizan en `src/lib/constants.ts`.
- Catálogos (bancos, tipos, frecuencias) también van en constants.

### Diseño Responsive
- La app se usa principalmente en móvil — el diseño responsive es crítico.
- Patrón para listas: `<div className="grid gap-4 md:hidden">` para cards en mobile, `<div className="hidden md:block">` para tablas en desktop.
- Navbar: menú hamburguesa en mobile (`md:hidden`), links horizontales en desktop (`hidden md:flex`).
- Grids de estadísticas: `grid-cols-2` en mobile, `lg:grid-cols-4` en desktop.
- Formularios: `max-w-md` funciona en ambos tamaños sin cambios.
- Tablas anchas (amortización): `overflow-x-auto` con márgenes negativos en mobile.
