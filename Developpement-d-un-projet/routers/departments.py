from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user, require_admin
from database import get_db
from models.department import Department
from models.user import User
from schemas.department import DepartmentCreate, DepartmentOut, DepartmentUpdate

router = APIRouter(prefix="/departments", tags=["Départements"])


@router.post("/", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    data: DepartmentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    dept = Department(**data.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.get("/", response_model=List[DepartmentOut])
def list_departments(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Department).offset(skip).limit(min(limit, 200)).all()


@router.get("/{dept_id}", response_model=DepartmentOut)
def get_department(
    dept_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Département introuvable")
    return dept


@router.patch("/{dept_id}", response_model=DepartmentOut)
def update_department(
    dept_id: int,
    data: DepartmentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Département introuvable")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(dept, field, value)
    db.commit()
    db.refresh(dept)
    return dept


@router.delete("/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Département introuvable")
    db.delete(dept)
    db.commit()
