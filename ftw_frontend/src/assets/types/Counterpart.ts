export class Counterpart {
  id: number;
  category_id: number;
  name: string;

  constructor(id: number, category_id: number, name: string) {
    this.id = id;
    (this.category_id = category_id), (this.name = name);
  }
}
