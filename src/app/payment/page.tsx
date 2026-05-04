// src/app/payment/page.tsx
"use client";

import { useState, useEffect } from 'react';
import DiscountCodeInput from '@/components/DiscountCodeInput';
import PayPalCheckout from '@/components/PayPalCheckout';
import type { PaymentSuccessData } from '@/types/payment';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { processPaymentAndGenerateReport } from '@/actions/questionnaireActions';
import type { QuestionnaireData, UserReportData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STORAGE_KEYS, readLocalJson, removeLocalKey, writeLocalJson } from '@/lib/clientStorage';

const BASE_PRICE = 15.99;

const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function PaymentPage() {
  const [code, setCode] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);
  const [paymentDone, setPaymentDone] = useState<PaymentSuccessData | null>(null);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const finalPrice = BASE_PRICE - (BASE_PRICE * percent) / 100;

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    const parsedStatus = readLocalJson<PaymentSuccessData>(STORAGE_KEYS.PAYMENT_SUCCESS);
    if (parsedStatus) {
      setPaymentDone(parsedStatus);
      setShowEmailInput(true);
      console.log("Client: useEffect - Found stored payment status, setting paymentDone and showEmailInput.");
    }
  }, []);

  const handlePaymentSuccess = (data: PaymentSuccessData) => {
    console.log("Client: handlePaymentSuccess called with data:", data);
    setPaymentDone(data);
    setShowEmailInput(true);
    writeLocalJson(STORAGE_KEYS.PAYMENT_SUCCESS, data);
    toast({
      title: "Payment Confirmed!",
      description: "Your payment was successful. Please provide your email to receive the report.",
      duration: 3000,
    });
  };

  const handleEmailSubmit = async (values: EmailFormValues) => {
    setIsGeneratingReport(true);

    let questionnaireData: QuestionnaireData | null = null;
    try {
      const parsed = readLocalJson<QuestionnaireData>(STORAGE_KEYS.PENDING_QUESTIONNAIRE);
      if (parsed) {
        questionnaireData = parsed;
      } else {
        throw new Error("Questionnaire data not found");
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not retrieve questionnaire data. Please try again.",
        variant: "destructive",
      });
      setIsGeneratingReport(false);
      return;
    }

    if (!paymentDone) {
      toast({
        title: "Payment Data Missing",
        description: "Payment details were not found. Please complete the payment process again.",
        variant: "destructive",
      });
      setIsGeneratingReport(false);
      return;
    }

    try {
      const result = await processPaymentAndGenerateReport(questionnaireData, paymentDone, values.email);

      if (result.success && result.reportData) {
        writeLocalJson(STORAGE_KEYS.GENERATED_REPORT, result.reportData);
        removeLocalKey(STORAGE_KEYS.PENDING_QUESTIONNAIRE);
        removeLocalKey(STORAGE_KEYS.PAYMENT_SUCCESS);
        toast({
          title: "Report Generated!",
          description: "Your personalised style report has been sent to your email.",
          duration: 5000,
        });
        router.push("/report");
      } else {
        toast({
          title: "Report Generation Failed",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (paymentDone && showEmailInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-8 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">✓</span>
            </div>
            <CardTitle className="text-3xl font-bold text-primary mb-2">Payment Successful!</CardTitle>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase. Please enter your email to proceed to your personalised style report.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-foreground">{paymentDone.orderId}</p>
            </div>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          {...field}
                          className="bg-white/20 text-white placeholder:text-purple-200 border-purple-400 focus:border-purple-600"
                          type="email"
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isGeneratingReport}>
                  {isGeneratingReport ? <LoadingSpinner size={20} className="mr-2" /> : <Send className="mr-2 h-4 w-4" />} Get My Report
                </Button>
              </form>
            </Form>
            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <p className="text-2xl font-bold text-primary">£{paymentDone.finalAmount.toFixed(2)}</p>
            </div>
            {paymentDone.discountCode && (
              <div className="bg-green-100 rounded-lg p-3 border border-green-200">
                <p className="text-sm text-green-700">Discount Applied</p>
                <p className="font-semibold text-green-800">{paymentDone.discountCode}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-8 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-gray-700 text-sm font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Final Step: Secure Payment
          </div>
        </div>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">💎</span>
            </div>
            <CardTitle className="text-3xl font-bold text-primary mb-3">Complete Your Style Journey</CardTitle>
            <p className="text-muted-foreground text-lg mb-6">Get your personalised style report</p>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary/50 border border-border rounded-lg p-6 mb-8">
              {percent > 0 ? (
                <div>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-2xl text-muted-foreground line-through">£{BASE_PRICE.toFixed(2)}</span>
                    <span className="text-4xl font-bold text-primary">£{finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 px-3 py-1 bg-green-100 rounded-full inline-block">
                    <span className="text-green-700 text-sm font-medium">{percent}% OFF Applied!</span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-4xl font-bold text-primary">£{BASE_PRICE.toFixed(2)}</span>
                  <div className="text-muted-foreground text-sm mt-1">One-time payment</div>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <DiscountCodeInput baseAmount={BASE_PRICE} onCodeChange={(c, p) => { setCode(c); setPercent(p); }} />
              <PayPalCheckout
                baseAmount={BASE_PRICE}
                discountCode={code}
                discountPercent={percent}
                onSuccess={handlePaymentSuccess}
                onError={e => {
                  console.error("PayPal Checkout Error:", e);
                  toast({
                    title: "Payment Error",
                    description: "There was an issue with your PayPal payment. Please try again.",
                    variant: "destructive",
                  });
                }}
              />
            </div>
            <div className="mt-8 pt-6 border-t border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="text-muted-foreground">
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="text-xs">Secure</div>
                </div>
                <div className="text-muted-foreground">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs">Instant</div>
                </div>
                <div className="text-muted-foreground">
                  <div className="text-2xl mb-1">💯</div>
                  <div className="text-xs">Guaranteed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
