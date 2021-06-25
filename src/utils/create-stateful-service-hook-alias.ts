import { interfaces } from 'inversify';
import { useService } from '../hooks/use-service';
import { StatefulService } from '../stateful-service';
import { IsStrictlyAny } from '../types/is-strictly-any';

export function createStatefulServiceHookAlias<
  ExplicitProvider extends StatefulService<any> = any,
  Token extends IsStrictlyAny<ExplicitProvider> extends true
    ? interfaces.ServiceIdentifier<StatefulService<any>>
    : interfaces.ServiceIdentifier<any> = any,
  Provider = IsStrictlyAny<ExplicitProvider> extends true
    ? Token extends interfaces.ServiceIdentifier<infer InferredProvider>
      ? InferredProvider extends StatefulService<any>
        ? InferredProvider
        : never
      : any
    : ExplicitProvider,
  // State = Provider extends StatefulService<any, infer ImmutableState>
  //   ? ImmutableState
  //   : never,
  Hook = (depsFn?: (service: Provider) => React.DependencyList) => Provider
>(token: Token): Hook {
  return ((depsFn?: (service: Provider) => React.DependencyList) => {
    return useService(token, depsFn);
  }) as unknown as Hook;
}
