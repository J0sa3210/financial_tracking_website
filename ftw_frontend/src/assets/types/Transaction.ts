export class Transaction {
  id: number;
  value: number;
  description: string;
  date_executed: Date; // e.g., "2024-06-10"
  transaction_type: string;
  transaction_category: string;
  transaction_owner_account_number: string;
  transaction_counterpart_name: string;
  transaction_counterpart_account_number: string;

  constructor(
    id: number,
    value: number,
    description: string,
    date_executed: string,
    transaction_type: string,
    transaction_category: string,
    transaction_owner_account_number: string,
    transaction_counterpart_name: string,
    transaction_counterpart_account_number: string
  ) {
    this.id = id;
    this.value = value;
    this.description = description;
    this.date_executed = new Date(date_executed);
    this.transaction_type = transaction_type;
    this.transaction_category = transaction_category;
    this.transaction_owner_account_number = transaction_owner_account_number;
    this.transaction_counterpart_name = transaction_counterpart_name;
    this.transaction_counterpart_account_number = transaction_counterpart_account_number;
  }
}
