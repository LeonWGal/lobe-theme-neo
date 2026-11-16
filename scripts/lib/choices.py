"""Names the command palette offers: samplers, schedulers and checkpoints,
labelled exactly as the WebUI's own dropdowns label them."""
from scripts.lib.lobe_log import LobeLog


def choices():
    result = {"samplers": [], "schedulers": [], "checkpoints": [], "checkpointArches": {}, "preset": ""}
    try:
        from modules import sd_samplers
        try:
            result["samplers"] = list(sd_samplers.visible_sampler_names())
        except Exception:
            result["samplers"] = [s.name for s in sd_samplers.visible_samplers()]
    except Exception as e:
        LobeLog.debug(f"choices samplers: {e}")
    try:
        from modules import sd_schedulers
        result["schedulers"] = [s.label for s in sd_schedulers.schedulers]
    except Exception as e:
        LobeLog.debug(f"choices schedulers: {e}")
    try:
        from modules import shared, shared_items
        from scripts.lib import loras
        use_short = bool(getattr(shared.opts, "sd_checkpoint_dropdown_use_short", False))
        result["checkpoints"] = sorted(shared_items.list_checkpoint_tiles(use_short))
        result["preset"] = str(getattr(shared.opts, "forge_preset", "") or "")
        result["checkpointArches"] = loras.checkpoint_arches()
    except Exception as e:
        LobeLog.debug(f"choices checkpoints: {e}")
    return result
