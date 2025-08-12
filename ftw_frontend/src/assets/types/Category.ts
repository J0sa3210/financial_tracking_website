import type { Counterpart } from "./Counterpart";

export class Category {
  id: number;
  name: string;
  description: string;
  counterparts: Counterpart[];

  constructor(id: number, name: string, description: string, counterparts: Counterpart[]) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.counterparts = counterparts;
  }
}
