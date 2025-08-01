export class Category {
  id: number;
  name: string;
  description: string;
  counterparts: string[];

  constructor(id: number, name: string, description: string, counterparts: string[]) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.counterparts = counterparts;
  }
}
