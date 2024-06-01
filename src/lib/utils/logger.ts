function log(...msgs: any) {
  console.log(`[LOG]`, ...msgs);
}

function error(...msgs: any) {
  console.error(`[ERROR]`, ...msgs);
}

function info(...msgs: any) {
  console.info(`[INFO]`, ...msgs);
}

function warn(...msgs: any) {
  console.warn(`[WARN]`, ...msgs);
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
