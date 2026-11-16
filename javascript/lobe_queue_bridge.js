/**
 * Capture Forge's Generate payload and its extension state builders for the
 * Lobe queue. Adapted from Agent Scheduler Neo (see scripts/lib/queue/LICENSE).
 */
(function () {
  if (window.__lobeQueueEnqueueBridgeUi) return;
  window.__lobeQueueEnqueueBridgeUi = true;

  var pending = null;
  var liveConfig = null;
  var lastClickTs = 0;
  var TIMEOUT_MS = 10000;
  // ControlNet unit builder payloads captured while Generate click fans out
  var pendingCnUnits = [];
  // ADetailer on_generate → State dicts keyed by output State component id
  var pendingAdStates = {};
  var pendingPrimaryCapture = null;
  var CN_UNIT_FIELDS = [
    "use_preview_as_input",
    "generated_image",
    "mask_image",
    "mask_image_fg",
    "hr_option",
    "enabled",
    "module",
    "model",
    "weight",
    "image",
    "image_fg",
    "resize_mode",
    "processor_res",
    "threshold_a",
    "threshold_b",
    "guidance_start",
    "guidance_end",
    "pixel_perfect",
    "control_mode",
    "type_filter",
  ];
  // Must match ADetailer-Neo lib_adetailer.args.ALL_ARGS.attrs order
  var AD_ARGS_ATTRS = [
    "ad_model",
    "ad_model_classes",
    "ad_tab_enable",
    "ad_tab_alias",
    "ad_prompt",
    "ad_negative_prompt",
    "ad_confidence",
    "ad_mask_filter_method",
    "ad_mask_k",
    "ad_mask_min_ratio",
    "ad_mask_max_ratio",
    "ad_x_offset",
    "ad_y_offset",
    "ad_dilate_erode",
    "ad_mask_merge_invert",
    "ad_mask_blur",
    "ad_denoising_strength",
    "ad_inpaint_only_masked",
    "ad_inpaint_only_masked_padding",
    "ad_use_inpaint_width_height",
    "ad_inpaint_width",
    "ad_inpaint_height",
    "ad_use_steps",
    "ad_steps",
    "ad_use_cfg_scale",
    "ad_cfg_scale",
    "ad_use_checkpoint",
    "ad_checkpoint",
    "ad_use_vae",
    "ad_vae",
    "ad_use_sampler",
    "ad_sampler",
    "ad_scheduler",
    "ad_use_noise_multiplier",
    "ad_noise_multiplier",
    "ad_restore_face",
    "ad_controlnet_model",
    "ad_controlnet_module",
    "ad_controlnet_weight",
    "ad_controlnet_guidance_start_end",
    "ad_sam_model",
    "ad_sam_keep_loaded",
    "ad_sam_mask_hint",
    "ad_sam_mask_hint_threshold",
    "ad_sam_dilation",
    "ad_sam_feather",
    "ad_sam_threshold",
    "ad_use_autotag",
    "ad_autotag_general_thresh",
    "ad_autotag_character_thresh",
    "ad_autotag_hide_rating",
    "ad_autotag_character_first",
    "ad_autotag_remove_separator",
  ];

  function root() {
    return typeof gradioApp === "function" ? gradioApp() : document;
  }

  function getConfig() {
    if (liveConfig && liveConfig.dependencies) return liveConfig;
    return window.gradio_config || null;
  }

  function loadLiveConfig() {
    return fetch("/config/")
      .then(function (r) {
        return r.json();
      })
      .then(function (cfg) {
        liveConfig = cfg;
        return cfg;
      })
      .catch(function () {
        return getConfig();
      });
  }

  function findEl(selectorOrId) {
    var id = selectorOrId.charAt(0) === "#" ? selectorOrId.slice(1) : null;
    var app = root();
    var el = null;
    if (id && app && app.getElementById) el = app.getElementById(id);
    if (!el && id) el = document.getElementById(id);
    if (!el && app && app.querySelector) el = app.querySelector(selectorOrId);
    if (!el) el = document.querySelector(selectorOrId);
    return el;
  }

  function readLivePrompt(selector, previous) {
    var field = findEl(selector + " textarea");
    if (!field || typeof field.value !== "string") return previous;
    return field.value;
  }

  function findGenerateButton(isImg2Img) {
    var prefix = isImg2Img ? "img2img" : "txt2img";
    var box = findEl("#" + prefix + "_generate_box");
    return (
      findEl("#" + prefix + "_generate") ||
      findEl("#" + prefix + "_generate_button") ||
      (box && box.querySelector("button")) ||
      null
    );
  }

  function getCheckpoint(isImg2Img) {
    var wrap = findEl(
      (isImg2Img ? "#img2img_enqueue_wrapper" : "#txt2img_enqueue_wrapper") + " input"
    );
    if (wrap && wrap.value && wrap.value !== "Current Checkpoint") return wrap.value;
    var setting = findEl("#setting_sd_model_checkpoint input");
    return (setting && setting.value) || "Current Checkpoint";
  }

  function findComponentId(elemId, cfg) {
    cfg = cfg || getConfig();
    if (!cfg || !cfg.components) return null;
    for (var i = 0; i < cfg.components.length; i++) {
      var c = cfg.components[i];
      if (c.props && c.props.elem_id === elemId) return c.id;
    }
    return null;
  }

  function findClickFnDetails(elemId, cfg) {
    cfg = cfg || getConfig();
    var compId = findComponentId(elemId, cfg);
    if (compId == null || !cfg || !cfg.dependencies) return [];
    var out = [];
    for (var i = 0; i < cfg.dependencies.length; i++) {
      var d = cfg.dependencies[i];
      var targets = d.targets || [];
      for (var t = 0; t < targets.length; t++) {
        var tgt = targets[t];
        var tid = Array.isArray(tgt) ? tgt[0] : tgt && tgt.id;
        var ev = Array.isArray(tgt) ? tgt[1] : tgt && tgt.event;
        if (tid == compId && ev === "click") {
          var fn = typeof d.id === "number" ? d.id : i;
          out.push({ fn: fn, inputs: (d.inputs || []).length, outputs: (d.outputs || []).length, inputIds: d.inputs || [] });
        }
      }
    }
    out.sort(function (a, b) {
      return b.inputs - a.inputs;
    });
    return out;
  }

  function blockedGenerateResponse(url) {
    if (url.indexOf("/queue/join") !== -1) {
      // Soft-cancel queue join so UI does not hang waiting for SSE
      return Promise.resolve(
        new Response(JSON.stringify({ event_id: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    }
    return Promise.resolve(
      new Response(JSON.stringify({ data: [], is_generating: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  }

  function postUiQueue(args, isImg2Img, selection) {
    var payload = {
      is_img2img: !!isImg2Img,
      checkpoint: selection.checkpoint,
      mode: selection.mode,
      args: args,
    };
    return fetch("/lobe/queue/ui", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error((j && j.detail) || r.statusText);
        return j;
      });
    });
  }

  function defaultCnUnit() {
    return {
      is_cnet: true,
      use_preview_as_input: false,
      generated_image: null,
      mask_image: null,
      mask_image_fg: null,
      hr_option: "Both",
      enabled: false,
      module: "None",
      model: "None",
      weight: 1.0,
      image: null,
      image_fg: null,
      resize_mode: "Crop and Resize",
      processor_res: -1,
      threshold_a: -1,
      threshold_b: -1,
      guidance_start: 0.0,
      guidance_end: 1.0,
      pixel_perfect: false,
      control_mode: "Balanced",
      type_filter: "All",
      save_detected_map: true,
      _idx: -1,
    };
  }

  function buildCnUnitFromArgs(data) {
    var unit = defaultCnUnit();
    if (!Array.isArray(data)) return unit;
    for (var i = 0; i < CN_UNIT_FIELDS.length && i < data.length; i++) {
      unit[CN_UNIT_FIELDS[i]] = data[i];
    }
    unit.is_cnet = true;
    return unit;
  }

  function isControlNetBuilderDep(dep, cfg) {
    if (!dep || !dep.outputs || dep.outputs.length !== 1) return false;
    if (!dep.inputs || dep.inputs.length < 19 || dep.inputs.length > 21) return false;
    // Prefer elem_id match on enable checkbox
    for (var i = 0; i < dep.inputs.length; i++) {
      var comp = null;
      for (var ci = 0; ci < cfg.components.length; ci++) {
        if (cfg.components[ci].id == dep.inputs[i]) {
          comp = cfg.components[ci];
          break;
        }
      }
      var eid = comp && comp.props && comp.props.elem_id;
      if (eid && String(eid).indexOf("controlnet_enable_checkbox") !== -1) return true;
    }
    // Fallback: output State default looks like ControlNetUnit
    var out = null;
    for (var oi = 0; oi < cfg.components.length; oi++) {
      if (cfg.components[oi].id == dep.outputs[0]) {
        out = cfg.components[oi];
        break;
      }
    }
    var v = out && out.props && out.props.value;
    return !!(v && typeof v === "object" && "enabled" in v && "module" in v && "control_mode" in v);
  }

  function findControlNetStateIndices(cfg, isImg2Img) {
    cfg = cfg || getConfig();
    if (!cfg || !cfg.dependencies || !cfg.components) return [];
    var genFns = findClickFnDetails(isImg2Img ? "img2img_generate" : "txt2img_generate", cfg);
    if (!genFns.length) return [];
    var primary = genFns[0];
    var dep = cfg.dependencies[primary.fn];
    if (!dep || !dep.inputs) return [];
    var indices = [];
    for (var i = 0; i < dep.inputs.length; i++) {
      var comp = null;
      for (var ci = 0; ci < cfg.components.length; ci++) {
        if (cfg.components[ci].id == dep.inputs[i]) {
          comp = cfg.components[ci];
          break;
        }
      }
      if (!comp || comp.type !== "state") continue;
      var v = comp.props && comp.props.value;
      if (v && typeof v === "object" && "enabled" in v && "module" in v && "control_mode" in v) {
        indices.push(i);
      }
    }
    return indices;
  }

  function injectControlNetUnits(args, isImg2Img) {
    var cfg = getConfig();
    var indices = findControlNetStateIndices(cfg, isImg2Img);
    if (!indices.length) return args;
    for (var i = 0; i < indices.length; i++) {
      var idx = indices[i];
      if (pendingCnUnits[i]) {
        args[idx] = pendingCnUnits[i];
      } else if (args[idx] == null || typeof args[idx] !== "object" || !("enabled" in args[idx])) {
        args[idx] = defaultCnUnit();
      } else if (!args[idx].is_cnet) {
        args[idx].is_cnet = true;
      }
    }
    console.info("[LobeQueue] bridge: injected ControlNet units", {
      slots: indices,
      captured: pendingCnUnits.length,
      enabled: indices.map(function (ix) {
        return !!(args[ix] && args[ix].enabled);
      }),
    });
    return args;
  }

  function getCompById(cfg, id) {
    if (!cfg || !cfg.components) return null;
    for (var i = 0; i < cfg.components.length; i++) {
      if (cfg.components[i].id == id) return cfg.components[i];
    }
    return null;
  }

  function isADetailerBuilderDep(dep, cfg) {
    if (!dep || !dep.outputs || dep.outputs.length !== 1) return false;
    if (!dep.inputs || dep.inputs.length < 30) return false;
    var out = getCompById(cfg, dep.outputs[0]);
    if (!out || out.type !== "state") return false;
    var outVal = out.props && out.props.value;
    if (!(outVal && typeof outVal === "object" && "ad_model" in outVal)) return false;
    for (var i = 0; i < dep.inputs.length; i++) {
      var comp = getCompById(cfg, dep.inputs[i]);
      var eid = comp && comp.props && comp.props.elem_id;
      if (
        eid &&
        String(eid).indexOf("adetailer_ad_model") !== -1 &&
        String(eid).indexOf("adetailer_ad_model_classes") === -1
      ) {
        return true;
      }
    }
    return false;
  }

  function defaultAdState(tabIndex) {
    return {
      ad_model: "None",
      ad_model_classes: "",
      ad_tab_enable: tabIndex === 0,
      ad_tab_alias: "",
      ad_prompt: "",
      ad_negative_prompt: "",
      ad_confidence: 0.3,
      ad_mask_filter_method: "Area",
      ad_mask_k: 0,
      ad_mask_min_ratio: 0.0,
      ad_mask_max_ratio: 1.0,
      ad_x_offset: 0,
      ad_y_offset: 0,
      ad_dilate_erode: 4,
      ad_mask_merge_invert: "None",
      ad_mask_blur: 4,
      ad_denoising_strength: 0.4,
      ad_inpaint_only_masked: true,
      ad_inpaint_only_masked_padding: 32,
      ad_use_inpaint_width_height: false,
      ad_inpaint_width: 512,
      ad_inpaint_height: 512,
      ad_use_steps: false,
      ad_steps: 20,
      ad_use_cfg_scale: false,
      ad_cfg_scale: 4.0,
      ad_use_checkpoint: false,
      ad_checkpoint: null,
      ad_use_vae: false,
      ad_vae: null,
      ad_use_sampler: false,
      ad_sampler: "Use same sampler",
      ad_scheduler: "Use same scheduler",
      ad_use_noise_multiplier: false,
      ad_noise_multiplier: 1.0,
      ad_restore_face: false,
      ad_controlnet_model: "None",
      ad_controlnet_module: "None",
      ad_controlnet_weight: 1.0,
      ad_controlnet_guidance_start_end: [0.0, 1.0],
      ad_sam_model: "None",
      ad_sam_keep_loaded: false,
      ad_sam_mask_hint: false,
      ad_sam_mask_hint_threshold: 0.5,
      ad_sam_dilation: 0,
      ad_sam_feather: 0,
      ad_sam_threshold: 0.0,
      ad_use_autotag: false,
      ad_autotag_general_thresh: 0.35,
      ad_autotag_character_thresh: 0.85,
      ad_autotag_hide_rating: true,
      ad_autotag_character_first: true,
      ad_autotag_remove_separator: true,
      is_api: [],
    };
  }

  function buildAdStateFromArgs(data, tabIndex) {
    var state = defaultAdState(tabIndex);
    if (!Array.isArray(data)) return state;
    // on_generate inputs: [old_state, *ALL_ARGS.attrs widgets]
    for (var i = 0; i < AD_ARGS_ATTRS.length && i + 1 < data.length; i++) {
      state[AD_ARGS_ATTRS[i]] = data[i + 1];
    }
    state.is_api = [];
    return state;
  }

  function findADetailerStateSlots(cfg, isImg2Img) {
    cfg = cfg || getConfig();
    if (!cfg || !cfg.dependencies || !cfg.components) return [];
    var genFns = findClickFnDetails(isImg2Img ? "img2img_generate" : "txt2img_generate", cfg);
    if (!genFns.length) return [];
    var dep = cfg.dependencies[genFns[0].fn];
    if (!dep || !dep.inputs) return [];
    var slots = [];
    for (var i = 0; i < dep.inputs.length; i++) {
      var comp = getCompById(cfg, dep.inputs[i]);
      if (!comp || comp.type !== "state") continue;
      var v = comp.props && comp.props.value;
      if (v && typeof v === "object" && "ad_model" in v) {
        slots.push({ index: i, compId: comp.id });
      }
    }
    return slots;
  }

  function readDomValue(wrap) {
    if (!wrap) return null;
    var input =
      wrap.querySelector("input:not([type=hidden])") ||
      wrap.querySelector("textarea") ||
      wrap.querySelector("select");
    if (input && typeof input.value === "string" && input.value !== "") return input.value;
    // Gradio 4 dropdown selected label
    var label =
      wrap.querySelector(".secondary-wrap .text-sm") ||
      wrap.querySelector("[data-testid=dropdown] .wrap-inner .token") ||
      wrap.querySelector(".wrap-inner span");
    if (label && label.textContent) return String(label.textContent).trim();
    return null;
  }

  function readAdStateFromDom(tabIndex, isImg2Img) {
    var prefix = isImg2Img ? "img2img" : "txt2img";
    var suf = ["", "_2nd", "_3rd", "_4th", "_5th", "_6th", "_7th", "_8th"][tabIndex] || "";
    var state = defaultAdState(tabIndex);
    var modelWrap = findEl("#script_" + prefix + "_adetailer_ad_model" + suf);
    var model = readDomValue(modelWrap);
    if (model) state.ad_model = model;
    var tabEnable = findEl("#script_" + prefix + "_adetailer_ad_tab_enable" + suf + " input");
    if (tabEnable) state.ad_tab_enable = !!tabEnable.checked;
    var tabAlias = findEl("#script_" + prefix + "_adetailer_ad_tab_alias" + suf + " input");
    if (tabAlias && typeof tabAlias.value === "string") state.ad_tab_alias = tabAlias.value;
    var promptEl = findEl("#script_" + prefix + "_adetailer_ad_prompt" + suf + " textarea");
    if (promptEl && typeof promptEl.value === "string") state.ad_prompt = promptEl.value;
    var negEl = findEl("#script_" + prefix + "_adetailer_ad_negative_prompt" + suf + " textarea");
    if (negEl && typeof negEl.value === "string") state.ad_negative_prompt = negEl.value;
    return state;
  }

  function injectADetailerStates(args, isImg2Img) {
    var cfg = getConfig();
    var slots = findADetailerStateSlots(cfg, isImg2Img);
    if (!slots.length) return args;
    var prefix = isImg2Img ? "img2img" : "txt2img";
    // Enable checkbox is two slots before the first State
    var enableIdx = slots[0].index - 2;
    if (enableIdx >= 0 && enableIdx < args.length) {
      var enEl =
        findEl("#script_" + prefix + "_adetailer_ad_main_accordion-checkbox input") ||
        findEl("#script_" + prefix + "_adetailer_ad_main_accordion-checkbox");
      if (enEl && typeof enEl.checked === "boolean") {
        args[enableIdx] = !!enEl.checked;
      } else if (typeof args[enableIdx] !== "boolean") {
        args[enableIdx] = !!args[enableIdx];
      }
    }
    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      var idx = slot.index;
      var captured = pendingAdStates[slot.compId];
      if (captured) {
        args[idx] = captured;
      } else if (args[idx] == null || typeof args[idx] !== "object" || !("ad_model" in args[idx])) {
        args[idx] = readAdStateFromDom(i, isImg2Img);
      } else {
        // State present but may be stale — prefer detector from DOM when available
        var domState = readAdStateFromDom(i, isImg2Img);
        if (domState.ad_model && domState.ad_model !== "None") {
          args[idx].ad_model = domState.ad_model;
        }
        if (typeof domState.ad_tab_enable === "boolean") {
          args[idx].ad_tab_enable = domState.ad_tab_enable;
        }
      }
    }
    console.info("[LobeQueue] bridge: injected ADetailer states", {
      enable: enableIdx >= 0 ? args[enableIdx] : null,
      slots: slots.map(function (s) {
        return s.index;
      }),
      captured: Object.keys(pendingAdStates).length,
      models: slots.map(function (s) {
        return args[s.index] && args[s.index].ad_model;
      }),
    });
    return args;
  }

  function findTipoBlockByLabel(acc, labelText) {
    if (!acc) return null;
    var labs = acc.querySelectorAll("label, span, .label-wrap, .svelte-1b6s6s");
    for (var j = 0; j < labs.length; j++) {
      var t = (labs[j].textContent || "").trim();
      if (t !== labelText && t.indexOf(labelText) !== 0) continue;
      return labs[j].closest(".block") || labs[j].parentElement;
    }
    return null;
  }

  function readRadioChoice(group) {
    if (!group) return null;
    var checked =
      group.querySelector("input[type=radio]:checked") ||
      group.querySelector('[role=radio][aria-checked="true"]');
    if (checked) {
      if (checked.value) return String(checked.value).trim();
      var lab = checked.closest("label") || checked.parentElement;
      if (lab && lab.textContent) return String(lab.textContent).trim();
    }
    // Gradio 4 selected button-style radio
    var selected = group.querySelector("button.selected, .selected");
    if (selected && selected.textContent) return String(selected.textContent).trim();
    return null;
  }

  function fillTipoFromDom(args, isImg2Img) {
    // Always prefer live DOM for TIPO — Gradio payload can be stale/default for radios.
    var cfg = getConfig();
    var genFns = findClickFnDetails(isImg2Img ? "img2img_generate" : "txt2img_generate", cfg);
    if (!genFns.length || !cfg || !cfg.dependencies) return args;
    var inputIds = (cfg.dependencies[genFns[0].fn] || {}).inputs || [];
    var prefix = isImg2Img ? "img2img" : "txt2img";
    var labelToIdx = {};
    var eidMap = {};
    eidMap[prefix + "_tipo_accordion-checkbox"] = "__tipo_enable";
    eidMap[prefix + "_tipo_tag_length"] = "tags";
    eidMap[prefix + "_tipo_nl_length"] = "nl";
    eidMap[prefix + "_tipo_ban_tags"] = "ban";
    eidMap[prefix + "_tipo_prompt_format"] = "format";
    eidMap[prefix + "_tipo_custom_format"] = "custom";
    eidMap[prefix + "_tipo_tag_prompt"] = "tagPrompt";
    eidMap[prefix + "_tipo_nl_prompt"] = "nlPrompt";

    for (var i = 0; i < inputIds.length; i++) {
      var comp = getCompById(cfg, inputIds[i]);
      if (!comp) continue;
      var label = comp.props && comp.props.label;
      var eid = comp.props && comp.props.elem_id;
      if (eid && eidMap[eid]) labelToIdx[eidMap[eid]] = i;
      // Label fallbacks (older TIPO without elem_id)
      if (labelToIdx.tags == null && label === "Tags Length target") labelToIdx.tags = i;
      if (labelToIdx.nl == null && label === "NL Length target") labelToIdx.nl = i;
      if (label === "Ban tags" && comp.type === "textbox") {
        if (labelToIdx.__tipo_enable != null && i > labelToIdx.__tipo_enable) labelToIdx.ban = i;
        else if (labelToIdx.ban == null) labelToIdx.ban = i;
      }
      if (label === "Prompt Format" && (comp.type === "dropdown" || comp.type === "textbox")) {
        if (labelToIdx.__tipo_enable != null && i > labelToIdx.__tipo_enable) labelToIdx.format = i;
        else if (labelToIdx.format == null) labelToIdx.format = i;
      }
      if (labelToIdx.custom == null && label === "Custom Prompt Format" && comp.type === "textbox") {
        if (labelToIdx.__tipo_enable == null || i > labelToIdx.__tipo_enable) labelToIdx.custom = i;
      }
      if (labelToIdx.tagPrompt == null && label === "Tag Prompt" && comp.type === "textbox") {
        if (labelToIdx.__tipo_enable == null || i > labelToIdx.__tipo_enable) labelToIdx.tagPrompt = i;
      }
      if (labelToIdx.nlPrompt == null && label === "Natural Language Prompt" && comp.type === "textbox") {
        if (labelToIdx.__tipo_enable == null || i > labelToIdx.__tipo_enable) labelToIdx.nlPrompt = i;
      }
    }

    var acc = findEl("#" + prefix + "_tipo_accordion");

    if (labelToIdx.__tipo_enable != null) {
      var en =
        findEl("#" + prefix + "_tipo_accordion-checkbox input") ||
        findEl("#" + prefix + "_tipo_accordion-checkbox");
      if (en && typeof en.checked === "boolean") {
        args[labelToIdx.__tipo_enable] = !!en.checked;
      }
    }

    function setFromRadio(idx, labelText, elemId) {
      if (idx == null || idx < 0 || idx >= args.length) return;
      var group = (elemId && findEl("#" + elemId)) || findTipoBlockByLabel(acc, labelText);
      var val = readRadioChoice(group);
      if (val) args[idx] = val;
    }

    function setFromText(idx, labelText, elemId) {
      if (idx == null || idx < 0 || idx >= args.length) return;
      var group = (elemId && findEl("#" + elemId)) || findTipoBlockByLabel(acc, labelText);
      if (!group) return;
      var input = group.querySelector("textarea") || group.querySelector("input:not([type=hidden])");
      if (input && typeof input.value === "string") args[idx] = input.value;
    }

    function setFromDropdown(idx, labelText, elemId) {
      if (idx == null || idx < 0 || idx >= args.length) return;
      var group = (elemId && findEl("#" + elemId)) || findTipoBlockByLabel(acc, labelText);
      var val = readDomValue(group);
      if (val) args[idx] = val;
    }

    setFromRadio(labelToIdx.tags, "Tags Length target", prefix + "_tipo_tag_length");
    setFromRadio(labelToIdx.nl, "NL Length target", prefix + "_tipo_nl_length");
    setFromText(labelToIdx.ban, "Ban tags", prefix + "_tipo_ban_tags");
    setFromDropdown(labelToIdx.format, "Prompt Format", prefix + "_tipo_prompt_format");
    setFromText(labelToIdx.custom, "Custom Prompt Format", prefix + "_tipo_custom_format");
    setFromText(labelToIdx.tagPrompt, "Tag Prompt", prefix + "_tipo_tag_prompt");
    setFromText(labelToIdx.nlPrompt, "Natural Language Prompt", prefix + "_tipo_nl_prompt");

    console.info("[LobeQueue] bridge: TIPO from DOM", {
      enable: labelToIdx.__tipo_enable != null ? args[labelToIdx.__tipo_enable] : null,
      tags: labelToIdx.tags != null ? args[labelToIdx.tags] : null,
      nl: labelToIdx.nl != null ? args[labelToIdx.nl] : null,
      ban: labelToIdx.ban != null ? args[labelToIdx.ban] : null,
      format: labelToIdx.format != null ? args[labelToIdx.format] : null,
    });
    return args;
  }

  function captureTagSeeds(args, cfg, inputIds) {
    for (var i = 0; i < Math.min(args.length, inputIds.length); i++) {
      var component = getCompById(cfg, inputIds[i]);
      if (component?.type !== "number" || component.props?.label !== "Seed for upsampling tags") continue;
      // TIPO and DTG use the same label. Gradio assigns a distinct DOM id to each.
      var id = component.props.elem_id || "component-" + component.id;
      var field = findEl("#" + id)?.querySelector("input[type=number]");
      if (!field || field.validity?.badInput) continue;
      args[i] = field.value.trim() === "" ? -1 : field.value;
    }
  }

  function xyzElemIds(isImg2Img) {
    // Script.elem_id: script_{tab}xyz_plot_{item} when shown on both tabs
    var tab = isImg2Img ? "img2img_" : "txt2img_";
    var base = "xyz_plot";
    return {
      x_type: ["script_" + tab + base + "_x_type", "script_" + base + "_x_type"],
      x_values: ["script_" + tab + base + "_x_values", "script_" + base + "_x_values"],
      y_type: ["script_" + tab + base + "_y_type", "script_" + base + "_y_type"],
      y_values: ["script_" + tab + base + "_y_values", "script_" + base + "_y_values"],
      z_type: ["script_" + tab + base + "_z_type", "script_" + base + "_z_type"],
      z_values: ["script_" + tab + base + "_z_values", "script_" + base + "_z_values"],
      csv_mode: ["script_" + tab + base + "_csv_mode", "script_" + base + "_csv_mode"],
    };
  }

  function findElByIds(ids) {
    for (var i = 0; i < ids.length; i++) {
      var el = findEl("#" + ids[i]);
      if (el) return el;
    }
    return null;
  }

  function indexOfInputByElemIds(cfg, inputIds, elemIds) {
    if (!cfg || !cfg.components || !inputIds) return -1;
    for (var si = 0; si < inputIds.length; si++) {
      var comp = getCompById(cfg, inputIds[si]);
      var eid = comp && comp.props && comp.props.elem_id;
      if (!eid) continue;
      for (var j = 0; j < elemIds.length; j++) {
        if (eid === elemIds[j]) return si;
      }
    }
    return -1;
  }

  function resolveDropdownIndex(raw, choices) {
    if (raw == null || raw === "") return null;
    if (typeof raw === "number" && !isNaN(raw)) return raw;
    var s = String(raw).trim();
    if (s === "None" || s === "") return 0;
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (choices && choices.length) {
      var idx = choices.indexOf(s);
      if (idx >= 0) return idx;
      var lower = s.toLowerCase();
      for (var i = 0; i < choices.length; i++) {
        if (String(choices[i]).toLowerCase() === lower) return i;
      }
    }
    return s; // leave label for backend coerce
  }

  function fillXyzFromDom(args, isImg2Img) {
    // Gradio type=index axis dropdowns often arrive as labels or stale defaults
    // when enqueue bypasses preprocess — prefer live DOM + config choices.
    var cfg = getConfig();
    var genFns = findClickFnDetails(isImg2Img ? "img2img_generate" : "txt2img_generate", cfg);
    if (!genFns.length || !cfg || !cfg.dependencies) return args;
    var inputIds = (cfg.dependencies[genFns[0].fn] || {}).inputs || [];
    var ids = xyzElemIds(isImg2Img);

    function applyType(key) {
      var idx = indexOfInputByElemIds(cfg, inputIds, ids[key]);
      if (idx < 0 || idx >= args.length) return;
      var wrap = findElByIds(ids[key]);
      var domVal = readDomValue(wrap);
      var comp = getCompById(cfg, inputIds[idx]);
      var choices = (comp && comp.props && comp.props.choices) || null;
      if (choices && choices.length && typeof choices[0] !== "string") {
        choices = choices.map(function (c) {
          return Array.isArray(c) ? c[0] : c;
        });
      }
      var resolved = resolveDropdownIndex(domVal != null ? domVal : args[idx], choices);
      if (resolved != null) args[idx] = resolved;
    }

    function applyText(key) {
      var idx = indexOfInputByElemIds(cfg, inputIds, ids[key]);
      if (idx < 0 || idx >= args.length) return;
      var wrap = findElByIds(ids[key]);
      if (!wrap) return;
      var input = wrap.querySelector("textarea") || wrap.querySelector("input:not([type=hidden])");
      if (input && typeof input.value === "string" && input.value) args[idx] = input.value;
    }

    applyType("x_type");
    applyType("y_type");
    applyType("z_type");
    applyText("x_values");
    applyText("y_values");
    applyText("z_values");

    // Ensure csv_mode / trailing slots exist when config undercounted inputs, without exceeding inputIds.length
    var csvIdx = indexOfInputByElemIds(cfg, inputIds, ids.csv_mode);
    if (csvIdx >= 0 && csvIdx < inputIds.length && args.length <= csvIdx) {
      while (args.length <= csvIdx) args.push(null);
    }

    var xIdx = indexOfInputByElemIds(cfg, inputIds, ids.x_type);
    var yIdx = indexOfInputByElemIds(cfg, inputIds, ids.y_type);
    var zIdx = indexOfInputByElemIds(cfg, inputIds, ids.z_type);
    console.info("[LobeQueue] bridge: XYZ from DOM", {
      x_type: xIdx >= 0 ? args[xIdx] : null,
      x_values:
        xIdx >= 0 && xIdx + 1 < args.length ? String(args[xIdx + 1]).slice(0, 60) : null,
      y_type: yIdx >= 0 ? args[yIdx] : null,
      z_type: zIdx >= 0 ? args[zIdx] : null,
      n_args: args.length,
    });
    return args;
  }

  function trimGenerateArgs(args, expectedInputs, expectedOutputs) {
    // Gradio appends output values to the JS callback arguments, including null
    // gallery values while the first job is still generating.
    if (args.length === expectedInputs || args.length === expectedInputs + expectedOutputs) {
      return args.slice(0, expectedInputs);
    }
    // If config is stale, only strip a recognizable gallery and its trailing outputs.
    var a = args.slice();
    var candidates = [5, 4, 3];
    for (var i = 0; i < candidates.length; i++) {
      var n = candidates[i];
      if (a.length < n) continue;
      if (expectedInputs > 0 && a.length - n === expectedInputs && Array.isArray(a[a.length - n])) {
        return a.slice(0, a.length - n);
      }
    }
    // Classic create_submit_args heuristic when lengths don't match config
    if (Array.isArray(a[a.length - 5])) return a.slice(0, a.length - 5);
    if (Array.isArray(a[a.length - 4])) return a.slice(0, a.length - 4);
    if (Array.isArray(a[a.length - 3])) return a.slice(0, a.length - 3);
    if (expectedInputs > 0 && a.length > expectedInputs) {
      console.warn(
        "[LobeQueue] bridge: keeping args longer than config",
        a.length,
        ">",
        expectedInputs
      );
    }
    return a;
  }

  function secondaryCaptureReady(cfg, isImg2Img) {
    var cnNeed = findControlNetStateIndices(cfg, isImg2Img).length;
    var adNeed = findADetailerStateSlots(cfg, isImg2Img).length;
    var cnOk = cnNeed === 0 || pendingCnUnits.length >= cnNeed;
    var adOk = adNeed === 0 || Object.keys(pendingAdStates).length >= adNeed;
    return cnOk && adOk;
  }

  function flushPrimaryCapture() {
    if (!pendingPrimaryCapture) return;
    var snap = pendingPrimaryCapture;
    snap.selection = pending.selection;
    var done = pending.done;
    pendingPrimaryCapture = null;
    if (snap.timer) {
      try {
        clearTimeout(snap.timer);
      } catch (e) {}
    }

    var args = injectControlNetUnits(snap.args, snap.isImg2Img);
    args = injectADetailerStates(args, snap.isImg2Img);
    args = fillTipoFromDom(args, snap.isImg2Img);
    args = fillXyzFromDom(args, snap.isImg2Img);
    pending = null;
    pendingCnUnits = [];
    pendingAdStates = {};
    window.__lobeQueueEnqueueActive = false;

    postUiQueue(args, snap.isImg2Img, snap.selection)
      .then(function (res) {
        done.resolve(res);
        try {
          window.dispatchEvent(
            new CustomEvent("lobe:queue-updated", { detail: res || {} })
          );
        } catch (evErr) {}
      })
      .catch(function (e) {
        done.reject(e);
      });
  }

  function handlePendingRequest(url, bodyStr) {
    // returns { block: true } | null
    if (!pending || !bodyStr || typeof bodyStr !== "string") return null;
    if (
      url.indexOf("/queue/join") === -1 &&
      url.indexOf("/run/predict") === -1 &&
      url.indexOf("/call/") === -1
    ) {
      return null;
    }
    try {
      var body = JSON.parse(bodyStr);
      if (typeof body.fn_index !== "number") return null;

      var allGen = [pending.primaryGenFn].concat(pending.secondaryGenFns);
      if (allGen.indexOf(body.fn_index) === -1) return null;

      // Secondary generate handlers: capture ControlNet / ADetailer builders, swallow the rest
      if (body.fn_index !== pending.primaryGenFn) {
        var cfgSec = getConfig();
        var dep = cfgSec && cfgSec.dependencies ? cfgSec.dependencies[body.fn_index] : null;
        if (dep && isControlNetBuilderDep(dep, cfgSec)) {
          pendingCnUnits.push(buildCnUnitFromArgs(body.data));
          console.info(
            "[LobeQueue] bridge: captured ControlNet unit fn=" +
              body.fn_index +
              " enabled=" +
              !!(pendingCnUnits[pendingCnUnits.length - 1] && pendingCnUnits[pendingCnUnits.length - 1].enabled)
          );
        } else if (dep && isADetailerBuilderDep(dep, cfgSec)) {
          var outId = dep.outputs[0];
          var adSlots = findADetailerStateSlots(cfgSec, pending.isImg2Img);
          var tabIndex = 0;
          for (var ti = 0; ti < adSlots.length; ti++) {
            if (adSlots[ti].compId == outId) {
              tabIndex = ti;
              break;
            }
          }
          pendingAdStates[outId] = buildAdStateFromArgs(body.data, tabIndex);
          console.info(
            "[LobeQueue] bridge: captured ADetailer state fn=" +
              body.fn_index +
              " tab=" +
              tabIndex +
              " model=" +
              (pendingAdStates[outId] && pendingAdStates[outId].ad_model)
          );
        } else {
          console.info("[LobeQueue] bridge: block secondary generate fn=" + body.fn_index);
        }
        // If primary already arrived, finish once CN + ADetailer slots are filled
        if (pendingPrimaryCapture && secondaryCaptureReady(cfgSec, pendingPrimaryCapture.isImg2Img)) {
          flushPrimaryCapture();
        }
        return { block: true };
      }

      var args = Array.isArray(body.data) ? body.data.slice() : [];
      args = trimGenerateArgs(args, pending.primaryInputs, pending.primaryOutputs);
      captureTagSeeds(args, pending.config, pending.primaryInputIds);

      var scriptIdx = 26;
      // Use the visible prompt value even before Forge's debounce flushes.
      try {
        var prefix = pending.isImg2Img ? "img2img" : "txt2img";
        // img2img adds its mode before the prompt.
        var offset = pending.isImg2Img ? 2 : 1;
        args[offset] = readLivePrompt("#" + prefix + "_prompt", args[offset]);
        args[offset + 1] = readLivePrompt("#" + prefix + "_neg_prompt", args[offset + 1]);
        // Script dropdown must be numeric index (type=index); label "None" / "X/Y/Z plot"
        // break runner if left as strings without resolution.
        scriptIdx = -1;
        var scriptChoices = null;
        try {
          var cfg = getConfig();
          var genFns = findClickFnDetails(
            pending.isImg2Img ? "img2img_generate" : "txt2img_generate",
            cfg
          );
          if (genFns.length && cfg && cfg.components) {
            var inputIds = (cfg.dependencies[genFns[0].fn] || {}).inputs || [];
            for (var si = 0; si < inputIds.length; si++) {
              var comp = getCompById(cfg, inputIds[si]);
              if (comp && comp.props && comp.props.elem_id === "script_list") {
                scriptIdx = si;
                scriptChoices = comp.props.choices || null;
                if (scriptChoices && scriptChoices.length && typeof scriptChoices[0] !== "string") {
                  scriptChoices = scriptChoices.map(function (c) {
                    return Array.isArray(c) ? c[0] : c;
                  });
                }
                break;
              }
            }
          }
        } catch (e) {}
        // Prefer live DOM script selection over stale payload
        if (scriptIdx >= 0) {
          var scriptDom = readDomValue(findEl("#tab_" + prefix + " #script_list"));
          if (scriptDom != null) {
            var fromDom = resolveDropdownIndex(scriptDom, scriptChoices);
            if (fromDom != null) args[scriptIdx] = fromDom;
          }
        }
      } catch (domErr) {
        console.warn("[LobeQueue] bridge: DOM prompt fill failed", domErr);
      }

      console.info("[LobeQueue] bridge: captured generate args=" + args.length, {
        promptLen: args[1] ? String(args[1]).length : 0,
        scriptIndex: args[scriptIdx],
        cnCaptured: pendingCnUnits.length,
        adCaptured: Object.keys(pendingAdStates).length,
      });

      // Delay flush so ControlNet / ADetailer builder requests (same Generate click) can arrive first
      pendingPrimaryCapture = {
        args: args,
        isImg2Img: pending.isImg2Img,
        scriptIdx: scriptIdx,
        timer: null,
      };
      var cfgNow = getConfig();
      if (secondaryCaptureReady(cfgNow, pending.isImg2Img)) {
        flushPrimaryCapture();
      } else {
        // 4 ADetailer + 3 ControlNet secondary builders can lag behind primary
        pendingPrimaryCapture.timer = setTimeout(flushPrimaryCapture, 350);
      }

      return { block: true };
    } catch (e) {
      console.error("[LobeQueue] bridge handle failed", e);
      return null;
    }
  }

  var origFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url =
      typeof input === "string"
        ? input
        : input && input.url
          ? input.url
          : String(input);
    if (pending && init && typeof init.body === "string") {
      var result = handlePendingRequest(url, init.body);
      if (result && result.block) return blockedGenerateResponse(url);
    }
    return origFetch(input, init);
  };

  var origOpen = XMLHttpRequest.prototype.open;
  var origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__as_url = String(url);
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (body) {
    if (pending && typeof body === "string" && this.__as_url) {
      var result = handlePendingRequest(this.__as_url, body);
      if (result && result.block) {
        var self = this;
        setTimeout(function () {
          Object.defineProperty(self, "status", { value: 200 });
          Object.defineProperty(self, "responseText", {
            value: JSON.stringify({ event_id: null, data: [] }),
          });
          Object.defineProperty(self, "readyState", { value: 4 });
          if (self.onreadystatechange) self.onreadystatechange();
          if (self.onload) self.onload();
        }, 0);
        return;
      }
    }
    return origSend.call(this, body);
  };

  function patchSubmit() {
    if (window.__lobeQueueSubmitPatched) return;
    window.__lobeQueueSubmitPatched = true;

    function wrapSubmit(name) {
      var orig = window[name];
      if (typeof orig !== "function") return;
      window[name] = function () {
        if (!window.__lobeQueueEnqueueActive) {
          return orig.apply(this, arguments);
        }
        // Keep full script args — create_submit_args strips trailing arrays.
        var id =
          typeof randomId === "function"
            ? randomId()
            : "task(" + Math.random().toString(36).slice(2) + ")";
        var res = Array.prototype.slice.call(arguments);
        if (res.length === 1 && Array.isArray(res[0])) res = res[0].slice();
        res[0] = id;
        if (name === "submit_img2img" && typeof get_tab_index === "function") {
          res[1] = get_tab_index("mode_img2img");
        }
        console.info("[LobeQueue] bridge: " + name + " passthrough args=" + res.length);
        return res;
      };
    }
    wrapSubmit("submit");
    wrapSubmit("submit_img2img");
  }

  function findComponentElement(comp) {
    if (!comp) return null;
    var props = comp.props || {};
    var eid = props.elem_id;
    var classes = Array.isArray(props.elem_classes) ? props.elem_classes : [];
    if (eid) {
      if (classes.indexOf("logical_image_background") !== -1) {
        return findEl("#" + eid + ".logical_image_background") || findEl("#component-" + comp.id);
      }
      if (classes.indexOf("logical_image_foreground") !== -1) {
        return findEl("#" + eid + ".logical_image_foreground") || findEl("#component-" + comp.id);
      }
      var byId = findEl("#" + eid);
      if (byId) return byId;
    }
    if (comp.id != null) {
      return findEl("#component-" + comp.id);
    }
    return null;
  }

  function normalizeChoices(choices) {
    if (!Array.isArray(choices) || !choices.length) return null;
    if (typeof choices[0] === "string") return choices;
    return choices.map(function (c) {
      return Array.isArray(c) ? c[0] : String(c);
    });
  }

  function resolveChoiceValue(val, choices) {
    if (!Array.isArray(choices) || !choices.length || val == null) return val;
    var s = String(val);
    for (var i = 0; i < choices.length; i++) {
      var c = choices[i];
      if (Array.isArray(c)) {
        if (String(c[1]) === s || String(c[0]) === s) return c[1];
      } else if (String(c) === s) {
        return c;
      }
    }
    return val;
  }

  function readImageElementValue(img) {
    if (!img) return null;
    var src = img.getAttribute("src") || img.src || "";
    if (!src) return null;
    var fileMarker = "/file=";
    var fileIdx = src.indexOf(fileMarker);
    if (fileIdx !== -1) {
      var rawPath = src.slice(fileIdx + fileMarker.length).split("?")[0].split("#")[0];
      try {
        rawPath = decodeURIComponent(rawPath);
      } catch (e) {}
      if (rawPath) return { path: rawPath, url: src };
    }
    if (src.indexOf("data:image/") === 0) {
      return { url: src };
    }
    if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      try {
        var canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        var ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          return { url: canvas.toDataURL("image/png") };
        }
      } catch (e) {}
    }
    return null;
  }

  function readComponentValue(comp, cfg) {
    if (!comp) return null;
    var props = comp.props || {};
    var defaultVal = props.value !== undefined ? props.value : null;
    var type = String(comp.type || "").toLowerCase();
    var wrap = findComponentElement(comp);

    if (type === "accordion" || (wrap && wrap.classList && wrap.classList.contains("input-accordion"))) {
      if (wrap) {
        var accCb =
          wrap.querySelector("input.input-accordion-checkbox") ||
          wrap.querySelector(".label-wrap input[type=checkbox]") ||
          wrap.querySelector("input[type=checkbox]");
        if (accCb && typeof accCb.checked === "boolean") return !!accCb.checked;
      }
      return typeof defaultVal === "boolean" ? defaultVal : false;
    }

    if (type === "image") {
      if (wrap) {
        var imgEl = wrap.querySelector("img");
        var imgVal = readImageElementValue(imgEl);
        if (imgVal) return imgVal;
      }
      return defaultVal;
    }

    if (type === "checkbox") {
      if (wrap) {
        var cb =
          wrap.tagName === "INPUT" && wrap.type === "checkbox"
            ? wrap
            : wrap.querySelector("input[type=checkbox]");
        if (cb && typeof cb.checked === "boolean") return !!cb.checked;
      }
      return !!defaultVal;
    }

    if (type === "slider" || type === "number") {
      if (Array.isArray(defaultVal)) {
        if (wrap) {
          var nums = wrap.querySelectorAll("input[type=number], input[type=range]");
          if (nums.length >= 2) {
            var n0 = Number(nums[0].value);
            var n1 = Number(nums[1].value);
            if (!isNaN(n0) && !isNaN(n1)) return [n0, n1];
          }
        }
        return defaultVal.slice();
      }
      if (wrap) {
        var numEl =
          wrap.querySelector("input[type=number]") ||
          wrap.querySelector("input[type=range]") ||
          (wrap.tagName === "INPUT" ? wrap : null);
        if (numEl && typeof numEl.value === "string" && numEl.value.trim() !== "") {
          var parsed = Number(numEl.value);
          if (!isNaN(parsed)) return parsed;
        }
      }
      return defaultVal;
    }

    if (type === "radio") {
      var rVal = readRadioChoice(wrap);
      var chosen = rVal != null ? rVal : defaultVal;
      if (props.type === "index") {
        var rIdx = resolveDropdownIndex(chosen, normalizeChoices(props.choices));
        return rIdx != null ? rIdx : 0;
      }
      return resolveChoiceValue(chosen, props.choices);
    }

    if (type === "dropdown") {
      if (props.multiselect) {
        if (wrap) {
          var tokens = wrap.querySelectorAll(".token > span, [data-testid=dropdown] .token span");
          if (tokens.length > 0) {
            var multi = [];
            for (var ti = 0; ti < tokens.length; ti++) {
              var txt = (tokens[ti].textContent || "").trim();
              if (txt) multi.push(resolveChoiceValue(txt, props.choices));
            }
            return multi;
          }
          if (wrap.querySelector(".wrap-inner")) {
            return [];
          }
        }
        return Array.isArray(defaultVal) ? defaultVal.slice() : [];
      }
      var dVal = readDomValue(wrap);
      var selected = dVal != null ? dVal : defaultVal;
      if (props.type === "index") {
        var dIdx = resolveDropdownIndex(selected, normalizeChoices(props.choices));
        return dIdx != null ? dIdx : 0;
      }
      return resolveChoiceValue(selected, props.choices);
    }

    if (type === "checkboxgroup") {
      if (wrap) {
        var cbs = wrap.querySelectorAll("input[type=checkbox]");
        if (cbs.length > 0) {
          var checkedList = [];
          for (var ci = 0; ci < cbs.length; ci++) {
            if (cbs[ci].checked) {
              var lab = cbs[ci].closest("label") || cbs[ci].parentElement;
              var valStr =
                cbs[ci].value && cbs[ci].value !== "on"
                  ? cbs[ci].value
                  : lab
                    ? (lab.textContent || "").trim()
                    : "";
              if (valStr) checkedList.push(valStr);
            }
          }
          return checkedList;
        }
      }
      return Array.isArray(defaultVal) ? defaultVal.slice() : [];
    }

    if (type === "textbox" || type === "text" || type === "textarea") {
      if (wrap) {
        var tEl =
          wrap.tagName === "TEXTAREA" || (wrap.tagName === "INPUT" && wrap.type !== "hidden")
            ? wrap
            : wrap.querySelector("textarea") || wrap.querySelector("input:not([type=hidden])");
        if (tEl && typeof tEl.value === "string") return tEl.value;
      }
      return defaultVal != null ? defaultVal : "";
    }

    return defaultVal;
  }

  function collectArgsDirectly(isImg2Img, cfg) {
    var genDetails = findClickFnDetails(
      isImg2Img ? "img2img_generate" : "txt2img_generate",
      cfg
    );
    if (!genDetails.length) {
      cfg = window.gradio_config;
      genDetails = findClickFnDetails(
        isImg2Img ? "img2img_generate" : "txt2img_generate",
        cfg
      );
    }
    if (!genDetails.length || !cfg) {
      throw new Error("Generate controls unavailable");
    }

    var primaryGen = genDetails[0];
    var inputIds = primaryGen.inputIds || [];
    var args = new Array(inputIds.length);
    for (var i = 0; i < inputIds.length; i++) {
      args[i] = readComponentValue(getCompById(cfg, inputIds[i]), cfg);
    }

    args[0] =
      typeof randomId === "function"
        ? randomId()
        : "task(" + Math.random().toString(36).slice(2) + ")";
    if (isImg2Img) {
      args[1] =
        typeof get_tab_index === "function"
          ? get_tab_index("mode_img2img")
          : typeof args[1] === "number"
            ? args[1]
            : 0;
    }

    // Populate secondary builders (ControlNet & ADetailer) directly from DOM/config
    pendingCnUnits = [];
    pendingAdStates = {};
    var adSlots = findADetailerStateSlots(cfg, isImg2Img);
    var secDetails = genDetails.slice(1);
    for (var si = 0; si < secDetails.length; si++) {
      var dep = cfg.dependencies && cfg.dependencies[secDetails[si].fn];
      if (!dep) continue;
      if (isControlNetBuilderDep(dep, cfg)) {
        var cnData = (dep.inputs || []).map(function (id) {
          return readComponentValue(getCompById(cfg, id), cfg);
        });
        pendingCnUnits.push(buildCnUnitFromArgs(cnData));
      } else if (isADetailerBuilderDep(dep, cfg)) {
        var outId = dep.outputs[0];
        var tabIndex = 0;
        for (var ti = 0; ti < adSlots.length; ti++) {
          if (adSlots[ti].compId == outId) {
            tabIndex = ti;
            break;
          }
        }
        var adData = (dep.inputs || []).map(function (id) {
          return readComponentValue(getCompById(cfg, id), cfg);
        });
        pendingAdStates[outId] = buildAdStateFromArgs(adData, tabIndex);
      }
    }

    captureTagSeeds(args, cfg, inputIds);

    try {
      var prefix = isImg2Img ? "img2img" : "txt2img";
      var offset = isImg2Img ? 2 : 1;
      args[offset] = readLivePrompt("#" + prefix + "_prompt", args[offset]);
      args[offset + 1] = readLivePrompt("#" + prefix + "_neg_prompt", args[offset + 1]);
      for (var sIdx = 0; sIdx < inputIds.length; sIdx++) {
        var sComp = getCompById(cfg, inputIds[sIdx]);
        if (sComp && sComp.props && sComp.props.elem_id === "script_list") {
          var scriptDom = readDomValue(findEl("#tab_" + prefix + " #script_list"));
          if (scriptDom != null) {
            var fromDom = resolveDropdownIndex(
              scriptDom,
              normalizeChoices(sComp.props.choices)
            );
            if (fromDom != null) args[sIdx] = fromDom;
          }
          break;
        }
      }
    } catch (domErr) {
      console.warn("[LobeQueue] bridge: DOM prompt fill failed", domErr);
    }

    args = injectControlNetUnits(args, isImg2Img);
    args = injectADetailerStates(args, isImg2Img);
    args = fillTipoFromDom(args, isImg2Img);
    args = fillXyzFromDom(args, isImg2Img);

    pendingCnUnits = [];
    pendingAdStates = {};
    return args;
  }

  function runBridge(isImg2Img, cfg, selection, done) {
    try {
      var args = collectArgsDirectly(isImg2Img, cfg);
      postUiQueue(args, isImg2Img, selection)
        .then(function (res) {
          done.resolve(res);
          try {
            window.dispatchEvent(
              new CustomEvent("lobe:queue-updated", { detail: res || {} })
            );
          } catch (evErr) {}
        })
        .catch(function (e) {
          done.reject(e);
        });
    } catch (err) {
      done.reject(err);
    }
  }


  window.lobeEnqueue = function (tab, selection) {
    return new Promise(function (resolve, reject) {
      if (pending || lastClickTs) return reject(new Error("Queue capture already in progress"));
      lastClickTs = Date.now();
      function run(cfg) {
        lastClickTs = 0;
        runBridge(tab === "img2img", cfg || getConfig(), selection, {resolve: resolve, reject: reject});
      }
      if (liveConfig) run(liveConfig);
      else loadLiveConfig().then(run, function (error) {
        lastClickTs = 0;
        reject(error);
      });
    });
  };
  var restoreHooks = new Map();
  var restoreJobs = new Map();

  function installRestoreHook(tab) {
    var name = tab === "txt2img" ? "restoreProgressTxt2img" : "restoreProgressImg2img";
    var nativeRestore = window[name];
    if (nativeRestore && nativeRestore === restoreHooks.get(tab)) return true;
    if (typeof nativeRestore !== "function") return false;
    var hook = function () {
      var queued = restoreJobs.get(tab);
      restoreJobs.delete(tab);
      // The Gradio event declares exactly one Textbox input. It turns undefined into [].
      if (queued && typeof localGet === "function" && !localGet(tab + "_task_id")) {
        return [queued.job];
      }
      var id = nativeRestore.apply(this, arguments);
      return [typeof id === "string" ? id : null];
    };
    restoreHooks.set(tab, hook);
    window[name] = hook;
    return true;
  }

  function installRestoreHooks() {
    installRestoreHook("txt2img");
    installRestoreHook("img2img");
  }

  installRestoreHooks();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installRestoreHooks, { once: true });
  }

  window.lobeQueueShowResult = function (tab, job) {
    if ((tab !== "txt2img" && tab !== "img2img") || typeof job !== "string" || !job) return;
    if (typeof localGet !== "function" || localGet(tab + "_task_id")) return;
    var button = findEl("#" + tab + "_restore_progress");
    if (!button || button.disabled || !installRestoreHook(tab)) return;
    var queued = { job: job };
    restoreJobs.set(tab, queued);
    setTimeout(function () {
      if (restoreJobs.get(tab) === queued) restoreJobs.delete(tab);
    }, 1000);
    button.click();
  };
})();
