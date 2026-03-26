export interface CalendarEvent {
  day: number;
  label: string;
  type: "income" | "card_payment" | "card_cutoff" | "loan" | "expense";
  amount: number | null;
  detail: string;
}
