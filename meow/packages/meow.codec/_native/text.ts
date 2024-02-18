const Decoder = $meow.def_foreign_type<TextDecoder>(
  "native-text-decoder",
  (x) => x instanceof TextDecoder
);

module.exports = {
  *text__decode(encoding: string, ignore_bom: boolean, bytes: Uint8Array) {
    try {
      const decoder = new TextDecoder(encoding, { ignoreBOM: ignore_bom, fatal: true });
      return $meow.record({ ok: true, value: decoder.decode(bytes) });
    } catch (e) {
      return $meow.record({ ok: false, reason: null });
    }
  },

  *text__decode_replace(encoding: string, ignore_bom: boolean, bytes: Uint8Array) {
    return new TextDecoder(encoding, { ignoreBOM: ignore_bom }).decode(bytes);
  },

  *text__stream_decoder(encoding: string, ignore_bom: boolean, fatal: boolean) {
    const decoder = new TextDecoder(encoding, { ignoreBOM: ignore_bom, fatal: fatal });
    return Decoder.box(decoder);
  },

  *text__decode_push(decoder0: $Foreign<TextDecoder>, bytes: Uint8Array) {
    try {
      const decoder = Decoder.unbox(decoder0);
      const result = decoder.decode(bytes, { stream: true });
      return $meow.record({ ok: true, value: result });
    } catch (e) {
      return $meow.record({ ok: false, value: null });
    }
  },

  *text__close_decoder(decoder0: $Foreign<TextDecoder>) {
    const decoder = Decoder.unbox(decoder0);
    return decoder.decode();
  },

  *text__encode_utf8(text: string) {
    return new TextEncoder().encode(text);
  },
};
