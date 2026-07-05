/**
 * Safely serializes a value into a JSON string suitable for embedding
 * inside an HTML `<script>` tag. Replaces characters that would allow
 * an attacker to break out of the script context (`</script>`, `<!--`)
 * with their safe Unicode escape equivalents.
 *
 * @see https://react.doctor/docs/rules/react-doctor/unsafe-json-in-html
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/'/g, "\\u0027");
}
