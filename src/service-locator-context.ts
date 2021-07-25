import { Container } from 'inversify';
import React from 'react';

export const ServiceLocatorContext = React.createContext<Container | null>(
  null
);
