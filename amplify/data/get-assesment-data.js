export function request(ctx) {
  return {
    version: '2018-05-29',
    payload: {}
  };
}

export function response(ctx) {
  const focusAreas = [
    'Data Architecture and Integration',
    'Data Governance and Trust',
    'Smart Lab and Workflow Automation',
    'Analytics and AI-driven Discovery',
    'Manufacturing and Scale-up Integration',
    'Leadership and Digital Culture',
    'Skills and Workforce Enablement',
    'Customer and Market Feedback Integration',
    'Sustainability and Regulatory Intelligence',
    'Supplier Ecosystem Connectivity'
  ];

  const maturityLevels = ['Basic', 'Emerging', 'Established', 'World Class'];

  const gridData = {
    'Data Architecture and Integration': {
      'Basic': 'Data is fragmented, stored in spreadsheets or local systems',
      'Emerging': 'Some systems connected, early standardization efforts',
      'Established': 'Unified data model, most key systems integrated',
      'World Class': 'Fully scalable, interoperable architecture supports innovation'
    },
    'Data Governance and Trust': {
      'Basic': 'No formal ownership or quality controls, data often unreliable',
      'Emerging': 'Defined ownership and data validation in early stages',
      'Established': 'Fair principles applied, governed processes standards',
      'World Class': 'Trusted high-quality data used across R&D and partners'
    },
    'Smart Lab and Workflow Automation': {
      'Basic': 'Paper-based records, disconnected instruments',
      'Emerging': 'Basic ELN use, isolated instrument capture',
      'Established': 'Connected lab systems, automated data capture expanding',
      'World Class': 'Fully automated smart lab with orchestration and robotics'
    },
    'Analytics and AI-driven Discovery': {
      'Basic': 'Manual reporting, no advanced analytics',
      'Emerging': 'Dashboards and BI tools used by select teams',
      'Established': 'Predictive models in use, analytics embedded in workflows',
      'World Class': 'AI/ML drives discovery, prescriptive analytics common'
    },
    'Manufacturing and Scale-up Integration': {
      'Basic': 'Manual tech transfer, R&D and Ops disconnected',
      'Emerging': 'R&D collects manufacturing data, with basic structure',
      'Established': 'Digital twins and structured tech transfer established',
      'World Class': 'Live feedback from manufacturing informs real-time R&D updates'
    },
    'Leadership and Digital Culture': {
      'Basic': 'No shared digital vision, limited executive engagement',
      'Emerging': 'Leadership expresses support, early digital culture efforts',
      'Established': 'Digital vision cascaded, digital innovation encouraged',
      'World Class': 'Leaders model digital behaviors, digital culture deeply embedded'
    },
    'Skills and Workforce Enablement': {
      'Basic': 'Minimal digital training, reliance on individual workarounds',
      'Emerging': 'Introductory training programs in place, limited support',
      'Established': 'Role-specific training and digital career paths defined with digital roles introduced in the organization',
      'World Class': 'Workforce excels in digital tools with continuous upskill, digital roles and career paths are robust'
    },
    'Customer and Market Feedback Integration': {
      'Basic': 'Customer input captured ad hoc, if at all',
      'Emerging': 'Structured VOC processes in place for key products',
      'Established': 'Feedback loops tied to product development decisions',
      'World Class': 'Real-time customer input continuously informs R&D'
    },
    'Sustainability and Regulatory Intelligence': {
      'Basic': 'Sustainability not considered in R&D decisions',
      'Emerging': 'Sustainability metrics tracked post-development',
      'Established': 'Sustainability built into early R&D design tools',
      'World Class': 'Eco-impact simulated during design, fully compliant by design'
    },
    'Supplier Ecosystem Connectivity': {
      'Basic': 'Email-based communications, no shared digital space',
      'Emerging': 'Some shared portals, supplier specs partially digitized',
      'Established': 'Digitally managed supplier data, real-time traceability',
      'World Class': 'Seamless secure integration across global ecosystem'
    }
  };

  return {
    focusAreas,
    maturityLevels,
    gridData: JSON.stringify(gridData)
  };
}