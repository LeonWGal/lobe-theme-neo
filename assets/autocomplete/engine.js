/* TagComplete Neo engine, derived from Dominik Reh's MIT-licensed Tag Autocomplete. See assets/autocomplete/LICENSE. */

(() => {

if (window.lobeTagComplete) return;

// __globals.js
// Core components
var TAC_CFG = null;
const tagBasePath = "/lobe/autocomplete/tags";
var modelKeywordPath = "";
var tacSelfTrigger = false;

// Tag completion data loaded from files
var allTags = [];
var translations = new Map();
var extras = [];
// Same for tag-likes
var wildcardFiles = [];
var wildcardExtFiles = [];
var yamlWildcards = [];
var umiWildcards = [];
var embeddings = [];
var loras = [];
var lycos = [];
var modelKeywordDict = new Map();
var chants = [];
var styleNames = [];

// Selected model info for black/whitelisting
var currentModelHash = "";
var currentModelName = "";
// Whether the current checkpoint was detected as ANIMA-based (for artist tag '@' prefixing)
var currentModelIsAnima = false;

// Current results
var results = [];
var resultCount = 0;

// Relevant for parsing
var previousTags = [];
var tagword = "";
var originalTagword = "";
let hideBlocked = false;

// Tag selection for keyboard navigation
var selectedTag = null;
var oldSelectedTag = null;
var resultCountBeforeNormalTags = 0;

// Lora keyword undo/redo history
var textBeforeKeywordInsertion = "";
var textAfterKeywordInsertion = "";
var lastEditWasKeywordInsertion = false;
var keywordInsertionUndone = false;

// UMI
var umiPreviousTags = [];

/// Extendability system:
/// Provides "queues" for other files of the script (or really any js)
/// to add functions to be called at certain points in the script.
/// Similar to a callback system, but primitive.

// Queues
const QUEUE_AFTER_INSERT = [];
const QUEUE_AFTER_SETUP = [];
const QUEUE_FILE_LOAD = [];
const QUEUE_AFTER_CONFIG_CHANGE = [];
const QUEUE_SANITIZE = [];

// List of parsers to try
const PARSERS = [];

// _baseParser.js
class FunctionNotOverriddenError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message + " is an abstract base function and must be overwritten.";
      }
}

class BaseTagParser {
    triggerCondition = null;

    constructor (triggerCondition) {
        if (new.target === BaseTagParser) {
            throw new TypeError("Cannot construct abstract BaseCompletionParser directly");
        }
        this.triggerCondition = triggerCondition;
    }

    parse() {
        throw new FunctionNotOverriddenError("parse()");
    }
}

// _caretPosition.js
// From https://github.com/component/textarea-caret-position

// We'll copy the properties below into the mirror div.
// Note that some browsers, such as Firefox, do not concatenate properties
// into their shorthand (e.g. padding-top, padding-bottom etc. -> padding),
// so we have to list every single property explicitly.
var properties = [
  'direction',  // RTL support
  'boxSizing',
  'width',  // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
  'height',
  'overflowX',
  'overflowY',  // copy the scrollbar for IE

  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',

  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',

  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',

  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',  // might not make a difference, but better be safe

  'letterSpacing',
  'wordSpacing',

  'tabSize',
  'MozTabSize'

];

var isBrowser = (typeof window !== 'undefined');
var isFirefox = (isBrowser && window.mozInnerScreenX != null);
let caretMirror;
let caretMarker;
let caretText;
let caretStyleElement;
let caretStyleSize;
const invalidateCaretStyle = () => { caretStyleElement = undefined; };
if (isBrowser) {
  window.addEventListener('resize', invalidateCaretStyle);
  window.addEventListener('lobe:settings', invalidateCaretStyle);
  document.fonts?.addEventListener('loadingdone', invalidateCaretStyle);
}

function getCaretCoordinates(element, position, options) {
  if (!isBrowser) {
    throw new Error('textarea-caret-position#getCaretCoordinates should only be called in a browser');
  }

  var debug = options && options.debug || false;
  if (debug) {
    var el = document.querySelector('#input-textarea-caret-position-mirror-div');
    if (el) el.parentNode.removeChild(el);
  }

  // The mirror div will replicate the textarea's style
  if (!caretMirror?.isConnected || debug) {
    invalidateCaretStyle();
    caretMirror = document.createElement('div');
    caretMirror.className = 'lobe-caret-mirror';
    if (debug) caretMirror.id = 'input-textarea-caret-position-mirror-div';
    caretText = document.createTextNode('');
    caretMarker = document.createElement('span');
    caretMirror.append(caretText, caretMarker);
    document.body.appendChild(caretMirror);
  }
  const div = caretMirror;

  var style = div.style;
  var isInput = element.nodeName === 'INPUT';

  // Default textarea styles
  style.whiteSpace = 'pre-wrap';
  style.wordWrap = isInput ? 'normal' : 'break-word';

  // Position off-screen
  style.position = 'absolute';  // required to return coordinates properly
  style.inset = '0 auto auto 0';
  style.contain = 'layout paint';
  style.pointerEvents = 'none';
  if (!debug)
    style.visibility = 'hidden';  // not 'display: none' because we want rendering

  const size = `${element.clientWidth}:${element.clientHeight}`;
  if (caretStyleElement !== element || caretStyleSize !== size || debug) {
    caretStyleElement = element;
    caretStyleSize = size;
    const computed = window.getComputedStyle(element);
    properties.forEach(function (prop) {
      if (!isInput || prop !== 'lineHeight') {
        style[prop] = computed[prop];
        return;
      }
      // Special case for <input>s because text is rendered centered and line height may be != height
      if (computed.boxSizing === "border-box") {
        var height = parseInt(computed.height);
        var outerHeight =
          parseInt(computed.paddingTop) +
          parseInt(computed.paddingBottom) +
          parseInt(computed.borderTopWidth) +
          parseInt(computed.borderBottomWidth);
        var targetHeight = outerHeight + parseInt(computed.lineHeight);
        if (height > targetHeight) {
          style.lineHeight = height - outerHeight + "px";
        } else if (height === targetHeight) {
          style.lineHeight = computed.lineHeight;
        } else {
          style.lineHeight = 0;
        }
      } else {
        style.lineHeight = computed.height;
      }
    });

    style.overflow = isFirefox && element.scrollHeight > parseInt(computed.height)
      ? 'hidden scroll' : 'hidden';
  }

  const prefix = element.value.substring(0, position);
  // The second special handling for input type="text" vs textarea:
  // spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
  const mirroredPrefix = isInput ? prefix.replace(/\s/g, '\u00a0') : prefix;
  if (caretText.data !== mirroredPrefix) caretText.data = mirroredPrefix;

  const span = caretMarker;
  // Wrapping must be replicated *exactly*, including when a long word gets
  // onto the next line, with whitespace at the end of the line before (#7).
  // The  *only* reliable way to do that is to copy the *entire* rest of the
  // textarea's content into the <span> created at the caret position.
  // For inputs, just '.' would be enough, but no need to bother.
  const suffix = element.value.substring(position) || '.';
  if (span.firstChild) {
    if (span.firstChild.data !== suffix) span.firstChild.data = suffix;
  } else span.append(document.createTextNode(suffix));

  var coordinates = {
    top: span.offsetTop + (parseInt(style.borderTopWidth) || 0),
    left: span.offsetLeft + (parseInt(style.borderLeftWidth) || 0),
    height: parseInt(style.lineHeight)
  };

  if (debug) {
    span.style.backgroundColor = '#aaa';
    caretMirror = undefined;
  }

  return coordinates;
}

// _promptTools.js
// Prompt text helpers for the used-tag selection and the prompt formatter.
// Pure functions without DOM access. Ideas adapted from
// newtextdoc1111/ComfyUI-Autocomplete-Plus (MIT).
var TacPromptTools = (() => {
    // Angle brackets are left out on purpose: emoticon tags such as ">_<" or ":<" would otherwise
    // read as unbalanced, and extra networks like <lora:name:1> contain no commas anyway.
    const PAIRS = { "(": ")", "[": "]", "{": "}" };
    const CLOSING = new Set(Object.values(PAIRS));
    const LINE_KEYWORDS = /^(BREAK|AND|ADDCOMM|ADDBASE|ADDCOL|ADDROW)$/;

    // Splits text at top-level commas and newlines. Separators inside brackets and quotes are kept,
    // and escaped characters are skipped. `balanced` is false when a bracket or quote never closes
    // or a closing bracket has no opener.
    function splitSegments(text) {
        const segments = [];
        const stack = [];
        let start = 0, quote = false, escape = false, stray = false;
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (escape) { escape = false; continue; }
            if (c === "\\") { escape = true; continue; }
            if (c === '"') { quote = !quote; continue; }
            if (quote) continue;
            if (PAIRS[c]) {
                stack.push(PAIRS[c]);
            } else if (stack.length && c === stack[stack.length - 1]) {
                stack.pop();
            } else if (CLOSING.has(c)) {
                stray = true;
            } else if (!stack.length && (c === "," || c === "\n")) {
                segments.push({ start, end: i, text: text.slice(start, i), separator: c });
                start = i + 1;
            }
        }
        segments.push({ start, end: text.length, text: text.slice(start), separator: "" });
        return { segments, balanced: !stack.length && !quote && !stray };
    }

    // Like splitSegments, but falls back to plain comma/newline splitting for unbalanced text
    // (e.g. a ":(" emoticon), so tag lookups still work there.
    function tagSegments(text) {
        const parsed = splitSegments(text);
        if (parsed.balanced) return parsed.segments;
        const segments = [];
        let start = 0;
        for (let i = 0; i <= text.length; i++) {
            if (i === text.length || text[i] === "," || text[i] === "\n") {
                segments.push({ start, end: i, text: text.slice(start, i), separator: text[i] || "" });
                start = i + 1;
            }
        }
        return segments;
    }

    // Reduces a prompt segment to a comparable tag name: drops emphasis brackets and weights,
    // unescapes parentheses, removes the ANIMA '@' artist prefix and treats spaces as underscores.
    function normalizeTag(text) {
        let tag = String(text ?? "").trim();
        for (;;) {
            const match = tag.match(/^\((.*?)(?::\s*-?\d+(?:\.\d+)?)?\)$/s)
                || tag.match(/^\[(.*)\]$/s)
                || tag.match(/^\{(.*)\}$/s);
            if (!match) break;
            tag = match[1].trim();
        }
        return tag
            .replace(/\\([()[\]{}])/g, "$1")
            .replace(/^@/, "")
            .replace(/\s+/g, "_")
            .toLowerCase();
    }

    // The segment containing the caret, or null.
    function segmentAt(text, pos) {
        return tagSegments(text).find(s => s.start <= pos && pos <= s.end) || null;
    }

    // First occurrence of `tag` as its own segment, outside the segment that contains `ignorePos`.
    // Returns the trimmed range of the occurrence.
    function findTag(text, tag, ignorePos = -1) {
        const key = normalizeTag(tag);
        if (!key) return null;
        for (const s of tagSegments(text)) {
            if (s.start <= ignorePos && ignorePos <= s.end) continue;
            if (normalizeTag(s.text) !== key) continue;
            const lead = s.text.length - s.text.trimStart().length;
            return { start: s.start + lead, end: s.start + s.text.trimEnd().length };
        }
        return null;
    }

    // Range that removes a segment together with one adjacent comma, so removing "b" from
    // "a, b, c" leaves "a, c". Newlines are never removed, to keep the line layout.
    function removalRange(text, segment) {
        if (segment.start > 0 && text[segment.start - 1] === ",") {
            return { start: segment.start - 1, end: segment.end };
        }
        if (segment.separator === ",") {
            let end = segment.end + 1;
            while (end < text.length && (text[end] === " " || text[end] === "\t")) end++;
            return { start: segment.start, end };
        }
        return { start: segment.start, end: segment.end };
    }

    // Multi-word queries for the plain words right before the caret, so "long hai" can complete to
    // long_hair: the last `maxWords` down to 2 words joined with "_", longest first. Only the text
    // after the last comma, newline or "|" counts, and it must be plain words separated by single
    // spaces; prompt syntax, wildcards or a trailing space return nothing.
    function spacedTagQueries(textBeforeCaret, maxWords = 3) {
        const field = String(textBeforeCaret ?? "").match(/[^,\n|]*$/)[0].trimStart();
        if (!field || /\s$/.test(field) || /\s\s|\t/.test(field)) return [];
        if (/[<>()[\]{}:*@$"\\]|__/.test(field)) return [];
        const words = field.split(" ");
        const queries = [];
        for (let n = Math.min(maxWords, words.length); n >= 2; n--) {
            queries.push(words.slice(-n).join("_").toLowerCase());
        }
        return queries;
    }

    // Number lists and single-letter templates (e.g. LoRA block weights "1,0,0,A") are data, not tags.
    function looksLikeData(segments) {
        const parts = segments.map(s => s.text.trim()).filter(Boolean);
        return parts.length > 0 && parts.every(p => /^[A-Za-z]$/.test(p) || /^-?\d+(\.\d+)?$/.test(p));
    }

    // Tidies a prompt: trims it, drops empty tags and joins the tags of each line with `separator`.
    // Each line with tags then ends with `lineEnd` ("," with `trailingComma`), and the last line
    // with `lastLineEnd` (default `lineEnd`); BREAK/AND keyword lines end with nothing.
    // Line breaks, bracket contents and quoted text are kept as written.
    // Text with unbalanced brackets or quotes is returned unchanged.
    function formatPrompt(text, { separator = ", ", trailingComma = false, lineEnd, lastLineEnd } = {}) {
        if (text == null) return text;
        if (!text.trim()) return "";
        const { segments, balanced } = splitSegments(text.trim());
        if (!balanced || looksLikeData(segments)) return text;
        lineEnd ??= trailingComma ? "," : "";
        lastLineEnd ??= lineEnd;

        const lines = [];
        let tags = [];
        for (const s of segments) {
            const tag = s.text.trim();
            if (tag) tags.push(tag);
            if (s.separator === ",") continue;
            let line = tags.join(separator);
            if (line && !LINE_KEYWORDS.test(line)) line += s.separator ? lineEnd : lastLineEnd;
            lines.push(line);
            tags = [];
        }
        return lines.join("\n");
    }

    return { splitSegments, tagSegments, normalizeTag, segmentAt, findTag, removalRange, spacedTagQueries, formatPrompt };
})();

// _result.js
// Result data type for cleaner use of optional completion result properties

// Type enum
const ResultType = Object.freeze({
    "tag": 1,
    "extra": 2,
    "embedding": 3,
    "wildcardTag": 4,
    "wildcardFile": 5,
    "yamlWildcard": 6,
    "umiWildcard": 7,
    "lora": 8,
    "lyco": 9,
    "chant": 10,
    "styleName": 11
});

// Class to hold result data and annotations to make it clearer to use
class AutocompleteResult {
    // Main properties
    text = "";
    type = ResultType.tag;

    // Additional info, only used in some cases
    category = null;
    count = Number.MAX_SAFE_INTEGER;
    usageBias = null;
    aliases = null;
    meta = null;
    hash = null;
    sortKey = null;

    // Constructor
    constructor(text, type) {
        this.text = text;
        this.type = type;
    }
}

// _textAreas.js
// Utility functions to select text areas the script should work on,
// including third party options.
// Supported third party options so far:
// - Dataset Tag Editor

// Core text area selectors.
// Use descendant selectors (no '>') so they work with Gradio 4.39+ which inserts
// intermediate wrapper divs between the component root and the <label>/<textarea>.
const core = [
    "#txt2img_prompt textarea",
    "#img2img_prompt textarea",
    "#txt2img_neg_prompt textarea",
    "#img2img_neg_prompt textarea",
    "#txt2img_edit_style_prompt textarea",
    "#txt2img_edit_style_neg_prompt textarea",
    "#img2img_edit_style_prompt textarea",
    "#img2img_edit_style_neg_prompt textarea"
];

const tipoSelector = 'textarea[data-lobe-tipo-prompt], textarea[placeholder^="Tag Prompt for TIPO"], textarea[placeholder^="Natural Language Prompt for TIPO"]';
const xyzSelector = '.xyz_entries [id*="xyz_plot_"][id$="_values"] textarea';
const additionalPromptSelector = tipoSelector + ', ' + xyzSelector;

function xyzAxis(area) {
    const block = area.closest('[id*="xyz_plot_"][id$="_values"]');
    const grid = block?.closest('.xyz_entries');
    if (!grid) return null;
    const dropdown = grid.querySelector('#' + CSS.escape(block.id.replace(/_values$/, "_type")));
    const type = dropdown?.querySelector('input:not([type=hidden]), select')?.value;
    return type?.trim() ?? "";
}

function allowsPromptSuggestions(area) {
    const axis = xyzAxis(area);
    return axis === null || /^(?:Prompt S\/R(?: \(LoRA\))?|Prompt order)$/i.test(axis);
}

function promptAreaKind(area) {
    if (area.matches(xyzSelector)) return "xyz";
    if (area.matches('textarea[data-lobe-tipo-prompt="prose"], textarea[placeholder^="Natural Language Prompt for TIPO"]')) return "prose";
    return "tags";
}

function additionalPromptQuery(area, prompt) {
    const before = prompt.slice(0, area.selectionStart ?? prompt.length);
    if (promptAreaKind(area) === "prose" && !/<[^>\s]*$/.test(before)) {
        return before.match(/[\p{L}\p{N}_*'-]+$/u)?.[0] || "";
    }
    const prefix = promptAreaKind(area) === "xyz" ? before.replaceAll('"', ' ') : before;
    const last = (prefix.match(getTagRegex()) || []).at(-1);
    return last && prefix.endsWith(last) ? last : "";
}

function attachAdditionalPrompt(event) {
    const area = event.composedPath()[0];
    if (area instanceof HTMLTextAreaElement && area.matches(additionalPromptSelector) && gradioApp().contains(area))
        addAutocompleteToArea(area);
}

// Third party text area selectors
const thirdParty = {
    "dataset-tag-editor": {
        "base": "#tab_dataset_tag_editor_interface",
        "hasIds": false,
        "selectors": [
            "Caption of Selected Image",
            "Interrogate Result",
            "Edit Caption",
            "Edit Tags"
        ]
    },
    "image browser": {
        "base": "#tab_image_browser",
        "hasIds": false,
        "selectors": [
            "Filename keyword search",
            "EXIF keyword search"
        ]
    },
    "tab_tagger": {
        "base": "#tab_tagger",
        "hasIds": false,
        "selectors": [
            "Additional tags (split by comma)",
            "Exclude tags (split by comma)"
        ]
    },
    "tiled-diffusion-t2i": {
        "base": "#txt2img_script_container",
        "hasIds": true,
        "onDemand": true,
        "selectors": [
            "[id^=MD-t2i][id$=prompt] textarea",
            "[id^=MD-t2i][id$=prompt] input[type='text']"
        ]
    },
    "tiled-diffusion-i2i": {
        "base": "#img2img_script_container",
        "hasIds": true,
        "onDemand": true,
        "selectors": [
            "[id^=MD-i2i][id$=prompt] textarea",
            "[id^=MD-i2i][id$=prompt] input[type='text']"
        ]
    },
    "adetailer-t2i": {
        "base": "#txt2img_script_container",
        "hasIds": true,
        "onDemand": true,
        "selectors": [
            "[id^=script_txt2img_adetailer_ad_prompt] textarea",
            "[id^=script_txt2img_adetailer_ad_negative_prompt] textarea"
        ]
    },
    "adetailer-i2i": {
        "base": "#img2img_script_container",
        "hasIds": true,
        "onDemand": true,
        "selectors": [
            "[id^=script_img2img_adetailer_ad_prompt] textarea",
            "[id^=script_img2img_adetailer_ad_negative_prompt] textarea"
        ]
    },
    "deepdanbooru-object-recognition": {
        "base": "#tab_deepdanboru_object_recg_tab",
        "hasIds": false,
        "selectors": [
            "Found tags",
        ]
    }
}

function getTextAreas() {
    // First get all core text areas
    let textAreas = [...gradioApp().querySelectorAll(core.join(", "))];
    textAreas.push(...gradioApp().querySelectorAll('textarea[data-lobe-prompt-tab]'));
    textAreas.push(...gradioApp().querySelectorAll(additionalPromptSelector));

    for (const [key, entry] of Object.entries(thirdParty)) {
        if (entry.hasIds) { // If the entry has proper ids, we can just select them
            textAreas = textAreas.concat([...gradioApp().querySelectorAll(entry.selectors.join(", "))]);
        } else { // Otherwise, we have to find the text areas by their adjacent labels
            let base = gradioApp().querySelector(entry.base);

            // Safety check
            if (!base) continue;

            let allTextAreas = [...base.querySelectorAll("textarea, input[type='text']")];

            // Filter the text areas where the adjacent label matches one of the selectors
            let matchingTextAreas = allTextAreas.filter(ta => [...ta.parentElement.childNodes].some(x => entry.selectors.includes(x.innerText)));
            textAreas = textAreas.concat(matchingTextAreas);
        }
    };

    return textAreas;
}

function addOnDemandObservers(setupFunction) {
    for (const [key, entry] of Object.entries(thirdParty)) {
        if (!entry.onDemand) continue;

        let base = gradioApp().querySelector(entry.base);
        if (!base) continue;

        let accordions = [...base?.querySelectorAll(".gradio-accordion")];
        if (!accordions) continue;

        accordions.forEach(acc => {
            let accObserver = new MutationObserver((mutationList, observer) => {
                for (const mutation of mutationList) {
                    if (mutation.type === "childList") {
                        let newChildren = mutation.addedNodes;
                        if (!newChildren) {
                            accObserver.disconnect();
                            continue;
                        }

                        newChildren.forEach(child => {
                            if (child.classList.contains("gradio-accordion") || child.querySelector(".gradio-accordion")) {
                                let newAccordions = [...child.querySelectorAll(".gradio-accordion")];
                                newAccordions.forEach(nAcc => accObserver.observe(nAcc, { childList: true }));
                            }
                        });

                        if (entry.hasIds) { // If the entry has proper ids, we can just select them
                            [...gradioApp().querySelectorAll(entry.selectors.join(", "))].forEach(x => setupFunction(x));
                        } else { // Otherwise, we have to find the text areas by their adjacent labels
                            let base = gradioApp().querySelector(entry.base);

                            // Safety check
                            if (!base) continue;

                            let allTextAreas = [...base.querySelectorAll("textarea, input[type='text']")];

                            // Filter the text areas where the adjacent label matches one of the selectors
                            let matchingTextAreas = allTextAreas.filter(ta => [...ta.parentElement.childNodes].some(x => entry.selectors.includes(x.innerText)));
                            matchingTextAreas.forEach(x => setupFunction(x));
                        }
                    }
                }
            });
            accObserver.observe(acc, { childList: true });
        });
    };
}

const thirdPartyIds = new WeakMap();
const textAreaIdCache = new WeakMap();
let nextThirdPartyId = 0;
// Get the identifier for the text area to differentiate between positive and negative
function getTextAreaIdentifier(textArea) {
    if (!textArea) return "";
    const cached = textAreaIdCache.get(textArea);
    if (cached) return cached;
    // Use descendant selectors to match Gradio 4.39+ DOM structure.
    let txt2img_p = gradioApp().querySelector('#txt2img_prompt textarea');
    let txt2img_n = gradioApp().querySelector('#txt2img_neg_prompt textarea');
    let img2img_p = gradioApp().querySelector('#img2img_prompt textarea');
    let img2img_n = gradioApp().querySelector('#img2img_neg_prompt textarea');

    let modifier = "";
    switch (textArea) {
        case txt2img_p:
            modifier = ".txt2img.p";
            break;
        case txt2img_n:
            modifier = ".txt2img.n";
            break;
        case img2img_p:
            modifier = ".img2img.p";
            break;
        case img2img_n:
            modifier = ".img2img.n";
            break;
        default:
            // If the text area is not a core text area, it must be a third party text area
            // Add it to the set of third party text areas and get its index as a unique identifier
            if (!thirdPartyIds.has(textArea))
                thirdPartyIds.set(textArea, nextThirdPartyId++);
            const tab = textArea.dataset.lobePromptTab ||
                (textArea.matches(additionalPromptSelector) ? textArea.closest('#tab_txt2img, #tab_img2img')?.id.slice(4) : null);
            const sectionTab = (tab === "txt2img" || tab === "img2img" ? "." + tab : "") +
                (textArea.dataset.lobePromptTab ? "" : ".thirdParty");
            modifier = `${sectionTab}.ta${thirdPartyIds.get(textArea)}`;
            break;
    }
    textAreaIdCache.set(textArea, modifier);
    return modifier;
}

// _utils.js
// Utility functions for tag autocomplete

// Parse the CSV file into a 2D array via slice boundaries instead of per-char concatenation.
// We are ignoring newlines in quote fields since we expect one-line entries and parsing would break for unclosed quotes otherwise
function* parseCSVChunks(str) {
    const arr = [];
    let quote = false;
    let hasQuote = false;
    let segStart = 0;
    let rowArr = [];
    let nextYield = 262144;
    const n = str.length;

    const pushField = (end) => {
        let val = str.slice(segStart, end);
        if (hasQuote) {
            let out = "";
            let q = false;
            let partStart = 0;
            for (let i = 0; i < val.length; i++) {
                if (val[i] === '"') {
                    if (q && val[i + 1] === '"') {
                        out += val.slice(partStart, i + 1);
                        i++;
                        partStart = i + 1;
                    } else {
                        out += val.slice(partStart, i);
                        q = !q;
                        partStart = i + 1;
                    }
                }
            }
            val = partStart === 0 ? val : out + val.slice(partStart);
            hasQuote = false;
        }
        rowArr.push(val);
    };

    for (let c = 0; c < n; c++) {
        if (c >= nextYield) {
            yield;
            nextYield += 262144;
        }
        const cc = str.charCodeAt(c);
        if (cc === 34) {
            hasQuote = true;
            if (quote && str.charCodeAt(c + 1) === 34) { c++; }
            else { quote = !quote; }
            continue;
        }
        if (cc === 44 && !quote) {
            pushField(c);
            segStart = c + 1;
            continue;
        }
        if (cc === 13 || cc === 10) {
            pushField(c);
            arr.push(rowArr);
            rowArr = [];
            quote = false;
            if (cc === 13 && str.charCodeAt(c + 1) === 10) c++;
            segStart = c + 1;
        }
    }
    if (segStart < n || rowArr.length > 0 || hasQuote) {
        pushField(n);
        arr.push(rowArr);
    }
    return arr;
}

// Load file
async function readFile(filePath, json = false, cache = false) {
    if (!cache)
        filePath += `${filePath.includes("?") ? "&" : "?"}${Date.now()}`;

    let response = await fetch(filePath.startsWith("/lobe/autocomplete/") ? filePath : `file=${filePath}`);

    if (response.status != 200) {
        console.error(`Error loading file "${filePath}": ` + response.status, response.statusText);
        return null;
    }

    if (json)
        return await response.json();
    else
        return await response.text();
}

// Load CSV
async function loadCSV(path) {
    let text = await readFile(path);
    if (text === null) throw new Error("Could not load CSV: " + path);
    const parser = parseCSVChunks(text);
    let step = parser.next();
    while (!step.done) {
        await new Promise(resolve => setTimeout(resolve, 0));
        step = parser.next();
    }
    return step.value;
}

const loraInfoCache = new Map();
async function fetchLoraInfoCached(loraName) {
    const now = Date.now();
    const hit = loraInfoCache.get(loraName);
    if (hit && now - hit.at < 5000) return hit.value;
    const promise = fetchTacAPI(`/lobe/autocomplete/lora-info/${loraName}`);
    loraInfoCache.set(loraName, { at: now, value: promise });
    return promise;
}

// Fetch API
async function fetchTacAPI(url, json = true, cache = false) {
    if (!cache) {
        const appendChar = url.includes("?") ? "&" : "?";
        url += `${appendChar}${new Date().getTime()}`
    }

    let response = await fetch(url);

    if (response.status != 200) {
        console.error(`Error fetching API endpoint "${url}": ` + response.status, response.statusText);
        return null;
    }

    if (json)
        return await response.json();
    else
        return await response.text();
}

async function postTacAPI(url, body = null, signal) {
    let response = await fetch(url, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: body,
        signal
    });

    if (response.status != 200) {
        console.error(`Error posting to API endpoint "${url}": ` + response.status, response.statusText);
        return null;
    }

    return await response.json();
}

async function putTacAPI(url, body = null) {
    let response = await fetch(url, { method: "PUT", body: body });
    
    if (response.status != 200) {
        console.error(`Error putting to API endpoint "${url}": ` + response.status, response.statusText);
        return null;
    }

    return await response.json();
}

// Extra network preview thumbnails
async function getTacExtraNetworkPreviewURL(filename, type) {
    const previewJSON = await fetchTacAPI(`/lobe/autocomplete/thumb-preview/${filename}?type=${type}`, true, true);
    if (previewJSON?.url) {
        const properURL = `sd_extra_networks/thumb?filename=${previewJSON.url}`;
        if ((await fetch(properURL)).status == 200) {
            return properURL;
        } else {
            // create blob url
            const blob = await (await fetch(`/lobe/autocomplete/thumb-preview-blob/${filename}?type=${type}`)).blob();
            return URL.createObjectURL(blob);
        }
    } else {
        return null;
    }
}

lastStyleRefresh = 0;
// Refresh style file if needed
async function refreshStyleNamesIfChanged() {
    // Only refresh once per second
    currentTimestamp = new Date().getTime();
    if (currentTimestamp - lastStyleRefresh < 1000) return;
    lastStyleRefresh = currentTimestamp;

    const response = await fetch(`/lobe/autocomplete/refresh-styles-if-changed?${new Date().getTime()}`)
    if (response.status === 304) {
        // Not modified
    } else if (response.status === 200) {
        // Reload
        QUEUE_FILE_LOAD.forEach(async fn => {
            if (fn.toString().includes("styleNames"))
                await fn.call(null, true);
        })
    } else {
        // Error
        console.error(`Error refreshing styles.txt: ` + response.status, response.statusText);
    }
}

// Debounce function to prevent spamming the autocomplete function
const debounce = (func, wait = 300) => {
    let timeout;
    return function (...args) {
        if (timeout) clearTimeout(timeout);
        return new Promise((resolve) => {
            timeout = setTimeout(() => resolve(func.apply(this, args)), wait);
        });
    };
}

// Difference function to fix duplicates not being seen as changes in normal filter
function difference(a, b) {
    if (a.length == 0) {
        return b;
    }
    if (b.length == 0) {
        return a;
    }

    const counts = b.reduce((acc, v) => acc.set(v, (acc.get(v) || 0) - 1),
        a.reduce((acc, v) => acc.set(v, (acc.get(v) || 0) + 1), new Map())
    );
    const changed = [];
    for (const [value, count] of counts) {
        for (let i = 0; i < Math.abs(count); i++) changed.push(value);
    }
    return changed;
}

// Object flatten function adapted from https://stackoverflow.com/a/61602592
// $roots keeps previous parent properties as they will be added as a prefix for each prop.
// $sep is just a preference if you want to seperate nested paths other than dot.
function flatten(obj, roots = [], sep = ".") {
  return Object.keys(obj).reduce(
    (memo, prop) =>
      Object.assign(
        // create a new object
        {},
        // include previously returned object
        memo,
        Object.prototype.toString.call(obj[prop]) === "[object Object]"
          ? // keep working if value is an object
            flatten(obj[prop], roots.concat([prop]), sep)
          : // include current prop and value and prefix prop with the roots
            { [roots.concat([prop]).join(sep)]: obj[prop] }
      ),
    {}
  );
}

// Calculate biased tag score based on post count and frequent usage
function calculateUsageBias(result, count, uses) {
    // Check setting conditions
    if (uses < TAC_CFG.frequencyMinCount) {
        uses = 0;
    } else if (uses != 0) {
        result.usageBias = true;
    }

    switch (TAC_CFG.frequencyFunction) {
        case "Logarithmic (weak)":
            return Math.log(1 + count) + Math.log(1 + uses);
        case "Logarithmic (strong)":
            return Math.log(1 + count) + 2 * Math.log(1 + uses);
        case "Usage first":
        case "Recent, then frequent":
            return uses;
        default:
            return count;
    }
}
// Sort results by recorded usage; counts are {name, type, count, lastUseDate} from getUseCounts.
// "Recent, then frequent" first lists the last few distinct results used in this kind of prompt,
// most recent first and whatever their count, then the rest by usage.
// Array.prototype.sort is stable, so ties keep the incoming (base) order.
function sortByUsage(results, counts) {
    const usageKey = r => `${r.type}|${r.type === ResultType.chant ? r.aliases : r.text}`;
    const stats = new Map(counts.map(c => [`${c.type}|${c.name}`, c]));

    // Pre-calculate weights to prevent duplicate work
    const weights = new Map();
    results.forEach(result => {
        const useStats = stats.get(usageKey(result));
        weights.set(result, calculateUsageBias(result, result.count, useStats?.count || 0));
    });

    // Rank the most recently used of these results; lastUseDate is SQLite's
    // "YYYY-MM-DD HH:MM:SS", so it sorts as text
    const recentRank = new Map();
    const recentCount = TAC_CFG.frequencyRecentCount ?? 0;
    if (TAC_CFG.frequencyFunction === "Recent, then frequent" && recentCount > 0) {
        [...new Set(results.map(usageKey))]
            .map(key => stats.get(key))
            .filter(c => c && c.count > 0 && c.lastUseDate)
            .sort((a, b) => String(b.lastUseDate).localeCompare(String(a.lastUseDate)))
            .slice(0, recentCount)
            .forEach((c, i) => recentRank.set(`${c.type}|${c.name}`, i));
    }
    if (recentRank.size === 0) return results.sort((a, b) => weights.get(b) - weights.get(a));

    // Look the ranks up once instead of rebuilding the usage key in every comparison
    const ranks = new Map();
    results.forEach(r => {
        const i = recentRank.get(usageKey(r));
        if (i === undefined) return;
        ranks.set(r, i);
        r.usageBias = true;
    });
    const rank = r => ranks.get(r) ?? Number.MAX_SAFE_INTEGER;

    return results.sort((a, b) => (rank(a) - rank(b)) || (weights.get(b) - weights.get(a)));
}

// Beautify return type for easier parsing
function mapUseCountArray(useCounts, posAndNeg = false) {
    return useCounts.map(useCount => {
        if (posAndNeg) {
            return {
                "name": useCount[0],
                "type": useCount[1],
                "count": useCount[2],
                "negCount": useCount[3],
                "lastUseDate": useCount[4]
            }
        }
        return {
            "name": useCount[0],
            "type": useCount[1],
            "count": useCount[2],
            "lastUseDate": useCount[3]
        }
    });
}
// Call API endpoint to increase bias of tag in the database
function increaseUseCount(tagName, type, negative = false) {
    postTacAPI(`/lobe/autocomplete/increase-use-count?tagname=${tagName}&ttype=${type}&neg=${negative}`);
}
// Get use count of tag from the database
async function getUseCount(tagName, type, negative = false) {
    const response = await fetchTacAPI(`/lobe/autocomplete/get-use-count?tagname=${tagName}&ttype=${type}&neg=${negative}`, true, false);
    // Guard for no db
    if (response == null) return null;
    // Result
    return response["result"];
}
async function getUseCounts(tagNames, types, negative = false, signal) {
    // While semantically weird, we have to use POST here for the body, as urls are limited in length
    const body = JSON.stringify({"tagNames": tagNames, "tagTypes": types, "neg": negative});
    const response = await postTacAPI(`/lobe/autocomplete/get-use-count-list`, body, signal)
    // Guard for no db
    if (!Array.isArray(response?.result)) return null;
    // Results
    return mapUseCountArray(response["result"]);
}
async function getAllUseCounts() {
    const response = await fetchTacAPI(`/lobe/autocomplete/get-all-use-counts`);
    // Guard for no db
    if (response == null) return null;
    // Results
    return mapUseCountArray(response["result"], true);
}
async function resetUseCount(tagName, type, resetPosCount, resetNegCount) {
    await putTacAPI(`/lobe/autocomplete/reset-use-count?tagname=${tagName}&ttype=${type}&pos=${resetPosCount}&neg=${resetNegCount}`);
}

function createTagUsageTable(tagCounts) {
    // Create table
    let tagTable = document.createElement("table");
    tagTable.innerHTML =
    `<thead>
        <tr>
            <td>Name</td>
            <td>Type</td>
            <td>Count(+)</td>
            <td>Count(-)</td>
            <td>Last used</td>
        </tr>
    </thead>`;
    tagTable.id = "tac_tagUsageTable"

    tagCounts.forEach(t => {
        let tr = document.createElement("tr");
        
        // Fill values
        let values = [t.name, t.type-1, t.count, t.negCount, t.lastUseDate]
        values.forEach(v => {
            let td = document.createElement("td");
            td.innerText = v;
            tr.append(td);
        });
        // Add delete/reset button
        let delButton = document.createElement("button");
        delButton.innerText = "🗑️";
        delButton.title = "Reset count";
        tr.append(delButton);
        
        tagTable.append(tr)
    });

    return tagTable;
}

// Sliding window function to get possible combination groups of an array
function toNgrams(inputArray, size) {
    return Array.from(
        { length: inputArray.length - (size - 1) }, //get the appropriate length
        (_, index) => inputArray.slice(index, index + size) //create the windows
    );
}

function escapeRegExp(string, wildcardMatching = false) {
    if (wildcardMatching) {
        // Escape all characters except asterisks and ?, which should be treated separately as placeholders.
        return string.replace(/[-[\]{}()+.,\\^$|#\s]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
    }
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function escapeHTML(unsafeText) {
    return unsafeText
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// For black/whitelisting
function updateModelName() {
    let sdm = gradioApp().querySelector("#setting_sd_model_checkpoint");
    let modelDropdown =  sdm?.querySelector("input") || sdm?.querySelector("select");
    if (modelDropdown) {
        currentModelName = modelDropdown.value;
    } else {
        // Fallback for intermediate versions
        modelDropdown = sdm?.querySelector("span.single-select");
        currentModelName = modelDropdown?.textContent || "";
    }
}

// Forge Neo's UI preset in lowercase, or null if the page has no preset dropdown.
function currentUiPreset() {
    return gradioApp().querySelector("#forge_ui_preset input")?.value?.trim().toLowerCase() || null;
}

// Whether artist tags should get ANIMA's '@' prefix. The UI preset decides when it exists:
// Forge Neo only sends #sd_checkpoint_hash to the browser on page load or a settings change,
// so after switching checkpoints the hash can still belong to the previous model.
function checkpointIsAnima() {
    const preset = currentUiPreset();
    return preset ? preset === "anima" : currentModelIsAnima;
}

// Fallback for pages without a UI preset: look up the checkpoint's CivitAI base model by hash.
async function updateAnimaCheckpointStatus() {
    if (!TAC_CFG || TAC_CFG.animaArtistPrefix === "Off" || !currentModelHash || currentUiPreset()) {
        currentModelIsAnima = false;
        return;
    }
    let data = await fetchTacAPI(`/lobe/autocomplete/civitai-checkpoint-basemodel/${currentModelHash}`, true, true);
    currentModelIsAnima = !!(data && data.baseModel && data.baseModel.toLowerCase().includes("anima"));
}

// From https://stackoverflow.com/a/61975440, how to detect JS value changes
function observeElement(element, property, callback, delay = 0) {
    let elementPrototype = Object.getPrototypeOf(element);
    if (elementPrototype.hasOwnProperty(property)) {
        let descriptor = Object.getOwnPropertyDescriptor(elementPrototype, property);
        Object.defineProperty(element, property, {
            get: function() {
                return descriptor.get.apply(this, arguments);
            },
            set: function () {
                let oldValue = this[property];
                descriptor.set.apply(this, arguments);
                let newValue = this[property];
                if (typeof callback == "function") {
                    setTimeout(callback.bind(this, oldValue, newValue), delay);
                }
                return newValue;
            }
        });
    }
}

// Sort functions
function getSortFunction() {
    let criterion = TAC_CFG.modelSortOrder || "Name";

    const textSort = (a, b, reverse = false) => {
        // Assign keys so next sort is faster
        if (!a.sortKey) {
            a.sortKey = a.type === ResultType.chant
                ? a.aliases
                : a.text;
        }
        if (!b.sortKey) {
            b.sortKey = b.type === ResultType.chant
                ? b.aliases
                : b.text;
        }

        return reverse ? b.sortKey.localeCompare(a.sortKey) : a.sortKey.localeCompare(b.sortKey);
    }
    const numericSort = (a, b, reverse = false) => {
        const noKey = reverse ? "-1" : Number.MAX_SAFE_INTEGER;
        let aParsed = parseFloat(a.sortKey || noKey);
        let bParsed = parseFloat(b.sortKey || noKey);

        if (aParsed === bParsed) {
            return textSort(a, b, false);
        }
        
        return reverse ? bParsed - aParsed : aParsed - bParsed;
    }

    return (a, b) => {
        switch (criterion) {
            case "Date Modified (newest first)":
                return numericSort(a, b, true);
            case "Date Modified (oldest first)":
                return numericSort(a, b, false);
            default:
                return textSort(a, b);
        }
    }
}

// Queue calling function to process global queues
async function processQueue(queue, context, ...args) {
    for (let i = 0; i < queue.length; i++) {
        await queue[i].call(context, ...args);
    }
}

// Parallel version for independent loads (e.g. QUEUE_FILE_LOAD)
async function processQueueParallel(queue, context, ...args) {
    await Promise.all(queue.map(fn =>
        fn.call(context, ...args).catch(err => {
            console.error('[TAC] Queue function error:', err);
            // Swallow so one failure doesn't break the others
        })
    ));
}
// The same but with return values
async function processQueueReturn(queue, context, ...args)
{
    let qeueueReturns = [];
    for (let i = 0; i < queue.length; i++) {
        let returnValue = await queue[i].call(context, ...args);
        if (returnValue)
            qeueueReturns.push(returnValue);
    }
    return qeueueReturns;
}
// Specific to tag completion parsers
async function processParsers(textArea, prompt) {
    // Get all parsers that have a successful trigger condition
    let matchingParsers = PARSERS.filter(parser => parser.triggerCondition());
    // Guard condition
    if (matchingParsers.length === 0) {
        return null;
    }

    const matches = [];
    for (const parser of matchingParsers) {
        try {
            const result = await parser.parse(textArea, prompt);
            if (result) matches.push(result);
        } catch (error) {
            console.warn("[Lobe Autocomplete] Suggestion source failed", error);
        }
    }
    return matches;
}

// tagAutocomplete.js
﻿const styleColors = {
    "--results-neutral-text": ["#e0e0e0","black"],
    "--results-bg": ["#0b0f19", "#ffffff"],
    "--results-border-color": ["#4b5563", "#e5e7eb"],
    "--results-border-width": ["1px", "1.5px"],
    "--results-bg-odd": ["#111827", "#f9fafb"],
    "--results-hover": ["#1f2937", "#f5f6f8"],
    "--results-selected": ["#374151", "#e5e7eb"],
    "--meta-text-color": ["#6b6f7b", "#a2a9b4"],
    "--embedding-v1-color": ["lightsteelblue", "#2b5797"],
    "--embedding-v2-color": ["skyblue", "#2d89ef"],
    "--lora-color": ["#597ef7", "#2040c8"],
    "--live-translation-rt": ["whitesmoke", "#222"],
    "--live-translation-color-1": ["lightskyblue", "#2d89ef"],
    "--live-translation-color-2": ["palegoldenrod", "#eb5700"],
    "--live-translation-color-3": ["darkseagreen", "darkgreen"],
}
const browserVars = {
    "--results-overflow-y": {
        "firefox": "scroll",
        "other": "auto"
    }
}
// Style for new elements. Gets appended to the Gradio root.
const autocompleteCSS = `
    #quicksettings [id^=setting_tac] {
        background-color: transparent;
        min-width: fit-content;
    }
    .autocompleteParent {
        display: flex;
        position: absolute;
        z-index: 999;
        max-width: calc(100% - 1.5rem);
        flex-wrap: wrap;
        gap: 10px;
    }
    .autocompleteResults {
        background-color: var(--results-bg) !important;
        border: var(--results-border-width) solid var(--results-border-color) !important;
        color: var(--results-neutral-text) !important;
        border-radius: 12px !important;
        height: fit-content;
        flex-basis: fit-content;
        flex-shrink: 0;
        overflow-y: var(--results-overflow-y);
        overflow-x: hidden;
        word-break: break-word;
        margin-top: 10px; /* Margin to create space below the cursor */
    }
    .sideInfo {
        display: none;
        position: relative;
        height: 18rem;
        max-width: 16rem;
    }
    .sideInfo > img {
        object-fit: cover;
        height: 100%;
        width: 100%;
    }
    .autocompleteResultsList > li:nth-child(odd) {
        background-color: var(--results-bg-odd);
    }
    .autocompleteResultsList > li {
        list-style-type: none;
        padding: 10px;
        cursor: pointer;
    }
    .autocompleteResultsList > li:hover {
        background-color: var(--results-hover);
    }
    .autocompleteResultsList > li.selected {
        background-color: var(--results-selected);
    }
    .resultsFlexContainer {
        display: flex;
    }
    .acListItem {
        white-space: break-spaces;
        min-width: 100px;
    }
    .acMetaText {
        position: relative;
        flex-grow: 1;
        text-align: end;
        padding: 0 0 0 15px;
        white-space: nowrap;
        color: var(--meta-text-color);
    }
    .acMetaText.biased::before {
        content: "✨";
        margin-right: 2px;
    }
    .acMetaText span.used::after {
        content: "🔁";
        margin-right: 2px;
    }
    .autocompleteResultsList > li.acUsedTag .acListItem {
        opacity: 0.5;
    }
    .acWikiLink {
        padding: 0.5rem;
        margin: -0.5rem 0 -0.5rem -0.5rem;
    }
    .acWikiLink:hover {
        text-decoration: underline;
    }
    .acListItem.acEmbeddingV1 {
        color: var(--embedding-v1-color);
    }
    .acListItem.acEmbeddingV2 {
        color: var(--embedding-v2-color);
    }
    .acListItem.acLora {
        color: var(--lora-color);
    }
    .acRuby {
        padding: var(--input-padding);
        color: #888;
        font-size: 0.8rem;
        user-select: none;
    }
    .acRuby > ruby {
        display: inline-flex;
        flex-direction: column-reverse;
        margin-top: 0.5rem;
        vertical-align: bottom;
        cursor: pointer;
    }
    .acRuby > ruby::hover {
        text-decoration: underline;
        text-shadow: 0 0 10px var(--live-translation-color-1);
    }
    .acRuby > :nth-child(3n+1) {
        color: var(--live-translation-color-1);
    }
    .acRuby > :nth-child(3n+2) {
        color: var(--live-translation-color-2);
    }
    .acRuby > :nth-child(3n+3) {
        color: var(--live-translation-color-3);
    }
    .acRuby > ruby > rt {
        line-height: 1rem;
        padding: 0px 5px 0px 0px;
        text-align: left;
        font-size: 1rem;
        color: var(--live-translation-rt);
    }
    .acListItem .acPathPart:nth-child(3n+1) {
        color: var(--live-translation-color-1);
    }
    .acListItem .acPathPart:nth-child(3n+2) {
        color: var(--live-translation-color-2);
    }
    .acListItem .acPathPart:nth-child(3n+3) {
        color: var(--live-translation-color-3);
    }
`;

let tagIndex = new Map();
let tagsLoaded = false;
let tagLoad;
let activeSearch;
let dictionaryWorker;
let localTagLoad;
const displayedValues = new WeakMap();
const areaTags = new WeakMap();
let lobeAutocomplete;
const lobeAutocompleteOptions = () => lobeAutocomplete?.options();

window.lobeTagComplete = {
    addArea: addAutocompleteToArea,
    setPresentation(presentation) {
        if (lobeAutocomplete === presentation) return;
        closeLobeAutocomplete();
        lobeAutocomplete = presentation;
    },
    refresh() {
        closeLobeAutocomplete();
        const selected = lobeAutocompleteOptions()?.dictionary || (typeof opts === "undefined" ? "" : opts.tac_tagFile);
        if (TAC_CFG && selected !== TAC_CFG.tagFile) void syncOptions().catch(console.error);
    },
    async lookupTagColors(names, dark = true) {
        if (!Array.isArray(names) || names.length === 0) return {};
        if (!TAC_CFG) {
            try { await initializeAutocomplete(); } catch {}
        }
        if (!TAC_CFG) return null;
        if (!tagsLoaded) {
            try {
                tagLoad ??= loadTags(TAC_CFG).then(() => {
                    tagsLoaded = true;
                }).finally(() => {
                    tagLoad = undefined;
                });
                await tagLoad;
            } catch {
                return null;
            }
        }
        if (!tagsLoaded) return null;
        let cats = {};
        if (dictionaryWorker) {
            try {
                cats = await dictionaryWorker.request("lookup", names);
            } catch {
                cats = {};
            }
        } else {
            for (let i = 0; i < names.length; i++) {
                const key = names[i];
                const cat = localCategoryMap.get(key);
                if (cat !== undefined) cats[key] = cat;
            }
        }
        const tagFileName = ((TAC_CFG && TAC_CFG.tagFile) || "").split(".")[0];
        const tagColors = (TAC_CFG && TAC_CFG.colorMap) || {};
        const colorGroup = tagColors[tagFileName] || tagColors["danbooru"] || {};
        const mode = dark ? 0 : 1;
        const result = {};
        for (const [key, cat] of Object.entries(cats)) {
            const entry = colorGroup[cat] || colorGroup["-1"];
            if (entry && entry[mode]) result[key] = entry[mode];
        }
        return result;
    },
};
document.documentElement.dataset.lobeAutocompleteProvider = "lobe";

function closeLobeAutocomplete() {
    if (typeof gradioApp !== "function" || !gradioApp()) return;
    gradioApp().querySelectorAll('.autocompleteParent').forEach(popup => {
        const area = popup.previousElementSibling;
        if (area?.matches('textarea, input')) lobeAutocomplete?.hide(area, popup);
        popup.style.display = "none";
        popup.removeAttribute("data-lobe-autocomplete");
        popup.style.removeProperty("top");
        popup.style.removeProperty("left");
    });
    activeSearch?.controller.abort();
    selectedTag = null;
}

function isAreaEnabled(textAreaId) {
    const options = lobeAutocompleteOptions();
    const negative = options?.mode === "lobe" && options.negative !== "inherit"
        ? options.negative === "on"
        : TAC_CFG.activeIn.negativePrompts;
    return !(textAreaId.includes(".txt2img") && !TAC_CFG.activeIn.txt2img
        || textAreaId.includes(".img2img") && !TAC_CFG.activeIn.img2img
        || textAreaId.endsWith(".n") && !negative
        || textAreaId.includes(".thirdParty") && !TAC_CFG.activeIn.thirdParty);
}

function autocompleteActive() {
    return lobeAutocompleteOptions()?.mode !== "off" && isEnabled();
}

async function buildTagIndex(tags) {
    const index = new Map();
    const CHUNK_SIZE = 5000;
    const total = tags.length;

    for (let i = 0; i < total; i += CHUNK_SIZE) {
        const end = Math.min(i + CHUNK_SIZE, total);
        for (let j = i; j < end; j++) {
            const tag = tags[j];
            const name = tag[0].trim();
            const lower = name.toLowerCase();
            tag._lower = lower;
            tag._aliasLower = tag[3] ? tag[3].toLowerCase() : null;

            // Index the same word boundaries used by the matcher, including aliases.
            const words = [lower, tag._aliasLower].filter(Boolean).flatMap(value => value.split(/[^a-z]+/));
            const keys = new Set();
            words.forEach(word => {
                for (let length = 1; length <= Math.min(word.length, 3); length++)
                    keys.add(word.slice(0, length));
            });
            // Also index by the full tag prefix for single-word tags
            if (lower.length >= 3) {
                keys.add(lower.substring(0, 3));
            }
            keys.forEach(key => {
                if (!index.has(key)) {
                    index.set(key, []);
                }
                index.get(key).push(tag);
            });
        }
        // Yield to the browser so input events don't starve
        if (end < total) {
            await new Promise(r => setTimeout(r, 0));
        }
    }
    return index;
}

function filterTagRows(rows, regex, options, translations) {
    const withTranslations = options.translation && translations.size > 0;
    const matchesTranslation = name => regex.test(translations.get(name) || "");
    return rows.filter(row => {
        if (regex.test(row._lower || row[0])) return true;
        if (!options.alias && !withTranslations) return false;
        const aliases = row._aliasLower || row[3]?.toLowerCase();
        if (options.alias && aliases && regex.test(aliases)) return true;
        return withTranslations && (matchesTranslation(row[0]) || aliases?.split(",").some(matchesTranslation));
    });
}

function findTagRows(tags, index, translations, query, phrases, options) {
    const indexed = options.indexed && index.size > 0;
    const phrase = phrases.find(word => {
        const regex = new RegExp("(^|[^a-zA-Z])" + escapeRegExp(word), "i");
        const matches = row => regex.test(row._lower || row[0]);
        return indexed
            ? word.split("_").some(part => index.get(part.slice(0, 3))?.some(matches))
            : tags.some(matches);
    });
    query = phrase || query;
    const anywhere = query.startsWith("*");
    if (anywhere) query = query.slice(1);
    const regex = new RegExp((anywhere ? "" : "(^|[^a-zA-Z])") + escapeRegExp(query), "i");
    const prefix = query.match(/^[a-z]{1,3}/)?.[0];
    const useIndex = indexed && !anywhere && prefix && (!options.translation || !translations.size);
    const subset = useIndex ? index.get(prefix) || [] : tags;
    let matches = filterTagRows(subset, regex, options, translations);
    if (options.limit !== null && matches.length > options.limit) {
        if (!options.frequency) {
            matches = matches.slice(0, options.limit);
        } else if (matches.length > 2000 + options.limit) {
            // Usage history only considers the first 2000 matches. Also retain any
            // later matches that could make the visible list on base count alone.
            const tail = matches.slice(2000);
            let best = tail.slice(0, options.limit);
            if (!options.usageOnly) {
                const cutoff = best.reduce((min, row) => Math.min(min, Number(row[2])), Infinity);
                if (tail.some((row, i) => i >= options.limit && Number(row[2]) > cutoff)) {
                    best = tail.slice().sort((a, b) => Number(b[2]) - Number(a[2])).slice(0, options.limit);
                }
            }
            const keep = new Set(best);
            matches = matches.slice(0, 2000).concat(tail.filter(row => keep.has(row)));
        }
    }
    return { query, anywhere, matches };
}

function windowDispatchTagLoaded() {
    try {
        window.dispatchEvent(new CustomEvent("lobe:tagcomplete-loaded"));
    } catch {}
}

function buildCategoryMap(rows) {
    const map = new Map();
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const raw = row && row[0];
        const cat = row && row[1];
        if (!raw || cat === undefined || cat === null || cat === "") continue;
        const val = String(cat);
        const lower = String(raw).toLowerCase();
        map.set(lower, val);
        if (lower.includes("_")) map.set(lower.replace(/_/g, " "), val);
    }
    return map;
}

function dictionaryWorkerMain() {
    let tags = [];
    let index = new Map();
    let categoryMap = new Map();
    let translations = new Map();
    let indexing = false;
    const recent = new Map();
    function indexInBackground() {
        if (indexing) return;
        indexing = true;
        void buildTagIndex(tags).then(value => {
            index = value;
            recent.clear();
        });
    }
    self.onmessage = async ({ data }) => {
        const { id, kind, payload } = data;
        try {
            if (kind === "translations") {
                translations = payload;
                recent.clear();
                return;
            }
            if (kind === "lookup") {
                const out = {};
                if (Array.isArray(payload)) {
                    for (let i = 0; i < payload.length; i++) {
                        const key = payload[i];
                        const cat = categoryMap.get(key);
                        if (cat !== undefined) out[key] = cat;
                    }
                }
                self.postMessage({ id, result: out });
                return;
            }
            if (kind === "load") {
                if (payload.url) {
                    const response = await fetch(payload.url);
                    if (!response.ok) throw new Error("Dictionary request failed: " + response.status);
                    const parser = parseCSVChunks(await response.text());
                    let step = parser.next();
                    while (!step.done) step = parser.next();
                    tags = step.value;
                    categoryMap = buildCategoryMap(tags);
                } else {
                    categoryMap = new Map();
                }
                translations = payload.translations;
                self.postMessage({ id });
                if (payload.indexed) indexInBackground();
                return;
            }
            const { query, phrases, options } = payload;
            const key = options.limit === null ? null : JSON.stringify(payload);
            let result = key && recent.get(key);
            if (!result) {
                result = findTagRows(tags, index, translations, query, phrases, options);
                if (key) {
                    if (recent.size >= 12) recent.delete(recent.keys().next().value);
                    recent.set(key, result);
                }
            }
            self.postMessage({ id, result });
            if (options.indexed) indexInBackground();
        } catch (error) {
            self.postMessage({ id, error: String(error) });
        }
    };
}

function createDictionaryWorker() {
    const source = [parseCSVChunks, escapeRegExp, buildTagIndex, buildCategoryMap, filterTagRows, findTagRows]
        .map(fn => "const " + fn.name + " = " + fn.toString() + ";").join("\n")
        + "\n(" + dictionaryWorkerMain.toString() + ")();";
    const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
    let worker;
    try {
        worker = new Worker(url);
    } finally {
        URL.revokeObjectURL(url);
    }
    let nextId = 0;
    let closed = false;
    const pending = new Map();
    const close = () => {
        if (closed) return;
        closed = true;
        worker.terminate();
        for (const { reject } of pending.values()) reject(new Error("Dictionary worker stopped"));
        pending.clear();
    };
    worker.onerror = close;
    worker.onmessage = ({ data }) => {
        const request = pending.get(data.id);
        if (!request) return;
        pending.delete(data.id);
        if (data.error) request.reject(new Error(data.error));
        else request.resolve(data.result);
    };
    return {
        request(kind, payload) {
            return new Promise((resolve, reject) => {
                if (closed) {
                    reject(new Error("Dictionary worker stopped"));
                    return;
                }
                const id = ++nextId;
                worker.postMessage({ id, kind, payload });
                pending.set(id, { resolve, reject });
            });
        },
        translations(value) {
            if (!closed) worker.postMessage({ kind: "translations", payload: value });
        },
        close,
    };
}

let localCategoryMap = new Map();
function loadLocalTags(c) {
    localTagLoad ??= (async () => {
        const tags = c.tagFile && c.tagFile !== "None"
            ? await loadCSV(`${tagBasePath}/${c.tagFile}`)
            : [];
        allTags = tags;
        localCategoryMap = buildCategoryMap(tags);
        if (c.useIndexedSearch) void refreshLocalTagIndex(tags);
    })().catch(error => {
        localTagLoad = undefined;
        throw error;
    });
    return localTagLoad;
}

async function refreshLocalTagIndex(tags) {
    const index = await buildTagIndex(tags);
    if (allTags === tags) tagIndex = index;
}

async function resolveFallbackTagFile(failedFile) {
    try {
        const res = await fetch("/lobe/autocomplete/catalog");
        if (!res.ok) return null;
        const data = await res.json();
        const list = Array.isArray(data?.dictionaries) ? data.dictionaries : [];
        const candidates = list.filter(name => name && name !== failedFile && /\.csv$/i.test(name));
        return (
            candidates.find(name => /gelbooru|danbooru/i.test(name) && !/quality/i.test(name)) ||
            candidates[0] ||
            null
        );
    } catch {
        return null;
    }
}

async function loadTags(c) {
    const tryLoad = async (tagFile) => {
        if (typeof Worker === "function") {
            try {
                dictionaryWorker = createDictionaryWorker();
                const url = tagFile && tagFile !== "None"
                    ? new URL(`${tagBasePath}/${encodeURIComponent(tagFile)}`, location.href).href
                    : null;
                await dictionaryWorker.request("load", { url, indexed: c.useIndexedSearch, translations });
                windowDispatchTagLoaded();
                return true;
            } catch {
                dictionaryWorker?.close();
                dictionaryWorker = undefined;
            }
        }
        try {
            localTagLoad = undefined;
            await loadLocalTags({ ...c, tagFile });
            windowDispatchTagLoaded();
            return true;
        } catch {
            return false;
        }
    };

    if (await tryLoad(c.tagFile)) return;
    if (c.tagFile && c.tagFile !== "None") {
        const fallback = await resolveFallbackTagFile(c.tagFile);
        if (fallback) {
            c.tagFile = fallback;
            if (await tryLoad(fallback)) return;
        }
    }
    throw new Error(`Failed to load tag dictionary: ${c.tagFile}`);
}

async function searchDictionary(query, phrases, options, isCurrent) {
    if (dictionaryWorker) {
        const worker = dictionaryWorker;
        try {
            return await worker.request("search", { query, phrases, options });
        } catch {
            if (!isCurrent()) return;
            worker.close();
            if (dictionaryWorker === worker) dictionaryWorker = undefined;
        }
    }
    if (!isCurrent()) return;
    try {
        await loadLocalTags(TAC_CFG);
        if (isCurrent()) return findTagRows(allTags, tagIndex, translations, query, phrases, options);
    } catch (error) {
        if (isCurrent()) console.warn("[TAC] Could not search dictionary", error);
    }
}

async function loadExtraTags(c) {
    const files = Array.isArray(c.extra.extraFiles) && c.extra.extraFiles.length
        ? c.extra.extraFiles
        : (c.extra.extraFile && c.extra.extraFile !== "None" ? [c.extra.extraFile] : []);
    for (const file of files) {
        if (!file || file === "None") continue;
        try {
            const loaded = await loadCSV(`${tagBasePath}/${file}`);
            loaded.forEach(e => {
                if (e[4]) translations.set(e[0], e[4]);
            });
            extras = extras.concat(loaded);
        } catch (e) {
            console.error("Error loading extra file (" + file + "): " + e);
        }
    }
}

async function loadTranslations(c) {
    if (c.translation.translationFile && c.translation.translationFile !== "None") {
        try {
            let tArray = await loadCSV(`${tagBasePath}/${c.translation.translationFile}`);
            tArray.forEach(t => {
                if (c.translation.oldFormat && t[2]) // if 2 doesn't exist, it's probably a new format file and the setting is on by mistake
                    translations.set(t[0], t[2]);
                else if (t[1])
                    translations.set(t[0], t[1]);
                else
                    translations.set(t[0], "Not found");
            });
        } catch (e) {
            console.error("Error loading translations file: " + e);
            return;
        }
    }
}

async function syncOptions() {
    const lobeOpts = lobeAutocompleteOptions();
    const extraFiles = Array.isArray(lobeOpts?.extraFiles) && lobeOpts.extraFiles.length
        ? lobeOpts.extraFiles
        : (opts["tac_extra.extraFile"] && opts["tac_extra.extraFile"] !== "None" ? [opts["tac_extra.extraFile"]] : []);
    let newCFG = {
        // Main tag file
        tagFile: lobeOpts?.dictionary || opts["tac_tagFile"],
        // Active in settings
        activeIn: {
            global: opts["tac_active"],
            txt2img: opts["tac_activeIn.txt2img"],
            img2img: opts["tac_activeIn.img2img"],
            negativePrompts: opts["tac_activeIn.negativePrompts"],
            thirdParty: opts["tac_activeIn.thirdParty"],
            modelList: opts["tac_activeIn.modelList"],
            modelListMode: opts["tac_activeIn.modelListMode"]
        },
        // Results related settings
        slidingPopup: opts["tac_slidingPopup"],
        maxResults: lobeOpts?.limit ?? opts["tac_maxResults"],
        showAllResults: opts["tac_showAllResults"],
        resultStepLength: opts["tac_resultStepLength"],
        delayTime: lobeOpts?.delayTime ?? opts["tac_delayTime"],
        useIndexedSearch: opts["tac_useIndexedSearch"],
        useWildcards: lobeOpts?.useWildcards ?? opts["tac_useWildcards"],
        sortWildcardResults: opts["tac_sortWildcardResults"],
        useEmbeddings: opts["tac_useEmbeddings"],
        includeEmbeddingsInNormalResults: opts["tac_includeEmbeddingsInNormalResults"],
        useLoras: opts["tac_useLoras"],
        loraArchFilter: lobeOpts?.loraArchFilter || opts["tac_loraArchFilter"],
        useLycos: opts["tac_useLycos"],
        useLoraPrefixForLycos: opts["tac_useLoraPrefixForLycos"],
        showWikiLinks: opts["tac_showWikiLinks"],
        showExtraNetworkPreviews: opts["tac_showExtraNetworkPreviews"],
        modelSortOrder: opts["tac_modelSortOrder"],
        frequencySort: lobeOpts?.frequencySort ?? opts["tac_frequencySort"],
        frequencyFunction: opts["tac_frequencyFunction"],
        frequencyRecentCount: opts["tac_frequencyRecentCount"],
        frequencyMinCount: opts["tac_frequencyMinCount"],
        frequencyMaxAge: opts["tac_frequencyMaxAge"],
        frequencyRecommendCap: opts["tac_frequencyRecommendCap"],
        frequencyIncludeAlias: opts["tac_frequencyIncludeAlias"],
        useStyleVars: opts["tac_useStyleVars"],
        // Insertion related settings
        replaceUnderscores: lobeOpts?.replaceUnderscores ?? opts["tac_replaceUnderscores"],
        replaceUnderscoresExclusionList: opts["tac_undersocreReplacementExclusionList"],
        escapeParentheses: lobeOpts?.escapeParentheses ?? opts["tac_escapeParentheses"],
        appendComma: lobeOpts?.appendComma ?? opts["tac_appendComma"],
        appendSpace: lobeOpts?.appendSpace ?? opts["tac_appendSpace"],
        alwaysSpaceAtEnd: opts["tac_alwaysSpaceAtEnd"],
        wildcardCompletionMode: opts["tac_wildcardCompletionMode"],
        modelKeywordCompletion: lobeOpts?.modelKeywordCompletion || opts["tac_modelKeywordCompletion"],
        modelKeywordLocation: lobeOpts?.modelKeywordLocation || opts["tac_modelKeywordLocation"],
        civitaiKeywordLookup: opts["tac_modelKeywordCivitai"],
        animaArtistPrefix: lobeOpts?.animaArtistPrefix || opts["tac_animaArtistPrefix"],
        // Prompt helper settings
        dimUsedTags: lobeOpts?.dimUsedTags ?? opts["tac_dimUsedTags"],
        selectUsedTag: lobeOpts?.selectUsedTag ?? opts["tac_selectUsedTag"],
        formatMode: lobeOpts?.formatMode || opts["tac_formatMode"],
        formatTrailingComma: opts["tac_formatTrailingComma"],
        wcWrap: opts["dp_parser_wildcard_wrap"] || "__", // to support custom wrapper chars set by dp_parser
        // Alias settings
        alias: {
            searchByAlias: opts["tac_alias.searchByAlias"],
            onlyShowAlias: opts["tac_alias.onlyShowAlias"]
        },
        // Translation settings
        translation: {
            translationFile: opts["tac_translation.translationFile"],
            oldFormat: opts["tac_translation.oldFormat"],
            searchByTranslation: opts["tac_translation.searchByTranslation"],
            liveTranslation: opts["tac_translation.liveTranslation"],
        },
        // Extra file settings
        extra: {
            extraFile: extraFiles[0] || "None",
            extraFiles: extraFiles,
            addMode: lobeOpts?.extraAddMode || opts["tac_extra.addMode"]
        },
        // Chant file settings
        chantFile: lobeOpts?.chantFile || opts["tac_chantFile"],
        // Settings not from tac but still used by the script
        extraNetworksDefaultMultiplier: opts["extra_networks_default_multiplier"],
        extraNetworksSeparator: opts["extra_networks_add_text_separator"],
        // Custom mapping settings
        keymap: JSON.parse(opts["tac_keymap"]),
        colorMap: JSON.parse(opts["tac_colormap"])
    }

    if (newCFG.alias.onlyShowAlias) {
        newCFG.alias.searchByAlias = true; // if only show translation, enable search by translation is necessary
    }

    // Reload translations if the translation file changed
    const translationChanged = !TAC_CFG || newCFG.translation.translationFile !== TAC_CFG.translation.translationFile;
    if (translationChanged) {
        translations.clear();
        await loadTranslations(newCFG);
    }
    const extrasChanged = !TAC_CFG || JSON.stringify(newCFG.extra.extraFiles) !== JSON.stringify(TAC_CFG.extra.extraFiles);
    if (translationChanged || extrasChanged) {
        extras = [];
        await loadExtraTags(newCFG);
    }
    // Reload tags if the tag file changed (after translations so extra tag translations get re-added)
    if (TAC_CFG && newCFG.tagFile !== TAC_CFG.tagFile) {
        activeSearch?.controller.abort();
        await tagLoad?.catch(() => {});
        dictionaryWorker?.close();
        dictionaryWorker = undefined;
        localTagLoad = undefined;
        allTags = [];
        tagIndex = new Map();
        tagsLoaded = false;
    } else if (TAC_CFG && newCFG.useIndexedSearch && !TAC_CFG.useIndexedSearch && tagsLoaded) {
        if (!dictionaryWorker) void refreshLocalTagIndex(allTags);
    }

    // Refresh temp files if model sort order changed
    // Contrary to the other loads, this one shouldn't happen on a first time load
    if (TAC_CFG && newCFG.modelSortOrder !== TAC_CFG.modelSortOrder) {
        const dropdown = gradioApp().querySelector("#setting_tac_modelSortOrder");
        if (dropdown) dropdown.style.opacity = 0.5;
        try {
            await refreshTacTempFiles(true);
        } finally {
            if (dropdown) dropdown.style.removeProperty("opacity");
        }
    }

    // Update CSS if maxResults changed
    if (TAC_CFG && newCFG.maxResults !== TAC_CFG.maxResults) {
        gradioApp().querySelectorAll(".autocompleteResults").forEach(r => {
            r.style.maxHeight = `${newCFG.maxResults * 50}px`;
        });
    }

    // Remove ruby div if live preview was disabled
    if (newCFG.translation.liveTranslation === false) {
        [...gradioApp().querySelectorAll('.acRuby')].forEach(r => {
            r.remove();
        });
    }

    // Apply changes
    const animaPrefixChanged = TAC_CFG?.animaArtistPrefix !== newCFG.animaArtistPrefix;
    TAC_CFG = newCFG;
    if (translationChanged || extrasChanged) dictionaryWorker?.translations(translations);
    if (TAC_CFG.activeIn.global && lobeAutocompleteOptions()?.mode !== "off" && !tagsLoaded)
        void ensureTagsLoaded().catch(console.error);
    if (animaPrefixChanged) updateAnimaCheckpointStatus();

    // Callback
    await processQueue(QUEUE_AFTER_CONFIG_CHANGE, null);
}

// Create the result list div and necessary styling
function createResultsDiv(textArea) {
    let parentDiv = document.createElement("div");
    let resultsDiv = document.createElement("div");
    let resultsList = document.createElement("ul");
    let sideDiv = document.createElement("div");
    let sideDivImg = document.createElement("img");

    let textAreaId = getTextAreaIdentifier(textArea);
    let typeClass = textAreaId.replaceAll(".", " ");

    parentDiv.setAttribute("class", `autocompleteParent${typeClass}`);

    resultsDiv.style.maxHeight = `${TAC_CFG.maxResults * 50}px`;
    resultsDiv.setAttribute("class", `autocompleteResults${typeClass} notranslate`);
    resultsDiv.setAttribute("translate", "no");
    resultsList.setAttribute("class", "autocompleteResultsList");
    resultsDiv.appendChild(resultsList);

    sideDiv.setAttribute("class", `autocompleteResults${typeClass} sideInfo`);
    sideDiv.appendChild(sideDivImg);

    parentDiv.appendChild(resultsDiv);
    parentDiv.appendChild(sideDiv);

    return parentDiv;
}

// Show or hide the results div
function isVisible(textArea) {
    let textAreaId = getTextAreaIdentifier(textArea);
    let parentDiv = gradioApp().querySelector('.autocompleteParent' + textAreaId);
    return parentDiv?.style.display === "flex";
}
function showResults(textArea) {
    let textAreaId = getTextAreaIdentifier(textArea);
    let parentDiv = gradioApp().querySelector('.autocompleteParent' + textAreaId);
    if (!parentDiv) return;
    parentDiv.style.display = "flex";
    if (lobeAutocompleteOptions()?.mode === "lobe") {
        lobeAutocomplete.show(textArea, parentDiv, getCaretCoordinates);
    } else if (TAC_CFG.slidingPopup) {
        let caretPosition = getCaretCoordinates(textArea, textArea.selectionEnd);
        // Top cursor offset fix for SDNext modern UI, based on code by https://github.com/Nyx01
        let offsetTop = textArea.offsetTop + caretPosition.top - textArea.scrollTop + 10; // Adjust this value for desired distance below cursor
        let offsetLeft = Math.min(textArea.offsetLeft - textArea.scrollLeft + caretPosition.left, textArea.offsetWidth - parentDiv.offsetWidth);

        parentDiv.style.top = `${offsetTop}px`; // Position below the cursor
        parentDiv.style.left = `${offsetLeft}px`;
    } else {
        parentDiv.style.removeProperty("top");
        if (parentDiv.style.left)
            parentDiv.style.removeProperty("left");
    }
    // Reset here too to make absolutely sure the browser registers it
    parentDiv.scrollTop = 0;

    // Ensure preview is hidden
    let previewDiv = gradioApp().querySelector(`.autocompleteParent${textAreaId} .sideInfo`);
    previewDiv.style.display = "none";
}
function showLoadingResults(textArea) {
    let textAreaId = getTextAreaIdentifier(textArea);
    let resultsDiv = gradioApp().querySelector('.autocompleteResults' + textAreaId);
    let resultsList = resultsDiv?.querySelector('ul');
    if (!resultsList) return;
    displayedValues.delete(textArea);
    const status = document.createElement("li");
    status.className = "acLoading";
    status.setAttribute("role", "status");
    const integrated = lobeAutocompleteOptions()?.mode === "lobe";
    if (!integrated) status.style.cssText = "padding:8px 12px;color:#9ca3af;font-style:italic";
    status.textContent = integrated ? lobeAutocomplete.loadingText() : "Loading tags…";
    resultsList.replaceChildren(status);
    showResults(textArea);
}

function hideResults(textArea) {
    if (activeSearch?.area === textArea) activeSearch.controller.abort();
    let textAreaId = getTextAreaIdentifier(textArea);
    let resultsDiv = gradioApp().querySelector('.autocompleteParent' + textAreaId);

    if (!resultsDiv) return;

    resultsDiv.style.display = "none";
    lobeAutocomplete?.hide(textArea, resultsDiv);
    selectedTag = null;
}

// Function to check activation criteria
function isEnabled() {
    if (TAC_CFG.activeIn.global) {
        // Skip check if the current model was not correctly detected, since it could wrongly disable the script otherwise
        if (!currentModelName || !currentModelHash) return true;

        let modelList = TAC_CFG.activeIn.modelList
            .split(",")
            .map(x => x.trim())
            .filter(x => x.length > 0);

        let shortHash = currentModelHash.substring(0, 10);
        let modelNameWithoutHash = currentModelName.replace(/\[.*\]$/g, "").trim();
        if (TAC_CFG.activeIn.modelListMode.toLowerCase() === "blacklist") {
            // If the current model is in the blacklist, disable
            return modelList.filter(x => x === currentModelName || x === modelNameWithoutHash || x === currentModelHash || x === shortHash).length === 0;
        } else {
            // If the current model is in the whitelist, enable.
            // An empty whitelist is ignored.
            return modelList.length === 0 || modelList.filter(x => x === currentModelName || x === modelNameWithoutHash || x === currentModelHash || x === shortHash).length > 0;
        }
    } else {
        return false;
    }
}

const WEIGHT_REGEX = /[([]([^()[\]:|]+)(?::(?:\d+(?:\.\d+)?|\.\d+))?[)\]]/g;
const POINTY_REGEX = /<[^\s,<](?:[^\t\n\r,<>]*>|[^\t\n\r,> ]*)/g;
const COMPLETED_WILDCARD_REGEX = /__[^\s,_][^\t\n\r,_]*[^\s,_]__[^\s,_]*/g;
const STYLE_VAR_REGEX = /\$\(?[^$|\[\],\s]*\)?/g;
const NORMAL_TAG_REGEX = /[^\s,|<>\[\]:]+_\([^\s,|<>\[\]:]*\)?|[^\s,|<>():\[\]]+|</g;
const RUBY_TAG_REGEX = /[\w\d<][\w\d' \-?!/$%]{2,}>?/g;
let cachedTagRegex = null;
let cachedWcWrap = null;
function getTagRegex() {
    if (cachedTagRegex === null || TAC_CFG.wcWrap !== cachedWcWrap) {
        cachedWcWrap = TAC_CFG.wcWrap;
        cachedTagRegex = new RegExp(`${POINTY_REGEX.source}|${COMPLETED_WILDCARD_REGEX.source.replaceAll("__", escapeRegExp(TAC_CFG.wcWrap))}|${STYLE_VAR_REGEX.source}|${NORMAL_TAG_REGEX.source}`, "g");
    }
    return cachedTagRegex;
}

function promptTags(prompt) {
    const weighted = [...prompt.matchAll(WEIGHT_REGEX)].map(match => match[1])
        .sort((a, b) => a.length - b.length);
    const weightedSet = new Set(weighted);
    return (prompt.match(getTagRegex()) || []).sort((a, b) => a.length - b.length)
        .filter(tag => !weightedSet.has(tag) || tag.startsWith("<[") || tag.startsWith("$("))
        .concat(weighted);
}

// Replaces the whole prompt the same way insertTextAtCursor does, so Gradio picks up the change
function setPromptText(textArea, text, caret) {
    textArea.value = text;
    textArea.selectionStart = textArea.selectionEnd = Math.min(caret, text.length);
    updateInput(textArea);
}

// Choosing a tag the prompt already contains selects that occurrence instead of adding a duplicate.
// Only applies while the tag being typed sits alone in a plain segment, which is then removed.
function selectUsedTag(textArea, tag) {
    const text = textArea.value;
    const caret = textArea.selectionStart;
    const current = TacPromptTools.segmentAt(text, caret);
    if (!current || !current.text.trim() || /[()[\]{}<>:|]/.test(current.text)) return false;
    const found = TacPromptTools.findTag(text, tag, caret);
    if (!found) return false;

    const removal = TacPromptTools.removalRange(text, current);
    const shift = found.start > removal.start ? removal.end - removal.start : 0;
    setPromptText(textArea, text.slice(0, removal.start) + text.slice(removal.end), found.start - shift);
    textArea.setSelectionRange(found.start - shift, found.end - shift);
    hideResults(textArea);
    tagword = "";
    return true;
}

// Tidies commas and spaces between tags. The separator follows the "Append space" setting.
function formatPromptArea(textArea) {
    if (promptAreaKind(textArea) !== "tags") return;
    const text = textArea.value;
    const formatted = TacPromptTools.formatPrompt(text, {
        separator: TAC_CFG.appendSpace ? ", " : ",",
        trailingComma: TAC_CFG.formatTrailingComma
    });
    if (formatted !== text) setPromptText(textArea, formatted, textArea.selectionStart);
}

// On click, insert the tag into the prompt textbox with respect to the cursor position
async function insertTextAtCursor(textArea, result, tagword, tabCompletedWithoutChoice = false) {
    if (!allowsPromptSuggestions(textArea)) return;
    const kind = promptAreaKind(textArea);
    const axis = xyzAxis(textArea);
    if (kind === "tags" && TAC_CFG.selectUsedTag && result.type === ResultType.tag && selectUsedTag(textArea, result.text)) return;

    let text = result.text;
    let tagType = result.type;

    let cursorPos = textArea.selectionStart;
    var sanitizedText = text

    // Run sanitize queue and use first result as sanitized text
    const sanitizeResults = await processQueueReturn(QUEUE_SANITIZE, null, tagType, text);

    if (sanitizeResults && sanitizeResults.length > 0) {
        sanitizedText = sanitizeResults[0];
    } else {
        const excluded_tags = TAC_CFG.replaceUnderscoresExclusionList?.split(',').map(s => s.trim()) || [];
        if (TAC_CFG.replaceUnderscores && !excluded_tags.includes(sanitizedText)) {
            sanitizedText = text.replaceAll("_", " ")
        } else {
            sanitizedText = text;
        }
        if (TAC_CFG.escapeParentheses && tagType === ResultType.tag) {
            sanitizedText = sanitizedText
                .replaceAll("(", "\\(")
                .replaceAll(")", "\\)")
                .replaceAll("[", "\\[")
                .replaceAll("]", "\\]");
        }
    }
    if (/^Prompt S\/R \(LoRA\)$/i.test(axis ?? "") && (tagType === ResultType.lora || tagType === ResultType.lyco) &&
        !/^<(?:lora|l|lyco):/i.test(tagword)) {
        sanitizedText = sanitizedText.match(/^<(?:lora|lyco):(.+):[^:>]+>$/i)?.[1] ?? sanitizedText;
    }

    // ANIMA-based checkpoints use '@' prefixed artist tags; auto-add it for Danbooru artist tags (category 1)
    if (TAC_CFG.animaArtistPrefix !== "Off" && checkpointIsAnima()
        && tagType === ResultType.tag && result.category == 1
        && TAC_CFG.tagFile && TAC_CFG.tagFile.toLowerCase().startsWith("danbooru")
        && !sanitizedText.startsWith("@")) {
        sanitizedText = "@" + sanitizedText;
    }

    if ((tagType === ResultType.wildcardFile || tagType === ResultType.yamlWildcard)
        && tabCompletedWithoutChoice
        && TAC_CFG.wildcardCompletionMode !== "Always fully"
        && sanitizedText.includes("/")) {
        if (TAC_CFG.wildcardCompletionMode === "To next folder level") {
            let regexMatch = sanitizedText.match(new RegExp(`${escapeRegExp(tagword)}([^/]*\\/?)`, "i"));
            if (regexMatch) {
                let pathPart = regexMatch[0];
                // In case the completion would have just added a slash, try again one level deeper
                if (pathPart === `${tagword}/`) {
                    pathPart = sanitizedText.match(new RegExp(`${escapeRegExp(tagword)}\\/([^/]*\\/?)`, "i"))[0];
                }
                sanitizedText = pathPart;
            }
        } else if (TAC_CFG.wildcardCompletionMode === "To first difference") {
            let firstDifference = 0;
            let longestResult = results.map(x => x.text.length).reduce((a, b) => Math.max(a, b));
            // Compare the results to each other to find the first point where they differ
            for (let i = 0; i < longestResult; i++) {
                let char = results[0].text[i];
                if (results.every(x => x.text[i] === char)) {
                    firstDifference++;
                } else {
                    break;
                }
            }
            // Don't cut off the __ at the end if it is already the full path
            if (firstDifference > 0 && firstDifference < longestResult) {
                // +2 because the sanitized text already has the __ at the start but the matched text doesn't
                sanitizedText = sanitizedText.substring(0, firstDifference + TAC_CFG.wcWrap.length);
            } else if (firstDifference === 0) {
                sanitizedText = tagword;
            }
        }
    }

    // Frequency db update
    if (TAC_CFG.frequencySort) {
        let name = null;

        switch (tagType) {
            case ResultType.wildcardFile:
            case ResultType.yamlWildcard:
                // We only want to update the frequency for a full wildcard, not partial paths
                if (sanitizedText.endsWith(TAC_CFG.wcWrap))
                    name = text
                break;
            case ResultType.chant:
                // Chants use a slightly different format
                name = result.aliases;
                break;
            default:
                name = text;
                break;
        }

        if (name && name.length > 0) {
            // Check if it's a negative prompt
            let textAreaId = getTextAreaIdentifier(textArea);
            let isNegative = textAreaId.includes("n");
            // Sanitize name for API call
            name = encodeURIComponent(name)
            // Call API & update db
            increaseUseCount(name, tagType, isNegative)
        }
    }

    var prompt = textArea.value;

    // Edit prompt text
    let editStart = Math.max(cursorPos - tagword.length, 0);
    let editEnd = Math.min(cursorPos + tagword.length, prompt.length);
    let surrounding = prompt.substring(editStart, editEnd);
    let tagPattern = escapeRegExp(`${tagword}`);
    const queryEnd = cursorPos - editStart;
    const matchBeforeCaret = (pattern) => surrounding.slice(0, queryEnd).match(new RegExp(`(?:${pattern})$`, "i"));
    let match = kind === "tags" ? surrounding.match(new RegExp(tagPattern, "i")) : matchBeforeCaret(tagPattern);
    // A multi-word query such as "long_hai" was typed with spaces ("long hai")
    if (!match && tagword.includes("_")) {
        tagPattern = tagPattern.replaceAll("_", "[ _]");
        match = kind === "tags" ? surrounding.match(new RegExp(tagPattern, "i")) : matchBeforeCaret(tagPattern);
    }
    if (!match) return;
    let afterInsertCursorPos = editStart + match.index + sanitizedText.length;

    var optionalSeparator = "";
    let extraNetworkTypes = [ResultType.lora];
    let noCommaTypes = [ResultType.wildcardFile, ResultType.yamlWildcard, ResultType.umiWildcard].concat(extraNetworkTypes);
    if (kind === "tags" && !noCommaTypes.includes(tagType)) {
        // Append comma if enabled and not already present
        let beforeComma = surrounding.match(new RegExp(`${tagPattern}[,:]`, "i")) !== null;
        if (TAC_CFG.appendComma)
            optionalSeparator = beforeComma ? "" : ",";
        // Add space if enabled
        if (TAC_CFG.appendSpace && !beforeComma)
            optionalSeparator += " ";
        // If at end of prompt and enabled, override the normal setting if not already added
        if (!TAC_CFG.appendSpace && TAC_CFG.alwaysSpaceAtEnd)
            optionalSeparator += surrounding.match(new RegExp(`${tagPattern}$`, "im")) !== null ? " " : "";
    } else if (kind === "tags" && extraNetworkTypes.includes(tagType)) {
        // Use the dedicated separator for extra networks if it's defined, otherwise fall back to space
        optionalSeparator = TAC_CFG.extraNetworksSeparator || " ";
    }

    // Replace partial tag word with new text, add comma if needed
    let insert = kind === "tags"
        ? surrounding.replace(match, () => sanitizedText + optionalSeparator)
        : surrounding.slice(0, match.index) + sanitizedText + surrounding.slice(queryEnd);

    // Add back start
    var newPrompt = prompt.substring(0, editStart) + insert + prompt.substring(editEnd);

    // Add lora/lyco keywords if enabled and found
    let keywordsLength = 0;

    if (kind === "tags" && TAC_CFG.modelKeywordCompletion !== "Never" && (tagType === ResultType.lora || tagType === ResultType.lyco)) {
        let keywords = null;
        // Check built-in activation words first (.json sidecar "activation text" field)
        if (tagType === ResultType.lora || tagType === ResultType.lyco) {
            let info = await fetchLoraInfoCached(result.text);
            if (info && info["activation text"]) {
                keywords = info["activation text"];
            }
        }

        // CivitAI API fallback: fetch trigger words by SHA256 (cached in sidecar)
        if (!keywords && TAC_CFG.civitaiKeywordLookup) {
            let civitaiData = await fetchTacAPI(`/lobe/autocomplete/civitai-trigger-words/${result.text}`);
            if (civitaiData && civitaiData.trainedWords && civitaiData.trainedWords.length > 0) {
                keywords = civitaiData.trainedWords;
            }
        }

        if (!keywords && modelKeywordPath.length > 0 && result.hash && result.hash !== "NOFILE" && result.hash.length > 0) {
            let nameDict = modelKeywordDict.get(result.hash);
            let names = [result.text + ".safetensors", result.text + ".pt", result.text + ".ckpt"];

            // No match, try to find a sha256 match from the cache file
            if (!nameDict) {
                const sha256 = await fetchTacAPI(`/lobe/autocomplete/lora-cached-hash/${result.text}`)
                if (sha256) {
                    nameDict = modelKeywordDict.get(sha256);
                }
            }

            if (nameDict) {
                let found = false;
                names.forEach(name => {
                    if (!found && nameDict.has(name)) {
                        found = true;
                        keywords = nameDict.get(name);
                    }
                });

                if (!found)
                    keywords = nameDict.get("none");
            }
        }

        if (keywords && keywords.length > 0) {
            textBeforeKeywordInsertion = newPrompt;

            if (TAC_CFG.modelKeywordLocation === "Start of prompt")
                newPrompt = `${keywords}, ${newPrompt}`; // Insert keywords
            else if (TAC_CFG.modelKeywordLocation === "End of prompt")
                newPrompt = `${newPrompt}, ${keywords}`; // Insert keywords
            else if (TAC_CFG.modelKeywordLocation === "After LORA/LyCO") {
                // Insert keywords immediately after the <lora:…> token in the already-built prompt
                let loraStart = editStart + match.index;
                let loraEnd = loraStart + sanitizedText.length;
                newPrompt = newPrompt.substring(0, loraEnd) + `, ${keywords}` + newPrompt.substring(loraEnd);
            } else {
                // "Before LORA/LyCO" (default)
                let keywordStart = prompt[editStart - 1] === " " ? editStart - 1 : editStart;
                newPrompt = prompt.substring(0, keywordStart) + `, ${keywords} ${insert}` + prompt.substring(editEnd);
            }


            textAfterKeywordInsertion = newPrompt;
            keywordInsertionUndone = false;
            setTimeout(() => lastEditWasKeywordInsertion = true, 200)

            keywordsLength = keywords.length + 2; // +2 for the comma and space
        }
    }

    // Insert into prompt textbox and reposition cursor
    textArea.value = newPrompt;
    textArea.selectionStart = afterInsertCursorPos + optionalSeparator.length + keywordsLength;
    textArea.selectionEnd = textArea.selectionStart

    // Set self trigger flag to show wildcard contents after the filename was inserted
    if ([ResultType.wildcardFile, ResultType.yamlWildcard, ResultType.umiWildcard].includes(result.type))
        tacSelfTrigger = true;
    // Since we've modified a Gradio Textbox component manually, we need to simulate an `input` DOM event to ensure it's propagated back to python.
    // Uses a built-in method from the webui's ui.js which also already accounts for event target
    if (tagType === ResultType.wildcardTag || tagType === ResultType.wildcardFile || tagType === ResultType.yamlWildcard)
        tacSelfTrigger = true;
    updateInput(textArea);

    // Update previous tags with the edited prompt to prevent re-searching the same term
    const tags = promptTags(newPrompt);
    previousTags = tags;
    areaTags.set(textArea, tags);
    tagword = ""; // Clear current tagword so next keystroke starts fresh

    // Callback
    let returns = await processQueueReturn(QUEUE_AFTER_INSERT, null, tagType, sanitizedText, newPrompt, textArea);
    // Return if any queue function returned true (has handled hide/show already)
    if (returns.some(x => x === true))
        return;

    // Hide results after inserting, if it hasn't been hidden already by a queue function
    if (!hideBlocked && isVisible(textArea)) {
        hideResults(textArea);
    }
}

const compactPostCount = new Intl.NumberFormat("en", { notation: "compact" });
const fractionalPostCount = new Intl.NumberFormat("en", {
    notation: "compact", minimumFractionDigits: 1, maximumFractionDigits: 1
});
const promptCounts = new WeakMap();

function addResultsToList(textArea, results, tagword, resetList) {
    let textAreaId = getTextAreaIdentifier(textArea);
    let resultDiv = gradioApp().querySelector('.autocompleteResults' + textAreaId);
    let resultsList = resultDiv.querySelector('ul');

    // Reset list, selection and scrollTop since the list changed
    if (resetList) {
        displayedValues.set(textArea, textArea.value);
        resultsList.innerHTML = "";
        selectedTag = null;
        oldSelectedTag = null;
        resultDiv.scrollTop = 0;
        resultCount = 0;
    }

    // Find right colors from config
    let tagFileName = (TAC_CFG.tagFile || "").split(".")[0];
    let tagColors = TAC_CFG.colorMap;
    let mode = (document.querySelector(".dark") || gradioApp().querySelector(".dark")) ? 0 : 1;
    let nextLength = Math.min(results.length, resultCount + TAC_CFG.resultStepLength);
    const IS_DAN_OR_E621_TAG_FILE =  (tagFileName.toLowerCase().startsWith("danbooru") || tagFileName.toLowerCase().startsWith("e621"));

    let tagCount = Object.create(null);

    // Indicate if tag was used before 
    if (IS_DAN_OR_E621_TAG_FILE) {
        const prompt = textArea.value;
        const cached = promptCounts.get(textArea);
        if (cached?.prompt === prompt) tagCount = cached.counts;
        else {
            for (const part of prompt.split(/[,\n]/)) {
                const tag = part.trim();
                if (!tag) continue;
                const weights = tag.matchAll(WEIGHT_REGEX);
                const first = weights.next().value;
                const name = first && weights.next().done ? first[1] : tag;
                const key = name.replaceAll(" ", "_").replaceAll("\\(", "(").replaceAll("\\)", ")");
                tagCount[key] = (tagCount[key] || 0) + 1;
            }
            promptCounts.set(textArea, { prompt, counts: tagCount });
        }
    }

    const fragment = document.createDocumentFragment();
    for (let i = resultCount; i < nextLength; i++) {
        let result = results[i];

        // Skip if the result is null or undefined
        if (!result)
            continue;

        let li = document.createElement("li");

        let flexDiv = document.createElement("div");
        flexDiv.classList.add("resultsFlexContainer");
        li.appendChild(flexDiv);

        let itemText = document.createElement("div");
        itemText.classList.add("acListItem");

        let displayText = "";
        // If the tag matches the tagword, we don't need to display the alias
        if(result.type === ResultType.chant) {
            displayText = escapeHTML(result.aliases);
        } else if (result.aliases && !result.text.includes(tagword)) { // Alias
            let splitAliases = result.aliases.split(",");
            let bestAlias = splitAliases.find(a => a.toLowerCase().includes(tagword));

            // search in translations if no alias matches
            if (!bestAlias) {
                for (const alias of splitAliases) {
                    const tr = translations.get(alias);
                    if (tr && tr.toLowerCase().includes(tagword)) {
                        bestAlias = alias;
                        break;
                    }
                }
                if (!bestAlias) {
                    const tr = translations.get(result.text);
                    if (tr && tr.toLowerCase().includes(tagword)) {
                        bestAlias = result.text;
                    }
                }
            }

            displayText = escapeHTML(bestAlias);

            // Append translation for alias if it exists and is not what the user typed
            if (translations.has(bestAlias) && translations.get(bestAlias) !== bestAlias && bestAlias !== result.text)
                displayText += `[${translations.get(bestAlias)}]`;

            if (!TAC_CFG.alias.onlyShowAlias && result.text !== bestAlias)
                displayText += " ➝ " + result.text;
        } else { // No alias
            displayText = escapeHTML(result.text);
        }

        // Append translation for result if it exists
        if (translations.has(result.text))
            displayText += `[${translations.get(result.text)}]`;

        // Print search term bolded in result
        // Escape tagword so it matches displayText (which was already escaped by escapeHTML)
        const escapedTagword = escapeHTML(tagword);
        itemText.innerHTML = displayText.replace(escapedTagword, `<b>${escapedTagword}</b>`);

        const splitTypes = [ResultType.wildcardFile, ResultType.yamlWildcard]
        if (splitTypes.includes(result.type) && itemText.innerHTML.includes("/")) {
            let parts = itemText.innerHTML.split("/");
            let lastPart = parts[parts.length - 1];
            parts = parts.slice(0, parts.length - 1);

            itemText.innerHTML = "<span class='acPathPart'>" + parts.join("</span><span class='acPathPart'>/") + "</span>" + "/" + lastPart;
        }

        // Add wiki link if the setting is enabled and a supported tag set loaded
        if (
            TAC_CFG.showWikiLinks &&
            result.type === ResultType.tag &&
            IS_DAN_OR_E621_TAG_FILE
        ) {
            let wikiLink = document.createElement("a");
            wikiLink.classList.add("acWikiLink");
            wikiLink.innerText = "?";
            wikiLink.title = "Open external wiki page for this tag";

            let linkPart = displayText;
            // Only use alias result if it is one
            if (displayText.includes("➝")) linkPart = displayText.split(" ➝ ")[1];

            // Remove any trailing translations
            if (linkPart.includes("[")) {
                linkPart = linkPart.split("[")[0];
            }

            linkPart = encodeURIComponent(linkPart);

            // Set link based on selected file
            let tagFileNameLower = tagFileName.toLowerCase();
            if (tagFileNameLower.startsWith("danbooru_e621_merged")) {
                // Use danbooru for categories 0-5, e621 for 6+
                // Based on the merged categories from https://github.com/DraconicDragon/dbr-e621-lists-archive/tree/main/tag-lists/danbooru_e621_merged
                // Danbooru is also the fallback if result.category is not set
                wikiLink.href =
                    result.category && result.category >= 6
                        ? `https://e621.net/wiki_pages/${linkPart}`
                        : `https://danbooru.donmai.us/wiki_pages/${linkPart}`;
            } else if (tagFileNameLower.startsWith("danbooru")) {
                wikiLink.href = `https://danbooru.donmai.us/wiki_pages/${linkPart}`;
            } else if (tagFileNameLower.startsWith("e621")) {
                wikiLink.href = `https://e621.net/wiki_pages/${linkPart}`;
            }

            wikiLink.target = "_blank";
            flexDiv.appendChild(wikiLink);
        }

        flexDiv.appendChild(itemText);

        // Add post count & color if it's a tag
        // Wildcards & Embeds have no tag category
        if (result.category) {
            // Set the color of the tag
            let cat = result.category;
            let colorGroup = tagColors[tagFileName];
            // Default to danbooru scheme if no matching one is found
            if (!colorGroup)
                colorGroup = tagColors["danbooru"];

            // Set tag type to invalid if not found
            if (!colorGroup[cat])
                cat = "-1";

            flexDiv.style = `color: ${colorGroup[cat][mode]};`;
        }

        // Post count
        if (result.count && !isNaN(result.count) && result.count !== Number.MAX_SAFE_INTEGER) {
            let postCount = result.count;
            // Danbooru formats numbers with a padded fraction for 1M or 1k, but not for 10/100k
            const formatter = postCount >= 1000000 || (postCount >= 1000 && postCount < 10000)
                ? fractionalPostCount : compactPostCount;

            let formattedCount = formatter.format(postCount);

            let countDiv = document.createElement("div");
            countDiv.textContent = formattedCount;
            countDiv.classList.add("acMetaText");
            flexDiv.appendChild(countDiv);
        } else if (result.meta) { // Check if there is meta info to display
            let metaDiv = document.createElement("div");
            metaDiv.textContent = result.meta;
            metaDiv.classList.add("acMetaText");

            // Add version info classes if it is an embedding
            if (result.type === ResultType.embedding) {
                if (result.meta.startsWith("v1"))
                    itemText.classList.add("acEmbeddingV1");
                else if (result.meta.startsWith("v2"))
                    itemText.classList.add("acEmbeddingV2");
            }

            // Color LoRA and LyCORIS entries
            if (result.type === ResultType.lora || result.type === ResultType.lyco) {
                itemText.classList.add("acLora");
            }

            flexDiv.appendChild(metaDiv);
        }

        // Add small ✨ marker to indicate usage sorting
        if (result.usageBias) {
            const metaNode = flexDiv.querySelector(".acMetaText");
            if (metaNode) metaNode.classList.add("biased");
            flexDiv.title = "✨ Frequent tag. Ctrl/Cmd + click to reset usage count.";
        }

        // Add 🔁 to indicate if tag was used before
        if (IS_DAN_OR_E621_TAG_FILE && tagCount[result.text]) {
            // Fix PR#313#issuecomment-2592551794
            if (!(result.text === tagword && tagCount[result.text] === 1)) {
                const textNode = flexDiv.querySelector(".acMetaText");
                if (textNode) {
                    const span = document.createElement("span");
                    textNode.insertBefore(span, textNode.firstChild);
                    span.classList.add("used");
                    span.title = "🔁 The prompt already contains this tag";
                }
                if (TAC_CFG.dimUsedTags) li.classList.add("acUsedTag");
            }
        }

        // Check if it's a negative prompt
        let isNegative = textAreaId.includes("n");

        // Add click listener
        li.addEventListener("click", (e) => {
            if (displayedValues.get(textArea) !== textArea.value) return;
            if (e.ctrlKey || e.metaKey) {
                resetUseCount(result.text, result.type, !isNegative, isNegative);
                flexDiv.querySelector(".acMetaText").classList.remove("biased");
            } else {
                insertTextAtCursor(textArea, result, tagword);
            }
        });
        // Add delayed hover listener for extra network previews
        if (
            TAC_CFG.showExtraNetworkPreviews &&
            [
                ResultType.embedding,
                ResultType.lora,
                ResultType.lyco,
            ].includes(result.type)
        ) {
            li.addEventListener("mouseover", async () => {
                const me = this;
                let hoverTimeout;

                hoverTimeout = setTimeout(async () => {
                    // If the tag we hover over is already selected, do nothing
                    if (selectedTag && selectedTag === i) return;

                    oldSelectedTag = selectedTag;
                    selectedTag = i;

                    // Update selection without scrolling to the item (since we would
                    // immediately trigger the next scroll as the items move under the cursor)
                    updateSelectionStyle(textArea, selectedTag, oldSelectedTag, false);
                }, 400);
                // Reset delay timer if we leave the item
                me.addEventListener("mouseout", () => {
                    clearTimeout(hoverTimeout);
                }, { once: true });
            });
        }

        // Add element to fragment
        fragment.appendChild(li);
    }
    resultsList.appendChild(fragment);
    if (lobeAutocompleteOptions()?.mode === "lobe") lobeAutocomplete.update(textArea, resultsList);
    resultCount = nextLength;

    if (resetList) {
        selectedTag = null;
        oldSelectedTag = null;
        resultDiv.scrollTop = 0;
    }
}

async function updateSelectionStyle(textArea, newIndex, oldIndex, scroll = true) {
    let textAreaId = getTextAreaIdentifier(textArea);
    let resultDiv = gradioApp().querySelector('.autocompleteResults' + textAreaId);
    let resultsList = resultDiv.querySelector('ul');
    let items = resultsList.getElementsByTagName('li');

    if (oldIndex != null) {
        items[oldIndex]?.classList.remove('selected');
    }

    // make it safer
    if (newIndex !== null) {
        let selected = items[newIndex];
        if (!selected) return;
        selected.classList.add('selected');

        // Set scrolltop to selected item
        if (scroll) resultDiv.scrollTop = selected.offsetTop - resultDiv.offsetTop;
    }
    if (lobeAutocompleteOptions()?.mode === "lobe") lobeAutocomplete.update(textArea, resultsList);

    // Show preview if enabled and the selected type supports it
    if (newIndex !== null) {
        let selectedResult = results[newIndex];
        let selectedType = selectedResult.type;
        // These types support previews (others could technically too, but are not native to the webui gallery)
        let previewTypes = [ResultType.embedding, ResultType.lora, ResultType.lyco];

        let previewDiv = gradioApp().querySelector(`.autocompleteParent${textAreaId} .sideInfo`);

        if (TAC_CFG.showExtraNetworkPreviews && previewTypes.includes(selectedType)) {
            let img = previewDiv.querySelector("img");
            // String representation of our type enum
            const typeString = Object.keys(ResultType)[selectedType - 1].toLowerCase();
            // Get image from API
            let url = await getTacExtraNetworkPreviewURL(selectedResult.text, typeString);
            if (url) {
                img.src = url;
                previewDiv.style.display = "block";
            } else {
                previewDiv.style.display = "none";
            }
        } else {
            previewDiv.style.display = "none";
        }
    }
}

function updateRuby(textArea, prompt) {
    if (!TAC_CFG.translation.liveTranslation) return;
    if (!TAC_CFG.translation.translationFile || TAC_CFG.translation.translationFile === "None") return;

    let ruby = gradioApp().querySelector('.acRuby' + getTextAreaIdentifier(textArea));
    if (!ruby) {
        let textAreaId = getTextAreaIdentifier(textArea);
        let typeClass = textAreaId.replaceAll(".", " ");
        ruby = document.createElement("div");
        ruby.setAttribute("class", `acRuby${typeClass} notranslate`);
        textArea.parentNode.appendChild(ruby);
    }

    ruby.innerText = prompt;

    let bracketEscapedPrompt = prompt.replaceAll("\\(", "$").replaceAll("\\)", "%");

    let rubyTags = bracketEscapedPrompt.match(RUBY_TAG_REGEX);
    if (!rubyTags) return;

    rubyTags.sort((a, b) => b.length - a.length);
    rubyTags = new Set(rubyTags);

    const prepareTag = (tag) => {
        tag = tag.replaceAll("$", "\\(").replaceAll("%", "\\)");

        let unsanitizedTag = tag
            .replaceAll(" ", "_")
            .replaceAll("\\(", "(")
            .replaceAll("\\)", ")");

        const translation = translations?.get(tag) || translations?.get(unsanitizedTag); 

        let escapedTag = escapeRegExp(tag);
        return { tag, escapedTag, translation };
    }

    const replaceOccurences = (text, tuple) => {
        let { tag, escapedTag, translation } = tuple;
        let searchRegex = new RegExp(`(?<!<ruby>)(?:\\b)${escapedTag}(?:\\b|$|(?=[,|: \\t\\n\\r]))(?!<rt>)`, "g");
        return text.replaceAll(searchRegex, `<ruby>${escapeHTML(tag)}<rt>${translation}</rt></ruby>`);
    }

    let html = escapeHTML(prompt);

    // First try to find direct matches
    [...rubyTags].forEach(tag => {
        let tuple = prepareTag(tag);

        if (tuple.translation) {
            html = replaceOccurences(html, tuple);
        } else {
            let subTags = tuple.tag.split(" ").filter(x => x.trim().length > 0);
            // Return if there is only one word
            if (subTags.length === 1) return;

            let subHtml = tag.replaceAll("$", "\\(").replaceAll("%", "\\)");

            let translateNgram = (windows) => {
                windows.forEach(window => {
                    let combinedTag = window.join(" ");
                    let subTuple = prepareTag(combinedTag);

                    if (subTuple.tag.length <= 2) return;

                    if (subTuple.translation) {
                        subHtml = replaceOccurences(subHtml, subTuple);
                    }
                });
            }

            // Perform n-gram sliding window search
            translateNgram(toNgrams(subTags, 3));
            translateNgram(toNgrams(subTags, 2));
            translateNgram(toNgrams(subTags, 1));

            let escapedTag = escapeRegExp(tuple.tag);

            let searchRegex = new RegExp(`(?<!<ruby>)(?:\\b)${escapedTag}(?:\\b|$|(?=[,|: \\t\\n\\r]))(?!<rt>)`, "g");
            html = html.replaceAll(searchRegex, subHtml);
        }
    });

    ruby.innerHTML = html;

    // Add listeners for auto selection
    const childNodes = [...ruby.childNodes];
    [...ruby.children].forEach(child => {
        const textBefore = childNodes.slice(0, childNodes.indexOf(child)).map(x => x.childNodes[0]?.textContent || x.textContent).join("")
        child.onclick = () => rubyTagClicked(child, textBefore, prompt, textArea);
    });
}

function rubyTagClicked(node, textBefore, prompt, textArea) {
    let selectionText = node.childNodes[0].textContent;

    // Find start and end position of the tag in the prompt
    let startPos = prompt.indexOf(textBefore) + textBefore.length;
    let endPos = startPos + selectionText.length;

    // Select in text area
    textArea.focus();
    textArea.setSelectionRange(startPos, endPos);
}

// Check if the last edit was the keyword insertion, and catch undo/redo in that case
function checkKeywordInsertionUndo(textArea, event) {
    if (TAC_CFG.modelKeywordCompletion === "Never") return;

    switch (event.inputType) {
        case "historyUndo":
            if (lastEditWasKeywordInsertion && !keywordInsertionUndone) {
                keywordInsertionUndone = true;
                textArea.value = textBeforeKeywordInsertion;
                tacSelfTrigger = true;
                updateInput(textArea);
            }
            break;
        case "historyRedo":
            if (lastEditWasKeywordInsertion && keywordInsertionUndone) {
                keywordInsertionUndone = false;
                textArea.value = textAfterKeywordInsertion;
                tacSelfTrigger = true;
                updateInput(textArea);
            }
        case undefined:
            // undefined is caused by the updateInput event firing, so we just ignore it
            break;
        default:
            // Everything else deactivates the keyword undo and returns to normal undo behavior
            lastEditWasKeywordInsertion = false;
            keywordInsertionUndone = false;
            textBeforeKeywordInsertion = "";
            textAfterKeywordInsertion = "";
            break;
    }
}

async function ensureTagsLoaded() {
    if (tagsLoaded) return;
    if (!tagLoad) {
        tagLoad = loadTags(TAC_CFG).then(() => {
            tagsLoaded = true;
        }).finally(() => {
            tagLoad = null;
        });
    }
    return tagLoad;
}

async function autocomplete(textArea, prompt, fixedTag = null) {
    const presentation = lobeAutocompleteOptions();
    if (!autocompleteActive() || !isAreaEnabled(getTextAreaIdentifier(textArea)) || !allowsPromptSuggestions(textArea)) return;
    const integrated = presentation?.mode === "lobe";
    const maxResults = integrated ? presentation.limit : TAC_CFG.maxResults;
    const frequency = integrated && presentation.history !== "inherit"
        ? presentation.history === "on" : TAC_CFG.frequencySort;
    const showAllResults = !integrated && TAC_CFG.showAllResults;
    if (!prompt.length) {
        hideResults(textArea);
        previousTags = [];
        areaTags.delete(textArea);
        tagword = "";
        return;
    }

    activeSearch?.controller.abort();
    const controller = new AbortController();
    activeSearch = { area: textArea, controller };
    const originalValue = textArea.value;
    const axis = xyzAxis(textArea);
    const isCurrent = () => !controller.signal.aborted && textArea.isConnected &&
        textArea.value === originalValue && xyzAxis(textArea) === axis;
    if (fixedTag === null && textArea.matches(additionalPromptSelector)) {
        tagword = additionalPromptQuery(textArea, prompt);
        if (!tagword) {
            hideResults(textArea);
            return;
        }
    } else if (fixedTag === null) {
        // Match tags with RegEx to get the last edited one
        // We also match for the weighting format (e.g. "tag:1.0") here, and combine the two to get the full tag word set
        const tags = promptTags(prompt);

        // Guard for no tags
        if (!tags.length) {
            previousTags = [];
            areaTags.delete(textArea);
            tagword = "";
            hideResults(textArea);
            return;
        }

        const prior = areaTags.get(textArea) || [];
        let tagCountChange = tags.length - prior.length;
        let diff = difference(tags, prior);
        previousTags = tags;
        areaTags.set(textArea, tags);

        // Guard for no difference / only whitespace remaining / last edited tag was fully removed
        if (diff === null || diff.length === 0 || (diff.length === 1 && tagCountChange < 0)) {
            if (!hideBlocked) hideResults(textArea);
            return;
        }

        tagword = diff[0]

        // Guard for empty tagword
        if (tagword === null || tagword.length === 0) {
            hideResults(textArea);
            return;
        }
    } else {
        tagword = fixedTag;
    }

    let candidates = [];
    let beforeNormalTags = 0;
    tagword = tagword.toLowerCase().replace(/[\n\r]/g, "");

    // Needed for slicing check later
    let normalTags = false;

    // Process all parsers
    const loraAxis = /^Prompt S\/R \(LoRA\)$/i.test(axis ?? "");
    const inputQuery = tagword;
    if (loraAxis && !tagword.startsWith("<")) tagword = "<lora:" + tagword;
    let resultCandidates = (await processParsers(textArea, prompt))?.filter(x => x.length > 0);
    if (!isCurrent()) return;
    let query = loraAxis ? inputQuery : tagword;
    // If one ore more result candidates match, use their candidates
    if (resultCandidates && resultCandidates.length > 0) {
        // Flatten our candidate(s)
        candidates = resultCandidates.flat();
        if (loraAxis) candidates = candidates.filter(result => [ResultType.lora, ResultType.lyco].includes(result.type));
        // Sort candidates, but not if it's umi tags since they are sorted by count
        if (!(resultCandidates.length === 1 && candidates[0].type === ResultType.umiWildcard))
            candidates = candidates.sort(getSortFunction());
    }
    // Else search the normal tag list
    if (!loraAxis && (!resultCandidates || resultCandidates.length === 0
        || (TAC_CFG.includeEmbeddingsInNormalResults && !(query.startsWith("<") || query.startsWith("*<"))))) {
        normalTags = true;
        beforeNormalTags = candidates.length;

        if (!tagsLoaded) {
            showLoadingResults(textArea);
            try {
                await ensureTagsLoaded();
            } catch {
                if (isCurrent()) hideResults(textArea);
                return;
            }
            if (!isCurrent()) return;
        }

        const caret = textArea.selectionStart;
        const phrases = fixedTag === null && !query.startsWith("*") && !/[^\s,|]/.test(prompt[caret] ?? "")
            ? TacPromptTools.spacedTagQueries(prompt.slice(0, caret)).filter(word => word.endsWith("_" + query))
            : [];
        const options = {
            alias: TAC_CFG.alias.searchByAlias,
            translation: TAC_CFG.translation.searchByTranslation,
            indexed: TAC_CFG.useIndexedSearch,
            limit: showAllResults ? null : maxResults + beforeNormalTags,
            frequency,
            usageOnly: ["Usage first", "Recent, then frequent"].includes(TAC_CFG.frequencyFunction),
        };
        const match = await searchDictionary(query, phrases, options, isCurrent);
        if (!isCurrent()) return;
        if (!match) {
            hideResults(textArea);
            return;
        }
        query = match.query;
        const filtered = match.matches;
        const searchRegex = new RegExp((match.anywhere ? "" : "(^|[^a-zA-Z])") + escapeRegExp(query), "i");
        filtered.forEach(t => {
            let result = new AutocompleteResult(t[0].trim(), ResultType.tag)
            result.category = t[1];
            result.count = t[2];
            result.aliases = t[3];
            candidates.push(result);
        });

        // Add extras
        if (extras.length > 0) {
            let extraResults = [];

            filterTagRows(extras, searchRegex, options, translations).forEach(e => {
                let result = new AutocompleteResult(e[0].trim(), ResultType.extra)
                result.category = e[1] || 0; // If no category is given, use 0 as the default
                result.meta = e[2] || "Custom tag";
                result.aliases = e[3] || "";
                extraResults.push(result);
            });

            if (TAC_CFG.extra.addMode === "Insert before") {
                candidates = extraResults.concat(candidates);
            } else {
                candidates = candidates.concat(extraResults);
            }
        }
    }

    if (candidates.length === 0) {
        hideResults(textArea);
        return;
    }

    const limit = !showAllResults && normalTags
        ? maxResults + beforeNormalTags
        : candidates.length;
    const rankByArchitecture = TAC_CFG.loraArchFilter && TAC_CFG.loraArchFilter !== "Off"
        && candidates.some(candidate => candidate.archRank !== undefined);
    const order = (items, counts) => {
        if (counts) sortByUsage(items, counts);
        if (rankByArchitecture) items.sort((a, b) => (a.archRank ?? 1) - (b.archRank ?? 1));
        return items.slice(0, limit);
    };
    const render = (items, firstPaint) => {
        if (!isCurrent()) return;
        results = items;
        tagword = query;
        resultCountBeforeNormalTags = beforeNormalTags;
        addResultsToList(textArea, items, query, true);
        if (firstPaint) showResults(textArea);
    };

    // Show local matches before asking Forge to rank them by usage history.
    const sortByFrequency = frequency;
    const initial = order(candidates.slice(), sortByFrequency ? [] : null);
    render(initial, true);
    if (!sortByFrequency) return;
    const initialBadges = initial.map(item => item.usageBias);

    if (integrated) await new Promise(resolve => setTimeout(resolve, 300));
    if (!isCurrent()) return;
    const names = [];
    const types = [];
    for (const candidate of candidates.slice(0, 2000)) {
        const name = candidate.type === ResultType.chant ? candidate.aliases : candidate.text;
        const viaAlias = (candidate.type === ResultType.tag || candidate.type === ResultType.extra)
            && !name.includes(query);
        if (viaAlias && !TAC_CFG.frequencyIncludeAlias) continue;
        names.push(name);
        types.push(candidate.type);
    }
    if (!names.length) return;

    try {
        const identifier = getTextAreaIdentifier(textArea);
        const counts = await getUseCounts(names, types, identifier.includes("n"), controller.signal);
        if (!counts?.length || !isCurrent() || selectedTag !== null) return;
        const popup = gradioApp().querySelector('.autocompleteParent' + identifier);
        if (popup?.matches(':hover')) return;
        const ranked = order(candidates, counts);
        if (ranked.length !== initial.length || ranked.some((item, index) =>
            item !== initial[index] || item.usageBias !== initialBadges[index]))
            render(ranked, false);
    } catch (error) {
        if (!controller.signal.aborted) console.warn("[TAC] Could not rank suggestions by usage", error);
    }
}

function navigateInList(textArea, event) {
    // Return if the function is deactivated in the UI or the current model is excluded due to white/blacklist settings
    if (!autocompleteActive()) return;
    if (!allowsPromptSuggestions(textArea)) {
        if (isVisible(textArea)) hideResults(textArea);
        return;
    }

    let keys = TAC_CFG.keymap;

    // Close window if Home or End is pressed while not a keybinding, since it would break completion on leaving the original tag
    if ((event.key === "Home" || event.key === "End") && !Object.values(keys).includes(event.key)) {
        hideResults(textArea);
        return;
    }

    // All set keys that are not None or empty are valid
    // Default keys are: ArrowUp, ArrowDown, PageUp, PageDown, Home, End, Enter, Tab, Escape
    validKeys = Object.values(keys).filter(x => x !== "None" && x !== "");

    if (!validKeys.includes(event.key)) return;
    if (!isVisible(textArea)) return
    // Add modifier keys to base as text+.
    let modKey = "";
    if (event.ctrlKey) modKey += "Ctrl+";
    if (event.altKey) modKey += "Alt+";
    if (event.shiftKey) modKey += "Shift+";
    if (event.metaKey) modKey += "Meta+";
        modKey += event.key;
    if (displayedValues.get(textArea) !== textArea.value) {
        if (modKey === keys["Close"]) hideResults(textArea);
        return;
    }

    oldSelectedTag = selectedTag;

    switch (modKey) {
        case keys["MoveUp"]:
            if (selectedTag === null) {
                selectedTag = resultCount - 1;
            } else {
                selectedTag = (selectedTag - 1 + resultCount) % resultCount;
            }
            break;
        case keys["MoveDown"]:
            if (selectedTag === null) {
                selectedTag = 0;
            } else {
                selectedTag = (selectedTag + 1) % resultCount;
            }
            break;
        case keys["JumpUp"]:
            if (selectedTag === null || selectedTag === 0) {
                selectedTag = resultCount - 1;
            } else {
                selectedTag = (Math.max(selectedTag - 5, 0) + resultCount) % resultCount;
            }
            break;
        case keys["JumpDown"]:
            if (selectedTag === null || selectedTag === resultCount - 1) {
                selectedTag = 0;
            } else {
                selectedTag = Math.min(selectedTag + 5, resultCount - 1) % resultCount;
            }
            break;
        case keys["JumpToStart"]:
            if (TAC_CFG.includeEmbeddingsInNormalResults &&
                selectedTag > resultCountBeforeNormalTags &&
                resultCountBeforeNormalTags > 0
            ) {
                selectedTag = resultCountBeforeNormalTags;
            } else {
                selectedTag = 0;
            }
            break;
        case keys["JumpToEnd"]:
            // Jump to the end of the list, or the end of embeddings if they are included in the normal results
            if (TAC_CFG.includeEmbeddingsInNormalResults &&
                selectedTag < resultCountBeforeNormalTags &&
                resultCountBeforeNormalTags > 0
            ) {
                selectedTag = Math.min(resultCountBeforeNormalTags, resultCount - 1);
            } else {
                selectedTag = resultCount - 1;
            }
            break;
        case keys["ChooseSelected"]:
            if (selectedTag !== null) {
                insertTextAtCursor(textArea, results[selectedTag], tagword);
            } else {
                hideResults(textArea);
                return;
            }
            break;
        case keys["ChooseFirstOrSelected"]:
            let withoutChoice = false;
            if (selectedTag === null) {
                selectedTag = 0;
                withoutChoice = true;
            } else if (TAC_CFG.wildcardCompletionMode === "To next folder level") {
                withoutChoice = true;
            }
            insertTextAtCursor(textArea, results[selectedTag], tagword, withoutChoice);
            break;
        case keys["Close"]:
            hideResults(textArea);
            break;
        default:
            if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return;
    }
    let moveKeys = [keys["MoveUp"], keys["MoveDown"], keys["JumpUp"], keys["JumpDown"], keys["JumpToStart"], keys["JumpToEnd"]];
    if (selectedTag === resultCount - 1 && moveKeys.includes(event.key)) {
        addResultsToList(textArea, results, tagword, false);
    }
    // Update highlighting
    if (selectedTag !== null)
        updateSelectionStyle(textArea, selectedTag, oldSelectedTag);

    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();
}

async function refreshTacTempFiles(api = false) {
    const reload = async () => {
        wildcardFiles = [];
        wildcardExtFiles = [];
        umiWildcards = [];
        embeddings = [];
        loras = [];
        lycos = [];
        modelKeywordDict.clear();
        await processQueue(QUEUE_FILE_LOAD, null);

        console.log("TAC: Refreshed temp files");
    }
    
    if (api) {
        await postTacAPI("/lobe/autocomplete/refresh-temp-files");
        await reload();
    } else {
        setTimeout(async () => {
            await reload();
        }, 2000);
    }
}

async function refreshEmbeddings() {
    await postTacAPI("/lobe/autocomplete/refresh-embeddings", null);
    embeddings = [];
    await processQueue(QUEUE_FILE_LOAD, null);
    console.log("TAC: Refreshed embeddings");
}

function addAutocompleteToArea(area) {
    if (!TAC_CFG || !area?.parentNode) return;

    // Only add listeners once
    if (!area.classList.contains('autocomplete')) {
        // Add our new element
        var resultsDiv = createResultsDiv(area);
        area.parentNode.insertBefore(resultsDiv, area.nextSibling);
        // Hide by default so it doesn't show up on page load
        hideResults(area);

        // Debounced handlers per textarea to avoid shared timeout interference
        let autocompleteTimer;
        const debouncedUpdateRuby = debounce(() => updateRuby(area, area.value), 300);
        area.addEventListener('focus', () => areaTags.set(area, promptTags(area.value)));

        // Add autocomplete event listener
        let forwardedInput;
        const onInput = (e) => {
            // Cancel autocomplete itself if the event has no inputType (e.g. because it was triggered by the updateInput() function)
            if (!e.inputType && !tacSelfTrigger) return;
            // A self trigger (e.g. a wildcard file was just inserted, to show its contents) runs right away, as upstream:
            // insertTextAtCursor records the new prompt's tags right after this event, so a debounced run would find
            // no change and show nothing
            const isSelfTrigger = !e.inputType;
            tacSelfTrigger = false;
            if (!autocompleteActive()) {
                checkKeywordInsertionUndo(area, e);
                return;
            }

            // Block hide we are composing (IME), so enter doesn't close the results
            if (e.isComposing) {
                hideBlocked = true;
                setTimeout(() => { hideBlocked = false; }, 100);
            }

            const isDelete = e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward';

            clearTimeout(autocompleteTimer);
            activeSearch?.controller.abort();
            if (!isDelete && TAC_CFG.translation.liveTranslation) debouncedUpdateRuby();
            if (!isAreaEnabled(getTextAreaIdentifier(area)) || !allowsPromptSuggestions(area)) {
                if (isVisible(area)) hideResults(area);
                return;
            }
            if (isSelfTrigger) void autocomplete(area, area.value);
            else {
                const wait = lobeAutocompleteOptions()?.mode === "lobe" ? 75
                    : isDelete || !isVisible(area) ? 0 : Math.min(TAC_CFG.delayTime, 24);
                autocompleteTimer = setTimeout(() => void autocomplete(area, area.value), wait);
            }
            checkKeywordInsertionUndo(area, e);
        };
        area.addEventListener('lobe:prompt-input', (event) => {
            forwardedInput = area.value;
            onInput(event.detail);
        });
        area.addEventListener('input', (event) => {
            if (forwardedInput !== undefined && !event.isTrusted && event.inputType && area.value === forwardedInput) {
                forwardedInput = undefined;
                return;
            }
            forwardedInput = undefined;
            onInput(event);
        });
        // Add focusout event listener
        area.addEventListener('focusout', debounce(() => {
            if (!hideBlocked && area.getRootNode().activeElement !== area)
                hideResults(area);
        }, 400));
        // Prompt formatter on leaving the textbox. Clicking a result also blurs the textbox,
        // and that click must not reformat the prompt before the tag is inserted.
        let clickingResult = false;
        resultsDiv.addEventListener('mousedown', () => {
            clickingResult = true;
            setTimeout(() => { clickingResult = false; }, 0);
        });
        area.addEventListener('focusout', () => {
            clearTimeout(autocompleteTimer);
            if (activeSearch?.area === area) activeSearch.controller.abort();
            if (!clickingResult && TAC_CFG.formatMode === "Automatic (on blur)" && isEnabled())
                formatPromptArea(area);
        });
        // Add up and down arrow event listener, plus the Alt+Shift+F formatter shortcut
        area.addEventListener('keydown', (e) => {
            if (e.code === "KeyF" && e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey
                && TAC_CFG.formatMode !== "Off" && isEnabled()) {
                e.preventDefault();
                hideResults(area);
                formatPromptArea(area);
                return;
            }
            navigateInList(area, e);
        });
        // CompositionEnd fires after the user has finished IME composing
        // We need to block hide here to prevent the enter key from insta-closing the results
        area.addEventListener('compositionend', () => {
            hideBlocked = true;
            setTimeout(() => { hideBlocked = false; }, 100);
        });

        // Add class so we know we've already added the listeners
        area.classList.add('autocomplete');
    }
}

// One-time setup, triggered from onUiUpdate
async function setup() {
    // Load external files needed by completion extensions (parallel for speed)
    const externalFiles = fetchTacAPI("/lobe/autocomplete/prepare")
        .then((state) => state?.ready ? processQueueParallel(QUEUE_FILE_LOAD, null) : undefined)
        .catch(error => console.warn("[Lobe Autocomplete] Could not initialize model and wildcard sources", error));

    // Find all textareas
    let textAreas = getTextAreas();

    // Add mutation observer to accordions inside a base that has onDemand set to true
    addOnDemandObservers(addAutocompleteToArea);

    // Add change listener to our quicksettings to change our internal config without the apply button for them
    let quicksettings = gradioApp().querySelector('#quicksettings');
    let commonQueryPart = "[id^=setting_tac] > label";
    quicksettings?.querySelectorAll(`${commonQueryPart} input, ${commonQueryPart} textarea, ${commonQueryPart} select`).forEach(e => {
        e.addEventListener("change", () => {
            setTimeout(async () => { 
                await syncOptions();
            }, 500);
        });
    });
    quicksettings?.querySelectorAll(`[id^=setting_tac].gradio-dropdown input`).forEach(e => {
        observeElement(e, "value", () => {
            setTimeout(async () => { 
                await syncOptions();
            }, 500);
        })
    });
    // Listener for internal temp files refresh button
    gradioApp().querySelector("#refresh_tac_refreshTempFiles")?.addEventListener("click", refreshTacTempFiles);

    // Also add listener for external network refresh button (plus triggering python code)
    let alreadyAdded = new Set();
    ["#img2img_extra_refresh", "#txt2img_extra_refresh", ".extra-network-control--refresh"].forEach(e => {
        const elems = gradioApp().querySelectorAll(e);
        elems.forEach(elem => {
            if (!elem || alreadyAdded.has(elem)) return;

            alreadyAdded.add(elem);
            elem.addEventListener("click", ()=>{
                refreshTacTempFiles(true);
            });
        });
    })

    // Add mutation observer for the model hash text to also allow hash-based blacklist again
    let modelHashText = gradioApp().querySelector("#sd_checkpoint_hash");
    updateModelName();
    if (modelHashText) {
        currentModelHash = modelHashText.title
        updateAnimaCheckpointStatus();
        let modelHashObserver = new MutationObserver((mutationList, observer) => {
            for (const mutation of mutationList) {
                if (mutation.type === "attributes" && mutation.attributeName === "title") {
                    currentModelHash = mutation.target.title;
                    updateModelName();
                    updateAnimaCheckpointStatus();
                    refreshEmbeddings();
                }
            }
        });
        modelHashObserver.observe(modelHashText, { attributes: true });
    }

    // Not found, we're on a page without prompt textareas
    if (textAreas.every(v => v === null || v === undefined)) return;
    // Already added or unnecessary to add
    if (gradioApp().querySelector('.autocompleteParent.p')) {
        if (gradioApp().querySelector('.autocompleteParent.n') || !TAC_CFG.activeIn.negativePrompts) {
            return;
        }
    } else if (!TAC_CFG.activeIn.txt2img && !TAC_CFG.activeIn.img2img) {
        return;
    }

    textAreas.forEach(area => addAutocompleteToArea(area));

    // Add style to dom
    let acStyle = document.createElement('style');
    let mode = (document.querySelector(".dark") || gradioApp().querySelector(".dark")) ? 0 : 1;
    // Check if we are on webkit
    let browser = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? "firefox" : "other";

    let css = autocompleteCSS;
    // Replace vars with actual values (can't use actual css vars because of the way we inject the css)
    Object.keys(styleColors).forEach((key) => {
        css = css.replaceAll(`var(${key})`, styleColors[key][mode]);
    })
    Object.keys(browserVars).forEach((key) => {
        css = css.replaceAll(`var(${key})`, browserVars[key][browser]);
    })

    if (acStyle.styleSheet) {
        acStyle.styleSheet.cssText = css;
    } else {
        acStyle.appendChild(document.createTextNode(css));
    }
    acStyle.id = "lobe-autocomplete-engine-style";
    document.getElementById(acStyle.id)?.remove();
    document.head.appendChild(acStyle);

    // Callback
    await externalFiles;
    await processQueue(QUEUE_AFTER_SETUP, null);

    // Preload tags immediately so first autocomplete feels instant
    windowDispatchTagLoaded();
    if (!TAC_CFG.activeIn.global || lobeAutocompleteOptions()?.mode === "off") return;
    if (!tagsLoaded) void ensureTagsLoaded().catch(console.error);
}

var tacLoading = false;

// Mirror applied settings to our internal config. Forge Neo calls this every time the
// settings JSON is written, even if nothing changed, so compare our own options first.
let lastTacOptions = null;
onOptionsChanged(() => {
    if (typeof opts === "undefined" || !opts.tac_keymap) return;
    const tacOptions = JSON.stringify(Object.entries(opts).filter(([key]) => key.startsWith("tac_")));
    if (tacOptions === lastTacOptions) return;
    lastTacOptions = tacOptions;
    if (TAC_CFG) void syncOptions().catch(console.error);
});

async function initializeAutocomplete() {
    if (tacLoading || typeof opts === "undefined" || !opts.tac_keymap) return;
    // Fast-exit when already initialized and mounted without scanning third-party textareas.
    if (TAC_CFG) {
        if (gradioApp().querySelector('.autocompleteParent')) return;
        TAC_CFG = null;
        dictionaryWorker?.close();
        dictionaryWorker = undefined;
        localTagLoad = undefined;
        allTags = [];
        tagIndex = new Map();
        tagsLoaded = false;
        embeddings = [];
        loras = [];
        lycos = [];
    }
    if (!getTextAreas().length) return;
    tacLoading = true;
    try {
        await syncOptions();
        await setup();
    } catch (error) {
        console.warn("[Lobe Autocomplete] Initialization failed", error);
    } finally {
        tacLoading = false;
    }
}

// ext_chants.js
(() => {
const CHANT_REGEX = /<(?!e:|h:|l:)[^,> ]*>?/g;
const CHANT_TRIGGER = () => TAC_CFG.chantFile && TAC_CFG.chantFile !== "None" && tagword.match(CHANT_REGEX);

class ChantParser extends BaseTagParser {
    parse() {
        // Show Chant
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<c:") {
            let searchTerm = tagword.replace("<chant:", "").replace("<c:", "").replace("<", "");
            const regex = new RegExp(escapeRegExp(searchTerm, true), 'i');
            tempResults = chants.filter(x => regex.test(x.terms) || regex.test(x.name)); // Filter by tagword
        } else {
            tempResults = chants;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t.content.trim(), ResultType.chant)
            result.meta = "Chant";
            result.aliases = t.name;
            result.category = t.color;
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load() {
    if (TAC_CFG.chantFile && TAC_CFG.chantFile !== "None") {
        try {
            const entries = await readFile(`${tagBasePath}/${encodeURIComponent(TAC_CFG.chantFile)}`, true);
            chants = Array.isArray(entries) ? entries : [];
        } catch (e) {
            console.error("Error loading chants.json: " + e);
        }
    } else {
        chants = [];
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.chant) {
        return text;
    }
    return null;
}

PARSERS.push(new ChantParser(CHANT_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);
QUEUE_AFTER_CONFIG_CHANGE.push(load);
})();

// ext_embeddings.js
(() => {
const EMB_REGEX = /<(?!l:|h:|c:)[^,> ]*>?/g;
const EMB_TRIGGER = () => TAC_CFG.useEmbeddings && (tagword.match(EMB_REGEX) || TAC_CFG.includeEmbeddingsInNormalResults);

class EmbeddingParser extends BaseTagParser {
    parse() {
        // Show embeddings
        let tempResults = [];
        if (tagword !== "<" && tagword !== "<e:") {
            let searchTerm = tagword.replace("<e:", "").replace("<", "");
            let versionString;
            if (searchTerm.startsWith("v1") || searchTerm.startsWith("v2")) {
                versionString = searchTerm.slice(0, 2);
                searchTerm = searchTerm.slice(2);
            } else if (searchTerm.startsWith("vxl")) {
                versionString = searchTerm.slice(0, 3);
                searchTerm = searchTerm.slice(3);
            }

            const regex = new RegExp(escapeRegExp(searchTerm, true), 'i');
            let filterCondition = x => regex.test(x[0]) || regex.test(x[0].replaceAll(" ", "_"));

            if (versionString)
                tempResults = embeddings.filter(x => filterCondition(x) && x[2] && x[2].toLowerCase() === versionString.toLowerCase()); // Filter by tagword
            else
                tempResults = embeddings.filter(x => filterCondition(x)); // Filter by tagword
        } else {
            tempResults = embeddings;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let lastDot = t[0].lastIndexOf(".") > -1 ? t[0].lastIndexOf(".") : t[0].length;
            let lastSlash = t[0].lastIndexOf("/") > -1 ? t[0].lastIndexOf("/") : -1;
            let name = t[0].trim().substring(lastSlash + 1, lastDot);

            let result = new AutocompleteResult(name, ResultType.embedding)
            result.sortKey = t[1];
            result.meta = t[2] + " Embedding";
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load() {
    if (embeddings.length === 0) {
        try {
            embeddings = (await loadCSV(`${tagBasePath}/temp/emb.txt`))
                .filter(x => x[0]?.trim().length > 0) // Remove empty lines
                .map(x => [x[0].trim(), x[1], x[2]]); // Return name, sortKey, hash tuples
        } catch (e) {
            console.error("Error loading embeddings.txt: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.embedding) {
        return text;
    }
    return null;
}

PARSERS.push(new EmbeddingParser(EMB_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);
})();

// ext_loras.js
(() => {
const LORA_REGEX = /<(?!e:|h:|c:)[^,> ]*>?/g;
const LORA_TRIGGER = () => TAC_CFG.useLoras && tagword.match(LORA_REGEX);

// Architecture labels scripts/lora_arch.py can assign (lora_arch.LABELS); keep the two in step.
// A UI preset outside this list turns the architecture filter off instead of hiding every LoRA.
const LORA_ARCH_LABELS = new Set([
    "sd", "xl", "flux", "klein", "qwen", "qwen21", "lumina", "zit", "wan", "anima", "ernie", "pid",
    "krea", "moss", "fibo2", "flux3", "h3", "ideogram4", "yue2",
]);
const LORA_ARCH_SEPARATOR = " " + String.fromCharCode(0xb7) + " ";

// Forge Neo's UI preset, when the architecture filter can use it; null turns the filter off.
function currentLoraArchPreset() {
    if (!TAC_CFG.loraArchFilter || TAC_CFG.loraArchFilter === "Off") return null;
    const value = currentUiPreset();
    return value && LORA_ARCH_LABELS.has(value) ? value : null;
}

// 0 = matches the preset, 1 = unknown architecture (or no filter), 2 = another architecture.
function loraArchRank(arch, preset) {
    if (!preset || !arch || arch.size === 0) return 1;
    return arch.has(preset) ? 0 : 2;
}

class LoraParser extends BaseTagParser {
    parse() {
        // Show lora
        let tempResults = [];
        // Determine search term:
        // - "<lora:X" or "<l:X" -> search term is X
        // - "<" / "<l" / "<lo" / "<lor" / "<lora" -> user still typing the prefix, show all
        // - "<X" (other) -> direct search for X
        let searchTerm;
        if (tagword.startsWith("<lora:")) {
            searchTerm = tagword.slice("<lora:".length);
        } else if (tagword.startsWith("<l:")) {
            searchTerm = tagword.slice("<l:".length);
        } else {
            const raw = tagword.slice(1); // strip leading "<"
            // If raw is a prefix of "lora" the user is still typing the keyword -> show all
            searchTerm = "lora".startsWith(raw) ? "" : raw;
        }
        if (searchTerm.length > 0) {
            const regex = new RegExp(escapeRegExp(searchTerm, true), 'i');
            tempResults = loras.filter(x => regex.test(x[0]) || regex.test(x[0].replaceAll(" ", "_"))); // Filter by tagword
        } else {
            tempResults = loras;
        }

        // Add final results
        const preset = currentLoraArchPreset();
        const hideOthers = TAC_CFG.loraArchFilter === "Hide other architectures";
        let finalResults = [];
        tempResults.forEach(t => {
            const archRank = loraArchRank(t[3], preset);
            if (archRank === 2 && hideOthers) return;

            const text = t[0].trim();
            let lastDot = text.lastIndexOf(".") > -1 ? text.lastIndexOf(".") : text.length;
            let lastSlash = text.lastIndexOf("/") > -1 ? text.lastIndexOf("/") : -1;
            let name = text.substring(lastSlash + 1, lastDot);

            let result = new AutocompleteResult(name, ResultType.lora)
            result.meta = "Lora";
            // With the filter on, name every architecture that is not the preset's
            // (others only survive "Show matching first"), and mark unknown ones.
            if (archRank === 2) result.meta += LORA_ARCH_SEPARATOR + [...t[3]].join("/");
            else if (archRank === 1 && preset) result.meta += LORA_ARCH_SEPARATOR + "unknown";
            result.sortKey = t[1];
            result.hash = t[2];
            result.archRank = archRank;
            finalResults.push(result);
        });

        return finalResults;
    }
}

// Maps stem (display name) -> alias from Forge Neo safetensors metadata.
// Alias is what Forge Neo actually uses to reference a LoRA at runtime.
const loraAliasMap = {};

async function load() {
    if (loras.length === 0) {
        try {
            const rows = (await loadCSV(`${tagBasePath}/temp/lora.txt`))
                .filter(x => x[0]?.trim().length > 0); // Remove empty lines
            // Column 5: architectures joined with "|", empty when unknown (missing in old files)
            loras = rows.map(x => [x[0]?.trim(), x[1], x[2], new Set((x[4]?.trim() || "").split("|").filter(Boolean))]);
            // Build stem -> alias lookup from column 4
            for (const x of rows) {
                const path = x[0]?.trim();
                const alias = x[3]?.trim();
                if (path && alias) {
                    const lastDot = path.lastIndexOf(".") > -1 ? path.lastIndexOf(".") : path.length;
                    const lastSlash = path.lastIndexOf("/") > -1 ? path.lastIndexOf("/") : -1;
                    const stem = path.substring(lastSlash + 1, lastDot);
                    loraAliasMap[stem] = alias;
                }
            }
        } catch (e) {
            console.error("Error loading lora.txt: " + e);
        }
    }
}

async function sanitize(tagType, text) {
    if (tagType === ResultType.lora) {
        let multiplier = TAC_CFG.extraNetworksDefaultMultiplier;
        let info = await fetchLoraInfoCached(text);
        if (info && info["preferred weight"]) {
            multiplier = info["preferred weight"];
        }
        // Use Forge Neo alias if available; fallback to stem (display name)
        const insertName = loraAliasMap[text] ?? text;
        return `<lora:${insertName}:${multiplier}>`;
    }
    return null;
}

PARSERS.push(new LoraParser(LORA_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);
})();

// ext_lycos.js
(() => {
const LYCO_REGEX = /<(?!e:|h:|c:)[^,> ]*>?/g;
const LYCO_TRIGGER = () => TAC_CFG.useLycos && tagword.match(LYCO_REGEX);

class LycoParser extends BaseTagParser {
    parse() {
        // Show lyco
        let tempResults = [];
        // Determine search term:
        // - "<lyco:X" or "<lora:X" or "<l:X" -> search term is X
        // - "<" / "<l" / "<ly" / "<lyc" / "<lyco" -> user still typing the prefix, show all
        // - "<X" (other) -> direct search for X
        let searchTerm;
        if (tagword.startsWith("<lyco:") || tagword.startsWith("<lora:")) {
            searchTerm = tagword.slice(tagword.indexOf(":") + 1);
        } else if (tagword.startsWith("<l:")) {
            searchTerm = tagword.slice("<l:".length);
        } else {
            const raw = tagword.slice(1); // strip leading "<"
            // If raw is a prefix of "lyco" the user is still typing the keyword -> show all
            searchTerm = "lyco".startsWith(raw) ? "" : raw;
        }
        if (searchTerm.length > 0) {
            const regex = new RegExp(escapeRegExp(searchTerm, true), 'i');
            tempResults = lycos.filter(x => regex.test(x[0]) || regex.test(x[0].replaceAll(" ", "_"))); // Filter by tagword
        } else {
            tempResults = lycos;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            const text = t[0].trim();
            let lastDot = text.lastIndexOf(".") > -1 ? text.lastIndexOf(".") : text.length;
            let lastSlash = text.lastIndexOf("/") > -1 ? text.lastIndexOf("/") : -1;
            let name = text.substring(lastSlash + 1, lastDot);

            let result = new AutocompleteResult(name, ResultType.lyco)
            result.meta = "Lyco";
            result.sortKey = t[1];
            result.hash = t[2];
            finalResults.push(result);
        });

        return finalResults;
    }
}

// Maps stem (display name) -> alias from Forge Neo safetensors metadata.
const lycoAliasMap = {};

async function load() {
    if (lycos.length === 0) {
        try {
            const rows = (await loadCSV(`${tagBasePath}/temp/lyco.txt`))
                .filter(x => x[0]?.trim().length > 0); // Remove empty lines
            lycos = rows.map(x => [x[0]?.trim(), x[1], x[2]]);
            // Build stem -> alias lookup from column 4
            for (const x of rows) {
                const path = x[0]?.trim();
                const alias = x[3]?.trim();
                if (path && alias) {
                    const lastDot = path.lastIndexOf(".") > -1 ? path.lastIndexOf(".") : path.length;
                    const lastSlash = path.lastIndexOf("/") > -1 ? path.lastIndexOf("/") : -1;
                    const stem = path.substring(lastSlash + 1, lastDot);
                    lycoAliasMap[stem] = alias;
                }
            }
        } catch (e) {
            console.error("Error loading lyco.txt: " + e);
        }
    }
}

async function sanitize(tagType, text) {
    if (tagType === ResultType.lyco) {
        let multiplier = TAC_CFG.extraNetworksDefaultMultiplier;
        let info = await fetchTacAPI(`/lobe/autocomplete/lyco-info/${text}`)
        if (info && info["preferred weight"]) {
            multiplier = info["preferred weight"];
        }
        // Use Forge Neo alias if available; fallback to stem (display name)
        const insertName = lycoAliasMap[text] ?? text;
        let prefix = TAC_CFG.useLoraPrefixForLycos ? "lora" : "lyco";
        return `<${prefix}:${insertName}:${multiplier}>`;
    }
    return null;
}

PARSERS.push(new LycoParser(LYCO_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);
})();

// ext_modelKeyword.js
(() => {
async function load() {
    let modelKeywordParts = ((await readFile(`${tagBasePath}/temp/modelKeywordPath.txt`)) || "").split(",")
    modelKeywordPath = modelKeywordParts[0];
    let customFileExists = modelKeywordParts[1] === "True";

    if (modelKeywordPath.length > 0 && modelKeywordDict.size === 0) {
        try {
            let csv_lines = [];
            // Only add default keywords if wanted by the user
            if (TAC_CFG.modelKeywordCompletion !== "Only user list")
                csv_lines = (await loadCSV(`${modelKeywordPath}/lora-keyword.txt`));
            // Add custom user keywords if the file exists
            if (customFileExists)
                csv_lines = csv_lines.concat((await loadCSV(`${modelKeywordPath}/lora-keyword-user.txt`)));

            if (csv_lines.length === 0) return;

            csv_lines = csv_lines.filter(x => x[0].trim().length > 0 && x[0].trim()[0] !== "#") // Remove empty lines and comments

            // Add to the dict
            csv_lines.forEach(parts => {
                const hash = parts[0];
                const keywords = parts[1]?.replaceAll("| ", ", ")?.replaceAll("|", ", ")?.trim();
                const lastSepIndex = parts[2]?.lastIndexOf("/") + 1 || parts[2]?.lastIndexOf("\\") + 1 || 0;
                const name = parts[2]?.substring(lastSepIndex).trim() || "none"

                if (modelKeywordDict.has(hash) && name !== "none") {
                    // Add a new name key if the hash already exists
                    modelKeywordDict.get(hash).set(name, keywords);
                } else {
                    // Create new hash entry
                    let map = new Map().set(name, keywords);
                    modelKeywordDict.set(hash, map);
                }
            });
        } catch (e) {
            console.error("Error loading model-keywords list: " + e);
        }
    }
}

QUEUE_FILE_LOAD.push(load);
})();

// ext_styles.js
(() => {
const STYLE_REGEX = /(\$(\d*)\(?)[^$|\[\],\s]*\)?/;
const STYLE_TRIGGER = () => TAC_CFG.useStyleVars && tagword.match(STYLE_REGEX);

var lastStyleVarIndex = "";

class StyleParser extends BaseTagParser {
   async parse() {
        // Refresh if needed
        await refreshStyleNamesIfChanged();

        // Show styles
        let tempResults = [];
        let matchGroups = tagword.match(STYLE_REGEX);
        
        // Save index to insert again later or clear last one
        lastStyleVarIndex = matchGroups[2] ? matchGroups[2] : "";

        if (tagword !== matchGroups[1]) {
            let searchTerm = tagword.replace(matchGroups[1], "");
            const regex = new RegExp(escapeRegExp(searchTerm, true), 'i');
            tempResults = styleNames.filter(x => regex.test(x[0]) || regex.test(x[0].replaceAll(" ", "_"))); // Filter by tagword
        } else {
            tempResults = styleNames;
        }

        // Add final results
        let finalResults = [];
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t[0].trim(), ResultType.styleName)
            result.meta = "Style";
            finalResults.push(result);
        });

        return finalResults;
    }
}

async function load(force = false) {
    if (styleNames.length === 0 || force) {
        try {
            styleNames = (await loadCSV(`${tagBasePath}/temp/styles.txt`))
                .filter(x => x[0]?.trim().length > 0) // Remove empty lines
                .filter(x => x[0] !== "None") // Remove "None" style
                .map(x => [x[0].trim()]); // Trim name
        } catch (e) {
            console.error("Error loading styles.txt: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.styleName) {
        if (text.includes(" ")) {
            return `$${lastStyleVarIndex}(${text})`;
        } else {
            return`$${lastStyleVarIndex}${text}`
        }
    }
    return null;
}

PARSERS.push(new StyleParser(STYLE_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);
})();

// ext_umi.js
(() => {
const UMI_PROMPT_REGEX = /<[^\s]*?\[[^,<>]*[\]|]?>?/gi;
const UMI_TAG_REGEX = /(?:\[|\||--)([^<>\[\]\-|]+)/gi;

const UMI_TRIGGER = () => TAC_CFG.useWildcards && [...tagword.matchAll(UMI_PROMPT_REGEX)].length > 0;

class UmiParser extends BaseTagParser {
    parse(textArea, prompt) {
        // We are in a UMI yaml tag definition, parse further
        let umiSubPrompts = [...prompt.matchAll(UMI_PROMPT_REGEX)];

        let umiTags = [];
        let umiTagsWithOperators = []

        const insertAt = (str,char,pos) => str.slice(0,pos) + char + str.slice(pos);

        umiSubPrompts.forEach(umiSubPrompt => {
            umiTags = umiTags.concat([...umiSubPrompt[0].matchAll(UMI_TAG_REGEX)].map(x => x[1].toLowerCase()));

            const start = umiSubPrompt.index;
            const end = umiSubPrompt.index + umiSubPrompt[0].length;
            if (textArea.selectionStart >= start && textArea.selectionStart <= end) {
                umiTagsWithOperators = insertAt(umiSubPrompt[0], '###', textArea.selectionStart - start);
            }
        });

        // Safety check since UMI parsing sometimes seems to trigger outside of an UMI subprompt and thus fails
        if (umiTagsWithOperators.length === 0) {
            return null;
        }

        const promptSplitToTags = umiTagsWithOperators.replace(']###[', '][').split("][");

        const clean = (str) => str
            .replaceAll('>', '')
            .replaceAll('<', '')
            .replaceAll('[', '')
            .replaceAll(']', '')
            .trim();

        const matches = promptSplitToTags.reduce((acc, curr) => {
            let isOptional = curr.includes("|");
            let isNegative = curr.startsWith("--");
            let out;
            if (isOptional) {
                out = {
                    hasCursor: curr.includes("###"),
                    tags: clean(curr).split('|').map(x => ({ 
                        hasCursor: x.includes("###"), 
                        isNegative: x.startsWith("--"),
                        tag: clean(x).replaceAll("###", '').replaceAll("--", '')
                    }))
                };
                acc.optional.push(out);
                acc.all.push(...out.tags.map(x => x.tag));
            } else if (isNegative) {
                out = {
                    hasCursor: curr.includes("###"),
                    tags: clean(curr).replaceAll("###", '').split('|'),
                };
                out.tags = out.tags.map(x => x.startsWith("--") ? x.substring(2) : x);
                acc.negative.push(out);
                acc.all.push(...out.tags);
            } else {
                out = {
                    hasCursor: curr.includes("###"),
                    tags: clean(curr).replaceAll("###", '').split('|'),
                };
                acc.positive.push(out);
                acc.all.push(...out.tags);
            }
            return acc;
        }, { positive: [], negative: [], optional: [], all: [] });

        //console.log({ matches })

        const filteredWildcards = (tagword) => {
            const wildcards = umiWildcards.filter(x => {
                let tags = x[1];
                const matchesNeg =
                    matches.negative.length === 0
                    || matches.negative.every(x => 
                        x.hasCursor 
                        || x.tags.every(t => !tags[t])
                    );
                if (!matchesNeg) return false;
                const matchesPos =
                    matches.positive.length === 0
                    || matches.positive.every(x =>
                        x.hasCursor
                        || x.tags.every(t => tags[t])
                    );
                if (!matchesPos) return false;
                const matchesOpt =
                    matches.optional.length === 0
                    || matches.optional.some(x =>
                        x.tags.some(t =>
                            t.hasCursor
                            || t.isNegative
                                ? !tags[t.tag]
                                : tags[t.tag]
                    ));
                if (!matchesOpt) return false;
                return true;
            }).reduce((acc, val) => {
                Object.keys(val[1]).forEach(tag => acc[tag] = acc[tag] + 1 || 1);
                return acc;
            }, {});

            return Object.entries(wildcards)
                .sort((a, b) => b[1] - a[1])
                .filter(x =>
                    x[0] === tagword
                    || !matches.all.includes(x[0])
                );
        }

        if (umiTags.length > 0) {
            // Get difference for subprompt
            let tagCountChange = umiTags.length - umiPreviousTags.length;
            let diff = difference(umiTags, umiPreviousTags);
            umiPreviousTags = umiTags;

            // Show all condition
            let showAll = tagword.endsWith("[") || tagword.endsWith("[--") || tagword.endsWith("|");

            // Exit early if the user closed the bracket manually
            if ((!diff || diff.length === 0 || (diff.length === 1 && tagCountChange < 0)) && !showAll) {
                if (!hideBlocked) hideResults(textArea);
                return;
            }

            let umiTagword = tagCountChange < 0 ? '' : diff[0] || '';
            let tempResults = [];
            if (umiTagword && umiTagword.length > 0) {
                umiTagword = umiTagword.toLowerCase().replace(/[\n\r]/g, "");
                originalTagword = tagword;
                tagword = umiTagword;
                let filteredWildcardsSorted = filteredWildcards(umiTagword);
                let searchRegex = new RegExp(`(^|[^a-zA-Z])${escapeRegExp(umiTagword)}`, 'i')
                let baseFilter = x => x[0].toLowerCase().search(searchRegex) > -1;
                let spaceIncludeFilter = x => x[0].toLowerCase().replaceAll(" ", "_").search(searchRegex) > -1;
                tempResults = filteredWildcardsSorted.filter(x => baseFilter(x) || spaceIncludeFilter(x)) // Filter by tagword

                // Add final results
                let finalResults = [];
                tempResults.forEach(t => {
                    let result = new AutocompleteResult(t[0].trim(), ResultType.umiWildcard)
                    result.count = t[1];
                    finalResults.push(result);
                });

                finalResults = finalResults.sort((a, b) => b.count - a.count);
                return finalResults;
            } else if (showAll) {
                let filteredWildcardsSorted = filteredWildcards("");

                // Add final results
                let finalResults = [];
                filteredWildcardsSorted.forEach(t => {
                    let result = new AutocompleteResult(t[0].trim(), ResultType.umiWildcard)
                    result.count = t[1];
                    finalResults.push(result);
                });

                originalTagword = tagword;
                tagword = "";

                finalResults = finalResults.sort((a, b) => b.count - a.count);
                return finalResults;
            }
        } else {
            let filteredWildcardsSorted = filteredWildcards("");

            // Add final results
            let finalResults = [];
            filteredWildcardsSorted.forEach(t => {
                let result = new AutocompleteResult(t[0].trim(), ResultType.umiWildcard)
                result.count = t[1];
                finalResults.push(result);
            });

            originalTagword = tagword;
            tagword = "";

            finalResults = finalResults.sort((a, b) => b.count - a.count);
            return finalResults;
        }
    }
}

function updateUmiTags(tagType, sanitizedText, newPrompt, textArea) {
    // If it was a umi wildcard, also update the umiPreviousTags
    if (tagType === ResultType.umiWildcard && originalTagword.length > 0) {
        let umiSubPrompts = [...newPrompt.matchAll(UMI_PROMPT_REGEX)];

        let umiTags = [];
        umiSubPrompts.forEach(umiSubPrompt => {
            umiTags = umiTags.concat([...umiSubPrompt[0].matchAll(UMI_TAG_REGEX)].map(x => x[1].toLowerCase()));
        });

        umiPreviousTags = umiTags;

        hideResults(textArea);

        return true;
    }
    return false;
}

async function load() {
    if (umiWildcards.length === 0) {
        try {
            let umiTags = (await readFile(`${tagBasePath}/temp/umi_tags.txt`)).split("\n");
            // Split into tag, count pairs
            umiWildcards = umiTags.map(x => x
                .trim()
                .split(","))
                .map(([i, ...rest]) => [
                    i,
                    rest.reduce((a, b) => {
                        a[b.toLowerCase()] = true;
                        return a;
                    }, {}),
                ]);
        } catch (e) {
            console.error("Error loading umi wildcards: " + e);
        }
    }
}

function sanitize(tagType, text) {
    // Replace underscores only if the umi tag is not using them
    if (tagType === ResultType.umiWildcard && !umiWildcards.includes(text)) {
        return text.replaceAll("_", " "); 
    }
    return null;
}

// Add UMI parser
PARSERS.push(new UmiParser(UMI_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);
QUEUE_AFTER_INSERT.push(updateUmiTags);
})();

// ext_wildcards.js
(() => {
// Regex
const WC_REGEX = new RegExp(/__([^,]+)__([^, ]*)/g);

// Trigger conditions
const WC_TRIGGER = () => TAC_CFG.useWildcards && [...tagword.matchAll(new RegExp(WC_REGEX.source.replaceAll("__", escapeRegExp(TAC_CFG.wcWrap)), "g"))].length > 0;
const WC_FILE_TRIGGER = () => TAC_CFG.useWildcards && (tagword.startsWith(TAC_CFG.wcWrap) && !tagword.endsWith(TAC_CFG.wcWrap) || tagword === TAC_CFG.wcWrap);

const wildcardContentCache = new Map();
class WildcardParser extends BaseTagParser {
    async parse() {
        // Show wildcards from a file with that name
        let wcMatch = [...tagword.matchAll(new RegExp(WC_REGEX.source.replaceAll("__", escapeRegExp(TAC_CFG.wcWrap)), "g"))];
        let wcFile = wcMatch[0][1];
        let wcWord = wcMatch[0][2];

        // Look in normal wildcard files
        let wcFound = wildcardFiles.filter(x => x[1].toLowerCase() === wcFile);
        if (wcFound.length === 0) wcFound = null;
        // Use found wildcard file or look in external wildcard files
        let wcPairs = wcFound || wildcardExtFiles.filter(x => x[1].toLowerCase() === wcFile);

        if (!wcPairs) return [];

        let wildcards = [];
        for (let i = 0; i < wcPairs.length; i++) {
            const basePath = wcPairs[i][0];
            const fileName = wcPairs[i][1];
            if (!basePath || !fileName) return;

            // YAML wildcards are already loaded as json, so we can get the values directly.
            // basePath is the name of the file in this case, and fileName the key
            if (basePath.endsWith(".yaml")) {
                const getDescendantProp = (obj, desc) => {
                    const arr = desc.split("/");
                    while (arr.length) {
                      obj = obj[arr.shift()];
                    }
                    return obj;
                }
                wildcards = wildcards.concat(getDescendantProp(yamlWildcards[basePath], fileName));
            } else {
                const query = new URLSearchParams({ basepath: basePath, filename: fileName + ".txt" });
                const cacheKey = `${basePath}/${fileName}`;
                const cached = wildcardContentCache.get(cacheKey);
                let lines;
                if (cached && Date.now() - cached.at < 30000) {
                    lines = cached.lines;
                } else {
                    lines = ((await fetchTacAPI(`/lobe/autocomplete/wildcard-contents?${query}`, false, true)) || "")
                        .split("\n")
                        .filter(x => x.trim().length > 0 && !x.startsWith('#'));  // Remove empty lines and comments
                    wildcardContentCache.set(cacheKey, { at: Date.now(), lines });
                }
                wildcards = wildcards.concat(lines);
            }
        }

        if (TAC_CFG.sortWildcardResults)
            wildcards.sort((a, b) => a.localeCompare(b));

        let finalResults = [];
        let tempResults = wildcards.filter(x => (wcWord !== null && wcWord.length > 0) ? x.toLowerCase().includes(wcWord) : x) // Filter by tagword
        tempResults.forEach(t => {
            let result = new AutocompleteResult(t.trim(), ResultType.wildcardTag);
            result.meta = wcFile;
            finalResults.push(result);
        });

        return finalResults;
    }
}

class WildcardFileParser extends BaseTagParser {
    parse() {
        // Show available wildcard files
        let tempResults = [];
        if (tagword !== TAC_CFG.wcWrap) {
            let lmb = (x) => x[1].toLowerCase().includes(tagword.replace(TAC_CFG.wcWrap, ""))
            tempResults = wildcardFiles.filter(lmb).concat(wildcardExtFiles.filter(lmb)) // Filter by tagword
        } else {
            tempResults = wildcardFiles.concat(wildcardExtFiles);
        }

        let finalResults = [];
        const alreadyAdded = new Map();
        // Get final results
        tempResults.forEach(wcFile => {
            // Skip duplicate entries incase multiple files have the same name or yaml category
            if (alreadyAdded.has(wcFile[1])) return;

            let result = null;
            if (wcFile[0].endsWith(".yaml")) {
                result = new AutocompleteResult(wcFile[1].trim(), ResultType.yamlWildcard);
                result.meta = "YAML wildcard collection";
            } else {
                result = new AutocompleteResult(wcFile[1].trim(), ResultType.wildcardFile);
                result.meta = "Wildcard file";
                result.sortKey = wcFile[2]?.trim() || wcFile[1];
            }

            finalResults.push(result);
            alreadyAdded.set(wcFile[1], true);
        });

        finalResults.sort(getSortFunction());

        return finalResults;
    }
}

async function load() {
    if (wildcardFiles.length === 0 && wildcardExtFiles.length === 0) {
        try {
            let wcFileArr = await loadCSV(`${tagBasePath}/temp/wc.txt`);
            if (wcFileArr && wcFileArr.length > 0) {
                let wcBasePath = wcFileArr[0][0].trim(); // First line should be the base path
                wildcardFiles = wcFileArr.slice(1)
                    .filter(x => x[0]?.trim().length > 0) //Remove empty lines
                    .map(x => [wcBasePath, x[0]?.trim().replace(".txt", ""), x[1]]); // Remove file extension & newlines
            }

            // To support multiple sources, we need to separate them using the provided "-----" strings
            let wcExtFileArr = await loadCSV(`${tagBasePath}/temp/wce.txt`);
            let splitIndices = [];
            for (let index = 0; index < wcExtFileArr.length; index++) {
                if (wcExtFileArr[index][0].trim() === "-----") {
                    splitIndices.push(index);
                }
            }
            // For each group, add them to the wildcardFiles array with the base path as the first element
            for (let i = 0; i < splitIndices.length; i++) {
                let start = splitIndices[i - 1] || 0;
                if (i > 0) start++; // Skip the "-----" line
                let end = splitIndices[i];

                let wcExtFile = wcExtFileArr.slice(start, end);
                if (wcExtFile && wcExtFile.length > 0) {
                    let base = wcExtFile[0][0].trim() + "/";
                    wcExtFile = wcExtFile.slice(1)
                        .filter(x => x[0]?.trim().length > 0) //Remove empty lines
                        .map(x => [base, x[0]?.trim().replace(base, "").replace(".txt", ""), x[1]]);
                    wildcardExtFiles.push(...wcExtFile);
                }
            }

            // Load the yaml wildcard json file and append it as a wildcard file, appending each key as a path component until we reach the end
            yamlWildcards = await readFile(`${tagBasePath}/temp/wc_yaml.json`, true);

            // Append each key as a path component until we reach a leaf
            Object.keys(yamlWildcards).forEach(file => {
                const flattened = flatten(yamlWildcards[file], [], "/");
                Object.keys(flattened).forEach(key => {
                    wildcardExtFiles.push([file, key]);
                });
            });
        } catch (e) {
            console.error("Error loading wildcards: " + e);
        }
    }
}

function sanitize(tagType, text) {
    if (tagType === ResultType.wildcardFile || tagType === ResultType.yamlWildcard) {
        return `${TAC_CFG.wcWrap}${text}${TAC_CFG.wcWrap}`;
    } else if (tagType === ResultType.wildcardTag) {
        return text;
    }
    return null;
}

function keepOpenIfWildcard(tagType, sanitizedText, newPrompt, textArea) {
    // If it's a wildcard, we want to keep the results open so the user can select another wildcard
    if (tagType === ResultType.wildcardFile || tagType === ResultType.yamlWildcard) {
        hideBlocked = true;
        setTimeout(() => { hideBlocked = false; }, 450);
        return true;
    }
    return false;
}

// Register the parsers
PARSERS.push(new WildcardParser(WC_TRIGGER));
PARSERS.push(new WildcardFileParser(WC_FILE_TRIGGER));

// Add our utility functions to their respective queues
QUEUE_FILE_LOAD.push(load);
QUEUE_SANITIZE.push(sanitize);
QUEUE_AFTER_INSERT.push(keepOpenIfWildcard);
})();

window.dispatchEvent(new Event("lobe:autocomplete-ready"));
document.addEventListener("focusin", attachAdditionalPrompt, true);
onUiUpdate(initializeAutocomplete);
onOptionsChanged(initializeAutocomplete);
void initializeAutocomplete();
})();
