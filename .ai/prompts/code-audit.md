# Code Audit — Análisis de mejoras y optimizaciones

## Objetivo

Analiza el proyecto en profundidad buscando áreas de mejora, optimizaciones y problemas potenciales. Revisa el código fuente, la documentación del proyecto, el schema de base de datos, la lógica de negocio, componentes, validaciones y configuración.

## Categorías a evaluar

### 1. Seguridad
- Auth checks faltantes o inconsistentes
- Validación de datos insuficiente
- Referencias sin foreign key o constraints
- Permisos y control de acceso
- Exposición de datos sensibles

### 2. Testing
- Cobertura actual vs esperada
- Áreas sin tests (lógica crítica, componentes, API routes)
- Tests frágiles o incompletos

### 3. Complejidad
- Archivos o funciones demasiado grandes (>200 LOC)
- Lógica duplicada entre módulos
- Candidatos a refactor o descomposición

### 4. Modelo de datos
- Tipos incorrectos (strings donde debería haber enums)
- Constraints faltantes en BD
- Índices necesarios para queries frecuentes
- Relaciones sin integridad referencial

### 5. Performance
- Queries excesivas por request (N+1, cascadas)
- Falta de caching o memoización
- Cálculos redundantes

### 6. UX / Código
- Código duplicado (funciones helper repetidas)
- Patrones inconsistentes entre módulos
- Dependencias no utilizadas
- Problemas de accesibilidad

## Formato de salida

Para cada hallazgo:
- **Qué**: Descripción del problema
- **Dónde**: Archivo y línea si aplica
- **Severidad**: Crítico / Importante / Menor
- **Sugerencia**: Cómo resolverlo

## Post-análisis

Después de completar el análisis:
1. Lee el archivo `IMPROVEMENTS.md` del proyecto (si existe).
2. Marca con `[x]` las mejoras que ya estén resueltas en el código actual.
3. Agrega las nuevas recomendaciones en la categoría correspondiente.
4. No elimines items existentes, solo actualiza su estado.
5. Si `IMPROVEMENTS.md` no existe, créalo con todos los hallazgos.
