import 'reflect-metadata';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { Injectable, ServiceContainer, useService } from '../src';

@Injectable()
class UserService {}

@Injectable()
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
});
