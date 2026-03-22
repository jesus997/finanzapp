export const INCOME_TYPE_LABELS: Record<string, string> = {
  SALARY: "Nómina",
  BONUS: "Bonos",
  CHRISTMAS_BONUS: "Aguinaldo",
  PROFIT_SHARING: "Reparto de utilidades (PTU)",
  SAVINGS_FUND: "Fondo/Caja de ahorro",
  PASSIVE: "Ingreso pasivo",
  ACTIVE: "Ingreso activo",
  WINDFALL: "Ingreso extraordinario",
  OTHER: "Otro",
};

export const FREQUENCY_LABELS: Record<string, string> = {
  ONE_TIME: "Único",
  DAILY: "Diario",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
  BIMONTHLY: "Bimestral",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  ANNUAL: "Anual",
};

export const WEEKDAY_LABELS: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export const MONTH_LABELS: Record<number, string> = {
  1: "Enero",
  2: "Febrero",
  3: "Marzo",
  4: "Abril",
  5: "Mayo",
  6: "Junio",
  7: "Julio",
  8: "Agosto",
  9: "Septiembre",
  10: "Octubre",
  11: "Noviembre",
  12: "Diciembre",
};

/** Frecuencias que requieren especificar mes(es) de pago */
export const FREQUENCIES_REQUIRING_MONTH = new Set([
  "ANNUAL",
  "SEMIANNUAL",
  "QUARTERLY",
  "BIMONTHLY",
]);

export const CARD_TYPE_LABELS: Record<string, string> = {
  CREDIT: "Crédito",
  DEBIT: "Débito",
};

export const CARD_NETWORK_LABELS: Record<string, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  AMEX: "American Express",
  OTHER: "Otra",
};

export const LOAN_TYPE_LABELS: Record<string, string> = {
  BANK: "Bancario",
  PAYROLL: "Nómina",
  AUTO: "Automotriz",
  INFONAVIT: "Infonavit",
  MORTGAGE: "Hipotecario",
  OTHER: "Otro",
};

export const LOAN_PAYMENT_FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
};

export const MEXICAN_BANKS = [
  "BBVA",
  "Banorte",
  "Santander",
  "Citibanamex",
  "HSBC",
  "Scotiabank",
  "Banco Azteca",
  "BanCoppel",
  "Inbursa",
  "Infonavit",
  "Nu México",
  "Hey Banco",
  "Banregio",
  "Afirme",
  "Invex",
  "Liverpool",
  "Palacio de Hierro",
  "American Express",
  "Costco Citibanamex",
] as const;

export const PAYMENT_METHOD_TYPE_LABELS: Record<string, string> = {
  CREDIT_CARD: "Tarjeta de crédito",
  DEBIT_CARD: "Tarjeta de débito",
  INCOME_SOURCE: "Fuente de ingreso",
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  HOUSING: "Vivienda",
  UTILITIES: "Servicios (luz, agua, gas, internet)",
  SUBSCRIPTIONS: "Suscripciones",
  INSURANCE: "Seguros",
  TRANSPORTATION: "Transporte",
  FOOD: "Alimentación",
  EDUCATION: "Educación",
  HEALTH: "Salud",
  ENTERTAINMENT: "Entretenimiento",
  PERSONAL: "Cuidado personal",
  PETS: "Mascotas",
  DONATIONS: "Donaciones",
  OTHER: "Otro",
};

export const SAVINGS_TYPE_LABELS: Record<string, string> = {
  FIXED_AMOUNT: "Monto fijo",
  PERCENTAGE: "Porcentaje del ingreso",
};
