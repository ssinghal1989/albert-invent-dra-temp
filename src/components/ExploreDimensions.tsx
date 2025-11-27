import React, { useState, useEffect } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { Pillar, Dimension, SubDimension } from '../data/dimensionsData';
import { fetchAllDimensions } from '../services/dimensionsService';
import { seedDimensionsData, checkDimensionsDataExists } from '../services/dimensionsSeedService';

export function ExploreDimensions() {
  const [dimensionsData, setDimensionsData] = useState<Pillar[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<string>('');
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDimensions();
  }, []);

  async function loadDimensions() {
    try {
      setLoading(true);
      setError(null);

      let data = await fetchAllDimensions();

      if (data.length === 0) {
        console.log('No dimensions data found, seeding...');
        await seedDimensionsData();
        data = await fetchAllDimensions();
      }

      setDimensionsData(data);

      if (data.length > 0) {
        setSelectedPillar(data[0].name);
      }
    } catch (err) {
      console.error('Error loading dimensions:', err);
      setError('Failed to load dimensions data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const currentPillar = dimensionsData.find(p => p.name === selectedPillar);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dimensions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={loadDimensions}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (dimensionsData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No dimensions data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Explore Dimensions
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl">
            Discover the importance of every dimension and subdimension across the three pillars of digital R&D maturity.
            Understand what each level means and how to progress toward world-class capabilities.
          </p>
        </div>

        {/* Pillar Selection */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {dimensionsData.map((pillar) => (
              <button
                key={pillar.name}
                onClick={() => {
                  setSelectedPillar(pillar.name);
                  setSelectedDimension(null);
                }}
                className={`px-8 py-3 rounded-xl font-semibold text-base transition-all duration-200 ${
                  selectedPillar === pillar.name
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow hover:shadow-md'
                }`}
              >
                {pillar.displayName}
              </button>
            ))}
          </div>
        </div>

        {/* Dimension Selection Dropdown */}
        {currentPillar && (
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Dimension to View Details
            </label>
            <div className="relative">
              <select
                value={selectedDimension || ''}
                onChange={(e) => setSelectedDimension(e.target.value || null)}
                className="w-full md:w-96 px-4 py-3 pr-10 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer text-gray-900 font-medium transition-all duration-200 hover:border-gray-400"
              >
                <option value="">Choose a dimension...</option>
                {currentPillar.dimensions.map((dimension) => (
                  <option key={dimension.name} value={dimension.name}>
                    {dimension.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Dimension Table */}
        {currentPillar && selectedDimension && (
          <DimensionTable
            pillar={currentPillar}
            dimension={currentPillar.dimensions.find(d => d.name === selectedDimension)!}
          />
        )}

        {/* Show message when no dimension is selected */}
        {currentPillar && !selectedDimension && (
          <div className="bg-white rounded-2xl shadow-md p-16 text-center border border-gray-200">
            <div className="max-w-lg mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Select a Dimension
              </h3>
              <p className="text-gray-600 text-lg">
                Choose a dimension from the dropdown above to explore its subdimensions and understand the maturity progression from Basic to World Class.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface DimensionTableProps {
  pillar: Pillar;
  dimension: Dimension;
}

function DimensionTable({ pillar, dimension }: DimensionTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Dimension Header */}
      <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
        <h2 className="text-3xl font-bold text-white">
          {dimension.name}
        </h2>
        <p className="text-white/80 mt-1 text-sm">Dimension Level</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200 w-48">
                Subdimension
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200 w-64">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Why it Matters
                </div>
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  Basic
                </div>
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  Emerging
                </div>
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Established
                </div>
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  World Class
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {dimension.subdimensions.map((subdimension, index) => (
              <tr
                key={subdimension.name}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {/* Subdimension Name */}
                <td className="px-6 py-6 align-top border-b border-gray-200">
                  <div className="font-semibold text-gray-900 leading-relaxed">
                    {subdimension.name}
                  </div>
                </td>

                {/* Why It Matters */}
                <td className="px-6 py-6 align-top border-b border-gray-200 bg-blue-50/50">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {subdimension.whyItMatters}
                  </p>
                </td>

                {/* Basic */}
                <td className="px-6 py-6 align-top border-b border-gray-200 bg-red-50/30">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {subdimension.basic}
                  </p>
                </td>

                {/* Emerging */}
                <td className="px-6 py-6 align-top border-b border-gray-200 bg-yellow-50/30">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {subdimension.emerging}
                  </p>
                </td>

                {/* Established */}
                <td className="px-6 py-6 align-top border-b border-gray-200 bg-green-50/30">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {subdimension.established}
                  </p>
                </td>

                {/* World Class */}
                <td className="px-6 py-6 align-top border-b border-gray-200 bg-blue-50/30">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {subdimension.worldClass}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
