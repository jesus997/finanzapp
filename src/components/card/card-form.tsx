"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BankCombobox } from "@/components/ui/bank-combobox";
import { CARD_TYPE_LABELS, CARD_NETWORK_LABELS } from "@/lib/constants";
import { createCard, updateCard } from "@/lib/actions/card";
import type { CardType, CardNetwork } from "@prisma/client";

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

interface Props {
  card?: {
    id: string;
    name: string;
    bank: string;
    lastFourDigits: string;
    type: CardType;
    network: CardNetwork;
    creditLimit: number | null;
    cutOffDay: number | null;
    paymentDay: number | null;
    interestRate: number | null;
    currentBalance: number | null;
    monthlyPayment: number | null;
  };
}

export function CardForm({ card }: Props) {
  const router = useRouter();
  const [cardType, setCardType] = useState<CardType>(card?.type ?? "DEBIT");
  const isCredit = cardType === "CREDIT";

  const action = card ? updateCard.bind(null, card.id) : createCard;

  return (
    <form action={action} className="space-y-4 max-w-md">
      <input type="hidden" name="type" value={cardType} />
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={card?.name}
          placeholder="Ej: Nubank, Nómina BBVA"
        />
      </div>

      <div className="space-y-2">
        <Label>Banco emisor</Label>
        <BankCombobox name="bank" defaultValue={card?.bank} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastFourDigits">Últimos 4 dígitos</Label>
        <Input
          id="lastFourDigits"
          name="lastFourDigits"
          required
          inputMode="numeric"
          maxLength={4}
          minLength={4}
          pattern="\d{4}"
          title="Ingresa exactamente 4 dígitos"
          defaultValue={card?.lastFourDigits}
          placeholder="1234"
          className="font-mono tracking-widest"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        El nombre, banco y últimos 4 dígitos son solo para identificar la tarjeta fácilmente.
      </p>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select
          value={cardType}
          onValueChange={(v) => v && setCardType(v as CardType)}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder={CARD_TYPE_LABELS[cardType]} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CARD_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Crédito: los gastos asociados se consideran deuda. Débito: se tratan como gasto directo.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="network">Red</Label>
        <Select name="network" defaultValue={card?.network ?? "VISA"}>
          <SelectTrigger id="network">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CARD_NETWORK_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Solo para identificar visualmente la tarjeta (Visa, Mastercard, etc.).
        </p>
      </div>

      {isCredit && (
        <>
          <div className="space-y-2">
            <Label htmlFor="creditLimit">Límite de crédito</Label>
            <Input
              id="creditLimit"
              name="creditLimit"
              type="number"
              step="0.01"
              required
              defaultValue={card?.creditLimit?.toString()}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cutOffDay">Día de corte</Label>
              <Select name="cutOffDay" defaultValue={card?.cutOffDay?.toString()}>
                <SelectTrigger id="cutOffDay">
                  <SelectValue placeholder="Día" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_MONTH.map((d) => (
                    <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDay">Día de pago</Label>
              <Select name="paymentDay" defaultValue={card?.paymentDay?.toString()}>
                <SelectTrigger id="paymentDay">
                  <SelectValue placeholder="Día" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_MONTH.map((d) => (
                    <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Estos datos aparecen en tu estado de cuenta. El corte cierra el periodo y el pago es la fecha límite.
          </p>

          <div className="space-y-2">
            <Label htmlFor="interestRate">Tasa de interés (%)</Label>
            <Input
              id="interestRate"
              name="interestRate"
              type="number"
              step="0.01"
              defaultValue={card?.interestRate?.toString() ?? "0"}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              Tasa anual. Se usa para calcular intereses en la tabla de amortización.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="currentBalance">Saldo actual (opcional)</Label>
              <Input
                id="currentBalance"
                name="currentBalance"
                type="number"
                step="0.01"
                defaultValue={card?.currentBalance?.toString() ?? ""}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyPayment">Pago mensual (opcional)</Label>
              <Input
                id="monthlyPayment"
                name="monthlyPayment"
                type="number"
                step="0.01"
                defaultValue={card?.monthlyPayment?.toString() ?? ""}
                placeholder="0.00"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Si tienes compras a meses u otros cargos, pon cuánto debes y cuánto pagas al mes. Se incluye en la dispersión.
          </p>
        </>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          {card ? "Guardar cambios" : "Crear tarjeta"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
