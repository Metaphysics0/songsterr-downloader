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

export const commonCssClasses = {
  textInput:
    'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2 text-center',
  getTabButton:
    'w-fit px-2 py-1 font-semibold p-2 rounded-lg shadow-md transition duration-75 cursor-pointer bg-red-500 hover:bg-red-400 text-white disabled:bg-slate-5 disabled:hover:bg-slate-6 disabled:hover:cursor-not-allowed'
};
