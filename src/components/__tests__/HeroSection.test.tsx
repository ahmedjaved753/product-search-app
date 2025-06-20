import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '../search/HeroSection';

// Mock the SearchBar component
jest.mock('../search/SearchBar', () => ({
    SearchBar: ({ query, onQueryChange, onClear, loading }: { query: string; onQueryChange: (query: string) => void; onClear: () => void; loading: boolean }) => (
        <div data-testid="search-bar">
            <input
                data-testid="search-input"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
            />
            <button data-testid="clear-button" onClick={onClear}>
                Clear
            </button>
            {loading && <div data-testid="loading">Loading...</div>}
        </div>
    ),
}));

describe('HeroSection', () => {
    const defaultProps = {
        query: '',
        onQueryChange: jest.fn(),
        onClear: jest.fn(),
        loading: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render hero title and description', () => {
        render(<HeroSection {...defaultProps} />);

        expect(screen.getByText('Discover Amazing Products')).toBeInTheDocument();
        expect(screen.getByText(/Search through thousands of products/)).toBeInTheDocument();
    });

    it('should render SearchBar component', () => {
        render(<HeroSection {...defaultProps} />);

        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('should pass props to SearchBar correctly', () => {
        const props = {
            query: 'test query',
            onQueryChange: jest.fn(),
            onClear: jest.fn(),
            loading: true,
        };

        render(<HeroSection {...props} />);

        expect(screen.getByTestId('search-input')).toHaveValue('test query');
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should have proper styling structure', () => {
        const { container } = render(<HeroSection {...defaultProps} />);

        // Check for main container
        const mainDiv = container.firstChild as HTMLElement;
        expect(mainDiv).toHaveClass('relative');

        // Check for search bar container
        const searchContainer = container.querySelector('.max-w-2xl');
        expect(searchContainer).toBeInTheDocument();
    });

    it('should handle empty query', () => {
        render(<HeroSection {...defaultProps} query="" />);

        expect(screen.getByTestId('search-input')).toHaveValue('');
    });

    it('should handle non-empty query', () => {
        render(<HeroSection {...defaultProps} query="iPhone" />);

        expect(screen.getByTestId('search-input')).toHaveValue('iPhone');
    });
}); 