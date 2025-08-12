export class Transaction {
  id: number;
  value: number;
  description: string;
  date_executed: Date; // e.g., "2024-06-10"
  transaction_type: string;
  category_id: number;
  category_name: string;
  owner_account_number: string;
  counterpart_name: string;
  counterpart_account_number: string;

  constructor(
    id: number,
    value: number,
    description: string,
    date_executed: string,
    transaction_type: string,
    category_id: number,
    category_name: string,
    owner_account_number: string,
    counterpart_name: string,
    counterpart_account_number: string
  ) {
    this.id = id;
    this.value = value;
    this.description = description;
    this.date_executed = new Date(date_executed);
    this.transaction_type = transaction_type;
    this.category_id = category_id;
    this.category_name = category_name;
    this.owner_account_number = owner_account_number;
    this.counterpart_name = counterpart_name;
    this.counterpart_account_number = counterpart_account_number;
  }
}
