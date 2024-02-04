const text_count_code_units = (a: string) => a.length;

const text_repeat = (a: string, n: number) => a.repeat(n);

const text_concat = (a: string, b: string) => a + b;

const text_slice = (a: string, from: number, to: number) => a.slice(from, to);

const text_slice_from = (a: string, from: number) => a.slice(from);

const text_ends_with = (a: string, b: string) => a.endsWith(b);

const text_starts_with = (a: string, b: string) => a.startsWith(b);

const text_contains = (a: string, b: string) => a.includes(b);

const text_trim_start = (a: string) => a.trimStart();

const text_trim_end = (a: string) => a.trimEnd();

const text_trim = (a: string) => a.trim();

const text_utf8_bytes = (a: string) => new TextEncoder().encode(a);

const text_utf16_code_points = (a: string) => [...a].map((x) => x.codePointAt(0));

const text_graphemes = Intl?.Segmenter
  ? (x: string) => [...new Intl.Segmenter().segment(x)].map((x) => new $Graphemes(x.segment))
  : (x: string) => [...x].map((x) => new $Graphemes(x));

const text_from_utf8_bytes = (x: Uint8Array) => {
  try {
    return new TextDecoder().decode(x);
  } catch (_) {
    return null;
  }
};

const text_from_code_points = (a: number[]) => {
  try {
    return String.fromCodePoint(...a);
  } catch (_) {
    return null;
  }
};

const text_lines = (a: string) => a.split(/\r\n|\r|\n/);
