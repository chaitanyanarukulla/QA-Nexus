import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
    it('should render correctly', () => {
        render(<Badge>New</Badge>);
        const badge = screen.getByText('New');
        expect(badge).toBeInTheDocument();
    });

    it('should apply variant classes', () => {
        const { container } = render(<Badge variant="success">Success</Badge>);
        expect(container.firstChild).toHaveClass('bg-success-100');
    });

    it('should apply size classes', () => {
        const { container } = render(<Badge size="sm">Small</Badge>);
        expect(container.firstChild).toHaveClass('text-xs');
    });
});
