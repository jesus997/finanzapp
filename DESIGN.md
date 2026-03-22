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
- active

### Card
- id, userId, name, bank, lastFourDigits
- type: `CREDIT` | `DEBIT`
- network: `VISA` | `MASTERCARD` | `AMEX` | `OTHER`
- Solo crédito: creditLimit, cutOffDay, paymentDay, interestRate

### Loan
- id, userId, name
- type: `BANK` | `PAYROLL` | `AUTO` | `INFONAVIT` | `MORTGAGE` | `OTHER`
- institution (banco/institución emisora)
- totalAmount, monthlyPayment, interestRate
- startDate, endDate, paymentDay, remainingBalance

### RecurringExpense
- id, userId, name, description
- amount, frequency, startDate, endDate
- paymentMethodType: `CREDIT_CARD` | `DEBIT_CARD` | `INCOME_SOURCE`
- paymentMethodId (referencia polimórfica)
- category: `HOUSING` | `UTILITIES` | `SUBSCRIPTIONS` | `INSURANCE` | `TRANSPORTATION` | `FOOD` | `EDUCATION` | `HEALTH` | `ENTERTAINMENT` | `PERSONAL` | `PETS` | `DONATIONS` | `OTHER`

### SavingsFund
- id, userId, name
- type: `FIXED_AMOUNT` | `PERCENTAGE`
- value, incomeSourceId, accumulatedBalance

### Distribution
- id, userId, incomeSourceId, date, totalAmount
- details: [{destinationType, destinationId, groupId?, amount}]
- groupId vincula gastos a la tarjeta con la que se pagan (para vista "por bolsas")

## 2. Enums compartidos

### Frequency
`ONE_TIME` | `WEEKLY` | `BIWEEKLY` | `MONTHLY` | `BIMONTHLY` | `QUARTERLY` | `SEMIANNUAL` | `ANNUAL`

### PayDayType
`DAY_OF_MONTH` | `DAY_OF_WEEK`

## 3. Frecuencias y campos de fecha

| Frecuencia | Campos requeridos | Ejemplo |
|---|---|---|
| ONE_TIME | oneTimeDate | 15 de junio de 2026 |
| WEEKLY | payDay (día de semana 0-6) | Miércoles |
| BIWEEKLY | payDay (2 días del mes) | 15, 30 |
| MONTHLY | payDay (1 día del mes) | 15 |
| BIMONTHLY | payDay + payMonth (6 pares) | 1 de Ene, 1 de Mar, ... |
| QUARTERLY | payDay + payMonth (4 pares) | 15 de Ene, 15 de Abr, ... |
| SEMIANNUAL | payDay + payMonth (2 pares) | 15 de Ene, 15 de Jul |
| ANNUAL | payDay + payMonth (1 par) | 20 de Dic |

## 4. Flujo de Dispersión Automática

1. Usuario selecciona fuente de ingreso recibida (ej: nómina quincenal)
2. Sistema calcula cuántas veces al mes cobra (semanal=4, quincenal=2, mensual=1)
3. Para cada gasto periódico: convierte a equivalente mensual y divide entre cobros al mes
4. Agrupa gastos por tarjeta de crédito/débito → "bolsas" por tarjeta
5. Prorratea préstamos por cobro (pago mensual ÷ cobros al mes)
6. Calcula ahorros vinculados (monto fijo o porcentaje del ingreso)
7. Muestra resumen: bolsas por tarjeta + préstamos + ahorros + sobrante
8. Usuario confirma → se registra la dispersión y se actualizan saldos de ahorro
9. Dispersiones se pueden revertir (revierte saldos de ahorro)

### Vista "Por bolsas"
Cada tarjeta se muestra como una cajita con el total a apartar y el desglose de gastos que se pagan con ella. Esto permite saber cuánto dinero separar para pagar cada tarjeta cuando llegue su fecha de pago.

## 5. Módulo IA (Opcional)

Funciona sin IA por defecto. Al configurar API key de OpenAI:
- Categorización automática de gastos
- Recomendaciones de ahorro basadas en patrones
- Detección de gastos hormiga
- Chat para consultas sobre finanzas personales
- Optimización de distribución de pagos

## 6. Páginas de la App

| Ruta | Estado | Descripción |
|---|---|---|
| `/` | ✅ | Dashboard (resumen, accesos rápidos) |
| `/ingresos` | ✅ | CRUD fuentes de ingreso |
| `/tarjetas` | ✅ | CRUD tarjetas crédito y débito |
| `/prestamos` | ✅ | CRUD préstamos (bancario, nómina, automotriz, Infonavit, hipotecario) |
| `/gastos` | ✅ | CRUD gastos periódicos con método de pago y categorías |
| `/ahorro` | ✅ | Gestión de apartados de ahorro (monto fijo o porcentaje) |
| `/calendario` | ✅ | Vista calendario mensual con eventos de todos los módulos |
| `/dispersiones` | ✅ | Dispersión automática con prorrateo por cobro y agrupación por tarjeta |
| `/reportes` | 🔲 | Reportería y gráficas |
| `/ia` | 🔲 | Chat y herramientas IA |
| `/configuracion` | 🔲 | API keys, preferencias |
