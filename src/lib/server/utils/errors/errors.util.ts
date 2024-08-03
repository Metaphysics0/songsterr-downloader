import { CustomError } from './custom-error.util';

export class MaximumAmountOfDownloadsExceededError extends CustomError {
  constructor({
    message,
    isUserLoggedIn
  }: {
    message: string;
    isUserLoggedIn: boolean;
  }) {
    super(message, { isUserLoggedIn });
  }
}
