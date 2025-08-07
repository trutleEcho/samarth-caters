'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {FileQuestion} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';

export default function NotFound() {
    const t = useTranslations('errors');
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="max-w-lg w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <FileQuestion className="h-5 w-5"/>
                        {t('pageNotFound')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            {t('pageNotFoundMessage')}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => router.back()}
                                variant="secondary"
                            >
                                {t('goBack')}
                            </Button>
                            <Button
                                onClick={() => router.push('/')}
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