import type { Counterpart, CounterpartEdit } from "./Counterpart";

export class Category {
  id: number;

  name: string;
  description: string;
  category_type: string;

  counterparts: Counterpart[];

  constructor(
    id: number,
    name: string,
    description: string,
    category_type: string,
    counterparts: Counterpart[]
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category_type = category_type;
    this.counterparts = counterparts;
  }
}

export class CategoryEdit {
  id: number;
  name: string;
  description: string;
  category_type: string;
  counterparts: CounterpartEdit[];

  constructor(
    id: number,
    name: string,
    description: string,
    category_type: string,
    counterparts: CounterpartEdit[]
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category_type = category_type;
    this.counterparts = counterparts;
  }
}
