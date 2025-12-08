import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Tier2ScoreResult, ensureDimensionScores, Question, Tier2AssessmentResponses } from './tier2ScoreCalculator';
import { questionsService } from '../services/questionsService';
import { Tier2TemplateId } from '../services/defaultQuestions';

const client = generateClient<Schema>();

export interface TeamAverages {
  overallScore: number;
  pillarAverages: {
    [pillarName: string]: {
      rawScore: number;
      percentage: number;
    };
  };
  dimensionAverages: {
    [dimensionName: string]: {
      score: number;
      percentage: number;
    };
  };
  calculationAverages: {
    totalRawScore: number;
    weightedScore: number;
    normalizedScore: number;
    normalizedShiftedScore: number;
  };
  assessmentCount: number;
}

export async function fetchTeamAverages(companyId: string): Promise<TeamAverages | null> {
  try {
    if (!companyId) return null;

    const { data: assessments } = await client.models.AssessmentInstance.list({
      filter: {
        companyId: { eq: companyId },
        assessmentType: { eq: 'TIER2' },
      },
    });

    if (!assessments || assessments.length === 0) {
      return null;
    }

    const {data: questionsData} = await questionsService.getQuestionsByTemplate(Tier2TemplateId);
    const questions: Question[] = questionsData ? questionsData?.map(q => {
      let metadata: { pillar?: string; dimension?: string } | undefined = undefined;
      if (q.metadata) {
        try {
          metadata = typeof q.metadata === 'string' ? JSON.parse(q.metadata) : q.metadata as any;
        } catch (e) {
          metadata = undefined;
        }
      }
      return {
        id: q.id || '',
        prompt: q.prompt || '',
        metadata,
        options: []
      };
    }) : [];

    const scores: Tier2ScoreResult[] = assessments
      .filter((a) => a.score)
      .map((a) => {
        const score = JSON.parse(a.score as string);
        const responses = a.responses ? JSON.parse(a.responses as string) : undefined;
        return ensureDimensionScores(score, responses, questions);
      });

    if (scores.length === 0) {
      return null;
    }

    const pillarAverages: { [key: string]: { rawScore: number; percentage: number } } = {};
    const dimensionAverages: { [key: string]: { score: number; percentage: number } } = {};

    let totalOverallScore = 0;
    let totalRawScore = 0;
    let totalWeightedScore = 0;
    let totalNormalizedScore = 0;
    let totalNormalizedShiftedScore = 0;

    scores.forEach((score) => {
      totalOverallScore += score.normalizedShiftedScore;
      totalRawScore += score.totalRawScore;
      totalWeightedScore += score.weightedScore;
      totalNormalizedScore += score.normalizedScore;
      totalNormalizedShiftedScore += score.normalizedShiftedScore;

      score.pillarScores.forEach((pillar) => {
        if (!pillarAverages[pillar.pillar]) {
          pillarAverages[pillar.pillar] = { rawScore: 0, percentage: 0 };
        }
        const percentage = (pillar.rawScore / pillar.maxRawScore) * 100;
        pillarAverages[pillar.pillar].rawScore += pillar.rawScore;
        pillarAverages[pillar.pillar].percentage += percentage;
      });

      if (score.dimensionScores && score.dimensionScores.length > 0) {
        score.dimensionScores.forEach((dimension) => {
          if (!dimensionAverages[dimension.dimension]) {
            dimensionAverages[dimension.dimension] = { score: 0, percentage: 0 };
          }
          dimensionAverages[dimension.dimension].score += dimension.dimensionScore;
          dimensionAverages[dimension.dimension].percentage += dimension.percentage;
        });
      }
    });

    const count = scores.length;

    Object.keys(pillarAverages).forEach((key) => {
      pillarAverages[key].rawScore = pillarAverages[key].rawScore / count;
      pillarAverages[key].percentage = pillarAverages[key].percentage / count;
    });

    Object.keys(dimensionAverages).forEach((key) => {
      dimensionAverages[key].score = dimensionAverages[key].score / count;
      dimensionAverages[key].percentage = dimensionAverages[key].percentage / count;
    });

    return {
      overallScore: totalOverallScore / count,
      pillarAverages,
      dimensionAverages,
      calculationAverages: {
        totalRawScore: totalRawScore / count,
        weightedScore: totalWeightedScore / count,
        normalizedScore: totalNormalizedScore / count,
        normalizedShiftedScore: totalNormalizedShiftedScore / count,
      },
      assessmentCount: count,
    };
  } catch (error) {
    console.error('Error fetching team averages:', error);
    return null;
  }
}
