import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye } from 'lucide-react';
import { questionsService } from '../../services/questionsService';
import { useLoader } from '../../hooks/useLoader';
import { Loader } from '../ui/Loader';
import { LoadingButton } from '../ui/LoadingButton';

interface Question {
  id: string;
  templateId: string;
  sectionId: string;
  order: number;
  kind: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SCALE' | 'TEXT';
  prompt: string;
  helpText?: string;
  required: boolean;
  metadata?: any;
  options: Array<{
    id: string;
    label: string;
    value: string;
    score?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface NewQuestionData {
  templateId: string;
  sectionId: string;
  order: number;
  kind: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SCALE' | 'TEXT';
  prompt: string;
  helpText: string;
  required: boolean;
  options: Array<{
    label: string;
    value: string;
    score: number;
  }>;
}

export function QuestionsManager() {
  const { isLoading: loadingQuestions, withLoading: withQuestionsLoading } = useLoader();
  const { isLoading: savingQuestion, withLoading: withSaveLoading } = useLoader();
  const { isLoading: deletingQuestion, withLoading: withDeleteLoading } = useLoader();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<string | null>(null);
  
  const [newQuestion, setNewQuestion] = useState<NewQuestionData>({
    templateId: 'tpl_01HZXXS3N9',
    sectionId: 'digitalization',
    order: 1,
    kind: 'SINGLE_CHOICE',
    prompt: '',
    helpText: '',
    required: true,
    options: [
      { label: '', value: 'BASIC', score: 25 },
      { label: '', value: 'EMERGING', score: 50 },
      { label: '', value: 'ESTABLISHED', score: 75 },
      { label: '', value: 'WORLD_CLASS', score: 100 }
    ]
  });

  // Load questions on component mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    await withQuestionsLoading(async () => {
      const result = await questionsService.getAllQuestions();
      if (result.success && result.data) {
        setQuestions(result.data);
      }
    });
  };

  const handleSaveQuestion = async () => {
    if (!newQuestion.prompt.trim()) {
      alert('Question prompt is required');
      return;
    }

    await withSaveLoading(async () => {
      const result = await questionsService.saveQuestion(newQuestion);
      if (result.success && result.data) {
        setQuestions(prev => [...prev, result.data]);
        setShowAddForm(false);
        resetNewQuestion();
      } else {
        alert('Failed to save question');
      }
    });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    await withDeleteLoading(async () => {
      const result = await questionsService.deleteQuestion(questionId);
      if (result.success) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
      } else {
        alert('Failed to delete question');
      }
    });
  };

  const resetNewQuestion = () => {
    setNewQuestion({
      templateId: 'tpl_01HZXXS3N9',
      sectionId: 'digitalization',
      order: questions.length + 1,
      kind: 'SINGLE_CHOICE',
      prompt: '',
      helpText: '',
      required: true,
      options: [
        { label: '', value: 'BASIC', score: 25 },
        { label: '', value: 'EMERGING', score: 50 },
        { label: '', value: 'ESTABLISHED', score: 75 },
        { label: '', value: 'WORLD_CLASS', score: 100 }
      ]
    });
  };

  const updateNewQuestionOption = (index: number, field: 'label' | 'value' | 'score', value: string | number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  if (loadingQuestions) {
    return (
      <div className="p-8">
        <Loader text="Loading questions..." size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Questions Manager</h1>
            <p className="text-gray-600 mt-2">Manage assessment questions and options</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Add Question Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Question</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetNewQuestion();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                <select
                  value={newQuestion.sectionId}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, sectionId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="digitalization">Digitalization</option>
                  <option value="transformation">Transformation</option>
                  <option value="value_scaling">Value Scaling</option>
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={newQuestion.order}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Question Prompt */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Question Prompt</label>
              <input
                type="text"
                value={newQuestion.prompt}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Enter the question prompt..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Help Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Help Text (Optional)</label>
              <textarea
                value={newQuestion.helpText}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, helpText: e.target.value }))}
                placeholder="Additional context or help text..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">Answer Options</label>
              <div className="space-y-3">
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => updateNewQuestionOption(index, 'label', e.target.value)}
                        placeholder={`${option.value} level description...`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={option.score}
                        onChange={(e) => updateNewQuestionOption(index, 'score', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                      />
                    </div>
                    <div className="w-32 text-sm font-medium text-gray-600 capitalize">
                      {option.value.replace('_', ' ').toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetNewQuestion();
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleSaveQuestion}
                loading={savingQuestion}
                loadingText="Saving..."
                disabled={!newQuestion.prompt.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Question
              </LoadingButton>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              All Questions ({questions.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {questions.map((question) => (
              <div key={question.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-primary bg-blue-50 px-2 py-1 rounded">
                        {question.sectionId}
                      </span>
                      <span className="text-sm text-gray-500">Order: {question.order}</span>
                      <span className="text-sm text-gray-500">
                        {question.options.length} options
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {question.prompt}
                    </h3>
                    {question.helpText && (
                      <p className="text-gray-600 text-sm mb-3">{question.helpText}</p>
                    )}
                    
                    {/* Show options when viewing */}
                    {viewingQuestion === question.id && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Answer Options:</h4>
                        <div className="space-y-2">
                          {question.options.map((option, index) => (
                            <div key={option.id} className="flex items-center justify-between bg-white p-3 rounded border">
                              <span className="text-gray-900">{option.label}</span>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-primary">
                                  {option.value.replace('_', ' ')}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Score: {option.score}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setViewingQuestion(
                        viewingQuestion === question.id ? null : question.id
                      )}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="View options"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingQuestion(question.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit question"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <LoadingButton
                      onClick={() => handleDeleteQuestion(question.id)}
                      loading={deletingQuestion}
                      variant="ghost"
                      size="sm"
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </LoadingButton>
                  </div>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Plus className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first question</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200"
                >
                  Add Question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}