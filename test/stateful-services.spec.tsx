/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'reflect-metadata';
import React, { useEffect, useRef } from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import { Service, ServiceContainer, StatefulService, useService } from '../src';

@Service()
class ProductService extends StatefulService<{ products: string[] }> {
  constructor() {
    super({ products: ['a'] });
  }

  addProduct(name: string) {
    this.setState({ products: [...this.state.products, name] });
  }

  get first() {
    return this.state.products[0];
  }

  get count() {
    return this.state.products.length;
  }
}

describe('stateful services', () => {
  afterEach(() => {
    cleanup();
  });

  describe('re-renders', () => {
    it('injecter renders once', () => {
      const fn = jest.fn(() => {});
      function Injecter() {
        fn();
        const productService = useService(ProductService);
        return <div>hello</div>;
      }
      function App() {
        return (
          <ServiceContainer services={[ProductService]}>
            <Injecter />
          </ServiceContainer>
        );
      }
      render(<App />);
      expect(fn).toHaveBeenCalledTimes(1);
    });
    it('injecter re-renders once when state is changed and no deps are specified', () => {
      const fn = jest.fn(() => {});
      function Injecter() {
        fn();
        const productService = useService(ProductService);
        return (
          <div>
            <button onClick={() => productService.addProduct('b')}>add</button>
          </div>
        );
      }
      function App() {
        return (
          <ServiceContainer services={[ProductService]}>
            <Injecter />
          </ServiceContainer>
        );
      }
      const { container } = render(<App />);
      fireEvent.click(container.querySelector('button')!);
      expect(fn).toHaveBeenCalledTimes(2);
    });
    it('injecter does not re-render if deps are not affected', () => {
      const fn = jest.fn(() => {});
      function Injecter() {
        fn();
        const productService = useService(ProductService, ({ first }) => [
          first,
        ]);
        return (
          <div>
            <button onClick={() => productService.addProduct('b')}>add</button>
          </div>
        );
      }
      function App() {
        return (
          <ServiceContainer services={[ProductService]}>
            <Injecter />
          </ServiceContainer>
        );
      }
      const { container } = render(<App />);
      fireEvent.click(container.querySelector('button')!);
      expect(fn).toHaveBeenCalledTimes(1);
    });
    it('injecter re-renders if deps are affected', () => {
      const fn = jest.fn(() => {});
      function Injecter() {
        fn();
        const productService = useService(ProductService, ({ count }) => [
          count,
        ]);
        return (
          <div>
            <button onClick={() => productService.addProduct('b')}></button>
          </div>
        );
      }
      function App() {
        return (
          <ServiceContainer services={[ProductService]}>
            <Injecter />
          </ServiceContainer>
        );
      }
      const { container } = render(<App />);
      fireEvent.click(container.querySelector('button')!);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
  describe('state initizalization', () => {
    it('can initialize with super', () => {
      @Service()
      class SomeService extends StatefulService<{ value: number }> {
        constructor() {
          super({ value: 0 });
        }
        increment = () => {
          this.setState({
            value: this.state.value + 1,
          });
        };
      }
      function Injecter() {
        const someService = useService(SomeService, (s) => [s.state.value]);
        return (
          <div>
            value: {someService.state.value}
            <button onClick={() => someService.increment()}>add</button>
          </div>
        );
      }
      function App() {
        return (
          <ServiceContainer>
            <Injecter />
          </ServiceContainer>
        );
      }
      const { container, getByText } = render(<App />);
      fireEvent.click(container.querySelector('button')!);
      expect(getByText('value: 1'));
    });
    it('can initialize with this.state', () => {
      @Service()
      class SomeService extends StatefulService<{ value: number }> {
        constructor() {
          super();
          this.state = { value: 0 };
        }
        increment = () => {
          this.setState({
            value: this.state.value + 1,
          });
        };
      }
      function Injecter() {
        const someService = useService(SomeService, (s) => [s.state.value]);
        return (
          <div>
            value: {someService.state.value}
            <button onClick={() => someService.increment()}>add</button>
          </div>
        );
      }
      function App() {
        return (
          <ServiceContainer>
            <Injecter />
          </ServiceContainer>
        );
      }
      const { container, getByText } = render(<App />);
      fireEvent.click(container.querySelector('button')!);
      expect(getByText('value: 1'));
    });
    it('throw if not initialized', () => {
      @Service()
      class SomeService extends StatefulService<{ value: number }> {
        increment = () => {
          this.setState({
            value: this.state.value + 1,
          });
        };
      }
      function Injecter() {
        const someService = useService(SomeService, (s) => [s.state.value]);
        return (
          <div>
            value: {someService.state.value}
            <button onClick={() => someService.increment()}>add</button>
          </div>
        );
      }
      function App() {
        return (
          <ServiceContainer>
            <Injecter />
          </ServiceContainer>
        );
      }
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<App />)).toThrowError(
        'State has not been initialized.'
      );
      spy.mockRestore();
    });
  });
  it('can do partial state updates', () => {
    type State = { a: number; b: number };
    @Service()
    class SessionService extends StatefulService<State> {
      constructor() {
        super({ a: 1, b: 2 });
      }
      update(values: Partial<State>) {
        this.setState(values);
      }
    }
    const fn = jest.fn(() => {});
    function Injecter() {
      fn();
      const service = useService(SessionService);
      const runRef = useRef<number>(0);
      useEffect(() => {
        service.update({ b: 3 });
      }, [service]);
      runRef.current++;
      if (runRef.current === 1) {
        expect(service.state).toEqual({ a: 1, b: 2 });
      } else if (runRef.current === 2) {
        expect(service.state).toEqual({ a: 1, b: 3 });
      }
      return <div>hello</div>;
    }
    function App() {
      return (
        <ServiceContainer services={[SessionService]}>
          <Injecter />
        </ServiceContainer>
      );
    }
    render(<App />);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
