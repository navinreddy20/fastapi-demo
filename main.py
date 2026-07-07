from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database_models
from models import Product
from database import SessionLocal, engine
from sqlalchemy.orm import Session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database_models.Base.metadata.create_all(bind=engine)


products = [
    Product(id=1, name="phone", description="Iphone 16", price=99, quantity=5),
    Product(id=2, name="laptop", description="macbook 16", price=99, quantity=5),
    Product(id=3, name="Pen", description="A blue ink pen", price=1.99, quantity=100),
    Product(id=4, name="Table", description="A wooden table", price=199.99, quantity=20),
    Product(id=5, name="Chair", description="A comfortable chair", price=89.99, quantity=15)
]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    db = SessionLocal()
    # Check if products already exist
    existing_count = db.query(database_models.Product).count()
    if existing_count == 0:
        for product_data in products:
            # Convert Pydantic model to SQLAlchemy model
            db_product = database_models.Product(
                id=product_data.id,
                name=product_data.name,
                description=product_data.description,
                price=product_data.price,
                quantity=product_data.quantity
            )
            db.add(db_product)
        db.commit()
    db.close()

init_db()


@app.get("/products")
@app.get("/products/")
def get_all_products(db: Session = Depends(get_db)):
    products = db.query(database_models.Product).all()
    return products

@app.get("/products/{product_id}")
@app.get("/products/{product_id}/")
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = db.query(database_models.Product).filter(database_models.Product.id == product_id).first()
    if product:
        return product
    return {"error": "Product not found"}

# @app.post("/products")
# def create_product(product: Product):
#     products.append(product)
#     return product

@app.post("/products")
@app.post("/products/")
def create_product(product: Product, db: Session = Depends(get_db)):
    # Convert Pydantic model to SQLAlchemy model
    db_product = database_models.Product(
        id=product.id,
        name=product.name,
        description=product.description,
        price=product.price,
        quantity=product.quantity
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product




@app.put("/products/{product_id}")
@app.put("/products/{product_id}/")
def update_product(product_id: int, updated_product: Product, db: Session = Depends(get_db)):
    product = db.query(database_models.Product).filter(database_models.Product.id == product_id).first()
    if product:
        product.name = updated_product.name
        product.description = updated_product.description
        product.price = updated_product.price
        product.quantity = updated_product.quantity
        db.commit()
        db.refresh(product)
    if product:
        return product
    return {"error": "Product not found"}


@app.delete("/products/{product_id}")
@app.delete("/products/{product_id}/")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(database_models.Product).filter(database_models.Product.id == product_id).first()
    if product:
        db.delete(product)
        db.commit()
        return {"message": "Product deleted successfully", "product": product}
    return {"error": "Product not found"}


@app.get("/")
def greet():
    return "Welcome to Telusko Trac"


message = greet()
print(message)