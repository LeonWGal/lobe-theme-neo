"""What the sidebar needs to know about each LoRA that the WebUI's cards do not
say: the model family it was trained for, and its trigger words.

The list itself comes from the WebUI's own LoRA module (`networks`, present in
A1111, reForge, Forge and Forge Classic), so names match the cards exactly.
Headers are read once per file and cached by modification time.
"""
import json
import os
import re
import struct
import sys
import threading
from pathlib import Path
from collections import Counter

from scripts.lib.lobe_log import LobeLog

_cache: dict = {}   # filename -> (mtime, info)
_cache_lock = threading.RLock()
_cache_path = Path(__file__).parents[2] / "lobe_data" / "lora_index.json"
_cache_loaded = False


def _read_header(filename: str):
    """The JSON header of a .safetensors file (tensor names, shapes, metadata)."""
    try:
        with open(filename, "rb") as f:
            size = struct.unpack("<Q", f.read(8))[0]
            if size <= 0 or size > 64 * 1024 * 1024:
                return {}
            return json.loads(f.read(size))
    except Exception:
        return {}


# Model families use Forge Classic (Neo)'s UI preset names, plus sd2 and sd3
# for the WebUIs that still load them.
FAMILIES = ("sd", "sd2", "xl", "sd3", "flux", "klein", "qwen", "lumina", "zit",
            "wan", "anima", "ernie", "pid", "krea")

# (words in the training metadata, family); checked in this order, so the
# more specific names come first
_NAMED = (
    (("flux.2", "flux2", "flux-2", "flux_2", "klein"), "klein"),
    (("chroma", "flux"), "flux"),
    (("qwen",), "qwen"),
    (("z-image", "z_image", "zimage"), "zit"),
    (("lumina",), "lumina"),
    (("wan2", "wan-2", "wan_2", "wan 2", "wan21", "wan22", "wan"), "wan"),
    (("anima", "cosmos"), "anima"),
    (("ernie",), "ernie"),
    (("pixeldit", "pid"), "pid"),
    (("krea",), "krea"),
    (("sd3", "stable-diffusion-3", "sd-3"), "sd3"),
    (("sdxl", "xl", "pony", "illustrious", "noobai"), "xl"),
    (("v2", "sd_v2", "stable-diffusion-v2", "sd2"), "sd2"),
    (("v1", "sd_v1", "sd1", "stable-diffusion-v1"), "sd"),
)


_WHOLE_WORDS = {"anima", "ernie", "krea", "wan", "pid", "qwen", "pony"}


def _family_from_text(text: str):
    text = text.lower()
    if not text:
        return None
    for words, family in _NAMED:
        for word in words:
            # short names only at the start of a word ("pid" in "rapid" is not
            # PiD), and some only as a whole word ("animagine" is SDXL, not Anima)
            if len(word) <= 5:
                tail = "(?![a-z])" if word in _WHOLE_WORDS else ""
                if re.search(rf"(?<![a-z]){re.escape(word)}{tail}", text):
                    return family
            elif word in text:
                return family
    return None


def _norm(key: str) -> str:
    """One spelling for every LoRA key format (kohya, PEFT/diffusers, ComfyUI)."""
    key = key.lower()
    for prefix in ("lora_unet_", "lora_transformer_", "lycoris_", "base_model.model.", "transformer.", "diffusion_model.", "model.diffusion_model.", "unet."):
        if key.startswith(prefix):
            key = key[len(prefix):]
    return key.replace(".", "_")


def _in_out(header: dict, key: str):
    """(in, out) features of the layer a LoRA down/up weight belongs to."""
    shape = (header.get(key) or {}).get("shape") or []
    if len(shape) < 2:
        return None
    if "lora_down" in key or "lora_a" in key.lower():
        return shape[1], None
    if "lora_up" in key or "lora_b" in key.lower():
        return None, shape[0]
    return None


def _layer_io(header: dict, raw_keys: list, pattern: str):
    """(in, out) of the first layer whose normalised key matches `pattern`."""
    rx = re.compile(pattern)
    found_in = found_out = None
    for key in raw_keys:
        if not rx.search(_norm(key)):
            continue
        io = _in_out(header, key)
        if not io:
            continue
        found_in = found_in or io[0]
        found_out = found_out or io[1]
        if found_in and found_out:
            break
    return found_in, found_out


def _family_from_keys(header: dict):
    raw = [k for k in header if k != "__metadata__"]
    if not raw:
        return None
    joined = " ".join(_norm(k) for k in raw[:6000])

    # BFL layout (Flux.1, Chroma, Flux.2): the width of the fused layers tells them apart
    if "double_blocks_" in joined or "single_blocks_" in joined:
        i, o = _layer_io(header, raw, r"single_blocks_\d+_linear1_")
        if i and o:
            return "klein" if o >= 8.5 * i else "flux"      # 9h vs 7h
        i, o = _layer_io(header, raw, r"double_blocks_\d+_img_mlp_0_")
        if i and o:
            return "klein" if o >= 5.5 * i else "flux"      # 6h vs 4h
        return "flux"
    # diffusers layout
    if "text_fusion_" in joined or re.search(r"transformer_blocks_\d+_(attn_to_gate|ff_(gate|up|down))_", joined):
        return "krea"
    if "to_qkv_mlp_proj" in joined or re.search(r"transformer_blocks_\d+_ff(_context)?_linear_in", joined):
        return "klein"
    if re.search(r"transformer_blocks_\d+_(img|txt)_mlp", joined) or re.search(r"transformer_blocks_\d+_(img|txt)_mod", joined):
        return "qwen"
    if "single_transformer_blocks_" in joined:
        return "flux"
    if "txtfusion_" in joined or re.search(r"blocks_\d+_attn_w[qkvo]_", joined):
        return "krea"
    if re.search(r"layers_\d+_self_attention_to_[qkv]_", joined) or re.search(r"layers_\d+_mlp_linear_fc2", joined):
        return "ernie"
    if re.search(r"blocks_\d+_(attn_)?qkv_[xy]_", joined) or "lq_proj_" in joined:
        return "pid"
    if "llm_adapter_" in joined or re.search(r"blocks_\d+_(self|cross)_attn_[qkvo]_proj_", joined) or re.search(r"blocks_\d+_mlp_layer[12]_", joined):
        return "anima"
    if re.search(r"blocks_\d+_(self|cross)_attn_[qkvo]_", joined) or re.search(r"blocks_\d+_ffn_[02]_", joined) \
            or re.search(r"(?<!transformer_)blocks_\d+_attn[12]_to_[qkv]_", joined):
        return "wan"
    if "noise_refiner_" in joined or "context_refiner_" in joined or re.search(r"layers_\d+_(attention|feed_forward)_", joined):
        # Lumina 2 and Z-Image share the layout; the width differs (2304 / 3840)
        i, _ = _layer_io(header, raw, r"layers_\d+_(attention_(qkv|to_q)|feed_forward_w[13])_")
        return "zit" if i and i >= 3000 else "lumina"
    if "joint_blocks_" in joined:
        return "sd3"
    # diffusers double-stream blocks alone: Qwen-Image has 60, Flux.1 has 19
    blocks = [int(n) for n in re.findall(r"(?<![a-z])transformer_blocks_(\d+)_attn_(?:to|add)_", joined)]
    if blocks:
        return "qwen" if max(blocks) >= 19 else "flux"
    if "lora_te2_" in joined or "lora_te1_" in joined or "input_blocks_4_1_transformer_blocks_1" in joined \
            or "down_blocks_1_attentions_0_transformer_blocks_1" in joined:
        return "xl"
    for key in raw:
        if key.startswith("lora_te_") and key.endswith("lora_down.weight"):
            shape = header[key].get("shape") or []
            if len(shape) == 2:
                return "sd2" if shape[1] == 1024 else "sd"
    if any(k.startswith("lora_unet_") for k in raw):
        return "sd"
    return None


def _arch_from(metadata: dict, header: dict, user: dict | None = None) -> str:
    # 1. what the user set in the card's metadata editor (Neo: "Preset")
    chosen = str((user or {}).get("sd version", "")).strip().lower()
    if chosen in FAMILIES:
        return chosen
    # 2. what the trainer wrote
    for field in ("modelspec.architecture", "ss_base_model_version", "ss_base_model", "base_model"):
        family = _family_from_text(str(metadata.get(field, "")))
        if family:
            return family
    # 3. the layer names and widths
    return _family_from_keys(header) or "unknown"


def _trigger_words(filename: str, metadata: dict, native_user=None):
    words = []
    stem = os.path.splitext(filename)[0]
    # the WebUI's own "activation text" (Edit metadata on the card)
    user = native_user if native_user is not None else _read_json(stem + ".json")
    if isinstance(user, dict) and user.get("activation text"):
        words += [w.strip() for w in str(user["activation text"]).split(",") if w.strip()]
    # Civitai Helper / Civitai Browser+ sidecar
    # Forge has already read card activation text; do not walk 15,000 sidecars again.
    civitai = _read_json(stem + ".civitai.info") if native_user is None else None
    if isinstance(civitai, dict):
        for w in civitai.get("trainedWords") or []:
            words += [x.strip() for x in str(w).split(",") if x.strip()]
    if not words:
        # most frequent training tags
        try:
            freq = metadata.get("ss_tag_frequency") or {}
            if isinstance(freq, str):   # the WebUI may already have decoded it
                freq = json.loads(freq)
            counter = Counter()
            for tags in freq.values():
                counter.update(tags)
            words = [tag for tag, _ in counter.most_common(5)]
        except Exception:
            pass
    return list(dict.fromkeys(words))[:12]


def _read_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def list_loras():
    with _cache_lock:
        return _list_loras()


def _list_loras():
    global _cache_loaded
    if not _cache_loaded:
        saved = _read_json(_cache_path)
        if isinstance(saved, dict):
            _cache.update(saved)
        _cache_loaded = True
    native_items = {}
    try:
        from modules import ui_extra_networks
        for page in ui_extra_networks.extra_pages:
            if str(getattr(page, "name", "")).lower() == "lora":
                native_items = getattr(page, "items", {}) or {}
                break
    except ImportError:
        pass
    networks = sys.modules.get("networks")
    available = getattr(networks, "available_networks", None) if networks else None
    if not isinstance(available, dict):
        return []
    result = []
    dirty = False
    for name, net in list(available.items()):
        filename = getattr(net, "filename", "")
        try:
            mtime = os.path.getmtime(filename)
        except OSError:
            continue
        cached = _cache.get(filename)
        item = native_items.get(name) or {}
        native_user = item.get("user_metadata")
        user_signature = [str(native_user.get("activation text", "")), str(native_user.get("sd version", ""))] if isinstance(native_user, dict) else []
        signature = [mtime, user_signature]
        if not cached or cached[0] != signature:
            metadata = dict(getattr(net, "metadata", {}) or {})
            user = native_user if native_user is not None else _read_json(os.path.splitext(filename)[0] + ".json")
            header = {}
            if _arch_from(metadata, {}, user) == "unknown" and filename.lower().endswith(".safetensors"):
                header = _read_header(filename)
            info = {"arch": _arch_from(metadata, header, user if isinstance(user, dict) else None),
                    "triggerWords": _trigger_words(filename, metadata, native_user)}
            _cache[filename] = (signature, info)
            dirty = True
        else:
            info = cached[1]
        try:
            alias = net.get_alias()
        except Exception:
            alias = getattr(net, "alias", name)
        result.append({"name": name, "alias": alias, **info})
    if dirty:
        _cache_path.parent.mkdir(parents=True, exist_ok=True)
        temporary = _cache_path.with_suffix(".tmp")
        temporary.write_text(json.dumps(_cache, ensure_ascii=False), encoding="utf-8")
        temporary.replace(_cache_path)
    return result


# Forge / Forge Classic diffusion engine classes -> family
_ENGINES = {
    "StableDiffusion": "sd", "StableDiffusion2": "sd2", "StableDiffusionXL": "xl",
    "StableDiffusionXLRefiner": "xl", "Mugen": "xl", "StableDiffusion3": "sd3",
    "Flux": "flux", "Chroma": "flux", "Flux2": "klein", "QwenImage": "qwen",
    "Lumina2": "lumina", "ZImage": "zit", "Wan": "wan", "Anima": "anima",
    "ErnieImage": "ernie", "PiD": "pid", "Krea2": "krea",
}


def current_model():
    """The loaded checkpoint's family, without triggering a model load."""
    arch = "unknown"
    name = ""
    try:
        from modules import sd_models, shared
        name = str(getattr(shared.opts, "sd_model_checkpoint", "") or "")
        model = getattr(sd_models.model_data, "sd_model", None)
        selected = sd_models.get_closet_checkpoint_match(name) if name else None
        loaded = getattr(model, "sd_checkpoint_info", None)
        if selected is not None:
            arch = _arch_from(getattr(selected, "metadata", {}) or {}, {})
        if model is not None and selected is not None and loaded is not None and loaded.filename == selected.filename:
            engine = _ENGINES.get(type(model).__name__)
            if engine:
                arch = engine
            elif getattr(model, "is_flux", False) or "flux" in type(model).__name__.lower():
                arch = "flux"
            elif getattr(model, "is_sd3", False):
                arch = "sd3"
            elif getattr(model, "is_sdxl", False):
                arch = "xl"
            elif getattr(model, "is_sd2", False):
                arch = "sd2"
            elif getattr(model, "is_sd1", False) or (
                    not hasattr(model, "is_sd1") and hasattr(model, "cond_stage_model")):
                arch = "sd"
    except Exception as e:
        LobeLog.debug(f"current_model: {e}")
    if arch == "unknown":
        arch = _family_from_text(name) or "unknown"
    return {"checkpoint": name, "arch": arch}


_ckpt_cache: dict = {}
_ckpt_cache_path = Path(__file__).parents[2] / "lobe_data" / "checkpoint_index.json"
_ckpt_cache_loaded = False


def _load_ckpt_cache():
    global _ckpt_cache_loaded
    if _ckpt_cache_loaded:
        return
    _ckpt_cache_loaded = True
    try:
        data = json.loads(_ckpt_cache_path.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            _ckpt_cache.update(data)
    except Exception:
        pass


def _arch_from_checkpoint_keys(keys) -> str | None:
    has_xl_cond = False
    has_sd_cond = False
    for key in keys:
        if key == "__metadata__":
            continue
        if "adaln_modulation_cross_attn" in key or "adaln_modulation_self_attn" in key:
            return "anima"
        if "double_blocks." in key or "single_blocks." in key:
            return "flux"
        if "joint_blocks." in key:
            return "sd3"
        if "cap_embedder" in key:
            return "lumina"
        if "cross_attn.k_img" in key:
            return "wan"
        if "img_mod" in key and "transformer_blocks." in key:
            return "qwen"
        if key.startswith(("conditioner.embedders.1.", "model.diffusion_model.label_emb.")):
            return "xl"
        if key.startswith("conditioner.embedders.0.transformer.text_model."):
            has_xl_cond = True
        elif key.startswith("cond_stage_model.transformer.text_model."):
            has_sd_cond = True
    if has_xl_cond:
        return "xl"
    if has_sd_cond:
        return "sd"
    return None


def _detect_checkpoint_arch(filename: str, metadata: dict | None = None, title: str = "") -> str:
    arch = _arch_from(metadata or {}, {})
    if arch != "unknown":
        return arch
    if filename and filename.lower().endswith(".safetensors"):
        header = _read_header(filename)
        if header:
            meta = header.get("__metadata__")
            if isinstance(meta, dict):
                arch = _arch_from(meta, {})
                if arch != "unknown":
                    return arch
            key_arch = _arch_from_checkpoint_keys(header.keys())
            if key_arch:
                return key_arch
    return _family_from_text(title or filename) or "unknown"


def checkpoint_arch(info) -> str:
    """Detect a CheckpointInfo's family from metadata, safetensors keys, or name, cached by mtime."""
    filename = getattr(info, "filename", "") or ""
    title = getattr(info, "title", "") or getattr(info, "name", "") or ""
    if not filename:
        return _family_from_text(title) or "unknown"
    try:
        mtime = os.path.getmtime(filename)
    except OSError:
        return _family_from_text(title or filename) or "unknown"
    with _cache_lock:
        _load_ckpt_cache()
        cached = _ckpt_cache.get(filename)
        if isinstance(cached, list) and len(cached) == 2 and cached[0] == mtime:
            return str(cached[1])
    arch = _detect_checkpoint_arch(filename, getattr(info, "metadata", None), title)
    with _cache_lock:
        _ckpt_cache[filename] = [mtime, arch]
    return arch


def checkpoint_arches(titles: list[str] | None = None) -> dict[str, str]:
    """Map checkpoint tile names to their detected family and persist the cache when updated."""
    from modules import sd_models, shared

    use_short = bool(getattr(shared.opts, "sd_checkpoint_dropdown_use_short", False))
    result: dict[str, str] = {}
    before = len(_ckpt_cache)
    with _cache_lock:
        _load_ckpt_cache()
    snapshot = dict(_ckpt_cache)
    if titles is None:
        items = list(sd_models.checkpoints_list.values())
    else:
        items = [sd_models.get_closet_checkpoint_match(t) for t in titles]
    for info in items:
        if info is None:
            continue
        key = info.short_title if use_short else info.title
        result[key] = checkpoint_arch(info)
    if _ckpt_cache != snapshot or len(_ckpt_cache) != before:
        try:
            with _cache_lock:
                _ckpt_cache_path.parent.mkdir(parents=True, exist_ok=True)
                temporary = _ckpt_cache_path.with_suffix(".tmp")
                temporary.write_text(json.dumps(_ckpt_cache, ensure_ascii=False), encoding="utf-8")
                temporary.replace(_ckpt_cache_path)
        except Exception as e:
            LobeLog.debug(f"checkpoint_arches save: {e}")
    return result
