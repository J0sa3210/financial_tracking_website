from models.category import Category, CategoryCreate
from database.schemas import CategorySchema, CounterpartSchema
from sqlalchemy.orm import Session


class CategoryService():
    def __init__(self):
        pass

    def get_all_categories(self, db: Session) -> list[Category]:
        categories = db.query(CategorySchema).all()

        response = []

        for category in categories:
            # Convert each category schema to a Pydantic model
            category = Category(id=category.id,
                                name=category.name,
                                description=category.description, 
                                counterparts=[counterpart.name for counterpart in category.counterparts])
            
            response.append(category)

        return response
        
    def add_category(self, new_category: CategoryCreate, db: Session) -> CategorySchema:
            """
            Add a new category to the database.
            """
            category_instance = self.convert_category_data(CategorySchema(), new_category, db)
            db.add(category_instance)
            db.commit()
            db.refresh(category_instance)
            return category_instance

    @staticmethod
    def convert_category_data(category_instance: CategorySchema, new_category: CategoryCreate, db: Session) -> CategorySchema:
        """
        Update an existing category object with new data.
        """
        for field, value in new_category.model_dump(exclude_none=True).items():
            if field == "counterparts":
                category_instance.counterparts = db.query(CounterpartSchema).filter(CounterpartSchema.name.in_(value)).all()
            else:
                setattr(category_instance, field, value)

        return category_instance