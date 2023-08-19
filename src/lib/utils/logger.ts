const logMethods = Object.fromEntries(
  ['log', 'error', 'info', 'warn'].map(make)
);

const logger = Object.freeze(logMethods);

function make(method: string) {
  return [
    method,
    function (prefix: string, ...msgs: any) {
      // @ts-ignore
      console[method](`[${prefix}]`, ...msgs);
    }
  ];
}

export { logger };
