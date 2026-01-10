export class Transaction {
  id: number;
  value: number;
  description: string;
  date_executed: Date; // e.g., "2024-06-10"
  transaction_type: string;
  category_id: number;
  category_name: string;
  owner_iban: string;
  counterpart_name: string;
  counterpart_id: number;

  constructor(
    id: number,
    value: number,
    description: string,
    date_executed: string,
    transaction_type: string,
    category_id: number,
    category_name: string,
    owner_iban: string,
    counterpart_name: string,
    counterpart_id: number
  ) {
    this.id = id;
    this.value = value;
    this.description = description;
    this.date_executed = new Date(date_executed);
    this.transaction_type = transaction_type;
    this.category_id = category_id;
    this.category_name = category_name;
    this.owner_iban = owner_iban;
    this.counterpart_name = counterpart_name;
    this.counterpart_id = counterpart_id;
  }
}
