'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReminder } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Need to add textarea
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const formSchema = z.object({
    title: z.string().min(2, "Title is too short").max(50),
    message: z.string().min(5, "Message must be at least 5 characters"),
    phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number (E.164 format preferred)"),
    scheduled_time: z.string()
        .refine((val) => {
            const date = new Date(val);
            // Allow up to a 5 minute buffer for clock skew or slow typing
            return date.getTime() > Date.now() - 5 * 60 * 1000;
        }, "Time must be in the future (plus a small buffer)"),
});

export default function CreateReminderForm() {
    const queryClient = useQueryClient();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            message: "",
            phone_number: "",
            scheduled_time: "",
        },
    });

    const mutation = useMutation({
        mutationFn: createReminder,
        onSuccess: () => {
            toast.success("Reminder created successfully");
            form.reset();
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
        onError: (error) => {
            toast.error(`Failed to create reminder: ${error.message}`);
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        // datetime-local input respects user's local timezone.
        // We parse it into a Javascript Date object which automatically understands local time
        // and `.toISOString()` consistently outputs the UTC equivalent mapping for the server.
        const date = new Date(values.scheduled_time);
        const isoString = date.toISOString();

        mutation.mutate({ ...values, scheduled_time: isoString });
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Create Reminder</CardTitle>
                <CardDescription>Schedule a call for yourself or a friend.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Wake up call" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message (to be spoken)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Wake up! You have a meeting." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1234567890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="scheduled_time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Time</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? "Scheduling..." : "Schedule Call"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
