import 'reflect-metadata';
import React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import {
  Injectable,
  ServiceContainer,
  StatefulService,
  useService,
} from '../src';

@Injectable()
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
  it('injecter re-renders once when state is changed', () => {
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
      const productService = useService(ProductService, ({ first }) => [first]);
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
      const productService = useService(ProductService, ({ count }) => [count]);
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
