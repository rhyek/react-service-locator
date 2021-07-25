import { Container } from 'inversify';

export function createContainer() {
  return new Container({
    skipBaseClassChecks: true,
    autoBindInjectable: false,
  });
}
