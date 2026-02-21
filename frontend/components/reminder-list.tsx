'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReminders, deleteReminder, Reminder } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { Trash2, Phone, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from 'react';

export default function ReminderList() {
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['reminders'],
        queryFn: ({ pageParam = 1 }) => getReminders(pageParam, 20),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: 1,
    });

    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: deleteReminder,
        onSuccess: () => {
            toast.success("Reminder deleted");
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to delete reminder");
        }
    });

    const [activeTab, setActiveTab] = useState("all");

    // Flatten pages and filter locally
    const filteredReminders = useMemo(() => {
        const allReminders = data?.pages.flatMap(page => page.data) || [];
        return allReminders.filter(r => {
            if (activeTab === "all") return true;
            return r.status === activeTab;
        });
    }, [data, activeTab]);

    if (isLoading) {
        return (
            <Card className="w-full" aria-busy="true" aria-live="polite">
                <CardHeader>
                    <CardTitle>Upcoming Reminders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-red-500" role="alert">
                <CardContent className="pt-6 text-center text-red-500">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p>{error.message || "Failed to load reminders. Is the backend running?"}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Dashboard</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="failed">Failed</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab}>
                        {filteredReminders.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>No reminders found.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReminders.map((reminder) => (
                                        <TableRow key={reminder.id}>
                                            <TableCell>
                                                <StatusBadge status={reminder.status} />
                                            </TableCell>
                                            <TableCell className="font-medium">{reminder.title}</TableCell>
                                            <TableCell className="max-w-[200px] truncate text-muted-foreground">{reminder.message}</TableCell>
                                            <TableCell>{maskPhone(reminder.phone_number)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{format(parseISO(reminder.scheduled_time), 'MMM d, yyyy h:mm a')}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(parseISO(reminder.scheduled_time), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteMutation.mutate(reminder.id)}
                                                    disabled={deleteMutation.isPending}
                                                    aria-label={`Delete reminder: ${reminder.title}`}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {hasNextPage && (
                            <div className="flex justify-center mt-4 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    aria-label="Load more reminders"
                                >
                                    {isFetchingNextPage ? "Loading..." : "Load More"}
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'completed') {
        return <Badge className="bg-green-600 hover:bg-green-700" aria-label="Status: Completed"><CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" /> Completed</Badge>;
    }
    if (status === 'failed') {
        return <Badge variant="destructive" aria-label="Status: Failed"><AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" /> Failed</Badge>;
    }
    return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200" aria-label="Status: Scheduled"><Clock className="w-3 h-3 mr-1" aria-hidden="true" /> Scheduled</Badge>;
}

function maskPhone(phone: string) {
    if (!phone || phone.length < 5) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-4);
}
