import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../layout/Header';
import { SearchMetadata } from '@/services/search.service';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
    Search: () => <div data-testid="search-icon" />,
    Users: () => <div data-testid="users-icon" />,
    Grid3X3: () => <div data-testid="grid-icon" />,
}));

describe('Header', () => {
    const mockMetadata: SearchMetadata = {
        vendors: ['Apple', 'Samsung', 'Google'],
        productTypes: ['Smartphone', 'Laptop', 'Tablet'],
        priceRange: { min: 10, max: 2000 },
        stats: {
            totalProducts: 5954,
            uniqueVendors: 125,
            uniqueProductTypes: 45,
            priceRange: { min: 10, max: 2000 },
            avgPrice: 350.75,
        },
    };

    it('should render header with logo and title', () => {
        render(<Header />);

        expect(screen.getByText('Product Discovery')).toBeInTheDocument();
        expect(screen.getByText('Search across brands & categories')).toBeInTheDocument();
        expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should render stats when metadata is provided', () => {
        render(<Header metadata={mockMetadata} />);

        // Check if stats are displayed (only Brands and Categories, no Products count)
        expect(screen.getByText('125')).toBeInTheDocument();
        expect(screen.getByText('Brands')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
        expect(screen.getByText('Categories')).toBeInTheDocument();

        // Products count should not be displayed
        expect(screen.queryByText('5,954')).not.toBeInTheDocument();
        expect(screen.queryByText('Products')).not.toBeInTheDocument();
    });

    it('should not render stats when metadata is not provided', () => {
        render(<Header />);

        // Stats should not be present
        expect(screen.queryByText('Brands')).not.toBeInTheDocument();
        expect(screen.queryByText('Categories')).not.toBeInTheDocument();
    });

    it('should display numbers without formatting', () => {
        const metadataWithLargeNumbers: SearchMetadata = {
            ...mockMetadata,
            stats: {
                ...mockMetadata.stats,
                uniqueVendors: 1234,
                uniqueProductTypes: 567,
            },
        };

        render(<Header metadata={metadataWithLargeNumbers} />);

        // Numbers are displayed directly without comma formatting
        expect(screen.getByText('1234')).toBeInTheDocument();
        expect(screen.getByText('567')).toBeInTheDocument();
    });

    it('should render icons in stats', () => {
        render(<Header metadata={mockMetadata} />);

        // Only Users and Grid icons are shown (no Package icon)
        expect(screen.getByTestId('users-icon')).toBeInTheDocument();
        expect(screen.getByTestId('grid-icon')).toBeInTheDocument();

        // Package icon should not be present
        expect(screen.queryByTestId('package-icon')).not.toBeInTheDocument();
    });

    it('should have proper styling classes', () => {
        const { container } = render(<Header metadata={mockMetadata} />);

        // Check for main header classes
        const header = container.querySelector('header');
        expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });

    it('should handle zero values in stats', () => {
        const metadataWithZeros: SearchMetadata = {
            ...mockMetadata,
            stats: {
                ...mockMetadata.stats,
                uniqueVendors: 0,
                uniqueProductTypes: 0,
            },
        };

        render(<Header metadata={metadataWithZeros} />);

        // Since there are multiple "0" values, let's check for all of them
        const zeroElements = screen.getAllByText('0');
        expect(zeroElements).toHaveLength(2); // Only Brands and Categories (no Products)
    });
}); 