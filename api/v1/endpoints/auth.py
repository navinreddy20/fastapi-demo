from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.user import UserCreate, UserLogin, RefreshTokenRequest
from crud import user as crud
from jose import jwt 
from dependencies.db import get_db
from core.security import create_refresh_token, verify_password, create_access_token
from core.config import SECRET_KEY, ALGORITHM

router = APIRouter()

@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    db_user = crud.create_user(db, user)
    return {"id": db_user.id, "email": db_user.email}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({
        "sub": db_user.email,
        "role": db_user.role
    })

    refresh_token = create_refresh_token({
        "sub": db_user.email
    })

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh")
def refresh_token(body: RefreshTokenRequest):
    try:
        payload = jwt.decode(body.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token")

        new_access_token = create_access_token({
            "sub": payload["sub"]
        })

        return {"access_token": new_access_token}

    except:
        raise HTTPException(status_code=401, detail="Invalid refresh token")