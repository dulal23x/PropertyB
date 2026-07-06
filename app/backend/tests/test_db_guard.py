from app.core.config import validate_database_url


def test_database_guard_rules():
    validate_database_url("sqlite+aiosqlite:///./realestate_mvp_v1.db")
    validate_database_url("sqlite+aiosqlite:///./bproperty_clone.db")
    validate_database_url("sqlite+aiosqlite:///./test_realestate_mvp_v1.db")
    try:
        validate_database_url("sqlite+aiosqlite:///./clearlyhired_v2.db")
        assert False, "Expected guard to fail for clearlyhired_v2.db"
    except RuntimeError:
        pass
