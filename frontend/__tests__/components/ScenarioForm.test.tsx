// ─── ShadowDrive AI — ScenarioForm Component Tests ───

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScenarioForm from '@/components/ScenarioForm';

function getGoButton() {
    return document.getElementById('go-button')!;
}

describe('ScenarioForm', () => {
    it('disables GO button when isLoading is true', () => {
        const onSubmit = vi.fn();
        render(<ScenarioForm onSubmit={onSubmit} isLoading={true} />);

        const goButton = getGoButton();
        expect(goButton).toBeDisabled();
        expect(goButton).toHaveTextContent(/oluşturuluyor/i);
    });

    it('disables GO button when topic is empty', () => {
        const onSubmit = vi.fn();
        render(<ScenarioForm onSubmit={onSubmit} isLoading={false} />);

        const goButton = getGoButton();
        expect(goButton).toBeDisabled();
    });

    it('enables GO button when topic is filled and not loading', () => {
        const onSubmit = vi.fn();
        render(<ScenarioForm onSubmit={onSubmit} isLoading={false} />);

        const input = screen.getByLabelText(/senaryo konusu/i);
        fireEvent.change(input, { target: { value: 'Koffie bestellen' } });

        const goButton = getGoButton();
        expect(goButton).not.toBeDisabled();
    });

    it('calls onSubmit with topic and level when form is submitted', () => {
        const onSubmit = vi.fn();
        render(<ScenarioForm onSubmit={onSubmit} isLoading={false} />);

        const topicInput = screen.getByLabelText(/senaryo konusu/i);
        fireEvent.change(topicInput, { target: { value: '  Bij de huisarts  ' } });

        fireEvent.click(getGoButton());

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith('Bij de huisarts', 'A0-A1');
    });

    it('calls onSubmit with selected CEFR level when level is changed', () => {
        const onSubmit = vi.fn();
        render(<ScenarioForm onSubmit={onSubmit} isLoading={false} />);

        fireEvent.change(screen.getByLabelText(/senaryo konusu/i), {
            target: { value: 'Test topic' },
        });

        // Select B1 level (level buttons contain label + "B1" badge)
        const levelButtons = screen.getAllByRole('button').filter((b) => b.textContent?.includes('B1') && b.textContent?.includes('Orta'));
        fireEvent.click(levelButtons[0]!);

        fireEvent.click(getGoButton());

        expect(onSubmit).toHaveBeenCalledWith('Test topic', 'B1');
    });

    it('quick topic chip sets topic when clicked', () => {
        const onSubmit = vi.fn();
        render(<ScenarioForm onSubmit={onSubmit} isLoading={false} />);

        const chip = screen.getByRole('button', { name: 'Koffie bestellen' });
        fireEvent.click(chip);

        expect(screen.getByDisplayValue('Koffie bestellen')).toBeInTheDocument();

        fireEvent.click(getGoButton());
        expect(onSubmit).toHaveBeenCalledWith('Koffie bestellen', 'A0-A1');
    });
});
