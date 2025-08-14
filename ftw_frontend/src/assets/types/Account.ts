export class Account {
  id: number;
  name: string;
  bank_account: string;

  constructor(id: number, name: string, bank_account: string) {
    this.id = id;
    this.name = name;
    this.bank_account = bank_account;
  }
}
