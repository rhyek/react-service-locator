import { config } from './config';

export function debug(...args: any[]) {
  if (config.debug) {
    console.debug('[react-service-locator]', ...args);
  }
}
