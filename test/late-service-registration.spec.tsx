import 'reflect-metadata';
import React from 'react';
import { render } from '@testing-library/react';
import { Service, ServiceContainer, useService, configure } from '../src';

describe('late service registration', () => {
  it('normal with decorator', () => {
    @Service()
    class UserService {}

    const renderCounter = jest.fn();

    function Injecter() {
      renderCounter();
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
    expect(renderCounter).toHaveBeenCalledTimes(1);
  });
  it('no decorator or late registration should throw', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    // No decorator so we can simulate late binding
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
    expect(() => render(<App />)).toThrowError(
      /No matching bindings found for serviceIdentifier: UserService/
    );
    consoleSpy.mockRestore();
  });
  it('late registration works', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    // No decorator so we can simulate late binding
    // @Service()
    class UserService {}

    let firstRun = true;

    const renderCounter = jest.fn();

    function Injecter() {
      renderCounter();
      if (firstRun) {
        Service()(UserService); // late registration
        firstRun = false;
      }
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
    // expect(() => render(<App />)).toThrowError(
    //   /No matching bindings found for serviceIdentifier: UserService/
    // );
    expect(renderCounter).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });
});
