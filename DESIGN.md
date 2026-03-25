# Documento de Diseño — FinanzApp

## 1. Entidades del Dominio

> Todos los nombres de entidades, campos y enums están en inglés siguiendo las [convenciones del proyecto](./CONVENTIONS.md).

### User
- id, email, name, image
- currency (default: MXN)
- onboardingCompleted (default: false) — controla si el tutorial ya se mostró
- invitedById: String? (referencia al usuario que lo invitó)
- createdAt, updatedAt
- Relación: NextAuth Account y Session (gestionadas por el adapter de Prisma), invitedBy (User), invitees (User[]), invitations (Invitation[])

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

### Product (catálogo global)
- id, barcode (único global), name, brand?, description?
- source: `OPEN_FOOD_FACTS` | `MANUAL`
- Sin userId — compartido entre todos los usuarios
- Relación: prices (ProductPrice[]), shoppingItems (ShoppingItem[])

### Store
- id, name (único), address?, latitude?, longitude?, isDefault
- Seed: Walmart, Oxxo, Soriana (isDefault: true)
- Usuarios pueden crear tiendas custom (isDefault: false)
- Dirección y coordenadas opcionales, detectables por geolocalización

### ProductPrice
- id, productId, storeId, price, updatedAt
- Constraint único: productId + storeId
- Permite rastrear precios diferentes por tienda

### ShoppingSession
- id, userId, storeId, name (auto-generado: "{tienda} {fecha}")
- status: `IN_PROGRESS` | `COMPLETED`
- paymentMethodType?, paymentMethodId? (se asignan al completar)
- estimatedTotal, finalTotal? (después de validación con ticket)
- expenseId? (referencia al Expense generado al completar)
- date

### ShoppingItem
- id, shoppingSessionId, productId?
- name, barcode?, estimatedPrice, finalPrice?
- quantity (default: 1), notes?

### Invitation
- id, code (único), inviterId
- usedByEmail: String? (email del usuario que usó la invitación)
- usedAt: DateTime? (fecha de uso)
- createdAt
- Máximo 10 invitaciones por usuario

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
- **Compra en progreso**: si hay sesiones de compra activas, muestra banner con la más reciente (nombre, productos, total) y botón para continuar. Si hay más de una, link para ver todas.
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

### Navegación mobile nativa
- **Bottom bar fija**: botón de menú, acceso directo a Inicio y Calendario, FAB (+) con acciones rápidas de creación
- **Drawer lateral**: se abre con swipe desde borde izquierdo o botón de menú. Links con iconos y estado activo. Sección inferior con foto de perfil, nombre, botón de info (versión, deploy, disclaimer) y cerrar sesión
- **Desktop**: navbar con dropdowns agrupados (Gastos, Más) y botón 'Nuevo' con dropdown de acciones rápidas

## 8. Escaneo de tickets (OCR)

Permite registrar gastos diarios tomando una foto de un ticket de compra:

- **Interfaz abstracta** (`src/lib/ocr/types.ts`): `OcrProvider` con método `extractText()`
- **Tesseract.js** (`src/lib/ocr/tesseract-provider.ts`): OCR en el browser vía WebAssembly, sin API key
- **Factory** (`src/lib/ocr/index.ts`): `getOcrProvider()` retorna Tesseract por defecto. Preparado para retornar OpenAI Vision cuando se agregue el módulo de IA y exista `OPENAI_API_KEY`
- **Parser de tickets** (`src/lib/utils/receipt-parser.ts`): extrae nombre de tienda (primeras líneas), total (busca "TOTAL" de abajo hacia arriba, ignora SUBTOTAL), fecha (DD/MM/YYYY o DD-MM-YYYY)
- **Flujo**: usuario toca "📷 Escanear ticket" → abre cámara (`capture="environment"`) → Tesseract extrae texto → parser pre-llena nombre/monto/fecha → usuario confirma/edita → se guarda

## 9. Onboarding (Tutorial para nuevos usuarios)

Tour guiado con Driver.js que se muestra al primer inicio de sesión:

- **Persistencia**: campo `onboardingCompleted` en User. Se marca `true` al completar o cerrar el tour.
- **7 pasos**: bienvenida (concepto de la app: separar dinero cada quincena para cubrir deudas), resumen del mes, próximos pagos, registrar ingresos, agregar gastos/deudas, usar dispersiones, cierre.
- **Mensaje central**: "Cada quincena separas dinero para pagar tus deudas y gastos. Así nunca se te pasa un pago y siempre sabes cuánto apartar."
- **Componente**: `src/components/onboarding-tour.tsx` (Client Component)
- **Action**: `src/lib/actions/onboarding.ts` (`completeOnboarding`, `getOnboardingStatus`)

## 10. Lista de Compras (Shopping)

Módulo para registrar compras en el supermercado en tiempo real con escaneo de códigos de barras.

### Flujo principal

1. Usuario toca "Nueva compra" → selecciona tienda → crea ShoppingSession (IN_PROGRESS)
2. Escanea código de barras con la cámara del celular (html5-qrcode, solo mobile — oculto en desktop en producción, disponible en dev)
   - Busca en Product local (catálogo global por barcode)
   - Si no existe → busca en Open Food Facts API
   - Si no existe → formulario manual → crea Product global
   - Agrega ShoppingItem con estimatedPrice (de ProductPrice para esa tienda, o manual)
3. Pantalla muestra lista con total acumulado en tiempo real
   - Tres modos de precio: por unidad (precio × cantidad), por peso (precio/kg × peso), precio fijo
   - Total calculado automáticamente en tiempo real
4. Usuario puede editar precio/cantidad de cualquier item (ej: frutas por kilo)
5. Al terminar → botón 'Terminar compra' abre dialog preguntando si quiere revisar
   - Sí: dialog con escaneo de ticket OCR, ajuste de precios con diff, método de pago
   - No: dialog solo con método de pago
6. Usuario selecciona método de pago y confirma → status = COMPLETED
   - Crea Expense automático (gasto diario) con finalTotal y categoría FOOD
   - Upsert ProductPrice para cada producto en esa tienda (precio actualizado)
   - Vincula expenseId en la sesión

### Resolución de productos (orden de búsqueda)

```
scanBarcode(code, storeId) →
  1. SELECT FROM Product WHERE barcode = code
     → encontrado: retorna nombre + precio de ESA tienda (ProductPrice)
  2. GET https://world.openfoodfacts.org/api/v2/product/{code}
     → encontrado: crea Product global (source: OPEN_FOOD_FACTS)
  3. → no encontrado: formulario manual, crea Product global (source: MANUAL)
```

### Catálogo global de productos

- `Product` no tiene `userId` — es compartido entre todos los usuarios
- Conforme más usuarios escanean, el catálogo se enriquece
- `ProductPrice` rastrea precios por tienda, se actualiza al completar cada compra

### Tiendas

- 3 tiendas predefinidas (seed): Walmart, Oxxo, Soriana
- Usuarios pueden crear tiendas custom con dirección y coordenadas opcionales
- Geolocalización: detecta ubicación actual y resuelve dirección vía Nominatim (OpenStreetMap)
- Las predefinidas (isDefault: true) no se pueden eliminar

## 11. Módulo IA (Opcional)

Funciona sin IA por defecto. Al configurar API key de OpenAI:
- Categorización automática de gastos
- Recomendaciones de ahorro basadas en patrones
- Detección de gastos hormiga
- Chat para consultas sobre finanzas personales
- Optimización de distribución de pagos

## 12. Páginas de la App

| Ruta | Estado | Descripción |
|---|---|---|
| `/` | ✅ | Dashboard con estadísticas, próximos eventos, accesos rápidos y onboarding |
| `/ingresos` | ✅ | CRUD fuentes de ingreso con tarjeta de depósito opcional |
| `/tarjetas` | ✅ | CRUD tarjetas crédito y débito, vista de gastos por tarjeta |
| `/prestamos` | ✅ | CRUD préstamos con frecuencia de pago variable |
| `/prestamos/[id]` | ✅ | Detalle con tabla de amortización y resumen |
| `/gastos` | ✅ | CRUD gastos periódicos con método de pago, categorías y días de cobro |
| `/gastos-diarios` | ✅ | CRUD gastos únicos con escaneo de tickets (OCR) |
| `/ahorro` | ✅ | Gestión de apartados de ahorro (monto fijo o porcentaje) |
| `/calendario` | ✅ | Vista calendario mensual/lista con eventos de todos los módulos |
| `/dispersiones` | ✅ | Dispersión automática con prorrateo por cobro y agrupación por tarjeta |
| `/compras` | ✅ | Historial de sesiones de compra |
| `/compras/nueva` | ✅ | Seleccionar tienda e iniciar compra |
| `/compras/[id]` | ✅ | Lista de compra en vivo con escaneo de códigos + completar con ticket OCR |
| `/invitaciones` | ✅ | Gestión de invitaciones (generar, copiar, eliminar) |
| `/invitar/[code]` | ✅ | Landing de invitación con nombre/foto del invitador |
| `/admin` | ✅ | Panel admin: estadísticas globales |
| `/admin/usuarios` | ✅ | Lista de usuarios con invitaciones enviadas/usadas |
| `/admin/invitaciones` | ✅ | Todas las invitaciones del sistema con estado |
| `/admin/productos` | ✅ | Catálogo global de productos: editar, eliminar |
| `/reportes` | 🔲 | Reportería y gráficas |
| `/ia` | 🔲 | Chat y herramientas IA |
| `/configuracion` | 🔲 | API keys, preferencias |

## 13. Sistema de Invitaciones

Sistema de invitación por enlace único para controlar el acceso de nuevos usuarios.

### Flujo del invitador
1. Va a `/invitaciones` y genera un enlace (código hex de 12 caracteres)
2. Comparte el enlace `/invitar/[code]`
3. Ve estado de cada invitación: pendiente o usada (con email)
4. Puede eliminar invitaciones no usadas. Máximo 10 por usuario.

### Flujo del invitado
1. Abre `/invitar/[code]` → ve foto y nombre del invitador
2. Texto: '{nombre} te ha invitado a usar FinanzApp'
3. Elige GitHub o Google para crear cuenta
4. Código se guarda en cookie → se valida en signIn callback
5. Al crear usuario, se marca invitación como usada y se vincula invitedById

### Control de acceso
- ALLOWED_EMAILS: whitelist que siempre puede entrar
- Usuarios existentes: siempre pueden hacer login
- Usuarios nuevos sin invitación válida: rechazados

## 14. Indicadores de Carga

- **Barra de progreso global**: línea delgada en la parte superior que aparece durante navegaciones entre páginas
- **Loading skeletons**: todas las rutas tienen `loading.tsx` con esqueletos animados
- **Dashboard interactivo**: tarjetas de resumen son links clickeables, eventos próximos abren dialog con detalle completo

## 15. Panel de Administración

Panel exclusivo para administradores del sistema, protegido por `ADMIN_EMAILS` (variable de entorno con emails separados por coma).

- **Resumen**: contadores globales (usuarios, invitaciones usadas/total, productos, tiendas, sesiones de compra)
- **Usuarios**: lista con foto, nombre, email, quién los invitó, invitaciones enviadas/usadas, fecha de registro
- **Invitaciones**: todas las invitaciones del sistema con código, invitador, estado (pendiente/usada), quién la usó
- **Productos**: catálogo global con edición inline (nombre, marca, descripción) y eliminación

El layout `/admin` verifica el email del usuario contra `ADMIN_EMAILS` y redirige a `/` si no es admin. No se requiere campo `role` en la BD.

## 16. Roadmap / Pendientes

### Próximas funcionalidades
- **Reportería** — Gasto por tarjeta, totales por periodo, balance general, gráficas de tendencia
- **Módulo IA** — Categorización automática de gastos, recomendaciones de ahorro, detección de gastos hormiga, chat financiero (OpenAI). El OCR de tickets ya está preparado para usar Vision como provider alternativo
- **Configuración** — Página de settings: API keys (OpenAI), preferencias de moneda, tema
- **Pagos adelantados de préstamos** — Registrar abonos a capital y recalcular amortización
- **Mejoras al OCR** — Provider de OpenAI Vision para mejor precisión en tickets, extracción de detalle de productos

### Mejoras técnicas pendientes
- Considerar PWA para mejor experiencia móvil (viewport ya configurado)
