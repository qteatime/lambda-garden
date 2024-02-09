// -- Content testing
const text_ends_with = (a: string, b: string) => a.endsWith(b);

const text_starts_with = (a: string, b: string) => a.startsWith(b);

const text_contains = (a: string, b: string) => a.includes(b);

const text_slice_contains = (a: string, offset: number, length: number, part: string) => {
  return a.slice(offset, offset + length).includes(part);
};

const text_slice_starts_with = (a: string, offset: number, length: number, part: string) => {
  return a.slice(offset, offset + length).startsWith(part);
};

const text_slice_ends_with = (a: string, offset: number, length: number, part: string) => {
  return a.slice(offset, offset + length).endsWith(part);
};

const text_slice_eq_text = (a: string, ox: number, len: number, b: string) => {
  return a.slice(ox, ox + len) === b;
};

const text_slice_eq = (
  a: string,
  aox: number,
  alen: number,
  b: string,
  box: number,
  blen: number
) => {
  return a.slice(aox, aox + alen) === b.slice(box, box + blen);
};

// -- Constructing
const text_decode_utf8 = (a: Uint8Array, strict: boolean) => {
  try {
    return new TextDecoder("utf-8", {
      fatal: strict,
    }).decode(a);
  } catch (_) {
    return null;
  }
};

const text_from_code_units = (xs: number[]) => String.fromCharCode(...xs);

const text_from_unicode = (xs: number[]) => String.fromCodePoint(...xs);

const text_join = (xs: string[], s: string) => xs.join(s);

// -- Combining
const text_concat = (a: string, b: string) => a + b;

const text_repeat = (a: string, n: number) => a.repeat(n);

// -- Transforming text
const text_trim_start = (a: string) => a.trimStart();

const text_trim_end = (a: string) => a.trimEnd();

const text_trim = (a: string) => a.trim();

const text_split = (a: string, sep: string) => a.split(sep);

const text_replace_first = (a: string, patt: string, subst: string) => a.replace(patt, subst);

const text_replace_all = (a: string, patt: string, subst: string) => a.replaceAll(patt, subst);

const text_pad_start = (a: string, size: number, c: string) => {
  const space = size - a.length;
  const fill = a.length + c.length * Math.floor(space / c.length);
  return a.padStart(Math.min(size, fill), c);
};

const text_pad_end = (a: string, size: number, c: string) => {
  const space = size - a.length;
  const fill = a.length + c.length * Math.floor(space / c.length);
  return a.padEnd(Math.min(size, fill), c);
};

// -- Representation properties
const text_count_code_units = (a: string) => a.length;

const text_is_well_formed = (a: string) => (a as any).isWellFormed();

const text_to_well_formed = (a: string) => (a as any).toWellFormed();

// -- Slicing
const text_unsafe_slice = (a: string, from: number, length: number) => {
  return a.slice(from, from + length);
};

// -- Conversions
const text_to_unicode_scalars = (a: string) => {
  if (!(a as any).isWellFormed()) {
    return null;
  } else {
    return [...a].map((x) => x.codePointAt(0));
  }
};

const text_to_utf8_bytes = (a: string) => {
  if (!(a as any).isWellFormed()) {
    return null;
  } else {
    return new TextEncoder().encode(a);
  }
};

// -- UTF16 representation -----------------------------------------------------
const text_code_unit_at = (x: string, ix: number) => x.charCodeAt(ix);

const $text_segmenter = Intl.Segmenter
  ? function* (x: string) {
      for (const v of new Intl.Segmenter().segment(x)) {
        yield [v.index, v.segment];
      }
    }
  : function* (x: string) {
      let i = 0;
      for (const v of x) {
        yield [i++, v];
      }
    };

const text_graphemes = (x: string) => {
  return $text_segmenter(x);
};

const text_words = (x: string) => {
  return (function* () {
    for (const v of new Intl.Segmenter(undefined, { granularity: "word" }).segment(x)) {
      yield [v.index, v.segment, v.isWordLike];
    }
  })();
};

const text_sentences = (x: string) => {
  return (function* () {
    for (const v of new Intl.Segmenter(undefined, { granularity: "sentence" }).segment(x)) {
      yield [v.index, v.segment];
    }
  })();
};

const text_lines = (x: string) => {
  return (function* () {
    let last_offset = 0;
    const re = /\r\n|\r|\n/g;
    while (true) {
      re.lastIndex = last_offset;
      const match = re.exec(x);
      if (match == null || re.lastIndex < last_offset) {
        yield [last_offset, x.slice(last_offset)];
        return;
      }
      yield [last_offset, x.slice(last_offset, match.index)];
      last_offset = re.lastIndex;
    }
  })();
};
