'use client';

// Obsolete landing for removed web signup; retained for URLs. Messaging reflects B2B consultant positioning.
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SignupPageContent() {
  const searchParams = useSearchParams();

  const fromQuestionnaire = searchParams.get('fromQuestionnaire') === 'true';
  const proceedLink = fromQuestionnaire ? '/payment' : '/questionnaire';

  return (
    <div className="text-center py-8">
      <h1 className="text-2xl font-bold mb-4">Consultant accounts on mobile</h1>
      <p className="mb-4 text-muted-foreground">
        Styla image consultants authenticate in the Styla mobile app with a consultant account. Public web questionnaires
        are an optional sandbox for prototyping client sessions.
      </p>
      <p className="mb-6">
        {fromQuestionnaire ? (
          <>
            Finished capturing a client questionnaire?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href={proceedLink}>Continue to billing</Link>
            </Button>
          </>
        ) : (
          <>
            To begin a sandbox client questionnaire,{' '}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href={proceedLink}>open the questionnaire</Link>
            </Button>
          </>
        )}
      </p>
    </div>
  );
}
