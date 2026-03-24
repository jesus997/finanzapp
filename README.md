# FinanzApp 💰

Aplicación web open source para gestión de finanzas personales. Controla tus tarjetas, préstamos, gastos periódicos, ingresos y ahorro desde un solo lugar.

## Características

- **Dashboard** — Resumen del mes (ingresos, gastos, préstamos, balance proyectado), ahorro acumulado, deuda total, próximos pagos e ingresos.
- **Fuentes de ingreso** — Nómina, aguinaldo, bonos, PTU, caja de ahorro, ingresos pasivos/activos, extraordinarios. Soporta frecuencias desde única hasta anual, con días de pago por día del mes o día de la semana. Vinculación opcional a tarjeta de depósito.
- **Tarjetas** — Crédito y débito unificadas. Fecha de corte, pago, límite, tasa de interés. Soporte para Visa, Mastercard, Amex. Vista de gastos vinculados por tarjeta con toggle expandible.
- **Préstamos** — Bancarios, nómina, automotrices, Infonavit, hipotecarios. Frecuencia de pago variable (diario, semanal, quincenal, mensual). Tabla de amortización con IVA sobre intereses. Fecha de fin estimada automáticamente si se omite. Barra de progreso visual.
- **Gastos periódicos** — Mensuales, quincenales, bimestrales con fecha inicio/fin. 13 categorías predefinidas. Días de cobro específicos. Vinculados a tarjeta o fuente de ingreso.
- **Gastos diarios** — Registro de gastos únicos con escaneo de tickets vía OCR (Tesseract.js). Toma una foto del ticket y se pre-llenan nombre, monto y fecha automáticamente. Integrado en dashboard y calendario.
- **Apartados de ahorro** — Por cantidad fija o porcentaje de ingreso, vinculados a fuente de ingreso.
- **Dispersión automática** — Al registrar ingreso, prorratea gastos y ahorros por cobro. Agrupa por tarjeta ("bolsas"). Soporte para revertir.
- **Lista de compras** — Inicia una compra en el super, escanea códigos de barras con la cámara para agregar productos. Catálogo global (Open Food Facts + manual). Precios por tienda (Walmart, Oxxo, Soriana + custom). Total acumulado en tiempo real. Al pagar, escanea el ticket para validar precios reales. Genera gasto diario automáticamente.
- **Calendario de pagos** — Vista mensual (grid en desktop, lista en móvil) con eventos de ingresos, tarjetas, préstamos y gastos. Navegación entre meses. Detalle al hacer click.
- **Diseño responsive** — Optimizado para uso en móvil con menú hamburguesa, cards en mobile y tablas en desktop.
- **Onboarding** — Tutorial guiado para nuevos usuarios que explica el concepto de la app y cómo usarla. Se muestra una sola vez.
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
| OCR | [Tesseract.js](https://tesseract.projectnaptha.com/) |
| Barcode | [html5-qrcode](https://github.com/mebjas/html5-qrcode) |
| Onboarding | [Driver.js](https://driverjs.com/) |
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
│   │   ├── tarjetas/          # CRUD tarjetas
│   │   ├── prestamos/         # CRUD préstamos + detalle con amortización
│   │   ├── gastos/            # CRUD gastos periódicos
│   │   ├── gastos-diarios/    # CRUD gastos únicos + escaneo de tickets
│   │   ├── ahorro/            # CRUD apartados de ahorro
│   │   ├── calendario/        # Vista calendario de pagos
│   │   ├── dispersiones/      # Dispersión automática
│   │   └── compras/           # Lista de compras con escaneo de códigos
│   ├── components/
│   │   ├── income-source/     # Componentes de ingresos
│   │   ├── card/              # Componentes de tarjetas
│   │   ├── loan/              # Componentes de préstamos y amortización
│   │   ├── recurring-expense/ # Componentes de gastos periódicos
│   │   ├── expense/           # Componentes de gastos diarios
│   │   ├── savings-fund/      # Componentes de ahorro
│   │   ├── calendar/          # Componentes de calendario (grid + lista)
│   │   ├── distribution/      # Componentes de dispersión
│   │   ├── shopping/          # Componentes de lista de compras (escáner, lista en vivo)
│   │   ├── navbar.tsx         # Navegación principal (responsive)
│   │   ├── mobile-menu.tsx    # Menú hamburguesa para móvil
│   │   └── onboarding-tour.tsx # Tutorial guiado (Driver.js)
│   ├── lib/
│   │   ├── actions/           # Server Actions (CRUD + lógica)
│   │   │   ├── dashboard.ts   # Estadísticas del home
│   │   │   ├── calendar.ts    # Eventos del calendario
│   │   │   ├── distribution.ts # Dispersión automática
│   │   │   └── ...            # Un archivo por entidad
│   │   ├── validations/       # Schemas Zod + tests
│   │   ├── utils/
│   │   │   ├── amortization.ts # Calculadora de amortización con IVA
│   │   │   └── receipt-parser.ts # Parser de tickets OCR
│   │   ├── ocr/               # Providers OCR (Tesseract, futuro Vision)
│   │   ├── auth.ts            # Configuración NextAuth
│   │   ├── prisma.ts          # Singleton Prisma Client
│   │   └── constants.ts       # Labels, catálogos
│   └── test/
│       └── setup.ts           # Setup de Vitest
├── CONVENTIONS.md             # Reglas de código y colaboración
├── DESIGN.md                  # Diseño de entidades y flujos
├── TECH_DECISIONS.md          # Decisiones técnicas
└── CONTRIBUTING.md            # Guía para contribuir
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
