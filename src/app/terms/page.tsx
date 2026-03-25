export default function TermsPage() {
  return (
    <div className="prose prose-sm max-w-2xl mx-auto py-8 px-4">
      <h1>Términos y Condiciones</h1>
      <p className="text-muted-foreground">Última actualización: 25 de marzo de 2026</p>

      <h2>1. Aceptación de los términos</h2>
      <p>
        Al acceder y usar FinanzApp, aceptas estos términos y condiciones. Si no estás de acuerdo, no uses el servicio.
      </p>

      <h2>2. Descripción del servicio</h2>
      <p>
        FinanzApp es una herramienta gratuita y open source de gestión de finanzas personales.
        Permite registrar ingresos, gastos, tarjetas, préstamos y ahorros para llevar un control personal.
      </p>

      <h2>3. Uso del servicio</h2>
      <ul>
        <li>El acceso requiere una invitación válida o estar en la lista de emails autorizados.</li>
        <li>Eres responsable de la veracidad de los datos que registres.</li>
        <li>No uses el servicio para actividades ilegales o que violen derechos de terceros.</li>
      </ul>

      <h2>4. Cuentas de usuario</h2>
      <p>
        Tu cuenta se crea mediante autenticación con GitHub o Google. Eres responsable de mantener la seguridad de tu cuenta en estos proveedores.
      </p>

      <h2>5. Limitación de responsabilidad</h2>
      <p>
        FinanzApp se proporciona &quot;tal cual&quot; sin garantías de ningún tipo. Este es un proyecto de hobby creado con asistencia de IA.
        No garantizamos:
      </p>
      <ul>
        <li>La disponibilidad continua del servicio.</li>
        <li>La exactitud de los cálculos financieros (amortización, dispersiones, etc.).</li>
        <li>La permanencia de los datos almacenados.</li>
      </ul>
      <p>
        No somos responsables de decisiones financieras tomadas con base en la información mostrada por la aplicación.
        Consulta siempre a un profesional financiero.
      </p>

      <h2>6. Propiedad intelectual</h2>
      <p>
        FinanzApp es software open source bajo licencia MIT. El código fuente está disponible en{" "}
        <a href="https://github.com/jesus997/finanzapp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          GitHub
        </a>.
      </p>

      <h2>7. Terminación</h2>
      <p>
        Nos reservamos el derecho de suspender o eliminar cuentas que violen estos términos o que se consideren abusivas.
      </p>

      <h2>8. Cambios a los términos</h2>
      <p>
        Podemos modificar estos términos en cualquier momento. Los cambios se publicarán en esta página.
        El uso continuado del servicio implica la aceptación de los términos actualizados.
      </p>

      <h2>9. Contacto</h2>
      <p>
        Para dudas sobre estos términos, abre un issue en el{" "}
        <a href="https://github.com/jesus997/finanzapp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          repositorio de GitHub
        </a>.
      </p>
    </div>
  );
}
