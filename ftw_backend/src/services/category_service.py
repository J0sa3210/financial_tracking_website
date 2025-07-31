from models.category import Category, CategoryCreate, Counterpart
from database.schemas import CategorySchema
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
        
    
    def add_category(self, new_category: CategoryCreate, db: Session) -> Category:
        """
        Add a new category to the database.

        Args:
            new_category (CategoryCreate): The category to add.
            db (Session): The SQLAlchemy database session.

        Returns:
            Category: The added category as a Pydantic model.
        """
        new_category_schema = self.convert_category_data(CategorySchema(), new_category)
        db.add(new_category_schema)
        db.commit()
        db.refresh(new_category_schema)
        
        return new_category_schema
    
    @staticmethod
    def convert_category_data(old_transaction: Category | CategorySchema, new_category: CategoryCreate) -> Category:
        """
        Update an existing category object with new data.

        Args:
            old_transaction (category | CategorySchema): The existing category object.
            new_category (TransactionEdit): The new category data.

        Returns:
            category: The updated category object.
        """
        for field, value in new_category.model_dump(exclude_none=True).items():
            # Convert values into right types
            setattr(old_transaction, field, value)
        
        return old_transaction