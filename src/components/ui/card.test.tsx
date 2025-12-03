import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card', () => {
    it('should render correctly', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>Content</CardContent>
                <CardFooter>Footer</CardFooter>
            </Card>
        );

        expect(screen.getByText('Card Title')).toBeInTheDocument();
        expect(screen.getByText('Card Description')).toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
        expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('should apply variant classes', () => {
        const { container } = render(<Card variant="elevated">Content</Card>);
        // Check if the div has the shadow-md class which is part of elevated variant
        expect(container.firstChild).toHaveClass('shadow-md');
    });

    it('should handle interactive prop', () => {
        const { container } = render(<Card interactive>Content</Card>);
        expect(container.firstChild).toHaveClass('cursor-pointer');
    });
});
