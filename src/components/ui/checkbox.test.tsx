import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
    it('should render correctly', () => {
        render(<Checkbox />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
    });

    it('should handle click events', () => {
        const handleClick = jest.fn();
        render(<Checkbox onCheckedChange={handleClick} />);
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        expect(handleClick).toHaveBeenCalledWith(true);
    });

    it('should be disabled when disabled prop is passed', () => {
        render(<Checkbox disabled />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeDisabled();
    });

    it('should apply custom classes', () => {
        render(<Checkbox className="custom-class" />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveClass('custom-class');
    });
});
