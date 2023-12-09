import React from 'react';
import TestRenderer from 'react-test-renderer';
import InputField from './AddUsers.js';

//Make sure CSS import in AddUsers.js is commented out
describe('InputField component', () => {
    it('renders correctly', () => {
        const tree = TestRenderer.create(<InputField onInputChange={() => {}} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('handles input change and form submission', () => {
        // Mock the onInputChange function
        const mockOnInputChange = jest.fn();

        // Create a test renderer instance
        const renderer = TestRenderer.create(<InputField onInputChange={mockOnInputChange} />);
        const instance = renderer.root;  // Use .root instead of .getInstance()

        // Simulate user input
        instance.findByType('input').props.onChange({ target: { value: 'TestInput' } });

        // Trigger form submission
        instance.findByType('form').props.onSubmit({ preventDefault: jest.fn() });

        // Check if onInputChange was called with the correct value
        expect(mockOnInputChange).toHaveBeenCalledWith('TestInput');
    });
});
