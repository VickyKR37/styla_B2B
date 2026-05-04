
"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import type { QuestionnaireData, LineAnswer, ScaleAnswer } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { STORAGE_KEYS, readLocalJson, removeLocalKey, writeLocalJson } from "@/lib/clientStorage";

// Schemas for individual form fields
const lineAnswerSchema = z.string().min(1, "Please select an option.");
const scaleAnswerSchema = z.string().min(1, "Please select an option.");
const bodyShapeSchema = z.string().min(1, "Please select your body shape.");

const combinedSchema = z.object({
  shoulders_answer: lineAnswerSchema,
  waist_answer: lineAnswerSchema,
  hips_answer: lineAnswerSchema,
  face_answer: lineAnswerSchema,
  jawline_answer: lineAnswerSchema,
  wrist_answer: scaleAnswerSchema,
  height_answer: scaleAnswerSchema,
  shoeSize_answer: scaleAnswerSchema,
  bodyShape: bodyShapeSchema,
});

type QuestionnaireFormValues = z.infer<typeof combinedSchema>;

const stepSchemas: z.ZodObject<any, any, any, any, any>[] = [
  z.object({
    shoulders_answer: lineAnswerSchema,
    waist_answer: lineAnswerSchema,
    hips_answer: lineAnswerSchema,
  }),
  z.object({
    face_answer: lineAnswerSchema,
    jawline_answer: lineAnswerSchema,
  }),
  z.object({
    wrist_answer: scaleAnswerSchema,
    height_answer: scaleAnswerSchema,
    shoeSize_answer: scaleAnswerSchema,
  }),
  z.object({
    bodyShape: bodyShapeSchema,
  }),
];


interface QuestionnaireFormProps {
  onSubmit: (data: QuestionnaireData) => Promise<void>;
  initialData?: Partial<QuestionnaireData>;
}

const lineOptions = {
  shoulders: [
    { value: "straight", label: "Straight", classification: "straight" },
    { value: "sloping", label: "Sloping", classification: "curved" },
  ],
  waist: [
    { value: "defined", label: "Defined", classification: "curved" },
    { value: "undefined", label: "Undefined", classification: "straight" },
  ],
  hips: [
    { value: "flared", label: "Flared", classification: "curved" },
    { value: "straight", label: "Straight", classification: "straight" },
  ],
  face: [
    { value: "straight/thin lips", label: "Straight/thin lips", classification: "straight" },
    { value: "curved/full lips", label: "Curved/full lips", classification: "curved" },
  ],
  jawline: [
    { value: "curved", label: "Curved", classification: "curved" },
    { value: "angular", label: "Angular", classification: "straight" },
  ],
};

const scaleOptions = {
  wrist: [
    { value: "Small - 5.5” (14cm) or less", label: "Small - 5.5” (14cm) or less" },
    { value: "Medium - 5.5 – 6.5” (14-16cm)", label: "Medium - 5.5 – 6.5” (14-16cm)" },
    { value: "Large 6.5 (16.5cm) or more", label: "Large 6.5 (16.5cm) or more" },
  ],
  height: [
    { value: "Small - Under 5’3” (1.6m)", label: "Small - Under 5’3” (1.6m)" },
    { value: "Medium - 5’3” – 5’8” (1.6-1.72m)", label: "Medium - 5’3” – 5’8” (1.6-1.72m)" },
    { value: "Large – 5’8” (1.72m) and over", label: "Large – 5’8” (1.72m) and over" },
  ],
  shoeSize: [
    { value: "Small – 35 – 37", label: "Small – 35 – 37" },
    { value: "Medium – 38 - 39", label: "Medium – 38 - 39" },
    { value: "Large – 40+", label: "Large – 40+" },
  ],
};

const bodyShapeOptions = [
  { name: "Pear Shape", description: "Smaller upper body, often with narrow shoulders and/or a petite bust. The waist is defined, leading to broader hips. This shape often includes full thighs and a more prominent lower body." },
  { name: "Inverted Triangle", description: "Shoulders are wider than the hips, often accompanied by a fuller bust. Typically, this shape also features a shorter waist." },
  { name: "Straight", description: "Hips and shoulders are aligned with little to no waist definition, creating an overall straight silhouette. Often gives a boxy or column-like appearance." },
  { name: "Round/Apple", description: "A rounded figure with fullness throughout. The waist is less defined, creating a naturally curvy outline." },
  { name: "Hourglass", description: "Balanced proportions between shoulders and hips, with a well-defined waist that is typically 8-10 inches smaller than the hips. Curves are evenly distributed, with straight shoulders and a rounded lower body." },
];


const stepTitles = [
  "Line Analysis (Part 1)",
  "Line Analysis (Part 2)",
  "Scale Assessment",
  "Horizontal Proportion (Body Shape)",
];

const stepDescriptions = [
  "Let's analyse the lines of your body structure (Shoulders, Waist, Hips).",
  "Continuing our line analysis (Face, Jawline).",
  "Let's determine your scale based on measurements.",
  "Try holding a meter stick against your shoulders (or ask a friend to help) and let it hang straight down. Observe where it aligns with your hips to get a better idea of your body shape.",
];

type QuestionnaireDraft = {
  currentStep: number;
  values: Partial<QuestionnaireFormValues>;
};

export default function QuestionnaireForm({ onSubmit, initialData }: QuestionnaireFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);

  const transformInitialDataToFormValues = (data?: Partial<QuestionnaireData>): Partial<QuestionnaireFormValues> => {
    if (!data) return {};
    const formValues: Partial<QuestionnaireFormValues> = { bodyShape: data.bodyShape as QuestionnaireFormValues['bodyShape'] };
    data.lineAnswers?.forEach(la => {
      if (la.bodyPart === 'Shoulders') formValues.shoulders_answer = la.answer;
      if (la.bodyPart === 'Waist') formValues.waist_answer = la.answer;
      if (la.bodyPart === 'Hips') formValues.hips_answer = la.answer;
      if (la.bodyPart === 'Face') formValues.face_answer = la.answer;
      if (la.bodyPart === 'Jawline') formValues.jawline_answer = la.answer;
    });
    data.scaleAnswers?.forEach(sa => {
      if (sa.category === 'Wrist Circumference') formValues.wrist_answer = sa.answer;
      if (sa.category === 'Height') formValues.height_answer = sa.answer;
      if (sa.category === 'Shoe Size') formValues.shoeSize_answer = sa.answer;
    });
    return formValues;
  };

  const form = useForm<QuestionnaireFormValues>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      shoulders_answer: transformInitialDataToFormValues(initialData).shoulders_answer || undefined,
      waist_answer: transformInitialDataToFormValues(initialData).waist_answer || undefined,
      hips_answer: transformInitialDataToFormValues(initialData).hips_answer || undefined,
      face_answer: transformInitialDataToFormValues(initialData).face_answer || undefined,
      jawline_answer: transformInitialDataToFormValues(initialData).jawline_answer || undefined,
      wrist_answer: transformInitialDataToFormValues(initialData).wrist_answer || undefined,
      height_answer: transformInitialDataToFormValues(initialData).height_answer || undefined,
      shoeSize_answer: transformInitialDataToFormValues(initialData).shoeSize_answer || undefined,
      bodyShape: transformInitialDataToFormValues(initialData).bodyShape || undefined,
    },
    mode: "onChange",
  });

  useEffect(() => {
    const pendingData = readLocalJson<QuestionnaireData>(STORAGE_KEYS.PENDING_QUESTIONNAIRE);
    if (pendingData) {
      form.reset(transformInitialDataToFormValues(pendingData));
      setCurrentStep(3);
      setDraftHydrated(true);
      return;
    }
    const draft = readLocalJson<QuestionnaireDraft>(STORAGE_KEYS.QUESTIONNAIRE_DRAFT);
    if (draft && typeof draft.currentStep === "number" && draft.values) {
      const step = Math.min(Math.max(draft.currentStep, 0), 3) as 0 | 1 | 2 | 3;
      setCurrentStep(step);
      form.reset({
        ...form.getValues(),
        ...draft.values,
      });
    }
    setDraftHydrated(true);
  }, [form]);

  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    if (!draftHydrated) return;
    const handle = window.setTimeout(() => {
      writeLocalJson(STORAGE_KEYS.QUESTIONNAIRE_DRAFT, {
        currentStep,
        values: watchedValues as Partial<QuestionnaireFormValues>,
      });
    }, 450);
    return () => window.clearTimeout(handle);
  }, [watchedValues, currentStep, draftHydrated]);

  const getClassification = (bodyPartKey: keyof typeof lineOptions, answer: string): 'straight' | 'curved' => {
    const option = lineOptions[bodyPartKey].find(opt => opt.value === answer);
    return option ? option.classification as 'straight' | 'curved' : 'straight'; // Default to straight if not found
  };

  const onFinalSubmit = async (data: QuestionnaireFormValues) => {
    setIsLoading(true);
    const lineAnswers: LineAnswer[] = [
      { bodyPart: 'Shoulders', answer: data.shoulders_answer, classification: getClassification('shoulders', data.shoulders_answer) },
      { bodyPart: 'Waist', answer: data.waist_answer, classification: getClassification('waist', data.waist_answer) },
      { bodyPart: 'Hips', answer: data.hips_answer, classification: getClassification('hips', data.hips_answer) },
      { bodyPart: 'Face', answer: data.face_answer, classification: getClassification('face', data.face_answer) },
      { bodyPart: 'Jawline', answer: data.jawline_answer, classification: getClassification('jawline', data.jawline_answer) },
    ];
    const scaleAnswers: ScaleAnswer[] = [
      { category: 'Wrist Circumference', answer: data.wrist_answer },
      { category: 'Height', answer: data.height_answer },
      { category: 'Shoe Size', answer: data.shoeSize_answer },
    ];

    const fullData: QuestionnaireData = {
      lineAnswers,
      scaleAnswers,
      bodyShape: data.bodyShape as QuestionnaireData['bodyShape'],
      // preferences field removed
    };
    removeLocalKey(STORAGE_KEYS.QUESTIONNAIRE_DRAFT);
    await onSubmit(fullData);
    setIsLoading(false);
  };

  const handleNext = async () => {
    const currentStepSchemaDef = stepSchemas[currentStep];
    let fieldsToValidate: (keyof QuestionnaireFormValues)[] = [];

    if (currentStepSchemaDef && typeof currentStepSchemaDef.shape === 'object' && currentStepSchemaDef.shape !== null) {
      fieldsToValidate = Object.keys(
        currentStepSchemaDef.shape
      ) as (keyof QuestionnaireFormValues)[];
    } else {
      console.warn(`Step schema for step ${currentStep} is not a ZodObject or shape is undefined.`);
    }

    if (fieldsToValidate.length === 0 && currentStep < stepSchemas.length - 1) {
      console.warn(`No fields identified for validation for step ${currentStep}. Proceeding or submitting.`);
    }

    const isValid = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true;

    if (isValid) {
      if (currentStep < stepSchemas.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        await form.handleSubmit(onFinalSubmit)();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const progressValue = ((currentStep + 1) / stepSchemas.length) * 100;

  const renderRadioGroup = (fieldName: keyof QuestionnaireFormValues, label: string, options: { value: string, label: string }[], description?: string) => (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-base font-semibold">{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value || undefined}
              className="flex flex-col space-y-2"
            >
              {options.map((option) => (
                <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={option.value} />
                  </FormControl>
                  <FormLabel className="font-normal text-sm">
                    {option.label}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">{stepTitles[currentStep]}</CardTitle>
        <CardDescription>{stepDescriptions[currentStep]}</CardDescription>
        <Progress value={progressValue} className="mt-2" />
        <p className="text-sm text-muted-foreground mt-1 text-right">Step {currentStep + 1} of {stepSchemas.length}</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinalSubmit)} className="space-y-8">
            {currentStep === 0 && (
              <>
                {renderRadioGroup("shoulders_answer", "Shoulders:", lineOptions.shoulders)}
                {renderRadioGroup("waist_answer", "Waist:", lineOptions.waist, "A defined waist is at least 8 inches narrower than the bust and hips, when looking at yourself straight on. Example: Bust: 38 inches, Waist: 28 inches, Hips: 38–40 inches")}
                {renderRadioGroup("hips_answer", "Hips:", lineOptions.hips)}
              </>
            )}
            {currentStep === 1 && (
              <>
                {renderRadioGroup("face_answer", "Face (Lips):", lineOptions.face)}
                {renderRadioGroup("jawline_answer", "Jawline:", lineOptions.jawline)}
              </>
            )}
            {currentStep === 2 && (
              <>
                {renderRadioGroup("wrist_answer", "Circumference of wrist:", scaleOptions.wrist)}
                {renderRadioGroup("height_answer", "Height:", scaleOptions.height)}
                {renderRadioGroup("shoeSize_answer", "Shoe size:", scaleOptions.shoeSize)}
              </>
            )}
            {currentStep === 3 && (
              <FormField
                control={form.control}
                name="bodyShape"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold">Select Your Body Shape:</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        className="space-y-4"
                      >
                        {bodyShapeOptions.map((option) => (
                          <FormItem key={option.name} className="border p-4 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <RadioGroupItem value={option.name} id={option.name.replace(/\s+/g, '')} />
                              </FormControl>
                              <div className="flex-1">
                                <FormLabel htmlFor={option.name.replace(/\s+/g, '')} className="font-semibold text-md cursor-pointer">
                                  {option.name}
                                </FormLabel>
                                <p className="text-sm text-muted-foreground mt-1 pr-2">{option.description}</p>
                              </div>
                            </div>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {currentStep === stepSchemas.length - 1 && <button type="submit" style={{ display: "none" }} disabled={isLoading} />}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 0 || isLoading}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        {currentStep < stepSchemas.length - 1 ? (
          <Button type="button" onClick={handleNext} disabled={isLoading}>
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleNext} disabled={isLoading}>
            {isLoading ? <LoadingSpinner size={20} className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
            Proceed to Get Report
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
