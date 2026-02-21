import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReminderList from './reminder-list';
import '@testing-library/jest-dom';

// Mock the API response
jest.mock('@/lib/api', () => ({
    getReminders: jest.fn().mockResolvedValue({
        data: [
            {
                id: 1,
                title: 'Test Reminder',
                message: 'Hello World',
                phone_number: '+1234567890',
                scheduled_time: new Date().toISOString(),
                status: 'scheduled'
            }
        ],
        nextCursor: undefined
    }),
    deleteReminder: jest.fn()
}));

const queryClient = new QueryClient();

describe('ReminderList', () => {
    it('renders loading skeleton initially', () => {
        render(
            <QueryClientProvider client={new QueryClient()}>
                <ReminderList />
            </QueryClientProvider>
        );
        expect(screen.getByText('Upcoming Reminders')).toBeInTheDocument();
    });

    it('renders reminders after successful fetch', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <ReminderList />
            </QueryClientProvider>
        );

        // Using waitFor to wait for queries to resolve and the list to appear
        await waitFor(() => {
            expect(screen.getByText('Test Reminder')).toBeInTheDocument();
            expect(screen.getByText('Hello World')).toBeInTheDocument();
        });
    });
});
