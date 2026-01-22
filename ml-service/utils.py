import re
from typing import Any


def snake_to_camel(s: str) -> str:
    """Convert snake_case string to camelCase."""
    if not isinstance(s, str):
        return s
    parts = s.split('_')
    if len(parts) == 1:
        return s
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])


def convert_keys_to_camel(obj: Any) -> Any:
    """Recursively convert dictionary keys from snake_case to camelCase.

    Works for dicts, lists, and leaves other types unchanged.
    """
    # Primitive types
    if obj is None or isinstance(obj, (str, int, float, bool)):
        return obj

    # Lists: convert each element
    if isinstance(obj, list):
        return [convert_keys_to_camel(v) for v in obj]

    # Dicts: convert keys and recurse
    if isinstance(obj, dict):
        new = {}
        for k, v in obj.items():
            new_key = snake_to_camel(k) if isinstance(k, str) else k
            new[new_key] = convert_keys_to_camel(v)
        return new

    # Other types (e.g., custom objects) - leave as-is
    return obj
