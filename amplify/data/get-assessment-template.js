export function request(ctx) {
  const { slug, version } = ctx.arguments;
  
  return {
    version: '2018-05-29',
    payload: {
      slug,
      version: version || '1.0.0'
    }
  };
}

export function response(ctx) {
  const { slug, version } = ctx.payload;
  
  // Return the high-level assessment template
  if (slug === 'digital-readiness-high') {
    return {
      id: 'tpl_01HZXXS3N9',
      name: 'Digital Readiness – High Level',
      slug: 'digital-readiness-high',
      version: version || '1.0.0',
      sections: [
        {
          id: 'digitalization',
          title: 'Digitalization',
          description: 'Data, systems, and digital infrastructure'
        },
        {
          id: 'transformation',
          title: 'Transformation',
          description: 'Process automation and workflow optimization'
        },
        {
          id: 'value_scaling',
          title: 'Value Scaling',
          description: 'Analytics, AI, and business value creation'
        }
      ],
      scoringConfig: {
        weights: {
          digitalization: 0.33,
          transformation: 0.33,
          value_scaling: 0.34
        },
        maturityToScore: {
          BASIC: 25,
          EMERGING: 50,
          ESTABLISHED: 75,
          WORLD_CLASS: 100
        }
      },
      questions: [
        {
          id: 'q_data_architecture',
          sectionId: 'digitalization',
          order: 1,
          kind: 'SINGLE_CHOICE',
          prompt: 'Data Architecture and Integration',
          required: true,
          options: [
            {
              id: 'opt_data_basic',
              label: 'Data is fragmented, stored in spreadsheets or local systems',
              value: 'BASIC',
              score: 25
            },
            {
              id: 'opt_data_emerging',
              label: 'Some systems connected, early standardization efforts',
              value: 'EMERGING',
              score: 50
            },
            {
              id: 'opt_data_established',
              label: 'Unified data model, most key systems integrated',
              value: 'ESTABLISHED',
              score: 75
            },
            {
              id: 'opt_data_world_class',
              label: 'Fully scalable, interoperable architecture supports innovation',
              value: 'WORLD_CLASS',
              score: 100
            }
          ]
        },
        {
          id: 'q_data_governance',
          sectionId: 'digitalization',
          order: 2,
          kind: 'SINGLE_CHOICE',
          prompt: 'Data Governance and Trust',
          required: true,
          options: [
            {
              id: 'opt_gov_basic',
              label: 'No formal ownership or quality controls, data often unreliable',
              value: 'BASIC',
              score: 25
            },
            {
              id: 'opt_gov_emerging',
              label: 'Defined ownership and data validation in early stages',
              value: 'EMERGING',
              score: 50
            },
            {
              id: 'opt_gov_established',
              label: 'Fair principles applied, governed processes standards',
              value: 'ESTABLISHED',
              score: 75
            },
            {
              id: 'opt_gov_world_class',
              label: 'Trusted high-quality data used across R&D and partners',
              value: 'WORLD_CLASS',
              score: 100
            }
          ]
        },
        {
          id: 'q_smart_lab',
          sectionId: 'transformation',
          order: 3,
          kind: 'SINGLE_CHOICE',
          prompt: 'Smart Lab and Workflow Automation',
          required: true,
          options: [
            {
              id: 'opt_lab_basic',
              label: 'Paper-based records, disconnected instruments',
              value: 'BASIC',
              score: 25
            },
            {
              id: 'opt_lab_emerging',
              label: 'Basic ELN use, isolated instrument capture',
              value: 'EMERGING',
              score: 50
            },
            {
              id: 'opt_lab_established',
              label: 'Connected lab systems, automated data capture expanding',
              value: 'ESTABLISHED',
              score: 75
            },
            {
              id: 'opt_lab_world_class',
              label: 'Fully automated smart lab with orchestration and robotics',
              value: 'WORLD_CLASS',
              score: 100
            }
          ]
        },
        {
          id: 'q_analytics_ai',
          sectionId: 'value_scaling',
          order: 4,
          kind: 'SINGLE_CHOICE',
          prompt: 'Analytics and AI-driven Discovery',
          required: true,
          options: [
            {
              id: 'opt_ai_basic',
              label: 'Manual reporting, no advanced analytics',
              value: 'BASIC',
              score: 25
            },
            {
              id: 'opt_ai_emerging',
              label: 'Dashboards and BI tools used by select teams',
              value: 'EMERGING',
              score: 50
            },
            {
              id: 'opt_ai_established',
              label: 'Predictive models in use, analytics embedded in workflows',
              value: 'ESTABLISHED',
              score: 75
            },
            {
              id: 'opt_ai_world_class',
              label: 'AI/ML drives discovery, prescriptive analytics common',
              value: 'WORLD_CLASS',
              score: 100
            }
          ]
        },
        {
          id: 'q_manufacturing',
          sectionId: 'transformation',
          order: 5,
          kind: 'SINGLE_CHOICE',
          prompt: 'Manufacturing and Scale-up Integration',
          required: true,
          options: [
            {
              id: 'opt_mfg_basic',
              label: 'Manual tech transfer, R&D and Ops disconnected',
              value: 'BASIC',
              score: 25
            },
            {
              id: 'opt_mfg_emerging',
              label: 'R&D collects manufacturing data, with basic structure',
              value: 'EMERGING',
              score: 50
            },
            {
              id: 'opt_mfg_established',
              label: 'Digital twins and structured tech transfer established',
              value: 'ESTABLISHED',
              score: 75
            },
            {
              id: 'opt_mfg_world_class',
              label: 'Live feedback from manufacturing informs real-time R&D updates',
              value: 'WORLD_CLASS',
              score: 100
            }
          ]
        },
        {
          id: 'q_leadership',
          sectionId: 'transformation',
          order: 6,
          kind: 'SINGLE_CHOICE',
          prompt: 'Leadership and Digital Culture',
          required: true,
          options: [
            {
              id: 'opt_lead_basic',
              label: 'No shared digital vision, limited executive engagement',
              value: 'BASIC',
              score: 25
            },
            {
              id: 'opt_lead_emerging',
              label: 'Leadership expresses support, early digital culture efforts',
              value: 'EMERGING',
              score: 50
            },
            {
              id: 'opt_lead_established',
              label: 'Digital vision cascaded, digital innovation encouraged',
              value: 'ESTABLISHED',
              score: 75
            },
            {
              id: 'opt_lead_world_class',
              label: 'Leaders model digital behaviors, digital culture deeply embedded',
              value: 'WORLD_CLASS',
              score: 100
            }
          ]
        },
        {
          id: 'q_skills',
          sectionId: 'transformation',
          order: 7,
          kind: 'SINGLE_CHOICE',
          prompt: 'Skills and Workforce Enablement',
          required: true,
          options: [
            {
              id: 'opt_skills_basic',
              label: 'Minimal digital training, reliance on individual workarounds',
              value: 'BASIC',
              score: 25
            },
            {
              id: 'opt_skills_emerging',
              label: 'Introductory training programs in place, limited support',
              value: 'EMERGING',
              score: 50
            },
            {
              id: 'opt_skills_established',
              label: 'Role-specific training and digital career paths defined with digital roles introduced in the organization',
              value: 'ESTABLISHED',
              score: 75
            },
            {
              id: 'opt_skills_world_class',
              label: 'Workforce excels in digital tools with continuous upskill, digital roles and career paths are robust',
              value: 'WORLD_CLASS',
              score: 100
            }
          ]
        },
        {
          id: 'q_customer_feedback',
          sectionId: 'value_scaling',
          order: 8,
          kind: 'SINGLE_CHOICE',
          prompt: 'Customer and Market Feedback Integration',
          required: true,
          options: [
            {
              id: 'opt_customer_basic',
              label: 'Customer input captured ad hoc, if at all',
              value: 'BASIC',
              score: 25
            },
            {
              id: 'opt_customer_emerging',
              label: 'Structured VOC processes in place for key products',
              value: 'EMERGING',
              score: 50
            },
            {
              id: 'opt_customer_established',
              label: 'Feedback loops tied to product development decisions',
              value: 'ESTABLISHED',
              score: 75
            },
            {
              id: 'opt_customer_world_class',
              label: 'Real-time customer input continuously informs R&D',
              value: 'WORLD_CLASS',
              score: 100
            }
          ]
        },
        {
          id: 'q_sustainability',
          sectionId: 'value_scaling',
          order: 9,
          kind: 'SINGLE_CHOICE',
          prompt: 'Sustainability and Regulatory Intelligence',
          required: true,
          options: [
            {
              id: 'opt_sustain_basic',
              label: 'Sustainability not considered in R&D decisions',
              value: 'BASIC',
              score: 25
            },
            {
              id: 'opt_sustain_emerging',
              label: 'Sustainability metrics tracked post-development',
              value: 'EMERGING',
              score: 50
            },
            {
              id: 'opt_sustain_established',
              label: 'Sustainability built into early R&D design tools',
              value: 'ESTABLISHED',
              score: 75
            },
            {
              id: 'opt_sustain_world_class',
              label: 'Eco-impact simulated during design, fully compliant by design',
              value: 'WORLD_CLASS',
              score: 100
            }
          ]
        },
        {
          id: 'q_supplier',
          sectionId: 'digitalization',
          order: 10,
          kind: 'SINGLE_CHOICE',
          prompt: 'Supplier Ecosystem Connectivity',
          required: true,
          options: [
            {
              id: 'opt_supplier_basic',
              label: 'Email-based communications, no shared digital space',
              value: 'BASIC',
              score: 25
            },
            {
              id: 'opt_supplier_emerging',
              label: 'Some shared portals, supplier specs partially digitized',
              value: 'EMERGING',
              score: 50
            },
            {
              id: 'opt_supplier_established',
              label: 'Digitally managed supplier data, real-time traceability',
              value: 'ESTABLISHED',
              score: 75
            },
            {
              id: 'opt_supplier_world_class',
              label: 'Seamless secure integration across global ecosystem',
              value: 'WORLD_CLASS',
              score: 100
            }
          ]
        }
      ],
      createdAt: '2025-08-01T09:00:00Z',
      updatedAt: '2025-08-10T09:00:00Z'
    };
  }
  
  return null;
}