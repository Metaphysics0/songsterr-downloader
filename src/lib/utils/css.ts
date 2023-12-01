export const createClassNames = (
  ...classes: (string | false | null | undefined)[]
) => classes.filter(Boolean).join(' ');
