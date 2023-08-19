function log(prefix: string, ...msgs: any) {
  console.log(`[${prefix}]`, ...msgs);
}

function error(prefix: string, ...msgs: any) {
  console.error(`[${prefix}]`, ...msgs);
}

function info(prefix: string, ...msgs: any) {
  console.info(`[${prefix}]`, ...msgs);
}

function warn(prefix: string, ...msgs: any) {
  console.warn(`[${prefix}]`, ...msgs);
}

function logJson(obj: any, ...msgs: any) {
  log(JSON.stringify(obj, null, 2), ...msgs);
}

const logger = Object.freeze({
  log,
  info,
  error,
  warn,
  logJson
});

export { logger };
