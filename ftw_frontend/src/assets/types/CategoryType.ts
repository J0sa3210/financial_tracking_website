export class CategoryType {
  id: number;
  owner_id: number;

  name: string;
  description: string;

  constructor(id: number, owner_id: number, name: string, description: string) {
    this.id = id;
    this.owner_id = owner_id;

    this.name = name;
    this.description = description;
  }
}

export class CategoryTypeEdit {
  id: number;
  owner_id: number;

  name: string;

  constructor(id: number, owner_id: number, name: string) {
    this.id = id;
    this.owner_id = owner_id;

    this.name = name;
  }
}
