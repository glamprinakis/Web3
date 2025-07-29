import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Lamprinakis-Eshop app', () => {
  render(<App />);
  const logoElement = screen.getByText(/Lamprinakis-Eshop © 2025/i);
  expect(logoElement).toBeInTheDocument();
});
