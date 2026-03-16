import type { CategoryType, CategoryTypeEdit } from "./CategoryType";
import type { Counterpart, CounterpartEdit } from "./Counterpart";

export class Category {
  id: number;

  name: string;
  description: string;
  category_type: CategoryType;

  counterparts: Counterpart[];

  constructor(
    id: number,
    name: string,
    description: string,
    category_type: CategoryType,
    counterparts: Counterpart[],
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
  category_type: CategoryTypeEdit;
  counterparts: CounterpartEdit[];

  constructor(
    id: number,
    name: string,
    description: string,
    category_type: CategoryTypeEdit,
    counterparts: CounterpartEdit[],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category_type = category_type;
    this.counterparts = counterparts;
  }
}
