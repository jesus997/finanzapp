# Documento de Diseño — FinanzApp

## 1. Entidades del Dominio

> Todos los nombres de entidades, campos y enums están en inglés siguiendo las [convenciones del proyecto](./CONVENTIONS.md).

### User
- id, email, name, image
- currency (default: MXN)
- createdAt, updatedAt
- Relación: NextAuth Account y Session (gestionadas por el adapter de Prisma)

### IncomeSource
- id, userId, name
- type: `SALARY` | `BONUS` | `CHRISTMAS_BONUS` | `PROFIT_SHARING` | `SAVINGS_FUND` | `PASSIVE` | `ACTIVE` | `WINDFALL` | `OTHER`
- amount, frequency, isVariable
- payDayType: `DAY_OF_MONTH` | `DAY_OF_WEEK`
- payDay: Int[] (días de pago, ej: [15, 30])
- payMonth: Int[] (meses de pago, para frecuencias que lo requieren)
- oneTimeDate: DateTime? (solo para frecuencia `ONE_TIME`)
- depositCardId: String? (tarjeta de débito donde se deposita, opcional)
- active

### Card
- id, userId, name, bank, lastFourDigits
- type: `CREDIT` | `DEBIT`
- network: `VISA` | `MASTERCARD` | `AMEX` | `OTHER`
- Solo crédito: creditLimit, cutOffDay, paymentDay, interestRate
- Relación inversa: incomeSources (fuentes de ingreso que depositan en esta tarjeta)

### Loan
- id, userId, name
- type: `BANK` | `PAYROLL` | `AUTO` | `INFONAVIT` | `MORTGAGE` | `OTHER`
- institution (banco/institución emisora)
- totalAmount, paymentAmount, interestRate
- paymentFrequency: Frequency (DAILY/WEEKLY/BIWEEKLY/MONTHLY, default: MONTHLY)
- startDate, endDate? (opcional — se estima automáticamente si se omite)
- cutOffDay: Int? (día de corte, opcional)
- paymentDueDay: Int (día de vencimiento del pago)
- remainingBalance

### RecurringExpense
- id, userId, name, description
- amount, frequency, startDate, endDate
- payDay: Int[] (días específicos de cobro; BIWEEKLY requiere 2, MONTHLY requiere 1)
- paymentMethodType: `CREDIT_CARD` | `DEBIT_CARD` | `INCOME_SOURCE`
- paymentMethodId (referencia polimórfica)
- category: `HOUSING` | `UTILITIES` | `SUBSCRIPTIONS` | `INSURANCE` | `TRANSPORTATION` | `FOOD` | `EDUCATION` | `HEALTH` | `ENTERTAINMENT` | `PERSONAL` | `PETS` | `DONATIONS` | `OTHER`

### SavingsFund
- id, userId, name
- type: `FIXED_AMOUNT` | `PERCENTAGE`
- value, incomeSourceId, accumulatedBalance

### Expense
- id, userId, name, description
- amount, date
- category (mismas 13 categorías que RecurringExpense)
- paymentMethodType: `CREDIT_CARD` | `DEBIT_CARD` | `INCOME_SOURCE`
- paymentMethodId (referencia polimórfica)
- Nota: gastos únicos/diarios, separados de RecurringExpense (compromisos periódicos)

### Distribution
- id, userId, incomeSourceId, date, totalAmount
- details: [{destinationType, destinationId, groupId?, amount}]
- groupId vincula gastos a la tarjeta con la que se pagan (para vista "por bolsas")

## 2. Enums compartidos

### Frequency
`ONE_TIME` | `DAILY` | `WEEKLY` | `BIWEEKLY` | `MONTHLY` | `BIMONTHLY` | `QUARTERLY` | `SEMIANNUAL` | `ANNUAL`

### PayDayType
`DAY_OF_MONTH` | `DAY_OF_WEEK`

## 3. Frecuencias y campos de fecha

| Frecuencia | Campos requeridos | Ejemplo |
|---|---|---|
| ONE_TIME | oneTimeDate | 15 de junio de 2026 |
| DAILY | — | Todos los días |
| WEEKLY | payDay (día de semana 0-6) | Miércoles |
| BIWEEKLY | payDay (2 días del mes) | 15, 30 |
| MONTHLY | payDay (1 día del mes) | 15 |
| BIMONTHLY | payDay + payMonth (6 pares) | 1 de Ene, 1 de Mar, ... |
| QUARTERLY | payDay + payMonth (4 pares) | 15 de Ene, 15 de Abr, ... |
| SEMIANNUAL | payDay + payMonth (2 pares) | 15 de Ene, 15 de Jul |
| ANNUAL | payDay + payMonth (1 par) | 20 de Dic |

## 4. Tabla de amortización de préstamos

- Función `calculateAmortization()` en `src/lib/utils/amortization.ts`
- Soporta frecuencias variables: DAILY (360 periodos/año), WEEKLY (52), BIWEEKLY (24), MONTHLY (12)
- Aplica IVA del 16% sobre intereses (`INTEREST_TAX_RATE = 0.16`) — impuesto mexicano sobre intereses de crédito
- Detecta pago insuficiente (pago < interés + IVA) — marca `insufficientPayment`, detiene cálculo y muestra advertencia
- Página de detalle `/prestamos/[id]` con 8 tarjetas de resumen + tabla de amortización expandible
- Componente `AmortizationTable` pagina a 12 filas con toggle "mostrar todo"

## 5. Flujo de Dispersión Automática

1. Usuario selecciona fuente de ingreso recibida (ej: nómina quincenal)
2. Sistema calcula cuántas veces al mes cobra (semanal=4, quincenal=2, mensual=1)
3. Para cada gasto periódico: convierte a equivalente mensual y divide entre cobros al mes
4. Agrupa gastos por tarjeta de crédito/débito → "bolsas" por tarjeta
5. Prorratea préstamos por cobro (pago mensual ÷ cobros al mes), convirtiendo según frecuencia del préstamo
6. Calcula ahorros vinculados (monto fijo o porcentaje del ingreso)
7. Muestra resumen: bolsas por tarjeta + préstamos + ahorros + sobrante
8. Usuario confirma → se registra la dispersión y se actualizan saldos de ahorro
9. Dispersiones se pueden revertir (revierte saldos de ahorro)

### Vista "Por bolsas"
Cada tarjeta se muestra como una cajita con el total a apartar y el desglose de gastos que se pagan con ella. Esto permite saber cuánto dinero separar para pagar cada tarjeta cuando llegue su fecha de pago.

## 6. Dashboard (Home)

El home muestra estadísticas rápidas al usuario autenticado:

- **Resumen del mes**: 4 tarjetas — ingresos, gastos (periódicos + diarios), préstamos, balance proyectado (ingresos - gastos - préstamos)
- **Ahorro y deuda**: 2 tarjetas — ahorro acumulado total, deuda total (suma de saldos restantes de préstamos)
- **Próximos pagos e ingresos**: hasta 5 eventos desde hoy, con colores por tipo y monto
- **Accesos rápidos**: grid de botones a cada módulo

Los totales del mes se calculan reutilizando `getCalendarEvents()` + aggregate de gastos diarios. Ahorro y deuda son queries directas.

## 7. Diseño Responsive

La app está optimizada para uso en móvil:

- **Navbar**: menú hamburguesa en mobile, links horizontales en desktop
- **Listas (ingresos, gastos)**: cards en mobile (`md:hidden`), tabla en desktop (`hidden md:block`)
- **Calendario**: vista de lista por día en mobile, grid de 7 columnas en desktop
- **Tabla de amortización**: scroll horizontal en pantallas pequeñas
- **Dashboard**: grid `grid-cols-2` en mobile, `lg:grid-cols-4` en desktop
- **Tarjetas de préstamos/ahorro**: ya usan `sm:grid-cols-2`, se adaptan bien
- **Formularios**: `max-w-md` funciona en mobile sin cambios
- **Tarjetas (cards page)**: vista de gastos por tarjeta con toggle expandible

## 8. Escaneo de tickets (OCR)

Permite registrar gastos diarios tomando una foto de un ticket de compra:

- **Interfaz abstracta** (`src/lib/ocr/types.ts`): `OcrProvider` con método `extractText()`
- **Tesseract.js** (`src/lib/ocr/tesseract-provider.ts`): OCR en el browser vía WebAssembly, sin API key
- **Factory** (`src/lib/ocr/index.ts`): `getOcrProvider()` retorna Tesseract por defecto. Preparado para retornar OpenAI Vision cuando se agregue el módulo de IA y exista `OPENAI_API_KEY`
- **Parser de tickets** (`src/lib/utils/receipt-parser.ts`): extrae nombre de tienda (primeras líneas), total (busca "TOTAL" de abajo hacia arriba, ignora SUBTOTAL), fecha (DD/MM/YYYY o DD-MM-YYYY)
- **Flujo**: usuario toca "📷 Escanear ticket" → abre cámara (`capture="environment"`) → Tesseract extrae texto → parser pre-llena nombre/monto/fecha → usuario confirma/edita → se guarda

## 9. Módulo IA (Opcional)

Funciona sin IA por defecto. Al configurar API key de OpenAI:
- Categorización automática de gastos
- Recomendaciones de ahorro basadas en patrones
- Detección de gastos hormiga
- Chat para consultas sobre finanzas personales
- Optimización de distribución de pagos

## 10. Páginas de la App

| Ruta | Estado | Descripción |
|---|---|---|
| `/` | ✅ | Dashboard con estadísticas, próximos eventos y accesos rápidos |
| `/ingresos` | ✅ | CRUD fuentes de ingreso con tarjeta de depósito opcional |
| `/tarjetas` | ✅ | CRUD tarjetas crédito y débito, vista de gastos por tarjeta |
| `/prestamos` | ✅ | CRUD préstamos con frecuencia de pago variable |
| `/prestamos/[id]` | ✅ | Detalle con tabla de amortización y resumen |
| `/gastos` | ✅ | CRUD gastos periódicos con método de pago, categorías y días de cobro |
| `/gastos-diarios` | ✅ | CRUD gastos únicos con escaneo de tickets (OCR) |
| `/ahorro` | ✅ | Gestión de apartados de ahorro (monto fijo o porcentaje) |
| `/calendario` | ✅ | Vista calendario mensual/lista con eventos de todos los módulos |
| `/dispersiones` | ✅ | Dispersión automática con prorrateo por cobro y agrupación por tarjeta |
| `/reportes` | 🔲 | Reportería y gráficas |
| `/ia` | 🔲 | Chat y herramientas IA |
| `/configuracion` | 🔲 | API keys, preferencias |
