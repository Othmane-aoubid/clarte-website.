/**
 * Injects a JSON-LD structured data <script> block.
 * Safe to use in Server Components — we control the data (no user input).
 * Pass an object or an array of objects for @graph.
 */
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  )
}
