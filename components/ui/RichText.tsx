import type { Rich } from '@/content/types';

/** Renders content strings with `{ em }` parts as the red italic accent. */
export function RichText({ value }: { value: Rich }) {
  return (
    <>
      {value.map((part, i) =>
        typeof part === 'string' ? (
          part
        ) : (
          <em key={i} className="r">
            {part.em}
          </em>
        ),
      )}
    </>
  );
}
