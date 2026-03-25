export default function PrivacyPage() {
  return (
    <div className="prose prose-sm max-w-2xl mx-auto py-8 px-4">
      <h1>Política de Privacidad</h1>
      <p className="text-muted-foreground">Última actualización: 25 de marzo de 2026</p>

      <h2>1. Información que recopilamos</h2>
      <p>
        FinanzApp recopila únicamente la información necesaria para el funcionamiento del servicio:
      </p>
      <ul>
        <li><strong>Datos de autenticación:</strong> nombre, email y foto de perfil proporcionados por tu proveedor de inicio de sesión (GitHub o Google).</li>
        <li><strong>Datos financieros:</strong> ingresos, gastos, tarjetas, préstamos y ahorros que registres voluntariamente en la aplicación.</li>
      </ul>

      <h2>2. Cómo usamos tu información</h2>
      <p>Tu información se usa exclusivamente para:</p>
      <ul>
        <li>Autenticarte y mantener tu sesión activa.</li>
        <li>Mostrarte tus datos financieros personales dentro de la aplicación.</li>
        <li>Calcular estadísticas, dispersiones y eventos de calendario basados en tus datos.</li>
      </ul>

      <h2>3. Almacenamiento y seguridad</h2>
      <p>
        Los datos se almacenan en una base de datos PostgreSQL hospedada en Neon (neon.tech) con conexión cifrada (SSL).
        Las sesiones se gestionan mediante NextAuth.js con tokens seguros.
      </p>

      <h2>4. Compartición de datos</h2>
      <p>
        No vendemos, compartimos ni transferimos tus datos personales a terceros.
        El catálogo de productos (nombre y código de barras) es compartido entre usuarios para enriquecer la base de datos, pero no contiene información personal.
      </p>

      <h2>5. Servicios de terceros</h2>
      <ul>
        <li><strong>GitHub / Google:</strong> autenticación OAuth. Consulta sus políticas de privacidad respectivas.</li>
        <li><strong>Open Food Facts:</strong> búsqueda de productos por código de barras (API pública).</li>
        <li><strong>Nominatim (OpenStreetMap):</strong> geocodificación inversa opcional al registrar tiendas.</li>
      </ul>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes solicitar la eliminación de tu cuenta y todos tus datos en cualquier momento contactando al administrador del sistema.
      </p>

      <h2>7. Cambios a esta política</h2>
      <p>
        Nos reservamos el derecho de actualizar esta política. Los cambios se publicarán en esta página con la fecha de actualización.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Para dudas sobre privacidad, abre un issue en el{" "}
        <a href="https://github.com/jesus997/finanzapp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          repositorio de GitHub
        </a>.
      </p>
    </div>
  );
}
