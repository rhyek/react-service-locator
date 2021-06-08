# React Service Locator

An implementation of the [service locator pattern](https://en.wikipedia.org/wiki/Service_locator_pattern) for React 16.13+ using Hooks, Context API, and [Inversify](https://github.com/inversify).

## Features

- Service containers defined via a `ServiceContainer` component that uses `Inversify`'s Dependency Injection containers under the hood
- Support for hierarchical DI using nested `ServiceContainer`s including the capability of overriding services
- Support for stateful services with reactivity when extending `StatefulService`
- Services are singleton-scoped by default, but transient is supported for `useClass` and `useFactory`
- Excellent TypeScript support throughout

## Setup

```bash
npm install react-service-locator reflect-metadata
```

Modify your `tsconfig.json` to enable experimental decorators:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Import `reflect-metadata` in your app's entrypoint (for example `index.tsx`):

```ts
import 'reflect-metadata';
```

## Basic Usage

Define a service:

```ts
import { Injectable, Inject } from 'react-service-locator';

@Injectable()
export class SessionService {
  // Dependency injection is handled by Inversify internally
  @Inject(HttpService)
  private readonly httpService;

  public async login(username: string, password: string): Promise<void> {
    await this.httpService.post('/login', { username, password });
  }
}
```

Register the service in the service container:

```tsx
import { ServiceContainer } from 'react-service-locator';
...

function App() {
  return (
    <ServiceContainer services={[HttpService, SessionService]}>
      <SignInPage />
    </ServiceContainer>
  );
}
```

Obtain the service:

```tsx
import { useService } from 'react-service-locator';
...

export function SignInPage() {
  // Service location is handled by Inversify internally
  const sessionService = useService(SessionService);

  return (
    <button onClick={() => sessionService.login('john', 'hunter2')}>
      Sign In
    </button>
  );
}
```

## Registering Services

Aside from the default way of registering services shown above, you can also do one of the following:

```ts
function App() {
  return (
    <ServiceContainer services={[
      SessionService, {/* default */}
      {
        provide: 'tokenA', {/* token can be an object, string, or symbol */}
        useClass: SessionService, {/* same as default */},
      },
      {
        provide: someSymbol,
        useFactory: (context) => new SessionService(context.container.get(ServiceB)),
        scope: 'transient',
      },
      {
        provide: 'tokenB',
        useValue: someInstance,
      }
    ]}>
      <Foo />
    </ServiceContainer>
  )
}
```

### Scopes

All forms of service registration are singleton-scoped by default. `useClass` and `useFactory` forms support a `scope` option that can be set to either `singleton` or `transient`.

## Obtaining Services

When registering services in the default way, you can obtain them by simply doing:

```ts
const service = useService(SessionService);
```

Sometimes, the service obtained might be of a different type than the provider token depending on how it was registered. Services can be registered with objects, strings, or symbols. To obtain such a service, `useService` allows you to specify a generic type. This will be the compile-time type of the service:

```ts
// service will be of type SessionService
const service = useService<SessionService>('tokenA');
```

## Stateful Services

Stateful services are like normal services with the added functionality of being able to manage internal state and be compatible with reactivity. Let's modify our service and see how this works:

```ts
import { Injectable, Inject, StatefulService } from 'react-service-locator';

@Injectable()
export class SessionService extends StatefulService<{
  displayName: string;
  idle: boolean;
} | null> {
  @Inject(HttpService)
  private readonly httpService;

  constructor() {
    super(null); // initialize state
  }

  get upperCaseDisplayName() {
    return this.state?.displayName?.toUpperCase();
  }

  public async login(username: string, password: string): Promise<void> {
    const { displayName } = await this.httpService.post('/login', {
      username,
      password,
    });
    this.setState({
      // value is type checked
      displayName,
      idle: false,
    });
  }

  public setIdle(idle: boolean) {
    this.setState({ idle }); // can be a partial value
  }
}
```

Now we can have a component that reads that state. This component will be re-rendered everytime `this.setState` is called on `SessionService`:

```ts
import { useService } from 'react-service-locator';
...

export function Header() {
  const sessionService = useService(SessionService);

  return (
    <div>
      <span>Name:</span>
      {sessionService.state?.displayName ?? 'Sign in, please'}
    </div>
  );
}
```

> _Note:_ The public `state` property is a getter that returns a recursively immutable version of the service's internal state.

### Avoiding unnecessary re-renders

Some services like `SessionService` might have complex objects as their state and components might care about _some_ of the data and re-render whenever it changes, but for performance reasons we want to avoid re-renders for the rest.

For example, our `Header` component is only using `displayName`, but not `idle`. We can ignore changes to `idle` by doing the following:

```ts
export function Header() {
  const sessionService =
    useService(SessionService, (service) => [service.state.displayName]);
    // service's type is known
  ...
}
```

The second parameter is an optional callback that receives the service instance as the parameter and must return a dependencies list similar to what you provide to React's `useEffect` and other built-in hooks. This dependencies list is shallow compared to the previous value after the last time `this.setState` was called.

You can return anything as part of that list. Even getters:

```ts
export function Header() {
  const sessionService =
    useService(SessionService, (service) => [service.upperCaseDisplayName]);
  ...
}
```

## FAQ

- **Service locator? Isn't this dependency injection?**

  Although they are very similar, there is a slight difference between the two. With the service locator pattern, your code is responsible for explicitly obtaining the service through a known mechanism or utility. In our case we are using the `useService` hook as our service locator.

  More answers to the difference between the two [here](https://stackoverflow.com/questions/1557781/whats-the-difference-between-the-dependency-injection-and-service-locator-patte).
