import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
    it('should render correctly', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
    });

    it('should handle click events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render disabled state', () => {
        render(<Button disabled>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeDisabled();
    });

    it('should render different variants', () => {
        const { rerender } = render(<Button variant="destructive">Delete</Button>);
        expect(screen.getByRole('button')).toHaveClass('from-red-500');

        rerender(<Button variant="outline">Cancel</Button>);
        expect(screen.getByRole('button')).toHaveClass('border-2');
    });
});
