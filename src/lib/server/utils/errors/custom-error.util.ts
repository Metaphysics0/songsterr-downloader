import { ErrorLevel } from './error-level.enum';

export abstract class CustomError extends Error {
  public readonly metadata: Record<string, unknown>;

  constructor(public message: string, metadata: Record<string, unknown> = {}) {
    super(message);
    this.metadata = metadata;
    Error.captureStackTrace(this);
  }

  get name(): string {
    return this.constructor.name;
  }

  get isRetryable(): boolean {
    return true;
  }

  get level(): ErrorLevel {
    return ErrorLevel.ERROR;
  }
}
