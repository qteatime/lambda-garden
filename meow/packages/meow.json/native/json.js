module.exports = {
  *json__parse(source) {
    try {
      return [
        true,
        JSON.parse(source, (_key, value) => {
          if (value === null) {
            return null;
          } else if (Array.isArray(value)) {
            return value;
          } else if (typeof value === "object") {
            return new Map(Object.entries(value));
          } else if (typeof value === "number") {
            return $meow.f64(value);
          } else {
            return value;
          }
        }),
      ];
    } catch (e) {
      return [false, String(e)];
    }
  },

  *json__serialise(source, indent) {
    try {
      return [
        true,
        JSON.stringify(
          source,
          (_, value) => {
            if (value instanceof Map) {
              return Object.fromEntries(value.entries());
            } else if (value instanceof $F64 || value instanceof $I32) {
              return value.value;
            } else if (
              value === null ||
              Array.isArray(value) ||
              typeof value === "string" ||
              typeof value === "boolean" ||
              typeof value === "number"
            ) {
              return value;
            } else {
              throw new Error(`Unsupported type ${typeof value}`);
            }
          },
          indent
        ),
      ];
    } catch (e) {
      return [false, String(e)];
    }
  },
};
