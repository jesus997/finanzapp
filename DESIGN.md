# Documento de Diseño — FinanzApp

## 1. Entidades del Dominio

> Nota: Todos los nombres de entidades, campos y enums están en inglés siguiendo las [convenciones del proyecto](./CONVENTIONS.md).

### User
- id, email, name, image
- currency (default: MXN)
- createdAt, updatedAt
- Relación: NextAuth Account y Session (gestionadas por el adapter de Prisma)

### IncomeSource
- id, name, type (SALARY | PASSIVE | ACTIVE | OTHER)
- amount, frequency (WEEKLY | BIWEEKLY | MONTHLY | BIMONTHLY | OTHER)
- payDay, active

### CreditCard
- id, name, bank, lastFourDigits
- creditLimit, cutOffDay (día del mes), paymentDay (día del mes)
- interestRate

### DebitCard
- id, name, bank, lastFourDigits
- incomeSourceId (vinculada a una fuente de ingreso)

### Loan
- id, name, type (BANK | AUTO | INFONAVIT | MORTGAGE | OTHER)
- totalAmount, monthlyPayment, interestRate
- startDate, endDate, paymentDay
- remainingBalance

### RecurringExpense
- id, name, description
- amount, frequency (WEEKLY | BIWEEKLY | MONTHLY | BIMONTHLY | QUARTERLY | SEMIANNUAL | ANNUAL)
- startDate, endDate
- totalAmount (calculado: amount × número de periodos)
- paymentMethodType (CREDIT_CARD | DEBIT_CARD | INCOME_SOURCE)
- paymentMethodId (referencia polimórfica)
- category (opcional, para IA)

### SavingsFund
- id, name
- type (FIXED_AMOUNT | PERCENTAGE)
- value (monto fijo o porcentaje)
- incomeSourceId
- accumulatedBalance

### Distribution
- id, incomeSourceId
- date, totalAmount
- details: [{destinationType, destinationId, amount}]

## 2. Periodicidades Soportadas

| Clave        | Frecuencia   | Días aprox |
|--------------|-------------|------------|
| WEEKLY       | Cada 7 días  | 7          |
| BIWEEKLY     | Cada 15 días | 15         |
| MONTHLY      | Cada mes     | 30         |
| BIMONTHLY    | Cada 2 meses | 60         |
| QUARTERLY    | Cada 3 meses | 90         |
| SEMIANNUAL   | Cada 6 meses | 180        |
| ANNUAL       | Cada año     | 365        |

## 3. Flujo de Dispersión Automática

1. Usuario registra ingreso recibido (ej: nómina quincenal)
2. Sistema busca reglas de dispersión vinculadas a esa fuente
3. Calcula montos: gastos periódicos que toca pagar + apartados de ahorro
4. Genera un resumen de dispersión para que el usuario confirme
5. Registra la dispersión y actualiza saldos

## 4. Módulo IA (Opcional)

Funciona sin IA por defecto. Al configurar API key de OpenAI:
- Categorización automática de gastos
- Recomendaciones de ahorro basadas en patrones
- Detección de gastos hormiga
- Chat para consultas sobre finanzas personales
- Optimización de distribución de pagos

## 5. Páginas de la App

- `/` — Dashboard (resumen, próximos pagos, balance)
- `/ingresos` — CRUD fuentes de ingreso
- `/tarjetas` — CRUD tarjetas crédito y débito
- `/prestamos` — CRUD préstamos
- `/gastos` — CRUD gastos periódicos
- `/calendario` — Vista calendario de pagos
- `/ahorro` — Gestión de apartados de ahorro
- `/dispersiones` — Historial y nueva dispersión
- `/reportes` — Reportería y gráficas
- `/ia` — Chat y herramientas IA (si está configurado)
- `/configuracion` — API keys, preferencias
