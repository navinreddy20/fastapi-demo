from fastapi import FastAPI
import models
from database import session, engine
import database_models


app = FastAPI()
database_models.Base.metadata.create_all(bind=engine)

@app.get("/")
def greet():
    return"Hello"

products = [
    models.Product(id = 1, name = "Laptop", desc = "A personal computer for mobile use.", price = 1000, qty = 10),
    models.Product(id = 2, name = "Smartphone", desc = "A portable device that combines mobile telephone and computing functions.", price = 500, qty = 20),
    models.Product(id = 3, name = "Tablet", desc = "A portable computer that has a touchscreen and is smaller than a laptop.", price = 300, qty = 15),
]

@app.get("/products")
def get_all_products():
    pass 


@app.get("/products/{id}")
def get_products(id: int):
    for product in products:
        if product.id == id:
            return product
    return "Product not found" 

@app.post("/products")
def add_product(product: models.Product):
    products.append(product)
    return product

@app.put("/product")
def update_product(id: int, product: models.Product):
    for i in range(0,len(products)):
        if(products[i].id==id):
            products[i] = product
            return "Product added successfully"
    return "Product not found"

@app.delete("/product")
def delete_product(id: int):
    for i in range(0,len(products)):
        if(products[i].id == id):
            del products[i]
            return "Product deleted"
    return "Product not found"