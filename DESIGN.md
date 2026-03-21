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

### Loan *(pendiente de implementar)*
- id, userId, name
- type: `BANK` | `AUTO` | `INFONAVIT` | `MORTGAGE` | `OTHER`
- totalAmount, monthlyPayment, interestRate
- startDate, endDate, paymentDay, remainingBalance

### RecurringExpense *(pendiente de implementar)*
- id, userId, name, description
- amount, frequency, startDate, endDate
- paymentMethodType: `CREDIT_CARD` | `DEBIT_CARD` | `INCOME_SOURCE`
- paymentMethodId (referencia polimórfica)
- category (opcional, para IA)

### SavingsFund *(pendiente de implementar)*
- id, userId, name
- type: `FIXED_AMOUNT` | `PERCENTAGE`
- value, incomeSourceId, accumulatedBalance

### Distribution *(pendiente de implementar)*
- id, userId, incomeSourceId, date, totalAmount
- details: [{destinationType, destinationId, amount}]

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

1. Usuario registra ingreso recibido (ej: nómina quincenal)
2. Sistema busca reglas de dispersión vinculadas a esa fuente
3. Calcula montos: gastos periódicos que toca pagar + apartados de ahorro
4. Genera un resumen de dispersión para que el usuario confirme
5. Registra la dispersión y actualiza saldos

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
| `/prestamos` | 🔲 | CRUD préstamos |
| `/gastos` | 🔲 | CRUD gastos periódicos |
| `/calendario` | 🔲 | Vista calendario de pagos |
| `/ahorro` | 🔲 | Gestión de apartados de ahorro |
| `/dispersiones` | 🔲 | Historial y nueva dispersión |
| `/reportes` | 🔲 | Reportería y gráficas |
| `/ia` | 🔲 | Chat y herramientas IA |
| `/configuracion` | 🔲 | API keys, preferencias |
