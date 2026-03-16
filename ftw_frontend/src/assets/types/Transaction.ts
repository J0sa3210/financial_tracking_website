import { CounterpartView } from "./Counterpart";

export class TransactionTableView {
  id!: number;
  category_id!: number | null;

  category_name: string | null = null;
  category_type_name: string | null = null;

  counterpart_id: number | null = null;
  counterpart: CounterpartView | null = null;

  owner_iban!: string;

  value!: number;
  date_executed!: Date;
  description!: string | null;

  constructor(data?: Partial<TransactionTableView>) {
    if (!data) return;

    Object.assign(this, data);

    this.date_executed = data.date_executed
      ? new Date(data.date_executed as any)
      : this.date_executed;

    this.counterpart = data.counterpart
      ? new CounterpartView(data.counterpart.id, data.counterpart.name)
      : null;
  }
}
