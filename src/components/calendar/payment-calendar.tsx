"use client";

import { useState } from "react";
import { MONTH_LABELS } from "@/lib/constants";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { CalendarEvent } from "@/lib/actions/calendar";

const EVENT_STYLES: Record<string, string> = {
  income: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  card_payment: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  card_cutoff: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  loan: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  expense: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  income: "Ingreso",
  card_payment: "Pago tarjeta",
  card_cutoff: "Corte tarjeta",
  loan: "Préstamo",
  expense: "Gasto",
};

interface Props {
  initialYear: number;
  initialMonth: number;
  initialEvents: CalendarEvent[];
  fetchEvents: (year: number, month: number) => Promise<CalendarEvent[]>;
}

function EventChip({ event }: { event: CalendarEvent }) {
  const fmt = (n: number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  return (
    <Popover>
      <PopoverTrigger
        className={`w-full truncate rounded px-1 py-0.5 text-[0.65rem] leading-tight text-left cursor-pointer hover:opacity-80 ${EVENT_STYLES[event.type]}`}
      >
        {event.label}
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-2 text-sm" align="start">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{event.label}</p>
          <span className={`rounded px-1.5 py-0.5 text-[0.65rem] ${EVENT_STYLES[event.type]}`}>
            {EVENT_TYPE_LABELS[event.type]}
          </span>
        </div>
        {event.amount != null && (
          <p className="text-lg font-medium">{fmt(event.amount)}</p>
        )}
        {event.detail !== "" && (
          <p className="text-xs text-muted-foreground">{event.detail}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}

function EventListItem({ event }: { event: CalendarEvent }) {
  const fmt = (n: number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${EVENT_STYLES[event.type]}`}>
      <div>
        <p className="text-sm font-medium">{event.label}</p>
        <p className="text-xs opacity-75">{EVENT_TYPE_LABELS[event.type]}</p>
      </div>
      {event.amount != null && (
        <p className="text-sm font-semibold">{fmt(event.amount)}</p>
      )}
    </div>
  );
}

export function PaymentCalendar({ initialYear, initialMonth, initialEvents, fetchEvents }: Props) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const navigate = async (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) { newMonth = 12; newYear--; }
    if (newMonth > 12) { newMonth = 1; newYear++; }
    setMonth(newMonth);
    setYear(newYear);
    setShowPast(false);
    setLoading(true);
    const data = await fetchEvents(newYear, newMonth);
    setEvents(data);
    setLoading(false);
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const eventsByDay: Record<number, CalendarEvent[]> = {};
  for (const e of events) {
    (eventsByDay[e.day] ??= []).push(e);
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  // Days that have events (for mobile list view)
  const daysWithEvents = Object.keys(eventsByDay)
    .map(Number)
    .sort((a, b) => a - b);

  const todayDay = isCurrentMonth ? today.getDate() : 1;
  const futureDays = daysWithEvents.filter((d) => d >= todayDay);
  const pastDays = daysWithEvents.filter((d) => d < todayDay);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-sm hover:underline">
          ← Anterior
        </button>
        <h2 className="text-lg font-semibold">
          {MONTH_LABELS[month]} {year}
        </h2>
        <button onClick={() => navigate(1)} className="text-sm hover:underline">
          Siguiente →
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
          <span key={type} className={`rounded px-2 py-0.5 ${EVENT_STYLES[type]}`}>
            {label}
          </span>
        ))}
      </div>

      {/* Mobile: list view — from today forward */}
      <div className={`md:hidden space-y-4 ${loading ? "opacity-50" : ""}`}>
        {pastDays.length > 0 && !showPast && (
          <button
            onClick={() => setShowPast(true)}
            className="w-full rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Ver {pastDays.length} día{pastDays.length > 1 ? "s" : ""} anterior{pastDays.length > 1 ? "es" : ""} con pagos
          </button>
        )}
        {showPast && pastDays.map((day) => (
          <div key={day} className="space-y-2 opacity-60">
            <p className="text-sm font-semibold">Día {day}</p>
            <div className="space-y-1.5">
              {eventsByDay[day].map((e, idx) => (
                <EventListItem key={idx} event={e} />
              ))}
            </div>
          </div>
        ))}
        {showPast && pastDays.length > 0 && futureDays.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 border-t" />
            <span>Hoy</span>
            <div className="flex-1 border-t" />
          </div>
        )}
        {futureDays.length === 0 && pastDays.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin eventos este mes.</p>
        ) : futureDays.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin eventos pendientes este mes.</p>
        ) : (
          futureDays.map((day) => {
            const isToday = isCurrentMonth && today.getDate() === day;
            return (
              <div key={day} className="space-y-2">
                <p className={`text-sm font-semibold ${isToday ? "text-primary" : ""}`}>
                  {isToday && "● "}Día {day}
                </p>
                <div className="space-y-1.5">
                  {eventsByDay[day].map((e, idx) => (
                    <EventListItem key={idx} event={e} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop: grid view */}
      <div className={`hidden md:grid grid-cols-7 gap-px rounded-xl border bg-muted overflow-hidden ${loading ? "opacity-50" : ""}`}>
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
          <div key={d} className="bg-background p-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}

        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-background p-2" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dayEvents = eventsByDay[day] ?? [];
          const isToday = isCurrentMonth && today.getDate() === day;

          return (
            <div
              key={day}
              className={`min-h-[80px] bg-background p-1.5 ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
            >
              <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                {day}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.map((e, idx) => (
                  <EventChip key={idx} event={e} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
