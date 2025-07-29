import { render, screen } from '@testing-library/react';
import App from './App';

test('renders VisionStudio app', () => {
  render(<App />);
  const logoElement = screen.getByText(/VisionStudio © 2023/i);
  expect(logoElement).toBeInTheDocument();
});
