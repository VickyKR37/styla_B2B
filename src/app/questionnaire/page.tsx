// src/app/questionnaire/page.tsx
'use client';

import QuestionnaireForm from '@/components/QuestionnaireForm';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { QuestionnaireData } from '@/types';
import { STORAGE_KEYS, writeLocalJson } from '@/lib/clientStorage';

export default function QuestionnairePage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: QuestionnaireData) => {
    try {
      writeLocalJson(STORAGE_KEYS.PENDING_QUESTIONNAIRE, data);
      toast({
        title: 'Draft saved',
        description: 'Client answers stored locally — continue to billing to generate her report.',
      });
      router.push('/payment');
    } catch (error) {
      toast({
        title: 'Could not save',
        description: 'Could not persist client questionnaire answers locally. Please try again.',
        variant: 'destructive',
      });
      console.error('Error saving questionnaire to localStorage:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 p-6 bg-card border rounded-lg shadow">
        <h2 className="text-xl font-semibold text-primary mb-4">Before you begin…</h2>
        <div className="space-y-3 text-sm text-foreground">
          <p>Your client will need a mirror, a metre stick, and measuring tape positioned where you can observe her.</p>
          <p>
            Before you record answers together, brainstorm three intention words describing how she wants her style to
            read (e.g. quirky, approachable, commanding). Discuss how those words translate into silhouette, colour, or
            texture choices.
          </p>
          <p>
            Keep those words handy while guiding her through garments—then capture the anatomical datapoints below on
            her behalf when you observe them yourself.
          </p>
          <p>
            The resulting style analysis is authored for{' '}
            <strong className="text-primary">your client</strong>; you are documenting professional measurements and
            visual assessments as her image consultant.
          </p>
        </div>
      </div>
      <QuestionnaireForm onSubmit={handleSubmit} />
    </div>
  );
}
