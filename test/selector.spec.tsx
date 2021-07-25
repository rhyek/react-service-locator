/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'reflect-metadata';
import React, { memo } from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import {
  Service,
  ServiceContainer,
  StatefulService,
  useService,
  useServiceSelector,
} from '../src';

@Service()
class SimpleService {
  hi = () => {};
}

@Service()
class VisibilityService extends StatefulService<{ visible: boolean }> {
  constructor() {
    super({ visible: false });
  }

  toggle = () => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  hide = () => {
    this.setState({
      visible: false,
    });
  };
}

describe('selector', () => {
  afterEach(() => {
    cleanup();
  });

  it('injecter renders once', () => {
    const fn = jest.fn(() => {});
    function Injecter() {
      fn();
      const toggle = useServiceSelector(VisibilityService, (s) => s.toggle);
      return <div>hello</div>;
    }
    function App() {
      return (
        <ServiceContainer services={[VisibilityService]}>
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
      const { toggle } = useServiceSelector(VisibilityService, (s) => ({
        toggle: s.toggle,
      }));
      return (
        <div>
          <button onClick={() => toggle()}></button>
        </div>
      );
    }
    function App() {
      return (
        <ServiceContainer services={[VisibilityService]}>
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
      const { toggle } = useServiceSelector(VisibilityService, (s) => ({
        visible: s.state.visible,
        toggle: s.toggle,
      }));
      return (
        <div>
          <button onClick={() => toggle()}></button>
        </div>
      );
    }
    function App() {
      return (
        <ServiceContainer services={[VisibilityService]}>
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
      const { toggle } = useService(VisibilityService, () => []);
      const visible = useServiceSelector(
        VisibilityService,
        (s) => s.state.visible
      );
      return (
        <div>
          visible: {visible ? 'yes' : 'no'}
          <button onClick={() => toggle()}>add</button>
        </div>
      );
    }
    function App() {
      return (
        <ServiceContainer services={[VisibilityService]}>
          <Injecter />
        </ServiceContainer>
      );
    }
    const { container, getByText } = render(<App />);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(getByText('visible: no')).toBeTruthy();
    fireEvent.click(container.querySelector('button')!);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(getByText('visible: yes')).toBeTruthy();
  });
  it('complex test', () => {
    const fn1 = jest.fn(() => {});
    const Injecter1 = memo(() => {
      fn1();
      const { visible } = useServiceSelector(VisibilityService, (s) => ({
        visible: s.state.visible,
      }));
      return <div>visible1: {visible ? 'yes' : 'no'}</div>;
    });
    const fn2 = jest.fn(() => {});
    const Injecter2 = memo(() => {
      fn2();
      const { toggle } = useService(VisibilityService, () => []);
      const { visible } = useServiceSelector(VisibilityService, (s) => ({
        visible: s.state.visible,
      }));
      return (
        <div>
          visible2: {visible ? 'yes' : 'no'}
          <button onClick={() => toggle()}></button>
        </div>
      );
    });
    function App() {
      return (
        <ServiceContainer>
          <Injecter1 />
          <Injecter2 />
        </ServiceContainer>
      );
    }
    const { container, getByText } = render(<App />);

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(getByText('visible1: no')).toBeTruthy();
    expect(getByText('visible2: no')).toBeTruthy();

    fireEvent.click(container.querySelector('button')!);
    expect(fn1).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(2);
    expect(getByText('visible1: yes')).toBeTruthy();
    expect(getByText('visible2: yes')).toBeTruthy();

    fireEvent.click(container.querySelector('button')!);
    expect(fn1).toHaveBeenCalledTimes(3);
    expect(fn2).toHaveBeenCalledTimes(3);
    expect(getByText('visible1: no')).toBeTruthy();
    expect(getByText('visible2: no')).toBeTruthy();
  });
});
