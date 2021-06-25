import { expectTypeOf } from 'expect-type';
import { StatefulService } from '../stateful-service';
import { Immutable } from '../types/immutable';
import { useService } from './use-service';

class RoleService {
  name: string | null = null;
}
class UserService {
  age: number = 20;
}
type SaleServiceState = { a: number };
class SaleService extends StatefulService<SaleServiceState> {}

// returns type of token if explicit type not specified
expectTypeOf(useService(UserService)).toEqualTypeOf<UserService>();

// returns explicit type if specified
expectTypeOf(useService<RoleService>(UserService)).toEqualTypeOf<RoleService>();

// returns correct type of stateful service
expectTypeOf(
  useService(SaleService, (salesService) => [salesService.state.a])
).toEqualTypeOf<SaleService>();

// depsFn callback receives the correct immutable type of state variable
useService(SaleService, ({ state }) => {
  expectTypeOf(state).toEqualTypeOf<Immutable<SaleServiceState>>();
  return [state.a];
});

// cannot provide a depsFn for a token that is not a stateful service
// @ts-expect-error
useService(UserService, ({ state }) => [state.a]);

// cannot provide a depsFn for a token that is a stateful service
// but at the same time providing an explicit provider type
// @ts-expect-error
useService<UserService>(SaleService, ({ state }) => [state.a]);
