import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
    it('should render correctly', () => {
        render(<Input placeholder="Enter text" />);
        const input = screen.getByPlaceholderText('Enter text');
        expect(input).toBeInTheDocument();
    });

    it('should handle change events', () => {
        const handleChange = jest.fn();
        render(<Input onChange={handleChange} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should apply custom classes', () => {
        render(<Input className="custom-class" />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('custom-class');
    });

    it('should support different types', () => {
        render(<Input type="password" placeholder="Password" />);
        const input = screen.getByPlaceholderText('Password');
        expect(input).toHaveAttribute('type', 'password');
    });

    it('should be disabled when disabled prop is passed', () => {
        render(<Input disabled />);
        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
    });
});
