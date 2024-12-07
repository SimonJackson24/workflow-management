// core/frontend/src/tests/utils/testHelpers.ts

import { render, RenderOptions } from '@testing-library/react';
import { TestProviders } from './TestProviders';

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialState?: any }
) => {
  const { initialState, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders initialState={initialState}>{children}</TestProviders>
    ),
    ...renderOptions
  });
};

export * from '@testing-library/react';
export { customRender as render };
