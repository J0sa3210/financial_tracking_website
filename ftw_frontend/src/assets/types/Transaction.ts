export class Transaction {
  id: number;
  value: number;
  description: string;
  dateTime_executed: Date; // e.g., "2024-06-10"
  transaction_type: string;

  constructor(
    id: number,
    value: number,
    description: string,
    date_executed: string,
    time_executed: string,
    transaction_type: string
  ) {
    this.id = id;
    this.value = value;
    this.description = description;
    this.dateTime_executed = new Date(date_executed + "T" + time_executed);
    this.transaction_type = transaction_type;
  }
}
