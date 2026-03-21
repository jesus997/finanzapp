# FinanzApp 💰

Aplicación web open source para gestión de finanzas personales. Controla tus tarjetas, préstamos, gastos periódicos, ingresos y ahorro desde un solo lugar.

## Características

- **Fuentes de ingreso** — Nómina, aguinaldo, bonos, PTU, caja de ahorro, ingresos pasivos/activos, extraordinarios. Soporta frecuencias desde única hasta anual, con días de pago por día del mes o día de la semana.
- **Tarjetas** — Crédito y débito unificadas. Fecha de corte, pago, límite, tasa de interés. Soporte para Visa, Mastercard, Amex.
- **Préstamos** — Bancarios, automotrices, Infonavit, hipotecarios *(próximamente)*
- **Gastos periódicos** — Mensuales, quincenales, bimestrales con fecha inicio/fin *(próximamente)*
- **Apartados de ahorro** — Por cantidad fija o porcentaje de ingreso *(próximamente)*
- **Dispersión automática** — Al registrar ingreso, distribuye a pagos y ahorros *(próximamente)*
- **Calendario de pagos** — Vista organizada por fechas *(próximamente)*
- **Reportería** — Gasto por tarjeta, totales por periodo, balance general *(próximamente)*
- **Integración IA (opcional)** — Categorización, recomendaciones, detección de gastos hormiga vía OpenAI *(próximamente)*

## Tech Stack

| Capa | Tecnología |
|---|---|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| Lenguaje | [TypeScript](https://www.typescriptlang.org/) |
| Base de datos | [PostgreSQL](https://www.postgresql.org/) ([Neon](https://neon.tech/)) |
| ORM | [Prisma](https://www.prisma.io/) |
| Autenticación | [NextAuth.js](https://authjs.dev/) v5 + GitHub |
| UI | [Tailwind CSS](https://tailwindcss.com/) v4 + [shadcn/ui](https://ui.shadcn.com/) |
| Validación | [Zod](https://zod.dev/) |
| Testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) |
| Deploy | [Vercel](https://vercel.com/) |

## Requisitos previos

- Node.js 20+
- npm
- Una base de datos PostgreSQL (recomendado: [Neon](https://neon.tech/) tier gratuito)
- Una GitHub OAuth App para autenticación

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/finanzapp.git
cd finanzapp

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (ver sección de configuración)

# 4. Generar Prisma Client
npx prisma generate

# 5. Ejecutar migraciones
npx prisma migrate dev

# 6. Iniciar servidor de desarrollo
npm run dev
```

## Configuración

Copia `.env.example` a `.env` y configura:

### Base de datos
Crea una BD gratuita en [Neon](https://neon.tech/) y copia el connection string:
```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

### Autenticación (GitHub OAuth)
1. Ve a [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copia Client ID y Client Secret:
```
AUTH_GITHUB_ID="tu-client-id"
AUTH_GITHUB_SECRET="tu-client-secret"
```
5. Genera el secret de auth:
```bash
npx auth secret
```

### IA (opcional)
```
OPENAI_API_KEY="tu-api-key"
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Tests en modo watch |
| `npm run test:run` | Tests una sola vez |

## Estructura del proyecto

```
finanzapp/
├── prisma/
│   ├── schema.prisma          # Modelos de BD
│   └── migrations/            # Migraciones
├── src/
│   ├── app/                   # Rutas (Next.js App Router)
│   │   ├── api/auth/          # API de autenticación
│   │   ├── ingresos/          # CRUD fuentes de ingreso
│   │   └── tarjetas/          # CRUD tarjetas
│   ├── components/
│   │   ├── ui/                # Componentes base (shadcn/ui)
│   │   ├── income-source/     # Componentes de ingresos
│   │   ├── card/              # Componentes de tarjetas
│   │   └── navbar.tsx         # Navegación principal
│   ├── lib/
│   │   ├── actions/           # Server Actions (CRUD)
│   │   ├── validations/       # Schemas Zod + tests
│   │   ├── auth.ts            # Configuración NextAuth
│   │   ├── prisma.ts          # Singleton Prisma Client
│   │   └── constants.ts       # Labels, catálogos
│   └── test/
│       └── setup.ts           # Setup de Vitest
├── CONVENTIONS.md             # Reglas de código y colaboración
├── DESIGN.md                  # Diseño de entidades
└── TECH_DECISIONS.md          # Decisiones técnicas
```

## Contribuir

Antes de contribuir, lee los siguientes documentos:

- [CONVENTIONS.md](./CONVENTIONS.md) — Reglas de idioma, nomenclatura, testing, commits y manejo de errores
- [DESIGN.md](./DESIGN.md) — Entidades del dominio y flujos
- [TECH_DECISIONS.md](./TECH_DECISIONS.md) — Decisiones técnicas y justificaciones

### Resumen rápido de convenciones

- **Código y BD en inglés**, documentación y UI en español
- **Tests obligatorios** para todo código nuevo
- **Conventional Commits** en inglés (recomendado)
- **Manejo de errores** siguiendo estándares de Next.js (`error.tsx`, `loading.tsx`, `not-found.tsx`)
- Validación con **Zod** en cliente y servidor

## Licencia

MIT

## Disclaimer

> ⚠️ Este es un proyecto realizado casi exclusivamente con uso de agentes de IA. La revisión al código es mínima por lo que no se garantiza la calidad del código ni la seguridad. Si encuentras algún error, bug o problema de seguridad crítico puedes abrir un [issue](../../issues). Este es un proyecto de hobby solo para resolver una problemática personal.
