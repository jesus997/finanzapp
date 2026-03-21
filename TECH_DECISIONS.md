# Decisiones Técnicas — FinanzApp

## 1. Persistencia

**PostgreSQL + Neon + Prisma**

- Neon ofrece tier gratuito generoso para PostgreSQL serverless.
- Prisma como ORM para type-safety y migraciones.
- PostgreSQL facilita queries complejas de reportería (agrupaciones, sumas, filtros por fecha).
- Escalable a multi-usuario en el futuro.

## 2. Autenticación

**NextAuth.js + GitHub Provider + Tabla de usuario**

- Protege los datos al hostear en Vercel público.
- GitHub como provider principal (puede extenderse a Google u otros).
- Tabla `User` con perfil personalizable: foto, nombre, configuraciones.
- NextAuth adapter de Prisma para persistir sesiones y cuentas en la BD.

## 3. Moneda

**Configurable sin conversión**

- Campo `currency` en la configuración del usuario (default: MXN).
- Formateo con `Intl.NumberFormat` según la moneda configurada.
- Sin conversión automática entre monedas.
- Cualquier persona que forkee el proyecto puede usar su moneda local.

## 4. UI

**Tailwind CSS + shadcn/ui**

- Componentes accesibles y personalizables.
- Tailwind para estilos utilitarios.
- shadcn/ui no es dependencia, se copia al proyecto (control total).

## 5. Testing

**Vitest + React Testing Library**

- Vitest para tests unitarios y de integración (rápido, compatible con Vite/Next).
- React Testing Library para tests de componentes.
- Archivos de test junto al código: `*.test.ts` / `*.test.tsx`.

## 6. Manejo de Estado

**Server Components + Server Actions**

- Priorizar Server Components y Server Actions de Next.js App Router.
- Mínimo estado en cliente.
- Agregar Zustand solo si surge necesidad real de estado global en cliente.

## Resumen del Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Lenguaje | TypeScript |
| BD | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth.js + GitHub |
| UI | Tailwind CSS + shadcn/ui |
| Validación | Zod |
| Testing | Vitest + React Testing Library |
| Deploy | Vercel |
| IA (opcional) | OpenAI API |
