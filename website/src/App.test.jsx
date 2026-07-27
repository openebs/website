/* eslint-disable no-undef */
import { render } from '@testing-library/react';
import App from './App';

test('renders the app without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
