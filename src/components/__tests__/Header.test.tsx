import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../layout/Header';
import { SearchMetadata } from '@/services/search.service';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
    Search: () => <div data-testid="search-icon" />,
    Package: () => <div data-testid="package-icon" />,
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

        // Check if stats are displayed
        expect(screen.getByText('5,954')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(screen.getByText('125')).toBeInTheDocument();
        expect(screen.getByText('Brands')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
        expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('should not render stats when metadata is not provided', () => {
        render(<Header />);

        // Stats should not be present
        expect(screen.queryByText('Products')).not.toBeInTheDocument();
        expect(screen.queryByText('Brands')).not.toBeInTheDocument();
        expect(screen.queryByText('Categories')).not.toBeInTheDocument();
    });

    it('should format numbers with commas', () => {
        const metadataWithLargeNumbers: SearchMetadata = {
            ...mockMetadata,
            stats: {
                ...mockMetadata.stats,
                totalProducts: 1234567,
            },
        };

        render(<Header metadata={metadataWithLargeNumbers} />);

        expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('should render icons in stats', () => {
        render(<Header metadata={mockMetadata} />);

        expect(screen.getByTestId('package-icon')).toBeInTheDocument();
        expect(screen.getByTestId('users-icon')).toBeInTheDocument();
        expect(screen.getByTestId('grid-icon')).toBeInTheDocument();
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
                totalProducts: 0,
                uniqueVendors: 0,
                uniqueProductTypes: 0,
            },
        };

        render(<Header metadata={metadataWithZeros} />);

        // Since there are multiple "0" values, let's check for all of them
        const zeroElements = screen.getAllByText('0');
        expect(zeroElements).toHaveLength(3); // Products, Brands, Categories
    });
}); 