from dataclasses import dataclass
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


# Used inside repositories — plain dataclass, no Pydantic schema generation
@dataclass
class Page(Generic[T]):
    items: list[T]
    total: int
    page: int
    limit: int
    pages: int


# Used as FastAPI response_model — Pydantic schema for serialization
class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    limit: int
    pages: int
