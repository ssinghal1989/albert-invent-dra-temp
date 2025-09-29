// Dummy questions data for development
export const dummyQuestions = [
  {
    id: 'q_data_architecture',
    templateId: 'tpl_01HZXXS3N9',
    sectionId: 'digitalization',
    order: 1,
    kind: 'SINGLE_CHOICE',
    prompt: 'Data Architecture and Integration',
    helpText: 'How well integrated and standardized is your data architecture?',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'DATA_FOUNDATION'
    },
    options: [
      {
        id: 'opt_data_basic',
        questionId: 'q_data_architecture',
        label: 'Data is fragmented, stored in spreadsheets or local systems',
        value: 'BASIC',
        score: 25
      },
      {
        id: 'opt_data_emerging',
        questionId: 'q_data_architecture',
        label: 'Some systems connected, early standardization efforts',
        value: 'EMERGING',
        score: 50
      },
      {
        id: 'opt_data_established',
        questionId: 'q_data_architecture',
        label: 'Unified data model, most key systems integrated',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        id: 'opt_data_world_class',
        questionId: 'q_data_architecture',
        label: 'Fully scalable, interoperable architecture supports innovation',
        value: 'WORLD_CLASS',
        score: 100
      }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'q_data_governance',
    templateId: 'tpl_01HZXXS3N9',
    sectionId: 'digitalization',
    order: 2,
    kind: 'SINGLE_CHOICE',
    prompt: 'Data Governance and Trust',
    helpText: 'How mature are your data governance processes?',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'DATA_GOVERNANCE'
    },
    options: [
      {
        id: 'opt_gov_basic',
        questionId: 'q_data_governance',
        label: 'No formal ownership or quality controls, data often unreliable',
        value: 'BASIC',
        score: 25
      },
      {
        id: 'opt_gov_emerging',
        questionId: 'q_data_governance',
        label: 'Defined ownership and data validation in early stages',
        value: 'EMERGING',
        score: 50
      },
      {
        id: 'opt_gov_established',
        questionId: 'q_data_governance',
        label: 'Fair principles applied, governed processes standards',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        id: 'opt_gov_world_class',
        questionId: 'q_data_governance',
        label: 'Trusted high-quality data used across R&D and partners',
        value: 'WORLD_CLASS',
        score: 100
      }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
  // Add more questions as needed...
];

export const dummyNewQuestion = {
  templateId: 'tpl_01HZXXS3N9',
  sectionId: 'digitalization',
  order: 11,
  kind: 'SINGLE_CHOICE',
  prompt: 'New Question Example',
  helpText: 'This is a sample new question',
  required: true,
  metadata: {
    pillar: 'DIGITALIZATION',
    dimension: 'NEW_AREA'
  },
  options: [
    {
      label: 'Basic level response',
      value: 'BASIC',
      score: 25
    },
    {
      label: 'Emerging level response',
      value: 'EMERGING',
      score: 50
    },
    {
      label: 'Established level response',
      value: 'ESTABLISHED',
      score: 75
    },
    {
      label: 'World class level response',
      value: 'WORLD_CLASS',
      score: 100
    }
  ]
};