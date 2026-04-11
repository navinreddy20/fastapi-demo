from sqlalchemy.orm import Session
from models.product import Product
from schemas.product import ProductCreate

def create_product(db: Session, product: ProductCreate):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(db: Session):
    return db.query(Product).all()

def get_product(db: Session, product_id: str):
    return db.query(Product).filter(Product.id == product_id).first()

def update_product(db: Session, product_id: str, data: dict):
    product = get_product(db, product_id)
    if not product:
        return None

    for key, value in data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product

def delete_product(db: Session, product_id: str):
    product = get_product(db, product_id)
    if not product:
        return None

    db.delete(product)
    db.commit()
    return product