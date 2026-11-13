import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion } from '../components/ui/Accordion';

const sampleFaq = [
  { id: 'item-1', question: 'How is the model trained?', answer: 'Using 50-tree Random Forest.' },
  { id: 'item-2', question: 'What is the decision latency?', answer: 'Under 5 milliseconds.' },
];

describe('Accordion Component', () => {
  it('renders FAQ questions and defaults first item open', () => {
    render(<Accordion items={sampleFaq} />);

    expect(screen.getByText('How is the model trained?')).toBeInTheDocument();
    expect(screen.getByText('Using 50-tree Random Forest.')).toBeInTheDocument();
  });

  it('toggles accordion items when button clicked', () => {
    render(<Accordion items={sampleFaq} />);

    const secondQuestionBtn = screen.getByRole('button', { name: /what is the decision latency/i });
    expect(secondQuestionBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(secondQuestionBtn);
    expect(secondQuestionBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Under 5 milliseconds.')).toBeInTheDocument();
  });
});

