import inspect
from functools import wraps

import safetensors
import safetensors.torch

from scripts.lib.lobe_log import LobeLog

_ORIG_SAFE_OPEN = None
_SUPPORTS_BACKEND = False
_PATCHED = False


def _init_orig() -> None:
    global _ORIG_SAFE_OPEN, _SUPPORTS_BACKEND
    if _ORIG_SAFE_OPEN is not None:
        return
    _ORIG_SAFE_OPEN = safetensors.safe_open
    try:
        sig = inspect.signature(_ORIG_SAFE_OPEN)
        _SUPPORTS_BACKEND = "backend" in sig.parameters
    except (TypeError, ValueError):
        _SUPPORTS_BACKEND = False


def apply_safetensors_pread(enabled: bool = True) -> bool:
    """Wrap safetensors.safe_open to default backend='pread' when supported."""
    global _PATCHED
    _init_orig()
    if not _SUPPORTS_BACKEND:
        return False

    if enabled:
        if _PATCHED:
            return True

        @wraps(_ORIG_SAFE_OPEN)
        def safe_open_pread(*args, **kwargs):
            if kwargs.get("backend") is None:
                kwargs["backend"] = "pread"
            return _ORIG_SAFE_OPEN(*args, **kwargs)

        safetensors.safe_open = safe_open_pread
        safetensors.torch.safe_open = safe_open_pread
        _PATCHED = True
        LobeLog.info("safetensors.safe_open wrapped with default backend='pread'")
        return True

    if _PATCHED:
        safetensors.safe_open = _ORIG_SAFE_OPEN
        safetensors.torch.safe_open = _ORIG_SAFE_OPEN
        _PATCHED = False
        LobeLog.info("safetensors.safe_open restored to default backend")
    return False
