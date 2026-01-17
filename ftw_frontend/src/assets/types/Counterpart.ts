export class Counterpart {
  id: number;
  name: string;
  category_id: number;

  constructor(id: number, name: string, category_id: number) {
    this.id = id;
    this.name = name;
    this.category_id = category_id;
  }
}

export class CounterpartEdit {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class CounterpartSelectOption {
  value: number;
  label: string;

  constructor(value: number, label: string) {
    this.value = value;
    this.label = label;
  }
}
