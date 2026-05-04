// This route is legacy; consultant registration flows through the Styla mobile app.
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-md p-6 text-center bg-card rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Consultant professional account</h1>
          <p className="mb-6 text-muted-foreground">
            Image consultants onboard through the Styla mobile experience. Prefer to preview the flow for a client in
            the browser? Capture answers on her behalf via the questionnaire, then settle billing separately.
          </p>
          <Button asChild>
            <Link href="/questionnaire">Start client questionnaire (preview)</Link>
          </Button>
        </div>
      </div>
    </Suspense>
  );
}
