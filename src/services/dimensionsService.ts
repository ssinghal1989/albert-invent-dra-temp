import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Pillar, Dimension, SubDimension } from '../data/dimensionsData';

const client = generateClient<Schema>();

export async function fetchAllDimensions(): Promise<Pillar[]> {
  try {
    const pillarsResult = await client.models.Pillar.list({
      selectionSet: ['id', 'name', 'displayName', 'color', 'order'],
    });

    if (!pillarsResult.data || pillarsResult.data.length === 0) {
      return [];
    }

    const pillars: Pillar[] = [];

    for (const pillarData of pillarsResult.data) {
      const dimensionsResult = await client.models.Dimension.list({
        filter: { pillarId: { eq: pillarData.id } },
        selectionSet: ['id', 'name', 'order', 'pillarId'],
      });

      const dimensions: Dimension[] = [];

      for (const dimensionData of dimensionsResult.data) {
        const subdimensionsResult = await client.models.SubDimension.list({
          filter: { dimensionId: { eq: dimensionData.id } },
          selectionSet: [
            'id',
            'name',
            'whyItMatters',
            'basic',
            'emerging',
            'established',
            'worldClass',
            'order',
            'dimensionId',
          ],
        });

        const subdimensions: (SubDimension & { id: string })[] = subdimensionsResult.data
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((sub) => ({
            id: sub.id,
            name: sub.name || '',
            whyItMatters: sub.whyItMatters || '',
            basic: sub.basic || '',
            emerging: sub.emerging || '',
            established: sub.established || '',
            worldClass: sub.worldClass || '',
          }));

        dimensions.push({
          name: dimensionData.name || '',
          subdimensions,
        });
      }

      dimensions.sort((a, b) => {
        const aData = dimensionsResult.data.find((d) => d.name === a.name);
        const bData = dimensionsResult.data.find((d) => d.name === b.name);
        return (aData?.order || 0) - (bData?.order || 0);
      });

      pillars.push({
        name: pillarData.name || '',
        displayName: pillarData.displayName || '',
        color: pillarData.color || '',
        dimensions,
      });
    }

    pillars.sort((a, b) => {
      const aData = pillarsResult.data.find((p) => p.name === a.name);
      const bData = pillarsResult.data.find((p) => p.name === b.name);
      return (aData?.order || 0) - (bData?.order || 0);
    });

    return pillars;
  } catch (error) {
    console.error('Error fetching dimensions:', error);
    throw error;
  }
}

export async function updateSubDimension(
  id: string,
  updates: {
    name?: string;
    whyItMatters?: string;
    basic?: string;
    emerging?: string;
    established?: string;
    worldClass?: string;
  }
): Promise<void> {
  try {
    await client.models.SubDimension.update({
      id,
      ...updates,
    });
  } catch (error) {
    console.error('Error updating subdimension:', error);
    throw error;
  }
}

export async function fetchSubDimensionById(id: string) {
  try {
    const result = await client.models.SubDimension.get({ id });
    return result.data;
  } catch (error) {
    console.error('Error fetching subdimension:', error);
    throw error;
  }
}

export async function updateDimension(
  id: string,
  updates: {
    name?: string;
  }
): Promise<void> {
  try {
    await client.models.Dimension.update({
      id,
      ...updates,
    });
  } catch (error) {
    console.error('Error updating dimension:', error);
    throw error;
  }
}

export async function fetchDimensionsByPillarWithIds(pillarName: string): Promise<Array<{ id: string; name: string; pillarId: string }>> {
  try {
    const pillarsResult = await client.models.Pillar.list({
      filter: { name: { eq: pillarName } },
      selectionSet: ['id'],
    });

    if (!pillarsResult.data || pillarsResult.data.length === 0) {
      return [];
    }

    const pillarId = pillarsResult.data[0].id;

    const dimensionsResult = await client.models.Dimension.list({
      filter: { pillarId: { eq: pillarId } },
      selectionSet: ['id', 'name', 'pillarId', 'order'],
    });

    return dimensionsResult.data
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((d) => ({
        id: d.id,
        name: d.name || '',
        pillarId: d.pillarId || '',
      }));
  } catch (error) {
    console.error('Error fetching dimensions:', error);
    throw error;
  }
}
