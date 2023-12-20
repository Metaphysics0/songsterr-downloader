export const createClassNames = (
  ...classes: (string | false | null | undefined)[]
) => classes.filter(Boolean).join(' ');

export function styleToString(
  style: Record<string, number | string | undefined>
): string {
  return Object.keys(style).reduce((str, key) => {
    if (style[key] === undefined) return str;
    return str + `${key}:${style[key]};`;
  }, '');
}
