import 'reflect-metadata';
import React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import {
  Injectable,
  ServiceContainer,
  StatefulService,
  useService,
  useServiceSelector,
} from '../src';

@Injectable()
class SimpleService {
  hi = () => {};
}

@Injectable()
class ProductService extends StatefulService<{ products: string[] }> {
  constructor() {
    super({ products: ['a'] });
  }

  addProduct = (name: string) => {
    this.setState({ products: [...this.state.products, name] });
  };

  get first() {
    return this.state.products[0];
  }

  get count() {
    return this.state.products.length;
  }
}

describe('selector', () => {
  afterEach(() => {
    cleanup();
  });

  it('injecter renders once', () => {
    const fn = jest.fn(() => {});
    function Injecter() {
      fn();
      const add = useServiceSelector(ProductService, (s) => s.addProduct);
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
  it('can use a non-stateful service', () => {
    const fn = jest.fn(() => {});
    function Injecter() {
      fn();
      const hi = useServiceSelector(SimpleService, (s) => s.hi);
      return <div>hello</div>;
    }
    function App() {
      return (
        <ServiceContainer services={[SimpleService]}>
          <Injecter />
        </ServiceContainer>
      );
    }
    render(<App />);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('injecter does not re-render if state changes but selector result does not', () => {
    const fn = jest.fn(() => {});
    function Injecter() {
      fn();
      const { add } = useServiceSelector(ProductService, (s) => ({
        add: s.addProduct,
      }));
      return (
        <div>
          <button onClick={() => add('b')}>add</button>
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
  it('injecter does re-render if state changes and selector result does, too', () => {
    const fn = jest.fn(() => {});
    function Injecter() {
      fn();
      const { add } = useServiceSelector(ProductService, (s) => ({
        products: s.state.products,
        add: s.addProduct,
      }));
      return (
        <div>
          <button onClick={() => add('b')}>add</button>
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
  it('injecter re-renders if state changes and primitive selector result changes', () => {
    const fn = jest.fn(() => {});
    function Injecter() {
      fn();
      const { addProduct } = useService(ProductService, () => []);
      const length = useServiceSelector(
        ProductService,
        (s) => s.state.products.length
      );
      return (
        <div>
          length: {length}
          <button onClick={() => addProduct('b')}>add</button>
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
    const { container, getByText } = render(<App />);
    expect(getByText('length: 1')).toBeTruthy();
    fireEvent.click(container.querySelector('button')!);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(getByText('length: 2')).toBeTruthy();
  });
});
