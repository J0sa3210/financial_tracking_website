import type { Counterpart } from "./Counterpart";

export class Category {
  id: number;

  name: string;
  description: string;
  category_type: string;

  counterparts: Counterpart[];

  constructor(id: number, name: string, description: string, category_type: string, counterparts: Counterpart[]) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category_type = category_type;
    this.counterparts = counterparts;
  }
}
