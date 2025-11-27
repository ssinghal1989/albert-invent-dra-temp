import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Pillar, Dimension, SubDimension } from '../data/dimensionsData';

const client = generateClient<Schema>();

export async function fetchAllDimensions(): Promise<Pillar[]> {
  try {
    const [pillarsResult, allDimensionsResult, allSubdimensionsResult] = await Promise.all([
      client.models.Pillar.list({
        selectionSet: ['id', 'name', 'displayName', 'color', 'order'],
      }),
      client.models.Dimension.list({
        selectionSet: ['id', 'name', 'order', 'pillarId'],
      }),
      client.models.SubDimension.list({
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
      }),
    ]);

    if (!pillarsResult.data || pillarsResult.data.length === 0) {
      return [];
    }

    const subdimensionsByDimensionId = new Map<string, (SubDimension & { id: string })[]>();
    allSubdimensionsResult.data.forEach((sub) => {
      if (!sub.dimensionId) return;
      if (!subdimensionsByDimensionId.has(sub.dimensionId)) {
        subdimensionsByDimensionId.set(sub.dimensionId, []);
      }
      subdimensionsByDimensionId.get(sub.dimensionId)!.push({
        id: sub.id,
        name: sub.name || '',
        whyItMatters: sub.whyItMatters || '',
        basic: sub.basic || '',
        emerging: sub.emerging || '',
        established: sub.established || '',
        worldClass: sub.worldClass || '',
      });
    });

    subdimensionsByDimensionId.forEach((subs) => {
      subs.sort((a, b) => {
        const aData = allSubdimensionsResult.data.find(s => s.id === a.id);
        const bData = allSubdimensionsResult.data.find(s => s.id === b.id);
        return (aData?.order || 0) - (bData?.order || 0);
      });
    });

    const dimensionsByPillarId = new Map<string, Dimension[]>();
    allDimensionsResult.data.forEach((dim) => {
      if (!dim.pillarId) return;
      if (!dimensionsByPillarId.has(dim.pillarId)) {
        dimensionsByPillarId.set(dim.pillarId, []);
      }
      dimensionsByPillarId.get(dim.pillarId)!.push({
        name: dim.name || '',
        subdimensions: subdimensionsByDimensionId.get(dim.id) || [],
      });
    });

    dimensionsByPillarId.forEach((dims, pillarId) => {
      dims.sort((a, b) => {
        const aData = allDimensionsResult.data.find(d => d.name === a.name && d.pillarId === pillarId);
        const bData = allDimensionsResult.data.find(d => d.name === b.name && d.pillarId === pillarId);
        return (aData?.order || 0) - (bData?.order || 0);
      });
    });

    const pillars: Pillar[] = pillarsResult.data.map((pillarData) => ({
      name: pillarData.name || '',
      displayName: pillarData.displayName || '',
      color: pillarData.color || '',
      dimensions: dimensionsByPillarId.get(pillarData.id) || [],
    }));

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

export async function createDimension(pillarName: string, dimensionName: string): Promise<void> {
  try {
    const pillarsResult = await client.models.Pillar.list({
      filter: { name: { eq: pillarName } },
      selectionSet: ['id'],
    });

    if (!pillarsResult.data || pillarsResult.data.length === 0) {
      throw new Error('Pillar not found');
    }

    const pillarId = pillarsResult.data[0].id;

    const existingDimensions = await client.models.Dimension.list({
      filter: { pillarId: { eq: pillarId } },
      selectionSet: ['order'],
    });

    const maxOrder = existingDimensions.data.reduce((max, dim) => Math.max(max, dim.order || 0), 0);

    await client.models.Dimension.create({
      name: dimensionName,
      pillarId: pillarId,
      order: maxOrder + 1,
    });
  } catch (error) {
    console.error('Error creating dimension:', error);
    throw error;
  }
}

export async function deleteDimension(dimensionId: string): Promise<void> {
  try {
    const subdimensionsResult = await client.models.SubDimension.list({
      filter: { dimensionId: { eq: dimensionId } },
      selectionSet: ['id'],
    });

    for (const subdimension of subdimensionsResult.data) {
      await client.models.SubDimension.delete({ id: subdimension.id });
    }

    await client.models.Dimension.delete({ id: dimensionId });
  } catch (error) {
    console.error('Error deleting dimension:', error);
    throw error;
  }
}

export async function createSubDimension(
  dimensionId: string,
  subdimensionData: {
    name: string;
    whyItMatters: string;
    basic: string;
    emerging: string;
    established: string;
    worldClass: string;
  }
): Promise<void> {
  try {
    const existingSubdimensions = await client.models.SubDimension.list({
      filter: { dimensionId: { eq: dimensionId } },
      selectionSet: ['order'],
    });

    const maxOrder = existingSubdimensions.data.reduce((max, sub) => Math.max(max, sub.order || 0), 0);

    await client.models.SubDimension.create({
      ...subdimensionData,
      dimensionId: dimensionId,
      order: maxOrder + 1,
    });
  } catch (error) {
    console.error('Error creating subdimension:', error);
    throw error;
  }
}

export async function deleteSubDimension(subdimensionId: string): Promise<void> {
  try {
    await client.models.SubDimension.delete({ id: subdimensionId });
  } catch (error) {
    console.error('Error deleting subdimension:', error);
    throw error;
  }
}
