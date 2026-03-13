import React from 'react';
import { render, screen } from '@testing-library/react';
import HeroSliderStatic from './HeroSliderStatic';

describe('HeroSliderStatic', () => {
  it('renders pitch text props', () => {
    render(<HeroSliderStatic string={{}} pitch1="Sub" pitch2="Main" pitch3="Shop Now" />);
    expect(screen.getByText('Sub')).toBeInTheDocument();
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Shop Now')).toBeInTheDocument();
  });

  it('Shop Now button links to /category/all', () => {
    render(<HeroSliderStatic string={{}} pitch3="Shop Now" />);
    expect(screen.getByText('Shop Now').closest('a')).toHaveAttribute('href', '/category/all');
  });
});
