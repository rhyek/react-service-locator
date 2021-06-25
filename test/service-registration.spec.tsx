import 'reflect-metadata';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { Injectable, ServiceContainer, useService } from '../src';

@Injectable()
class UserService {}

describe('service registration', () => {
  afterEach(() => {
    cleanup();
  });

  it('with service container', () => {
    @Injectable()
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
    @Injectable()
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
    @Injectable('token')
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
    @Injectable(UserService)
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
    @Injectable()
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
