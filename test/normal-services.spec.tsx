import 'reflect-metadata';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { Injectable, ServiceContainer, useService } from '../src';

@Injectable()
class UserService {}

@Injectable()
class ProductService {}

describe('normal services', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders without crashing', () => {
    function App() {
      return (
        <ServiceContainer services={[UserService, ProductService]}>
          hello
        </ServiceContainer>
      );
    }
    const { getByText } = render(<App />);
    expect(getByText('hello')).toBeTruthy();
  });
  it('obtains the correct service', () => {
    function Injecter() {
      const service = useService(UserService);
      expect(service instanceof UserService).toBeTruthy();
      return <div>hello</div>;
    }
    function App() {
      return (
        <ServiceContainer services={[UserService, ProductService]}>
          <Injecter />
        </ServiceContainer>
      );
    }
    render(<App />);
  });
  it('default behavior provides singleton service', () => {
    function Injecter() {
      const service1 = useService(UserService);
      const service2 = useService(UserService);
      expect(service1 === service2).toBeTruthy();
      return <div>hello</div>;
    }
    function App() {
      return (
        <ServiceContainer services={[UserService, ProductService]}>
          <Injecter />
        </ServiceContainer>
      );
    }
    render(<App />);
  });
});
