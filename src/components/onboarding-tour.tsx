"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { completeOnboarding } from "@/lib/actions/onboarding";

export function OnboardingTour() {
  useEffect(() => {
    const tour = driver({
      showProgress: true,
      progressText: "{{current}} de {{total}}",
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "¡Empezar!",
      onDestroyed: () => {
        completeOnboarding();
      },
      steps: [
        {
          popover: {
            title: "¡Bienvenido a FinanzApp! 👋",
            description:
              "La idea es simple: cada quincena (o cada que cobras), separas dinero para pagar tus deudas y gastos. Así nunca se te pasa un pago y siempre sabes cuánto apartar.",
          },
        },
        {
          element: "#tour-summary",
          popover: {
            title: "Tu resumen del mes 📊",
            description:
              "Aquí ves de un vistazo cuánto ganas, cuánto debes y cuánto te queda. El balance proyectado te dice si tu quincena alcanza para cubrir todo.",
          },
        },
        {
          element: "#tour-upcoming",
          popover: {
            title: "Próximos pagos 📅",
            description:
              "Estos son tus próximos pagos e ingresos. Así nunca se te olvida una fecha de pago o de corte.",
          },
        },
        {
          element: "#tour-shortcuts",
          popover: {
            title: "Paso 1: Registra tus ingresos 💰",
            description:
              "Empieza registrando cuánto ganas y cada cuándo cobras (quincenal, semanal, mensual). Esto es la base para calcular cuánto puedes apartar.",
          },
        },
        {
          element: "#tour-shortcuts",
          popover: {
            title: "Paso 2: Agrega tus gastos y deudas 📝",
            description:
              "Registra tus gastos fijos (servicios, suscripciones), préstamos y tarjetas. La app calcula cuánto debes apartar de cada cobro para cubrirlos todos.",
          },
        },
        {
          element: "#tour-shortcuts",
          popover: {
            title: "Paso 3: Dispersa tu ingreso 🏦",
            description:
              "Cuando cobres, ve a Dispersiones. La app te dice exactamente cuánto separar para cada tarjeta, préstamo y ahorro. Como \"sobres\" digitales para cada compromiso.",
          },
        },
        {
          popover: {
            title: "¡Listo! 🎉",
            description:
              "Empieza registrando tus ingresos y gastos. La app se encarga de recordarte los pagos y calcular cuánto apartar. ¡Nunca más se te pasa un pago!",
          },
        },
      ],
    });

    // Small delay to ensure DOM elements are rendered
    const timeout = setTimeout(() => tour.drive(), 500);
    return () => clearTimeout(timeout);
  }, []);

  return null;
}
