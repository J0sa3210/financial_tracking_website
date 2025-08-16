export class Account {
  id: number;
  name: string;
  iban: string;

  constructor(id: number, name: string, iban: string) {
    this.id = id;
    this.name = name;
    this.iban = iban;
  }
}
