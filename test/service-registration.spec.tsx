import 'reflect-metadata';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { Service, ServiceContainer, useService } from '../src';

@Service()
class UserService {}

describe('service registration', () => {
  afterEach(() => {
    cleanup();
  });

  it('with service container', () => {
    @Service()
    class UserService {}

    function Injecter() {
      const service = useService(UserService);
      expect(service instanceof UserService).toBeTruthy();
      return <div>hello</div>;
    }
    function App() {
      return (
        <ServiceContainer services={[UserService]}>
          <Injecter />
        </ServiceContainer>
      );
    }
    render(<App />);
  });

  it('with decorator', () => {
    @Service()
    class UserService {}

    function Injecter() {
      const service = useService(UserService);
      expect(service instanceof UserService).toBeTruthy();
      return <div>hello</div>;
    }
    function App() {
      return (
        <ServiceContainer>
          <Injecter />
        </ServiceContainer>
      );
    }
    render(<App />);
  });

  it('with decorator specifying string token', () => {
    @Service({ provide: 'token' })
    class UserService {}

    function Injecter() {
      const service = useService<UserService>('token');
      expect(service instanceof UserService).toBeTruthy();
      return <div>hello</div>;
    }

    function App() {
      return (
        <ServiceContainer>
          <Injecter />
        </ServiceContainer>
      );
    }
    render(<App />);
  });

  it('with decorator specifying same class as token', () => {
    @Service({ provide: UserService })
    class UserService {}

    function Injecter() {
      const service = useService<UserService>(UserService);
      expect(service instanceof UserService).toBeTruthy();
      return <div>hello</div>;
    }

    function App() {
      return (
        <ServiceContainer>
          <Injecter />
        </ServiceContainer>
      );
    }
    render(<App />);
  });

  it('can override a default service through service container', () => {
    @Service()
    class UserService {
      name = () => 'default';
    }

    function Injecter() {
      const service = useService(UserService);
      const name = service.name();
      return <div>hello, {name}</div>;
    }

    function App() {
      return (
        <ServiceContainer
          services={[
            {
              provide: UserService,
              useValue: {
                name: () => 'override',
              },
            },
          ]}
        >
          <Injecter />
        </ServiceContainer>
      );
    }

    const { getByText } = render(<App />);
    expect(getByText('hello, override')).toBeTruthy();
  });
});
