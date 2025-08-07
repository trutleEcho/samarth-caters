'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {AlertCircle} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useEffect} from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations('errors');

    useEffect(() => {
        console.error('Runtime error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="max-w-lg w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5"/>
                        {t('errorOccurred')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            {t('errorMessage')}
                        </p>
                        {process.env.NODE_ENV === 'development' && (
                            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                                {error.message}
                                {error.digest && (
                                    <>
                                        <br/>
                                        <span className="text-xs text-muted-foreground">
                                            Digest: {error.digest}
                                        </span>
                                    </>
                                )}
                            </pre>
                        )}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => reset()}
                                variant="secondary"
                            >
                                {t('tryAgain')}
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                            >
                                {t('goHome')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}