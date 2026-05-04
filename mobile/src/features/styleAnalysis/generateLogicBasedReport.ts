import { bodyShapeAdvice, dominantLineAdvice, dominantScaleAdvice } from './styleReports';
import type { LineAnswer, QuestionnaireData } from './types';

function getBodyShapeKey(formValue: string): string | undefined {
  const mapping: Record<string, string> = {
    'Pear Shape': 'pear',
    'Inverted Triangle': 'invertedTriangle',
    Straight: 'rectangle',
    'Round/Apple': 'apple',
    Hourglass: 'hourglass',
  };
  return mapping[formValue];
}

function stripMarkdownMarkers(text: string): string {
  return text.replace(/[#*]/g, '');
}

export function generateLogicBasedReport(questionnaireData: QuestionnaireData): string {
  let recommendations = '## Your Personalised Style Report\n\n';

  try {
    // --- Line Analysis ---
    let straightCount = 0;
    let curvedCount = 0;
    questionnaireData.lineAnswers.forEach((ans: LineAnswer) => {
      if (ans.classification === 'straight') straightCount += 1;
      if (ans.classification === 'curved') curvedCount += 1;
    });

    let dominantLine: 'Straight' | 'Curved' | 'Combination' = 'Combination';
    if (straightCount > 0 && curvedCount === 0) dominantLine = 'Straight';
    else if (curvedCount > 0 && straightCount === 0) dominantLine = 'Curved';

    recommendations += '## Line Analysis Summary\n';
    questionnaireData.lineAnswers.forEach((ans: LineAnswer) => {
      recommendations += `- ${ans.bodyPart}: ${ans.answer} (Classified as: ${ans.classification})\n`;
    });

    const lineAdviceKey = dominantLine.toLowerCase() as string;
    const lineAdviceData = (dominantLineAdvice as any)[lineAdviceKey];

    if (lineAdviceData) {
      recommendations += `\n### Your Dominant Line: ${lineAdviceData.title}\n`;
      recommendations += `${lineAdviceData.advice}\n`;

      if (lineAdviceData.elements) {
        for (const [key, value] of Object.entries(lineAdviceData.elements as Record<string, any>)) {
          recommendations += `\n**${key.charAt(0).toUpperCase() + key.slice(1)}:**\n`;
          if (Array.isArray(value)) {
            value.forEach((item: string) => {
              recommendations += `  - ${item}\n`;
            });
          } else {
            recommendations += `  - ${String(value)}\n`;
          }
        }
      }
    } else {
      recommendations += `\n### Dominant Line: ${dominantLine}\nNo specific advice found for this dominant line type in the dataset.\n`;
    }

    recommendations += '\n---\n';

    // --- Scale Assessment ---
    let smallScaleCount = 0;
    let mediumScaleCount = 0;
    let largeScaleCount = 0;

    questionnaireData.scaleAnswers.forEach((ans) => {
      const lower = ans.answer.toLowerCase();
      if (lower.includes('small')) smallScaleCount += 1;
      else if (lower.includes('medium')) mediumScaleCount += 1;
      else if (lower.includes('large')) largeScaleCount += 1;
    });

    let dominantScale: 'Small' | 'Medium' | 'Large' = 'Medium';
    if (largeScaleCount > smallScaleCount && largeScaleCount > mediumScaleCount) dominantScale = 'Large';
    else if (smallScaleCount > largeScaleCount && smallScaleCount > mediumScaleCount) dominantScale = 'Small';
    else if (mediumScaleCount >= largeScaleCount && mediumScaleCount >= smallScaleCount) dominantScale = 'Medium';

    recommendations += '\n## Scale Assessment Summary\n';
    questionnaireData.scaleAnswers.forEach((ans) => {
      recommendations += `- ${ans.category}: ${ans.answer}\n`;
    });

    const scaleAdviceKey = dominantScale.toLowerCase() as string;
    const scaleAdviceData = (dominantScaleAdvice as any)[scaleAdviceKey];

    if (scaleAdviceData) {
      recommendations += `\n### Your Dominant Scale: ${scaleAdviceData.title}\n`;
      recommendations += `${scaleAdviceData.description}\n`;
      if (scaleAdviceData.note) recommendations += `*Note: ${scaleAdviceData.note}*\n`;

      if (scaleAdviceData.elements) {
        for (const [category, details] of Object.entries(
          scaleAdviceData.elements as Record<string, any>,
        )) {
          recommendations += `\n**${category.charAt(0).toUpperCase() + category.slice(1)}:**\n`;

          if (typeof details === 'object' && details !== null && !Array.isArray(details)) {
            for (const [subKey, subValue] of Object.entries(details as Record<string, any>)) {
              recommendations += `  - **${subKey.charAt(0).toUpperCase() + subKey.slice(1)}:** `;
              if (Array.isArray(subValue)) {
                recommendations += subValue.join('; ') + '\n';
              } else {
                recommendations += `${String(subValue)}\n`;
              }
            }
          } else if (Array.isArray(details)) {
            details.forEach((item: string) => {
              recommendations += `  - ${item}\n`;
            });
          }
        }
      }
    } else {
      recommendations += `\n### Dominant Scale: ${dominantScale}\nNo specific advice found for this dominant scale type in the dataset.\n`;
    }

    recommendations += '\n---\n';

    // --- Body Shape ---
    recommendations += `\n## Body Shape: ${questionnaireData.bodyShape}\n`;

    const internalShapeKey = getBodyShapeKey(questionnaireData.bodyShape);
    if (internalShapeKey) {
      const shapeAdviceData = (bodyShapeAdvice as any)[internalShapeKey];
      if (shapeAdviceData) {
        if (shapeAdviceData.description) recommendations += `${shapeAdviceData.description}\n`;
        if (shapeAdviceData.examples) recommendations += `*Examples: ${shapeAdviceData.examples}*\n`;
        if (shapeAdviceData.notes) recommendations += `*Notes: ${shapeAdviceData.notes}*\n\n`;

        if (shapeAdviceData.styling?.balanceStrategy) {
          recommendations += `### Styling Strategy\n${shapeAdviceData.styling.balanceStrategy}\n\n`;
        }

        if (shapeAdviceData.styling?.fabrics) {
          recommendations += '### Fabrics & Patterns\n';
          const fabrics = shapeAdviceData.styling.fabrics;
          if (fabrics.recommended) recommendations += `- Recommended Fabrics: ${fabrics.recommended}\n`;
          if (fabrics.avoidIfLarger) recommendations += `- Avoid If Larger: ${fabrics.avoidIfLarger}\n`;
          if (fabrics.patterns) recommendations += `- Patterns: ${fabrics.patterns}\n`;
          if (fabrics.colours) recommendations += `- Colours: ${fabrics.colours}\n\n`;
        }

        if (shapeAdviceData.styling?.clothing) {
          recommendations += '### Clothing Specifics\n';
          const clothing = shapeAdviceData.styling.clothing;
          if (clothing.general) recommendations += `- General: ${clothing.general}\n`;
          if (clothing.tops) recommendations += `- Tops: ${clothing.tops}\n`;
          if (clothing.necklines) recommendations += `- Necklines: ${clothing.necklines}\n`;
          if (clothing.bottoms) recommendations += `- Bottoms: ${clothing.bottoms}\n`;
          if (clothing.dresses) recommendations += `- Dresses: ${clothing.dresses}\n`;
          if (clothing.styling) recommendations += `- General Styling: ${clothing.styling}\n`;
          if (clothing.bras) recommendations += `- Bras: ${clothing.bras}\n\n`;
          if (clothing.details) recommendations += `- Details: ${clothing.details}\n`;
        }

        if (shapeAdviceData.styling?.avoid && shapeAdviceData.styling.avoid.length > 0) {
          recommendations += '### Avoid:\n';
          shapeAdviceData.styling.avoid.forEach((item: string) => {
            recommendations += `- ${item}\n`;
          });
          recommendations += '\n';
        }

        if (shapeAdviceData.styling?.gobletSpecific) {
          recommendations += `**Goblet Shape Specifics:** ${shapeAdviceData.styling.gobletSpecific}\n\n`;
        }
        if (shapeAdviceData.styling?.weightGain?.softened) {
          recommendations += `**Weight Gain - Softened Straight:** ${shapeAdviceData.styling.weightGain.softened}\n\n`;
        }
        if (shapeAdviceData.styling?.weightGain?.barrel && shapeAdviceData.styling.barrelSpecific) {
          recommendations += `**Weight Gain - Barrel/Rectangle:** ${shapeAdviceData.styling.weightGain.barrel}\n`;
          shapeAdviceData.styling.barrelSpecific.forEach((item: string) => {
            recommendations += `  - ${item}\n`;
          });
          recommendations += '\n';
        }
      } else {
        recommendations += `No specific styling advice found for "${questionnaireData.bodyShape}" in the dataset.\n`;
      }
    } else {
      recommendations += `No specific styling advice found for "${questionnaireData.bodyShape}" in the dataset.\n`;
    }

    recommendations += '\nRemember, these are guidelines. The best style is one that makes you feel confident and comfortable!\n';
  } catch (error: any) {
    recommendations += '\n\n**Note:** An error occurred while generating your report. Some information may be missing.\n';
    // Keep the thrown error details for debugging.
    // eslint-disable-next-line no-console
    console.error('generateLogicBasedReport error', error);
  }

  return stripMarkdownMarkers(recommendations);
}

