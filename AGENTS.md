<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FinanzApp — Contexto para Agentes de IA

## Sobre el proyecto

FinanzApp es una app web open source de gestión de finanzas personales construida con Next.js 16, TypeScript, Prisma, PostgreSQL y shadcn/ui. Antes de escribir código, lee los siguientes documentos:

## Documentos de referencia obligatorios

- **[CONVENTIONS.md](./CONVENTIONS.md)** — Reglas de idioma (código en inglés, UI en español), nomenclatura, testing obligatorio, manejo de errores, y patrones del proyecto (hidden inputs para selects controlados, serialización Decimal/Date, buttonVariants, etc.)
- **[DESIGN.md](./DESIGN.md)** — Entidades del dominio, enums, tabla de frecuencias y campos de fecha, flujo de dispersión, y progreso de implementación de páginas.
- **[TECH_DECISIONS.md](./TECH_DECISIONS.md)** — Decisiones técnicas con justificaciones: PostgreSQL+Neon, NextAuth+GitHub, shadcn/base-ui (no Radix), Vitest, modelo Card unificado, etc.
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Estructura esperada para nuevos módulos, checklist de PR.

## Reglas críticas

1. **Código y BD en inglés**, documentación y UI en español.
2. **Tests obligatorios** para todo código nuevo. Schemas Zod en `src/lib/validations/` con `*.test.ts` junto al archivo.
3. **shadcn/ui usa base-ui, NO Radix**. No existe `asChild`. Los Selects controlados necesitan `<input type="hidden">` explícitos. `onValueChange` puede pasar `null` — usar `(v) => setState(v ?? "")`.
4. **Prisma Decimal/Date** no son serializables a Client Components. Convertir antes de pasar como props.
5. **Para delete con userId**, usar `deleteMany` en vez de `delete`.
6. **Botones de submit en Server Components**: usar `<button type="submit">` nativo, no el componente `Button` de base-ui.
7. **Dos tipos de gastos**: `RecurringExpense` (periódicos, participan en dispersión) y `Expense` (diarios/únicos, registro histórico). No mezclar.
8. **OCR con provider abstracto**: `OcrProvider` interface en `src/lib/ocr/`. Tesseract.js ahora, OpenAI Vision después. No acoplar a un provider específico.
