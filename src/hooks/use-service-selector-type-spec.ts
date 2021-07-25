/* eslint-disable */
import { expectTypeOf } from 'expect-type';
import { useServiceSelector } from './use-service-selector';

class RoleService {
  name = 'ab';
}
class UserService {
  age = 20;
}

// returns type of selector fn result if explicit type not specified
expectTypeOf(
  useServiceSelector(UserService, (s) => s.age)
).toEqualTypeOf<number>();

// returns explicit type if specified
expectTypeOf(
  useServiceSelector<UserService, number>('fg', (s) => s.age)
).toEqualTypeOf<number>();
