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

Place a `<ServiceContainer>` in the component tree:

```tsx
import { ServiceContainer } from 'react-service-locator';
...

function App() {
  return (
    <ServiceContainer>
      <SignInPage />
    </ServiceContainer>
  );
}
```

Define a service:

```ts
import { Injectable, Inject } from 'react-service-locator';

@Injectable()
export class SessionService {
  // Dependency injection is handled by Inversify internally
  @Inject(HttpService)
  private readonly httpService;

  public login = async (username: string, password: string): Promise<void> => {
    await this.httpService.post('/login', { username, password });
  };
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

### Using the `Injectable` decorator

By default, all classes decorated with `@Injectable` are automatically registered in the service container. The decorator receives two optional parameters: `token` and `scope`. If not specified, `token` will be the target class and `scope` will be `singleton`:

```ts
@Injectable()
class HttpService {}
```

is equivalent to:

```ts
@Injectable(HttpService, 'singleton')
class HttpService {}
```

For more control, you can also register services on the `<ServiceContainer>`:

```ts
function App() {
  return (
    <ServiceContainer
      services={[
        SessionService, // shorthand
        {
          // same as shorthand
          provide: SessionService,
          useClass: SessionService,
          scope: 'singleton', // optional
        },
        {
          provide: someSymbol, // token can be an object, string, or symbol
          useFactory: (context) =>
            new SessionService(context.container.get(ServiceB)),
          scope: 'transient',
        },
        {
          provide: 'tokenB',
          useValue: someInstance,
        },
      ]}
    >
      <Foo />
    </ServiceContainer>
  );
}
```

> Note: Services registered on the `<ServiceContainer>` will override those registered with just the decorator if they have the same token.

### Scopes

All forms of service registration are singleton-scoped by default. `useClass` and `useFactory` forms support a `scope` option that can be set to either `singleton` or `transient`. Shorthand and `useValue` forms will always be singleton-scoped.

## Obtaining Services

### `useService` hook

When registering services in the default way, you can obtain the service instance by simply doing:

```ts
const service = useService(SessionService);
```

You can also explicitly specify the return type:

```ts
// service will be of type SessionService
const service = useService<SessionService>('tokenA');
```

### `useServiceSelector` hook

You can use this hook to obtain a partial or transformed representation of the service instance:

```ts
const { fn } = useServiceSelector(SessionService, (service) => ({
  fn: service.login,
}));
```

> This hook is most useful with Stateful Services.

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

### Stateful Services and `useService` hook

When using `useService` to obtain a stateful service instance, every time `this.setState` is called within that service, `useService` will trigger a re-render on any component where it is used.

We can avoid unnecessary re-renders by providing a second parameter (`depsFn`) to `useService`:

```ts
export function Header() {
  const sessionService =
    useService(SessionService, (service) => [service.state.displayName]);
  ...
}
```

Now, re-renders will only happen in the `Header` component whenever `state.displayName` changes in our service. Any other change to state will be ignored.

`depsFn` receives the entire service instance so that you have more control. The function must return a dependencies list similar to what you provide to React's `useEffect` and other built-in hooks. This dependencies list is shallow compared every time `this.setState` is called.

### Stateful Services and `useServiceSelector` hook

Another way to obtain a stateful service besides `useService` is with `useServiceSelector`. This hook will behave the same way as when called with non stateful services, but additionally it will trigger a re-render whenever `this.setState` is called and if and only if the result of `selectorFn` has changed.

```ts
const { name } = useServiceSelector(SessionService, (service) => ({
  name: service.state.displayName,
}));
```

#### Compare function

If `selectorFn`'s result is a primitive value it will be compared with `Object.is`. If it is either an object or array, a shallow comparison will be used.

You can provide an alternative compare function as an optional third parameter, if needed.

### Why one or the other?

The main difference between `useService` and `useServiceSelector` is that the former will always return the entire service instance, while the latter will only return the exact result of its `selectorFn`. This means that with `useService` the `depsFn` can define a set of dependencies for re-renders while still giving you access to everything the service exposes. This can be good in some cases, but it can potentially lead to situations where in your component you access some state that you forget to add to the dependency list which could result in stale UI elements.

With `useServiceSelector` you are forced to add everything you need in your component to the `selectorFn` result, so it's easier to reason about.

## FAQ

- **Service locator? Isn't this dependency injection?**

  Although they are very similar, there is a slight difference between the two. With the service locator pattern, your code is responsible for explicitly obtaining the service through a known mechanism or utility. In our case we are using the `useService` hook as our service locator.

  More answers to the difference between the two [here](https://stackoverflow.com/questions/1557781/whats-the-difference-between-the-dependency-injection-and-service-locator-patte).
