import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ShopPriceFilter from './ShopPriceFilter';

const string = {};

describe('ShopPriceFilter', () => {
  it('renders Min and Max inputs and Apply/Reset buttons', () => {
    render(<ShopPriceFilter string={string} getSortParams={() => {}} />);
    expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('calls getSortParams with parsed min/max on Apply', () => {
    const getSortParams = jest.fn();
    render(<ShopPriceFilter string={string} getSortParams={getSortParams} />);
    fireEvent.change(screen.getByPlaceholderText('Min'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('Max'), { target: { value: '100' } });
    fireEvent.click(screen.getByText('Apply'));
    expect(getSortParams).toHaveBeenCalledWith('price', { min: 10, max: 100 });
  });

  it('calls getSortParams with defaults and clears inputs on Reset', () => {
    const getSortParams = jest.fn();
    render(<ShopPriceFilter string={string} getSortParams={getSortParams} />);
    fireEvent.change(screen.getByPlaceholderText('Min'), { target: { value: '20' } });
    fireEvent.click(screen.getByText('Reset'));
    expect(getSortParams).toHaveBeenCalledWith('price', { min: 0, max: Infinity });
    expect(screen.getByPlaceholderText('Min').value).toBe('');
    expect(screen.getByPlaceholderText('Max').value).toBe('');
  });

  it('uses 0 for min and Infinity for max when inputs are empty on Apply', () => {
    const getSortParams = jest.fn();
    render(<ShopPriceFilter string={string} getSortParams={getSortParams} />);
    fireEvent.click(screen.getByText('Apply'));
    expect(getSortParams).toHaveBeenCalledWith('price', { min: 0, max: Infinity });
  });

  it('uses string prop labels when provided', () => {
    render(<ShopPriceFilter string={{ Price: 'Preis', Apply: 'Anwenden', Reset: 'Zurücksetzen' }} getSortParams={() => {}} />);
    expect(screen.getByText('Preis')).toBeInTheDocument();
    expect(screen.getByText('Anwenden')).toBeInTheDocument();
    expect(screen.getByText('Zurücksetzen')).toBeInTheDocument();
  });
});
