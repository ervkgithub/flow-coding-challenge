'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("ErrorBoundary caught an error:", error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-vh-[50vh] p-4">
            <Card className="w-full max-w-md border-red-200">
                <CardHeader className="bg-red-50 text-red-900 rounded-t-lg">
                    <CardTitle className="flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        Something went wrong
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <p className="text-sm text-gray-700">
                        {error.message || "An unexpected error occurred. Please try again."}
                    </p>
                    <div className="flex justify-end pt-4">
                        <Button
                            variant="default"
                            onClick={() => reset()}
                        >
                            Try again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
