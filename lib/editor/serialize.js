/*
 * Article body serialisation.
 *
 * Two on-disk formats exist in Firestore:
 *
 *   legacy  EditorJS output -- { time, blocks: [...], version }
 *   current Tiptap/ProseMirror doc -- { type: 'doc', content: [...] }
 *
 * Both are turned into HTML here by plain string building rather than by
 * Tiptap's generateHTML, which needs a DOM (and therefore happy-dom) on the
 * server. Keeping it string-based means the blog can server-render article
 * bodies for SEO with no extra dependency.
 */

const VOID = new Set(['br', 'hr', 'img']);

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(url) {
  const trimmed = String(url ?? '').trim();
  return /^(https?:|mailto:|\/)/i.test(trimmed) ? escapeHtml(trimmed) : '';
}

/*
 * EditorJS stored inline formatting as raw HTML inside block text, so legacy
 * bodies carry markup we did not generate. Keep an allow-list of inline tags
 * and escape everything else -- this is the one place untrusted markup enters.
 */
const INLINE_ALLOWED = new Set(['b', 'strong', 'i', 'em', 'u', 's', 'mark', 'code', 'br', 'a']);

export function sanitizeInline(html) {
  let out = '';
  let last = 0;
  const open = [];
  const tag = /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let m;

  while ((m = tag.exec(html)) !== null) {
    out += escapeHtml(html.slice(last, m.index));
    last = tag.lastIndex;

    const closing = m[1] === '/';
    const name = m[2].toLowerCase();
    if (!INLINE_ALLOWED.has(name)) continue;

    if (closing) {
      const at = open.lastIndexOf(name);
      if (at !== -1) { open.splice(at, 1); out += `</${name}>`; }
      continue;
    }

    if (name === 'br') { out += '<br>'; continue; }

    if (name === 'a') {
      const href = safeUrl((/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(m[3]) || [])
        .slice(2).find(Boolean));
      if (!href) continue;
      open.push('a');
      out += `<a href="${href}" rel="noopener noreferrer nofollow">`;
      continue;
    }

    open.push(name);
    out += `<${name}>`;
  }

  out += escapeHtml(html.slice(last));
  while (open.length) out += `</${open.pop()}>`;
  return out;
}

function el(tag, attrs, inner) {
  const a = Object.entries(attrs || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
    .join('');
  return VOID.has(tag) ? `<${tag}${a}>` : `<${tag}${a}>${inner ?? ''}</${tag}>`;
}

/* ---------------------------------------------------------------- Tiptap -- */

const MARK_TAG = {
  bold: 'strong', italic: 'em', strike: 's', underline: 'u',
  code: 'code', highlight: 'mark'
};

function tiptapText(node) {
  let html = escapeHtml(node.text);
  for (const mark of [...(node.marks || [])].reverse()) {
    if (mark.type === 'link') {
      const href = safeUrl(mark.attrs?.href);
      html = href ? `<a href="${href}" rel="noopener noreferrer nofollow">${html}</a>` : html;
    } else if (MARK_TAG[mark.type]) {
      html = `<${MARK_TAG[mark.type]}>${html}</${MARK_TAG[mark.type]}>`;
    }
  }
  return html;
}

function tiptapChildren(node) {
  return (node.content || []).map(tiptapNode).join('');
}

function tiptapNode(node) {
  if (!node || typeof node !== 'object') return '';
  const kids = () => tiptapChildren(node);

  switch (node.type) {
    case 'doc':            return kids();
    case 'text':           return tiptapText(node);
    case 'paragraph':      return el('p', null, kids());
    case 'heading':        return el(`h${Math.min(Math.max(node.attrs?.level || 2, 1), 6)}`, null, kids());
    case 'bulletList':     return el('ul', null, kids());
    case 'orderedList':    return el('ol', { start: node.attrs?.start > 1 ? node.attrs.start : undefined }, kids());
    case 'listItem':       return el('li', null, kids());
    case 'taskList':       return el('ul', { 'data-type': 'taskList' }, kids());
    case 'taskItem':       return el('li', { 'data-type': 'taskItem', 'data-checked': node.attrs?.checked ? 'true' : 'false' }, kids());
    case 'blockquote':     return el('blockquote', null, kids());
    case 'codeBlock':      return el('pre', null, el('code', { class: node.attrs?.language ? `language-${node.attrs.language}` : undefined }, escapeHtml((node.content || []).map((c) => c.text || '').join(''))));
    case 'horizontalRule': return el('hr');
    case 'hardBreak':      return el('br');
    case 'image':          return safeUrl(node.attrs?.src) ? el('img', { src: safeUrl(node.attrs.src), alt: node.attrs?.alt || '', title: node.attrs?.title || undefined, loading: 'lazy' }) : '';
    case 'table':          return el('table', null, kids());
    case 'tableRow':       return el('tr', null, kids());
    case 'tableCell':      return el('td', { colspan: node.attrs?.colspan, rowspan: node.attrs?.rowspan }, kids());
    case 'tableHeader':    return el('th', { colspan: node.attrs?.colspan, rowspan: node.attrs?.rowspan }, kids());
    default:               return kids();
  }
}

export function tiptapToHtml(doc) {
  return doc ? tiptapNode(doc) : '';
}

/* --------------------------------------------------------------- EditorJS -- */

function legacyList(items, ordered) {
  const body = (items || []).map((item) => {
    // v1 stored plain strings; later versions store { content, items } objects.
    if (typeof item === 'string') return el('li', null, sanitizeInline(item));
    const nested = item?.items?.length ? legacyList(item.items, ordered) : '';
    return el('li', null, sanitizeInline(item?.content ?? '') + nested);
  }).join('');
  return el(ordered ? 'ol' : 'ul', null, body);
}

function legacyBlock(block) {
  const d = block?.data || {};

  switch (block?.type) {
    case 'paragraph':   return el('p', null, sanitizeInline(d.text));
    case 'header':      return el(`h${Math.min(Math.max(d.level || 2, 1), 6)}`, null, sanitizeInline(d.text));
    case 'list':        return legacyList(d.items, d.style === 'ordered');
    case 'checklist':   return el('ul', { 'data-type': 'taskList' }, (d.items || []).map((i) =>
                                 el('li', { 'data-type': 'taskItem', 'data-checked': i?.checked ? 'true' : 'false' }, sanitizeInline(i?.text))).join(''));
    case 'quote':       return el('blockquote', null, el('p', null, sanitizeInline(d.text)) + (d.caption ? el('cite', null, sanitizeInline(d.caption)) : ''));
    case 'code':        return el('pre', null, el('code', null, escapeHtml(d.code)));
    case 'delimiter':   return el('hr');
    case 'warning':     return el('blockquote', null, (d.title ? el('strong', null, sanitizeInline(d.title)) : '') + el('p', null, sanitizeInline(d.message)));
    case 'table':       return el('table', null, (d.content || []).map((row, i) =>
                                 el('tr', null, (row || []).map((cell) =>
                                   el(d.withHeadings && i === 0 ? 'th' : 'td', null, sanitizeInline(cell))).join(''))).join(''));
    case 'image':
    case 'simpleImage': {
      const src = safeUrl(d.file?.url || d.url);
      if (!src) return '';
      const img = el('img', { src, alt: d.caption || '', loading: 'lazy' });
      return el('figure', null, img + (d.caption ? el('figcaption', null, sanitizeInline(d.caption)) : ''));
    }
    case 'embed': {
      const src = safeUrl(d.embed || d.source);
      return src ? el('p', null, `<a href="${src}" rel="noopener noreferrer nofollow">${escapeHtml(d.caption || d.source || src)}</a>`) : '';
    }
    // `raw` let authors store arbitrary HTML. Escape it rather than trust it.
    case 'raw':         return el('pre', null, el('code', null, escapeHtml(d.html)));
    default:            return d.text ? el('p', null, sanitizeInline(d.text)) : '';
  }
}

export function editorjsToHtml(data) {
  return (data?.blocks || []).map(legacyBlock).join('');
}

/* ----------------------------------------------------------------- shared -- */

export function isLegacyDocument(doc) {
  return Boolean(doc) && Array.isArray(doc.blocks);
}

export function isEmptyDocument(doc) {
  if (!doc) return true;
  if (isLegacyDocument(doc)) return doc.blocks.length === 0;
  return tiptapToHtml(doc).replace(/<[^>]*>/g, '').trim().length === 0;
}

/* Accepts either stored format, as a JSON string or an object. */
export function articleBodyToHtml(body) {
  let doc = body;
  if (typeof body === 'string') {
    try { doc = JSON.parse(body); } catch { return ''; }
  }
  return isLegacyDocument(doc) ? editorjsToHtml(doc) : tiptapToHtml(doc);
}
