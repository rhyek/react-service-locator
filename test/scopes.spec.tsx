import 'reflect-metadata';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { Injectable, ServiceContainer, useService } from '../src';

@Injectable()
class TheService {}

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
  });
});
