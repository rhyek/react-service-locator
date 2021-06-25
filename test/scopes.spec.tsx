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
class TheService {}

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

describe('scopes', () => {
  afterEach(() => {
    cleanup();
  });

  describe('singleton', () => {
    describe('implicit', () => {
      it('shorthand', () => {
        function Injecter() {
          const service1 = useService(TheService);
          const service2 = useService(TheService);
          expect(service1 === service2).toBeTruthy();
          return <div>hello</div>;
        }
        function App() {
          return (
            <ServiceContainer services={[TheService]}>
              <Injecter />
            </ServiceContainer>
          );
        }
        render(<App />);
      });
      it('useClass', () => {
        function Injecter() {
          const service1 = useService(TheService);
          const service2 = useService(TheService);
          expect(service1 === service2).toBeTruthy();
          return <div>hello</div>;
        }
        function App() {
          return (
            <ServiceContainer
              services={[{ provide: TheService, useClass: TheService }]}
            >
              <Injecter />
            </ServiceContainer>
          );
        }
        render(<App />);
      });
      it('useFactory', () => {
        function Injecter() {
          const service1 = useService(TheService);
          const service2 = useService(TheService);
          expect(service1 === service2).toBeTruthy();
          return <div>hello</div>;
        }
        function App() {
          return (
            <ServiceContainer
              services={[
                { provide: TheService, useFactory: () => new TheService() },
              ]}
            >
              <Injecter />
            </ServiceContainer>
          );
        }
        render(<App />);
      });
      it('useValue', () => {
        function Injecter() {
          const service1 = useService(TheService);
          const service2 = useService(TheService);
          expect(service1 === service2).toBeTruthy();
          return <div>hello</div>;
        }
        function App() {
          return (
            <ServiceContainer
              services={[{ provide: TheService, useValue: new TheService() }]}
            >
              <Injecter />
            </ServiceContainer>
          );
        }
        render(<App />);
      });
    });
    describe('explicit', () => {
      it('useClass', () => {
        function Injecter() {
          const service1 = useService(TheService);
          const service2 = useService(TheService);
          expect(service1 === service2).toBeTruthy();
          return <div>hello</div>;
        }
        function App() {
          return (
            <ServiceContainer
              services={[
                {
                  provide: TheService,
                  useClass: TheService,
                  scope: 'singleton',
                },
              ]}
            >
              <Injecter />
            </ServiceContainer>
          );
        }
        render(<App />);
      });
      it('useFactory', () => {
        function Injecter() {
          const service1 = useService(TheService);
          const service2 = useService(TheService);
          expect(service1 === service2).toBeTruthy();
          return <div>hello</div>;
        }
        function App() {
          return (
            <ServiceContainer
              services={[
                {
                  provide: TheService,
                  useFactory: () => new TheService(),
                  scope: 'singleton',
                },
              ]}
            >
              <Injecter />
            </ServiceContainer>
          );
        }
        render(<App />);
      });
      it('useValue', () => {
        function Injecter() {
          const service1 = useService(TheService);
          const service2 = useService(TheService);
          expect(service1 === service2).toBeTruthy();
          return <div>hello</div>;
        }
        function App() {
          return (
            <ServiceContainer
              services={[{ provide: TheService, useValue: new TheService() }]}
            >
              <Injecter />
            </ServiceContainer>
          );
        }
        render(<App />);
      });
    });
  });
  describe('transient', () => {
    it('useClass', () => {
      function Injecter() {
        const service1 = useService(TheService);
        const service2 = useService(TheService);
        expect(service1 !== service2).toBeTruthy();
        return <div>hello</div>;
      }
      function App() {
        return (
          <ServiceContainer
            services={[
              {
                provide: TheService,
                useClass: TheService,
                scope: 'transient',
              },
            ]}
          >
            <Injecter />
          </ServiceContainer>
        );
      }
      render(<App />);
    });
    it('useFactory', () => {
      function Injecter() {
        const service1 = useService(TheService);
        const service2 = useService(TheService);
        expect(service1 !== service2).toBeTruthy();
        return <div>hello</div>;
      }
      function App() {
        return (
          <ServiceContainer
            services={[
              {
                provide: TheService,
                useFactory: () => new TheService(),
                scope: 'transient',
              },
            ]}
          >
            <Injecter />
          </ServiceContainer>
        );
      }
      render(<App />);
    });
    it('obtains the same instance after re-render', () => {
      const equalityChecked = jest.fn(() => {});
      const fn = jest.fn(() => {});
      let theService: TheService | null = null;
      function Injecter() {
        fn();
        const lastTheService = theService;
        const newTheService = useService(TheService);
        const differentTheService = useService(TheService);

        const productService = useService(ProductService);

        expect(newTheService === differentTheService).toEqual(false);

        if (lastTheService !== null) {
          equalityChecked();
          expect(lastTheService === newTheService).toEqual(true);
        }

        theService = newTheService;

        return (
          <div>
            <button onClick={() => productService.addProduct('b')}>add</button>
          </div>
        );
      }
      function App() {
        return (
          <ServiceContainer
            services={[
              {
                provide: TheService,
                useClass: TheService,
                scope: 'transient',
              },
              ProductService,
            ]}
          >
            <Injecter />
          </ServiceContainer>
        );
      }
      const { container } = render(<App />);
      fireEvent.click(container.querySelector('button')!);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(equalityChecked).toHaveBeenCalled();
    });
  });
});
