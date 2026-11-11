/** Inline rich text: plain strings, plus `{ em }` for the red Playfair italic accent (`em.r`). */
export type RichPart = string | { em: string };
export type Rich = readonly RichPart[];

export interface NavLink {
  label: string;
  href: `#${string}`;
}
