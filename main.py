from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import models
from database import session, engine
import database_models
from sqlalchemy.orm import Session


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000"],
    allow_methods = ["*"]
)
database_models.Base.metadata.create_all(bind=engine)

@app.get("/")
def greet():
    return"Hello"

products = [
    models.Product(id = 1, name = "Laptop", description = "A personal computer for mobile use.", price = 1000, quantity = 10),
    models.Product(id = 2, name = "Smartphone", description = "A portable device that combines mobile telephone and computing functions.", price = 500, quantity = 20),
    models.Product(id = 3, name = "Tablet", description = "A portable computer that has a touchscreen and is smaller than a laptop.", price = 300, quantity = 15),
]

def get_db():
    db=session()    
    try:
        yield db
    finally:
        db.close()

def init_db():
    db = session()
    count = db.query(database_models.Product).count()
    if count == 0:
        for product in products:
            db.add(database_models.Product(**product.model_dump()))
        db.commit()

init_db()

@app.get("/products")
def get_all_products(db: Session = Depends(get_db)):
    db_products = db.query(database_models.Product).all()
    return db_products 


@app.get("/products/{id}")
def get_products(id: int, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product:
            return db_product
    return "Product not found"

@app.post("/products")
def add_product(product: models.Product, db: Session = Depends(get_db)):
    db.add(database_models.Product(**product.model_dump()))
    db.commit()
    return product

@app.put("/products/{id}")
def update_product(id: int, product: models.Product, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product :
        db_product.name = product.name
        db_product.description = product.description
        db_product.price = product.price
        db_product.quantity = product.quantity
        db.commit()
        return "Product Updated"
    return "Product not found"


@app.delete("/products/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product :
        db.delete(db_product)
        db.commit()
        return "Product deleted successfully"
    return "Product not found"