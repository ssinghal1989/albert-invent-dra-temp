import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, RefreshCw, ChevronDown } from 'lucide-react';
import { fetchAllDimensions, updateSubDimension, updateDimension, fetchDimensionsByPillarWithIds } from '../../services/dimensionsService';
import { seedDimensionsData, clearDimensionsData } from '../../services/dimensionsSeedService';
import { Pillar } from '../../data/dimensionsData';
import { useToast } from '../../context/ToastContext';

export function DimensionsManagement() {
  const { showToast } = useToast();
  const [dimensionsData, setDimensionsData] = useState<Pillar[]>([]);
  const [dimensionsWithIds, setDimensionsWithIds] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState<string>('');
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedDimensionId, setSelectedDimensionId] = useState<string>('');
  const [editingSubdimension, setEditingSubdimension] = useState<string | null>(null);
  const [editingDimensionName, setEditingDimensionName] = useState(false);
  const [dimensionNameForm, setDimensionNameForm] = useState<string>('');
  const [editForm, setEditForm] = useState<{
    name: string;
    whyItMatters: string;
    basic: string;
    emerging: string;
    established: string;
    worldClass: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  useEffect(() => {
    loadDimensions();
  }, []);

  useEffect(() => {
    if (selectedPillar) {
      loadDimensionsWithIds();
    }
  }, [selectedPillar]);

  async function loadDimensions() {
    try {
      setLoading(true);
      const data = await fetchAllDimensions();
      setDimensionsData(data);

      if (data.length > 0) {
        setSelectedPillar(data[0].name);
        if (data[0].dimensions.length > 0) {
          setSelectedDimension(data[0].dimensions[0].name);
        }
      }
    } catch (error) {
      console.error('Error loading dimensions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadDimensionsWithIds() {
    try {
      const dimsWithIds = await fetchDimensionsByPillarWithIds(selectedPillar);
      setDimensionsWithIds(dimsWithIds);

      if (dimsWithIds.length > 0 && selectedDimension) {
        const dimWithId = dimsWithIds.find(d => d.name === selectedDimension);
        if (dimWithId) {
          setSelectedDimensionId(dimWithId.id);
        }
      }
    } catch (error) {
      console.error('Error loading dimensions with IDs:', error);
    }
  }

  async function handleReseedData() {
    if (!confirm('This will delete all existing dimensions data and reseed from the default data. Are you sure?')) {
      return;
    }

    try {
      setReseeding(true);
      await clearDimensionsData();
      await seedDimensionsData();
      await loadDimensions();
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Dimensions data has been reseeded successfully!',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error reseeding data:', error);
      showToast({
        type: 'error',
        title: 'Reseed Failed',
        message: 'Failed to reseed data. Please try again.',
        duration: 5000,
      });
    } finally {
      setReseeding(false);
    }
  }

  async function handleEdit(subdimensionId: string, subdimensionData: any) {
    setEditingSubdimension(subdimensionId);
    setEditForm({
      name: subdimensionData.name,
      whyItMatters: subdimensionData.whyItMatters,
      basic: subdimensionData.basic,
      emerging: subdimensionData.emerging,
      established: subdimensionData.established,
      worldClass: subdimensionData.worldClass,
    });
  }

  async function handleSave(subdimensionId: string) {
    if (!editForm) return;

    try {
      setSaving(true);
      await updateSubDimension(subdimensionId, editForm);
      await loadDimensions();
      setEditingSubdimension(null);
      setEditForm(null);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Subdimension updated successfully!',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error updating subdimension:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update subdimension. Please try again.',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditingSubdimension(null);
    setEditForm(null);
    setEditingDimensionName(false);
    setDimensionNameForm('');
  }

  async function handleEditDimensionName() {
    setEditingDimensionName(true);
    setDimensionNameForm(selectedDimension);
  }

  async function handleSaveDimensionName() {
    if (!dimensionNameForm.trim() || !selectedDimensionId) return;

    try {
      setSaving(true);
      await updateDimension(selectedDimensionId, { name: dimensionNameForm });
      await loadDimensions();
      setSelectedDimension(dimensionNameForm);
      setEditingDimensionName(false);
      setDimensionNameForm('');
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Dimension name updated successfully!',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error updating dimension name:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update dimension name. Please try again.',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  }

  const currentPillar = dimensionsData.find(p => p.name === selectedPillar);
  const currentDimension = currentPillar?.dimensions.find(d => d.name === selectedDimension);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dimensions Management</h2>
          <p className="text-gray-600 mt-1">Edit and manage dimension content</p>
        </div>
        <button
          onClick={handleReseedData}
          disabled={reseeding}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${reseeding ? 'animate-spin' : ''}`} />
          {reseeding ? 'Reseeding...' : 'Reseed Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Pillar</label>
          <div className="relative">
            <select
              value={selectedPillar}
              onChange={(e) => {
                setSelectedPillar(e.target.value);
                const pillar = dimensionsData.find(p => p.name === e.target.value);
                if (pillar && pillar.dimensions.length > 0) {
                  setSelectedDimension(pillar.dimensions[0].name);
                }
              }}
              className="w-full px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              {dimensionsData.map((pillar) => (
                <option key={pillar.name} value={pillar.name}>
                  {pillar.displayName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Dimension</label>
          <div className="relative">
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
              className="w-full px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              {currentPillar?.dimensions.map((dimension) => (
                <option key={dimension.name} value={dimension.name}>
                  {dimension.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {currentDimension && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 bg-gradient-to-r from-primary to-secondary flex justify-between items-center">
            {editingDimensionName ? (
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="text"
                  value={dimensionNameForm}
                  onChange={(e) => setDimensionNameForm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-gray-900 font-semibold"
                  placeholder="Dimension name"
                />
                <button
                  onClick={handleSaveDimensionName}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white">{currentDimension.name}</h3>
                <button
                  onClick={handleEditDimensionName}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors shadow-md"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Name
                </button>
              </>
            )}
          </div>

          <div className="divide-y divide-gray-200">
            {currentDimension.subdimensions.map((subdimension: any, index) => {
              const subdimensionId = subdimension.id;
              const isEditing = editingSubdimension === subdimensionId;

              return (
                <div key={subdimensionId} className="p-6">
                  <div className="flex justify-between items-start mb-4 gap-1 items-center">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm?.name || ''}
                        onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg font-semibold"
                        placeholder="Subdimension name"
                      />
                    ) : (
                      <h4 className="text-lg font-semibold text-gray-900">{subdimension.name}</h4>
                    )}
                    {!isEditing ? (
                      <button
                        onClick={() => handleEdit(subdimensionId, subdimension)}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(subdimensionId)}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Why It Matters</label>
                      {isEditing ? (
                        <textarea
                          value={editForm?.whyItMatters || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, whyItMatters: e.target.value } : null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{subdimension.whyItMatters}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Basic</label>
                      {isEditing ? (
                        <textarea
                          value={editForm?.basic || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, basic: e.target.value } : null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <p className="text-gray-700 bg-red-50 p-3 rounded-lg">{subdimension.basic}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emerging</label>
                      {isEditing ? (
                        <textarea
                          value={editForm?.emerging || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, emerging: e.target.value } : null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{subdimension.emerging}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Established</label>
                      {isEditing ? (
                        <textarea
                          value={editForm?.established || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, established: e.target.value } : null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <p className="text-gray-700 bg-green-50 p-3 rounded-lg">{subdimension.established}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">World Class</label>
                      {isEditing ? (
                        <textarea
                          value={editForm?.worldClass || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, worldClass: e.target.value } : null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{subdimension.worldClass}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}