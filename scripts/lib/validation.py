import json
import math
from pathlib import Path

SCHEMA = json.loads((Path(__file__).parents[2] / "setting_schema.json").read_text(encoding="utf-8"))


def validate_settings(data, strict=True):
    if not isinstance(data, dict):
        raise ValueError("Settings must be an object")
    if "schemaVersion" in data and (type(data["schemaVersion"]) not in (int, float) or data["schemaVersion"] != 1):
        raise ValueError("Unsupported settings version")
    if "setting" in data:
        data = data["setting"]
        if not isinstance(data, dict):
            raise ValueError("Settings must be an object")
    cleaned = {}
    for key, rule in SCHEMA.items():
        if key not in data:
            continue
        value = data[key]
        if rule.get("optional") and (value is None or value == ""):
            cleaned[key] = None if key.endswith("Color") else ""
            continue
        if "enum" in rule:
            valid = isinstance(value, str) and value in rule["enum"]
        elif rule["type"] == "boolean":
            valid = isinstance(value, bool)
        elif rule["type"] == "number":
            valid = (type(value) in (int, float) and math.isfinite(value)
                     and int(value) == value and rule["min"] <= value <= rule["max"])
        elif rule["type"] == "array":
            max_items = rule.get("maxItems", 32)
            valid = (isinstance(value, list) and len(value) <= max_items
                     and all(isinstance(item, str) and len(item) <= 255 for item in value))
        else:
            valid = isinstance(value, str) and len(value) <= rule["maxLength"]
        if valid:
            cleaned[key] = value
        elif strict:
            raise ValueError(f"Invalid setting: {key}")
    return cleaned
