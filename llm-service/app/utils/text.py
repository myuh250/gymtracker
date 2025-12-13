def normalize_text(value: str, *, forbid_empty: bool = True) -> str:
    """
    Normalize user-provided text:
    - strip leading/trailing whitespace
    - optionally forbid empty content
    """
    if not isinstance(value, str):
        return value

    stripped = value.strip()

    if forbid_empty and not stripped:
        raise ValueError("Text content cannot be empty")

    return stripped