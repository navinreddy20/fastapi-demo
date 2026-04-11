from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from schemas.product import ProductCreate, ProductResponse
from crud import product as crud
from dependencies.db import get_db
from dependencies.auth import get_current_user

router = APIRouter()


# ✅ CREATE
@router.post("/", response_model=ProductResponse)
def create(
    product: ProductCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)   # 🔐 auth
):
    return crud.create_product(db, product)


# ✅ READ ALL
@router.get("/")
def read_all(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)   # 🔐 REQUIRED
):
    return crud.get_products(db)

# ✅ READ ONE
@router.get("/{product_id}", response_model=ProductResponse)
def read_one(
    product_id: str,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Not found")
    return product


# ✅ UPDATE
@router.put("/{product_id}", response_model=ProductResponse)
def update(
    product_id: str,
    data: dict,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    product = crud.update_product(db, product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Not found")
    return product


# ✅ DELETE
@router.delete("/{product_id}")
def delete(
    product_id: str,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    product = crud.delete_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}