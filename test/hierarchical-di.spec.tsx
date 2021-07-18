import 'reflect-metadata';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { Service, ServiceContainer, useService } from '../src';

@Service()
class UserService {}

@Service()
class ProductService {}

describe('hierarchical di', () => {
  afterEach(() => {
    cleanup();
  });
  it('obtains service from parent container', () => {
    function Injecter() {
      const service = useService(UserService);
      expect(service instanceof UserService).toBeTruthy();
      return <div>hello</div>;
    }
    function App() {
      return (
        <ServiceContainer services={[UserService]}>
          <ServiceContainer services={[ProductService]}>
            <Injecter />
          </ServiceContainer>
        </ServiceContainer>
      );
    }
    render(<App />);
  });
  it('obtains service from current container', () => {
    function Injecter() {
      const service = useService(ProductService);
      expect(service instanceof ProductService).toBeTruthy();
      return <div>hello</div>;
    }
    function App() {
      return (
        <ServiceContainer services={[UserService]}>
          <ServiceContainer services={[ProductService]}>
            <Injecter />
          </ServiceContainer>
        </ServiceContainer>
      );
    }
    render(<App />);
  });
  it('obtains overriden service from current container', () => {
    const overrider = {};
    function Injecter() {
      const service = useService(UserService);
      expect(service === overrider).toBeTruthy();
      return <div>hello</div>;
    }

    function App() {
      return (
        <ServiceContainer services={[UserService]}>
          <ServiceContainer
            services={[
              ProductService,
              { provide: UserService, useValue: overrider },
            ]}
          >
            <Injecter />
          </ServiceContainer>
        </ServiceContainer>
      );
    }
    render(<App />);
  });
  it('decorated services are only automatically registered on root service containers', () => {
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
          <ServiceContainer>
            <Injecter />
          </ServiceContainer>
        </ServiceContainer>
      );
    }

    const { getByText } = render(<App />);
    expect(getByText('hello, override')).toBeTruthy();
  });
});
