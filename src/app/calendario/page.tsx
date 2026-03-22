import { getCalendarEvents } from "@/lib/actions/calendar";
import { PaymentCalendar } from "@/components/calendar/payment-calendar";

export default async function CalendarPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const events = await getCalendarEvents(year, month);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Calendario de pagos</h1>
      <PaymentCalendar
        initialYear={year}
        initialMonth={month}
        initialEvents={events}
        fetchEvents={getCalendarEvents}
      />
    </div>
  );
}
