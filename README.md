# FinanzApp 💰

Aplicación web de gestión de finanzas personales. Controla tus tarjetas de crédito, préstamos, gastos periódicos, ingresos y ahorro desde un solo lugar.

## Características

- **Tarjetas de crédito y débito** — Fechas de corte, pago, límites y gastos vinculados
- **Préstamos** — Bancarios, automotrices, Infonavit, hipotecarios con seguimiento de pagos
- **Fuentes de ingreso** — Nómina, ingresos pasivos, activos con periodicidad
- **Gastos periódicos** — Mensuales, quincenales, bimestrales con fecha inicio/fin y montos
- **Calendario de pagos** — Vista organizada por fechas de cuánto pagar y a quién
- **Apartados de ahorro** — Por cantidad fija o porcentaje de ingreso
- **Dispersión automática** — Al registrar ingreso, distribuye automáticamente a pagos y ahorros
- **Reportería** — Gasto por tarjeta, totales por periodo, balance general
- **Integración IA (opcional)** — Categorización de gastos, recomendaciones de ahorro, detección de gastos hormiga vía OpenAI

## Tech Stack

- [Next.js](https://nextjs.org/) 14+ (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/) + SQLite
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- Deploy en [Vercel](https://vercel.com/)

## Desarrollo

```bash
npm install
npm run dev
```

## Licencia

MIT
