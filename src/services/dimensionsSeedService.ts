import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { dimensionsData } from '../data/dimensionsData';

const client = generateClient<Schema>();

export async function seedDimensionsData(): Promise<void> {
  try {
    console.log('Starting dimensions data seed...');

    const existingPillars = await client.models.Pillar.list();
    if (existingPillars.data.length > 0) {
      console.log('Dimensions data already exists, skipping seed.');
      return;
    }

    for (let pillarIndex = 0; pillarIndex < dimensionsData.length; pillarIndex++) {
      const pillarData = dimensionsData[pillarIndex];

      const pillarResult = await client.models.Pillar.create({
        name: pillarData.name,
        displayName: pillarData.displayName,
        color: pillarData.color,
        order: pillarIndex + 1,
      });

      if (!pillarResult.data) {
        console.error(`Failed to create pillar: ${pillarData.name}`);
        continue;
      }

      const pillarId = pillarResult.data.id;
      console.log(`Created pillar: ${pillarData.displayName}`);

      for (let dimIndex = 0; dimIndex < pillarData.dimensions.length; dimIndex++) {
        const dimensionData = pillarData.dimensions[dimIndex];

        const dimensionResult = await client.models.Dimension.create({
          pillarId,
          name: dimensionData.name,
          order: dimIndex + 1,
        });

        if (!dimensionResult.data) {
          console.error(`Failed to create dimension: ${dimensionData.name}`);
          continue;
        }

        const dimensionId = dimensionResult.data.id;
        console.log(`  Created dimension: ${dimensionData.name}`);

        for (let subIndex = 0; subIndex < dimensionData.subdimensions.length; subIndex++) {
          const subdimensionData = dimensionData.subdimensions[subIndex];

          await client.models.SubDimension.create({
            dimensionId,
            name: subdimensionData.name,
            whyItMatters: subdimensionData.whyItMatters,
            basic: subdimensionData.basic,
            emerging: subdimensionData.emerging,
            established: subdimensionData.established,
            worldClass: subdimensionData.worldClass,
            order: subIndex + 1,
          });

          console.log(`    Created subdimension: ${subdimensionData.name}`);
        }
      }
    }

    console.log('Dimensions data seed completed successfully!');
  } catch (error) {
    console.error('Error seeding dimensions data:', error);
    throw error;
  }
}

export async function clearDimensionsData(): Promise<void> {
  try {
    console.log('Clearing dimensions data...');

    const subdimensions = await client.models.SubDimension.list();
    for (const subdimension of subdimensions.data) {
      await client.models.SubDimension.delete({ id: subdimension.id });
    }

    const dimensions = await client.models.Dimension.list();
    for (const dimension of dimensions.data) {
      await client.models.Dimension.delete({ id: dimension.id });
    }

    const pillars = await client.models.Pillar.list();
    for (const pillar of pillars.data) {
      await client.models.Pillar.delete({ id: pillar.id });
    }

    console.log('Dimensions data cleared successfully!');
  } catch (error) {
    console.error('Error clearing dimensions data:', error);
    throw error;
  }
}

export async function checkDimensionsDataExists(): Promise<boolean> {
  try {
    const pillars = await client.models.Pillar.list();
    return pillars.data.length > 0;
  } catch (error) {
    console.error('Error checking dimensions data:', error);
    return false;
  }
}
