from pydantic import BaseModel


class AdminUserUpdate(BaseModel):
    full_name: str | None = None
    role: str | None = None
    is_active: bool | None = None


class BulkActionRequest(BaseModel):
    ids: list[int]
    note: str | None = None

class SettingUpdateSchema(BaseModel):
    value: str
