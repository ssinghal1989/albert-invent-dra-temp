export const Tier1TemplateId = 'tier1_high_level_assessment';
export const Tier2TemplateId = 'tier2_detailed_assessment';


// Default questions for TIER1 and TIER2 assessments
export const TIER1_DEFAULT_QUESTIONS = [
  {
    templateId: Tier1TemplateId,
    sectionId: 'digitalization',
    order: 1,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'Data Architecture and Integration',
    helpText: 'How well integrated and standardized is your data architecture across R&D systems?',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'DATA_FOUNDATION',
      tier: 'TIER1'
    },
    options: [
      {
        label: 'Data is fragmented, stored in spreadsheets or local systems',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some systems connected, early standardization efforts',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Unified data model, most key systems integrated',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Fully scalable, interoperable architecture supports innovation',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier1TemplateId,
    sectionId: 'digitalization',
    order: 2,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'Data Governance and Trust',
    helpText: 'How mature are your data governance processes and data quality controls?',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'DATA_GOVERNANCE',
      tier: 'TIER1'
    },
    options: [
      {
        label: 'No formal ownership or quality controls, data often unreliable',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Defined ownership and data validation in early stages',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'FAIR principles applied, governed processes and standards',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Trusted high-quality data used across R&D and partners',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier1TemplateId,
    sectionId: 'digitalization',
    order: 3,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'Smart Lab and Workflow Automation',
    helpText: 'What is the level of automation and digital integration in your laboratory workflows?',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'LAB_AUTOMATION',
      tier: 'TIER1'
    },
    options: [
      {
        label: 'Paper-based records, disconnected instruments',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Basic ELN use, isolated instrument capture',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Connected lab systems, automated data capture expanding',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Fully automated smart lab with orchestration and robotics',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier1TemplateId,
    sectionId: 'value_scaling',
    order: 4,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'Analytics and AI-driven Discovery',
    helpText: 'How advanced are your analytics capabilities and AI/ML integration in R&D processes?',
    required: true,
    metadata: {
      pillar: 'VALUE_SCALING',
      dimension: 'ANALYTICS_AI',
      tier: 'TIER1'
    },
    options: [
      {
        label: 'Manual reporting, no advanced analytics',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Dashboards and BI tools used by select teams',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Predictive models in use, analytics embedded in workflows',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'AI/ML drives discovery, prescriptive analytics common',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier1TemplateId,
    sectionId: 'transformation',
    order: 5,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'Manufacturing and Scale-up Integration',
    helpText: 'How well integrated are your R&D and manufacturing processes through digital systems?',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'MANUFACTURING_INTEGRATION',
      tier: 'TIER1'
    },
    options: [
      {
        label: 'Manual tech transfer, R&D and Ops disconnected',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'R&D collects manufacturing data, with basic structure',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Digital twins and structured tech transfer established',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Live feedback from manufacturing informs real-time R&D updates',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier1TemplateId,
    sectionId: 'transformation',
    order: 6,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'Leadership and Digital Culture',
    helpText: 'How strong is leadership support and digital culture adoption across the organization?',
    required: true,
    metadata: {
      pillar: 'TRANSFORMATION',
      dimension: 'DIGITAL_CULTURE',
      tier: 'TIER1'
    },
    options: [
      {
        label: 'No shared digital vision, limited executive engagement',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Leadership expresses support, early digital culture efforts',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Digital vision cascaded, digital innovation encouraged',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Leaders model digital behaviors, digital culture deeply embedded',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier1TemplateId,
    sectionId: 'transformation',
    order: 7,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'Skills and Workforce Enablement',
    helpText: 'What is the level of digital skills development and workforce enablement programs?',
    required: true,
    metadata: {
      pillar: 'TRANSFORMATION',
      dimension: 'WORKFORCE_SKILLS',
      tier: 'TIER1'
    },
    options: [
      {
        label: 'Minimal digital training, reliance on individual workarounds',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Introductory training programs in place, limited support',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Role-specific training and digital career paths defined with digital roles introduced in the organization',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Workforce excels in digital tools with continuous upskill, digital roles and career paths are robust',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier1TemplateId,
    sectionId: 'value_scaling',
    order: 8,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'Customer and Market Feedback Integration',
    helpText: 'How effectively do you capture and integrate customer feedback into R&D processes?',
    required: true,
    metadata: {
      pillar: 'VALUE_SCALING',
      dimension: 'CUSTOMER_INTEGRATION',
      tier: 'TIER1'
    },
    options: [
      {
        label: 'Customer input captured ad hoc, if at all',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Structured VOC processes in place for key products',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Feedback loops tied to product development decisions',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Real-time customer input continuously informs R&D',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier1TemplateId,
    sectionId: 'value_scaling',
    order: 9,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'Sustainability and Regulatory Intelligence',
    helpText: 'How well integrated are sustainability considerations and regulatory intelligence in your R&D processes?',
    required: true,
    metadata: {
      pillar: 'VALUE_SCALING',
      dimension: 'SUSTAINABILITY_REGULATORY',
      tier: 'TIER1'
    },
    options: [
      {
        label: 'Sustainability not considered in R&D decisions',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Sustainability metrics tracked post-development',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Sustainability built into early R&D design tools',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Eco-impact simulated during design, fully compliant by design',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier1TemplateId,
    sectionId: 'value_scaling',
    order: 10,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'Supplier Ecosystem Connectivity',
    helpText: 'How digitally connected and integrated is your supplier ecosystem?',
    required: true,
    metadata: {
      pillar: 'VALUE_SCALING',
      dimension: 'SUPPLIER_CONNECTIVITY',
      tier: 'TIER1'
    },
    options: [
      {
        label: 'Email-based communications, no shared digital space',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some shared portals, supplier specs partially digitized',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Digitally managed supplier data, real-time traceability',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Seamless secure integration across global ecosystem',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  }
];

export const TIER2_DEFAULT_QUESTIONS = [
  {
    templateId: Tier2TemplateId,
    sectionId: 'digitalization',
    order: 1,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How would you describe your organization\'s current approach to data foundation?',
    helpText: 'Data Architecture, Systems Integrations and Interoperability, Scalable Infrastructure',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'Data Foundation',
      subdimensions: 'Data Architecture\nSystems Integrations and Interoperability\nScalable Infrastructure',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'Data is scattered across spreadsheets and tools, with no standard structure; silos and inconsistencies are common. Systems don\'t talk to each other; data is moved manually via email or spreadsheets. Infrastructure is fragmented, mostly on-premise, and hard to scale; there\'s no redundancy or support for large files.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some data formats and models exist, but they\'re only used in pockets and metadata is applied inconsistently. A few systems are connected with custom scripts or APIs, but integration is one-off and doesn\'t scale. Hybrid infrastructure is starting to emerge, but provisioning is manual and scaling remains limited.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'A unified architecture organizes and links data across systems using shared vocabularies and models. Core R&D systems are connected through a standard framework, enabling consistent and reliable data flow. Scalable cloud or hybrid infrastructure supports automation, monitoring, and optimized performance.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Enterprise-wide architecture supports structured and unstructured data using semantic models and ontologies. Systems are plug-and-play, enabling real-time, predictive decision-making across labs, tools, and partners. Cloud-native infrastructure is elastic, self-optimizing, and evolves dynamically to support AI, modeling, and global collaboration.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'digitalization',
    order: 2,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How would you describe your organization\'s current approach to fair data?',
    helpText: 'FAIR Data principles implementation and data discoverability',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'FAIR Data',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'There\'s no shared data model in R&D; formats and labels vary by team, making integration difficult. Metadata is minimal or missing, and no standard vocabularies are used, so data reuse is rare. Experimental and business context is usually lost, and users can\'t tell how or why data was generated. Data discovery is manual, with no centralized catalog — people rely on folder browsing or word-of-mouth.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some teams start using naming conventions and simple data models for specific data types. Metadata is applied manually, and domain vocabularies are emerging but inconsistent. Context like project or equipment is captured for some data, but it\'s not queryable. Basic portals or spreadsheets index limited datasets, and users can only search by filename or tags.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'A shared data model exists for critical R&D entities and supports system interoperability. Metadata is consistently captured using standard vocabularies and ontologies, enabling better tagging and reuse. Data is linked to full lifecycle context and can be explored via dashboards. Internal data catalogs allow team-wide discovery using tags, metadata, and full-text search.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'An ontology-driven, enterprise-wide data model connects all R&D systems and evolves with industry standards. Metadata is auto-generated and supports semantic reasoning and AI. Context is captured in real time and enriches analytics, models, and compliance. Enterprise-grade catalogs index and rank data, enabling semantic search, lineage views, and federated discovery across internal and external sources.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'digitalization',
    order: 3,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How would you describe your organization\'s current approach to governance and stewardship?',
    helpText: 'Data governance, asset stewardship, and digital asset management',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'Governance and Stewardship',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'There\'s no clear ownership of digital assets—teams rely on informal roles, and knowledge is lost when people leave. Data quality isn\'t monitored consistently; issues are found manually or after they cause problems, and tools are used without validation. Data and models pile up with no versioning or formal retention, and outdated logic is often reused. There are few or no policies around access or usage, leading to inconsistent practices and security gaps.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some systems or datasets have informal owners or stewards, but accountability is inconsistent. Basic checks or logs are used for select data types, and dashboards are being introduced. Models or data are archived manually, but there\'s no consistent end-of-life process. Access and naming policies exist for a few systems, but enforcement is mostly manual and varies by team.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Ownership roles are defined and documented for different asset types, with governance embedded in workflows. Automated validation checks ensure data quality and tool performance. Lifecycle rules exist for how data is archived, versioned, and retired, and some processes are automated. Enforcement of policies (e.g., access, validation) is built into tools, and violations trigger remediation.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Ownership is fully institutionalized across all digital assets, supported by metadata and governance frameworks. AI-driven systems monitor data quality, tool usage, and model drift in real time. Every asset is tracked through its lifecycle, and intelligent systems automate deprecation and compliance. Governance policies evolve dynamically based on analytics, and enforcement is proactive, continuous, and system-integrated.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'digitalization',
    order: 4,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How would you describe your organization\'s current approach to cybersecurity?',
    helpText: 'Security measures, access control, and incident response capabilities',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'Cybersecurity',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'Access to data and tools is manual and inconsistent, often using shared logins with no formal user management. Security incidents are handled reactively with no clear plan, and breaches are often detected late or not investigated thoroughly. Sensitive data may not be encrypted, and audit trails or logs are missing or incomplete.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Role-based access exists for key systems but policies are inconsistently applied and reviews are manual. Teams have a basic incident response process for major systems, but responsibilities are unclear. Some encryption is used, and limited logs or version control exist, but monitoring is not routine.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Access rights are managed centrally and tied to roles or teams, with directory integration in place. A full incident response plan exists with alerts and periodic simulations. Sensitive data is encrypted by default, and audit trails are reviewed regularly for compliance.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Access control is dynamic and automated, adapting by user, location, or data type. Incident response is fast and AI-assisted, with automated workflows and post-incident reviews. Encryption and audit trails are enforced in real time, and logs feed directly into analytics and compliance systems.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'digitalization',
    order: 5,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How would you describe your organization\'s current approach to physical-to-digital identification systems?',
    helpText: 'Sample tracking, equipment identification, and real-time location systems',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'Physical-to-Digital Identification Systems',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'Samples and lots are tracked manually using spreadsheets or handwritten labels, and IDs are often reused or inconsistent, leading to lost traceability. Equipment is tracked on spreadsheets without unique identifiers or links to workflows, and calibration data is poorly recorded. There are no real-time tracking capabilities—locations are logged manually, increasing risk of loss or duplication.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some labs use barcodes or unique IDs, but data capture is fragmented and not consistently linked to experiments. Major equipment may have barcodes or asset tags, with some tools connected to inventory or maintenance systems, but usage data remains unstructured. RFID or mobile scanners may be piloted for high-value samples, but real-time tracking is limited and isolated.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'All samples and lots have standardized IDs connected to ELN, LIMS, and inventory systems. Equipment is fully tagged and digitally linked to maintenance, scheduling, and data workflows, with calibration and usage tracked. Real-time tracking systems are in place in some labs, making movement data and alerts visible to teams.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'End-to-end traceability of high-value assets, samples, and lots is achieved using automated tagging (e.g., RFID) and real-time location systems. Sample twins carry metadata, chain of custody, and lifecycle info, with AI used to predict issues like expiry or contamination. Equipment is mapped live via IoT, linked to analytics and predictive maintenance, and supports intelligent planning. Continuous tracking data feeds analytics for real-time asset flow, loss prevention, and reallocation.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'digitalization',
    order: 6,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How would you describe your organization\'s current approach to digital workflows?',
    helpText: 'Electronic lab notebooks, workflow automation, and data integration',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'Digital Workflows',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'Experiments are written in paper notebooks or generic formats like Word or Excel. There\'s no standardization, and it\'s hard to find or share records. Workflows are completely manual, relying on individual memory and habits. Data is siloed across tools and folders, often copied and pasted between systems, with missing or inconsistent metadata.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some labs use Electronic Lab Notebooks (ELNs), but adoption is inconsistent and basic templates are only just being introduced. Common workflows are documented, and simple automation like macros or scheduling tools are being piloted. Some ELNs or instruments are connected, but integration is manual and reactive, with patchy metadata.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'ELNs are widely used with standard templates and links to samples, materials, and instruments. SOPs are digitized and run through lab execution systems with scripts or bots to reduce manual work. Data flows automatically from instruments and systems through pipelines, with harmonized metadata for analysis and modeling.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'ELNs are fully integrated with inventory, LIMS, and data systems, with smart features like tagging and real-time recommendations. Workflows are adaptive and automated, coordinated across equipment, scheduling, and analysis, with intelligent agents suggesting optimizations. Data moves seamlessly across lab and enterprise systems, with automated lineage, versioning, and real-time connections enabling AI and decision automation.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'digitalization',
    order: 7,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How would you describe your organization\'s current approach to smart lab?',
    helpText: 'Laboratory automation, robotics, and intelligent monitoring systems',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'Smart Lab',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'Most instruments are standalone, with data collected manually via USB or printouts and no centralized tracking. Data is entered by hand, leading to frequent errors and data gaps. Labs don\'t use robotics; all sample handling is manual and operator-dependent. Monitoring is also manual, so issues are only noticed after the fact. Scheduling relies on whiteboards or spreadsheets, with no coordination across experiments or priorities.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some instruments are networked or connect to ELNs/LIMS for basic uploads. Data capture is partly automated for specific formats, but metadata is still added by hand. A few standalone robots handle repetitive tasks like pipetting but require expert programming. Some tools have basic monitoring and alerts, and equipment usage is logged separately. Scheduling is digital but disconnected from experiments or lab systems.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Instruments are connected via LAN or Wi-Fi, with logs of usage and metadata. Data is automatically captured and stored in structured formats with associated metadata. Robots are integrated with lab systems and schedules, making them easier to use and reconfigure. Central platforms track instrument health, alert users, and support preventative maintenance. Scheduling is centralized and integrated with ELNs and robotics platforms, enabling conflict detection and resource allocation.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Instruments are part of a smart lab architecture, using open protocols for plug-and-play interoperability. Data capture is fully automated in real time and feeds dashboards, models, and closed-loop experiments. Robotics are AI-orchestrated, supporting autonomous operations and dynamic task allocation. AI systems monitor lab conditions in real time, predict issues, and adjust operations automatically. Scheduling is optimized by AI across labs and sites, balancing constraints and priorities with predictive planning.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'digitalization',
    order: 8,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How would you describe your organization\'s current approach to centralized R&D analytics and dashboards?',
    helpText: 'Data visualization, analytics platforms, and predictive modeling capabilities',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'Centralized R&D Analytics and Dashboards',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'Data is scattered across emails, spreadsheets, and personal folders. Visualizations are static, manually created in Excel or PowerPoint, and rarely updated. No shared analytics environment exists, and data is not easily discoverable. Most users rely on static reports generated by experts. Data analysis requires specialized skills, and insights are hard to produce or share. Predictive or prescriptive models are not in use; analysis is mostly backward-looking, and hypotheses are generated manually without structured methods.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some teams have started building dashboards in BI tools like Power BI or Tableau, though they are often disconnected from live data sources. Visuals are developed independently, with limited standards or reuse. A few users can run queries or create visuals, but training and access remain limited. Early predictive models (e.g., regressions or time-series forecasts) are being piloted, though results are typically shared in slide decks or offline reports, and their impact on decisions is minimal.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Data from multiple systems is pulled into centralized repositories like data lakes or warehouses. Dashboards track KPIs, project status, and resource metrics, with consistent visual standards. Scientists and managers use guided tools to explore data, and templates help reduce dependency on analytics experts. Governance ensures consistency and quality. Predictive models are integrated into dashboards and tools, enabling scenario planning and prioritization. Teams trust and use these models as part of routine decision-making.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Live data pipelines feed fully dynamic dashboards personalized by role and embedded into R&D workflows. Analytics are proactive, leveraging AI to deliver alerts and recommendations in real time. Self-service analytics is intuitive and widespread, supported by natural language interfaces, no-code tools, or AI copilots. Users at all levels can generate insights and improve dashboards collaboratively. Prescriptive analytics drives decisions by recommending actions, predicting risks, and updating models automatically through ML pipelines. Insights trigger actions in real time through workflow integrations.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'digitalization',
    order: 9,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How would you describe your organization\'s current approach to AI/ML?',
    helpText: 'Artificial intelligence and machine learning implementation across R&D processes',
    required: true,
    metadata: {
      pillar: 'DIGITALIZATION',
      dimension: 'AI/ML',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'Experiments are designed manually, relying on intuition and experience. Iterations are slow, often repeated, and rarely guided by models. Researchers manually read papers and patents to find insights, and it\'s hard to reuse prior internal knowledge. Property prediction is mostly done using simple equations or guesswork, and materials are selected through trial-and-error. Failures are logged but not deeply analyzed, and their causes are speculative. Lab scheduling and resource planning are done manually, with frequent conflicts. Sustainability is addressed late in the process, mainly for compliance.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some statistical tools like Design of Experiments (DoE) are used to optimize tests, and teams are starting to explore machine learning models. NLP tools help extract keywords from papers and patents, and early pilots of knowledge graphs and document clustering are underway. Machine learning models are being developed to predict certain material properties, though accuracy is still improving. Screening libraries and basic computational models are used to prioritize materials. Teams analyze failure logs using scripts or dashboards and use basic alerts. Scheduling tools are used reactively. Lifecycle tools like LCA are introduced during review gates to estimate environmental impact.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'ML models are used to design experiments and improve them with each cycle. Multi-objective tools optimize performance, cost, and other parameters. AI tools scan internal and external knowledge bases, linking documents and tagging key insights. Validated models predict material properties and are used for screening, simulation, and faster formulation tuning. ML helps identify promising materials based on structure-property patterns, closing the loop with validation data. Algorithms spot root causes of failures and reduce resolution time. ML models align lab availability with project needs, enabling data-driven planning. Sustainability metrics are built into early formulation or process design stages, with tradeoffs visualized for better decisions.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Experiments run with minimal human input in closed-loop systems guided by AI. Reinforcement learning helps optimize speed, cost, and scientific novelty. Generative AI tools combine knowledge from text, data, and images, suggesting prior art, collaborators, and inventions. Chemically informed ML models predict multiple properties across design spaces and support inverse design. Generative models propose new materials and validate them in real-time workflows. AI systems predict and prevent failures, simulate outcomes, and recommend actions. Labs are dynamically scheduled using real-time data, optimizing equipment, personnel, and energy use. AI-powered design tools include carbon, toxicity, and circularity predictions from the start—enabling truly sustainable R&D.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'transformation',
    order: 10,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How actively does R&D leadership set, communicate, and champion the digital transformation agenda?',
    helpText: 'Executive sponsorship and leadership engagement in digital transformation',
    required: true,
    metadata: {
      pillar: 'TRANSFORMATION',
      dimension: 'Executive Sponsorship',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'The organization is in the early stages of defining its digital direction. Teams may have varying interpretations of what digital transformation means, and communication around goals and priorities is still forming. Digital responsibilities are often delegated to technical teams, and initiatives can struggle to gain momentum without consistent sponsorship or resources.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'A digital vision is beginning to take shape and may be included in leadership communications, though broader alignment and engagement are still developing. Leaders show interest in digital efforts, often through support for pilots or innovation projects. While investment may be more tactical than strategic, there is a growing foundation to build on.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'A clear and well-communicated digital vision is in place, with alignment to broader R&D and business objectives. Executives regularly participate in digital programs and serve as visible sponsors at key milestones. Investment in people, systems, and tools is sustained, and digital outcomes are increasingly tied to performance and cross-functional priorities.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Digital transformation is fully embedded in corporate strategy and is widely embraced across teams. Leadership is highly engaged and proactive—modeling digital behaviors, celebrating successes, and inspiring teams with a compelling vision. Digital efforts receive strong governance, clear KPIs, and long-term commitment, positioning transformation as a core driver of R&D innovation and value creation.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'transformation',
    order: 11,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How broadly are digital skills and learning opportunities available and encouraged across R&D?',
    helpText: 'Digital literacy, training programs, and workforce development',
    required: true,
    metadata: {
      pillar: 'TRANSFORMATION',
      dimension: 'Digital Literacy and Upskilling',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'Digital tools like ELNs and LIMS are available but are inconsistently used, with many processes still relying on spreadsheets or paper-based methods. Awareness of digital possibilities tends to be limited to immediate tools, and digital is often viewed as an IT responsibility. Upskilling is informal, with few structured learning opportunities and little visibility into digital competencies across roles.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Teams have begun using core digital platforms in select workflows, though adoption is uneven and often team- or site-specific. There is growing curiosity about how digital can enhance R&D, supported by a few internal champions. Some structured training exists, especially for those in technical roles, but learning paths remain inconsistent and depend on individual initiative.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Standardized digital tools are widely adopted and integrated into daily work, supporting consistent execution and improved data quality. Innovation is increasingly seen as a shared responsibility, with teams exploring emerging technologies and participating in organized idea-generation activities. Organization-wide training programs and competency models help build digital fluency, and capabilities are beginning to be assessed formally.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Digital tools are seamlessly embedded across end-to-end R&D workflows, and teams actively experiment with advanced technologies and automation. Innovation is employee-led as much as leadership-driven, with a strong culture of digital experimentation and empowerment. Continuous learning is part of the organizational fabric, with AI-curated, role-based development paths and digital skills embedded in career progression.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'transformation',
    order: 12,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How effectively do R&D teams collaborate using digital tools and shared platforms?',
    helpText: 'Cross-functional collaboration and digital platform adoption',
    required: true,
    metadata: {
      pillar: 'TRANSFORMATION',
      dimension: 'Collaborative Digital Mindset',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'Cross-functional collaboration is minimal, with siloed teams and limited communication across labs. Project tracking and coordination rely on static, disconnected tools like Excel or paper. There are no shared collaboration platforms, and knowledge rarely moves beyond individual groups. Communities of Practice (CoPs) are absent, and the culture does not actively support knowledge sharing.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some cross-team digital efforts have begun, using shared drives, email, or tools like Teams or Slack. Digital collaboration tools are available but inconsistently adopted, leading to confusion and limited reuse. Informal communities are starting to form around shared interests, but participation is voluntary and not widely visible.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Collaboration tools are embedded into daily work, with shared dashboards, integrated platforms, and clear communication standards across functions. Teams align on shared goals and timelines, and receive support to use digital tools effectively. Recognized CoPs focus on digital and scientific topics, contributing to best practices and process improvement with leadership support.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Collaboration is fluid and embedded into how R&D operates, with interdisciplinary teams co-developing, testing, and improving solutions in real time. Tools are fully integrated—from planning to retrospectives—and connect with systems like ELNs and data platforms. Strategic CoPs drive innovation, evolve continuously through feedback, and foster a learning culture across roles and geographies.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'transformation',
    order: 13,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How consistently is R&D knowledge captured, transferred, and reused across teams and projects?',
    helpText: 'Knowledge management systems and institutional memory preservation',
    required: true,
    metadata: {
      pillar: 'TRANSFORMATION',
      dimension: 'Knowledge Management',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'Knowledge is inconsistently documented, often stored in offline or disconnected files, leading to version control issues and frequent rework. Transfer depends on informal conversations or trial-and-error, with no structured onboarding or retention practices. Discovery is manual and slow, with insights duplicated or lost due to the absence of AI tools.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Basic systems like wikis or LIMS begin consolidating documents, though usage is inconsistent and metadata incomplete. Some teams pilot templates or folder structures and appoint "knowledge champions." Sharing occurs in ad hoc formats like meetings or training sessions. Teams begin experimenting with AI tools such as keyword search or NLP pilots but lack formal support or scale.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Standardized documentation practices and shared repositories support consistent recording of data, results, and lessons learned. Knowledge is proactively captured and searchable across teams. Formal onboarding, handoff, and mentoring programs improve transfer, and digital platforms enable asynchronous access. AI tools are actively used to mine literature and internal data, surfacing insights that inform design and strategy.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Knowledge capture is embedded into digital workflows and enriched through AI-driven annotation, summarization, and linking. AI avatars and LLMs continuously learn from centralized sources like reports and interviews, creating accessible institutional memory. Knowledge flows seamlessly across roles and generations via AI-personalized platforms and embedded transfer processes. Intelligent discovery systems suggest experiments, surface hidden insights, and enable fully contextual and traceable decision-making.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'transformation',
    order: 14,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How well does the organization support and manage change during digital transformation in R&D?',
    helpText: 'Change management processes and organizational adaptation capabilities',
    required: true,
    metadata: {
      pillar: 'TRANSFORMATION',
      dimension: 'Change Management',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'Change efforts face resistance, with teams preferring established methods and limited trust in digital initiatives. Multiple projects may be launched at once without coordination, leading to fatigue. Communication is often ad hoc and begins late, while training is minimal and mostly informal.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some openness to new ways of working is taking root, especially through pilots or innovation teams. Leadership begins recognizing change fatigue and starts sequencing initiatives. Communication plans exist for major projects, though messaging may remain top-down. Initial training is offered but lacks follow-up and consistency.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Change is actively managed with lessons learned applied across initiatives. Tools like dashboards or surveys help monitor saturation, and capacity is factored into planning. Communication strategies are audience-specific and supported by feedback loops. Training is structured, reinforced by managers, and tailored to user needs.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Change is embraced across the organization as a driver of progress. Agile teams, proactive communication, and continuous reinforcement enable smooth transitions. Change load is carefully managed, and learning is embedded into workflows through in-app support, AI coaches, and peer learning—making change feel purposeful and sustainable.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'value_scaling',
    order: 15,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How well are customer, market, and product insights integrated into R&D decision-making?',
    helpText: 'Voice of customer integration and market-driven R&D decisions',
    required: true,
    metadata: {
      pillar: 'VALUE_SCALING',
      dimension: 'Market and Product Insights Integration',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'R&D receives anecdotal or secondhand feedback through intermediaries, making it hard to understand real use cases. Market trends and customer needs are largely invisible to scientists, and product decisions rely on technical feasibility or legacy inputs. Feedback loops are manual, late-stage, and disconnected from innovation cycles.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Feedback is captured through customer visits, technical support, or trade events and documented in CRM or service logs. Market data is shared occasionally by commercial teams, though it is often outdated or siloed. R&D reviews feedback during stage gates, but tools remain presentation-based and are not tied to design workflows.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'R&D integrates VOC from service reports, field trials, and dashboards, using personas and application data to guide product decisions. Market analytics and business potential inform prioritization earlier in the pipeline. Performance data is digitally captured and linked to formulations, with documented corrective actions that close the loop.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'R&D collaborates with customers in real time through digital platforms and connected products. AI analyzes VOC by region, segment, and trend, guiding proactive decisions. Market analytics and ML-based prioritization are embedded in planning tools. Feedback loops operate continuously using real-time product performance data, driving agile, customer-centric innovation.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'value_scaling',
    order: 16,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How digitally connected is R&D with suppliers and procurement partners?',
    helpText: 'Supplier integration and procurement digitalization',
    required: true,
    metadata: {
      pillar: 'VALUE_SCALING',
      dimension: 'Supplier and Procurement Integration',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'Supplier interactions are transactional and handled via email or spreadsheets, with limited structure or shared systems. COAs, specs, and SDS files are manually requested and stored in static formats. Traceability into raw materials is low, and R&D works from disconnected or outdated specification data.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Basic supplier portals and procurement tools provide access to SDS, TDS, and limited lot tracking. Some digital records are uploaded to shared drives or portals, but systems remain siloed. Specification updates are manual, and supplier input is not yet integrated into R&D workflows.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Suppliers collaborate through digital portals or APIs integrated into R&D tools (e.g., ELN, PLM). Material specifications are co-authored, version-controlled, and searchable. Digital traceability links batch data, test results, and material history, improving root cause analysis and formulation design.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'R&D and suppliers operate in real-time on integrated platforms. AI evaluates supplier risk and sustainability alignment, and digital twins model the full supply chain. Smart specifications are governed by APIs, enriched with material fingerprints, and monitored by AI to flag risk or performance deviations instantly.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'value_scaling',
    order: 17,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How easily can commercial teams and customers access and use R&D data and tools?',
    helpText: 'Customer-facing digitalization and commercial team integration',
    required: true,
    metadata: {
      pillar: 'VALUE_SCALING',
      dimension: 'Customer-Centric Digitalization',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'R&D data is isolated in lab notebooks or spreadsheets, with commercial teams relying on tribal knowledge or informal queries. Customer requests are vague and relayed through reps. Field feedback is anecdotal and delayed, limiting R&D\'s ability to respond or adapt.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Basic R&D specs and TDSs are available via CRM or internal portals. Customer portals collect structured requests using templates. Field feedback is gathered via service portals or apps, and processes exist for periodic review, though updates are manual.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'R&D databases are integrated with tools used by sales and service teams. AI-powered configurators support solutioning based on R&D data. CRM and IoT platforms feed structured, real-time field data into models that help inform formulation updates.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'AI-curated R&D insights are accessible to commercial teams, field service reps, and even customers. Digital tools like simulators and recommenders allow for real-time solutioning. Predictive models detect and interpret field anomalies to guide proactive product adaptation and new development.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'value_scaling',
    order: 18,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How effectively does R&D collaborate with manufacturing using digital tools and data?',
    helpText: 'Manufacturing integration and Industry 4.0 enablement',
    required: true,
    metadata: {
      pillar: 'VALUE_SCALING',
      dimension: 'Manufacturing and Operations 4.0 Enablement',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'R&D and manufacturing operate independently, with no digital twins or real-time process visibility. Scale-up data is shared manually via emails or spreadsheets, leading to misalignment and frequent trial-and-error. Process monitoring is reactive and relies on operator experience, with limited data analysis after the fact.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'Some unit operations are simulated, but models are isolated from real plant data. R&D provides scale-up templates and lab data in structured formats, though coordination happens through meetings or shared folders. Optimization efforts apply basic statistics or Six Sigma, with findings documented in static reports.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Digital models of key production units are linked to historical and live data, allowing R&D and manufacturing to collaborate on scale-up and design decisions. Digital workflows and shared platforms manage structured data transfer and store searchable historical data. AI/ML models support optimization, with real-time dashboards tracking performance.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Fully integrated digital twins span lab to production scale, using real-time sensor data for predictive control and lifecycle management. Seamless, interoperable systems enable automated data transfer and simulate scale-up outcomes. Optimization is adaptive, co-developed by R&D and operations, and driven by AI to support sustainable, high-performance manufacturing.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  },
  {
    templateId: Tier2TemplateId,
    sectionId: 'value_scaling',
    order: 19,
    kind: 'SINGLE_CHOICE' as const,
    prompt: 'How digitally integrated is your R&D organization with external partners and ecosystems?',
    helpText: 'External partnerships and digital ecosystem collaboration',
    required: true,
    metadata: {
      pillar: 'VALUE_SCALING',
      dimension: 'External Partnerships, Digital Ecosystem',
      tier: 'TIER2'
    },
    options: [
      {
        label: 'External partners like universities or vendors are engaged on a case-by-case basis through email or file exchange. Collaboration is limited to specific projects, with little digital infrastructure or strategic participation in consortia. Data sharing is manual, slow, and lacks structure, with IP handled offline and no support for broader joint initiatives.',
        value: 'BASIC',
        score: 25
      },
      {
        label: 'The organization participates in some funded collaborations or consortia, but integration is still manual and offline. File-sharing portals or cloud storage are used with a few select partners, and IP terms are defined in contracts but not automated. Versioning and tagging are managed manually.',
        value: 'EMERGING',
        score: 50
      },
      {
        label: 'Strategic partnerships are digitally enabled via APIs, shared dashboards, and collaboration platforms. Joint projects use structured repositories, calendars, and shared workspaces with defined roles and access policies. Data sharing and IP workflows are partially automated with audit trails and compliance support.',
        value: 'ESTABLISHED',
        score: 75
      },
      {
        label: 'Partner integration is seamless, API-driven, and spans academia, industry, and government. Real-time collaboration occurs across federated data platforms with fine-grained access control and smart contracts. Data sharing is dynamic and scalable, supported by cloud workspaces, standardized schemas, and blockchain-enabled IP tracking and compliance tools.',
        value: 'WORLD_CLASS',
        score: 100
      }
    ]
  }
];

// Assessment templates for TIER1 and TIER2
export const DEFAULT_ASSESSMENT_TEMPLATES = [
  {
    id: Tier1TemplateId, // Keep existing ID for compatibility
    name: 'Digital Readiness Assessment - Tier 1 (High Level)',
    slug: 'digital-readiness-tier1',
    version: '1.0.0',
    tier: 'TIER1',
    sections: [
      {
        id: 'digitalization',
        title: 'Digitalization',
        description: 'Data, systems, and digital infrastructure foundations'
      },
      {
        id: 'transformation',
        title: 'Transformation',
        description: 'Process automation, workflow optimization, and cultural change'
      },
      {
        id: 'value_scaling',
        title: 'Value Scaling',
        description: 'Analytics, AI, and business value creation capabilities'
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
    }
  },
  {
    id: Tier2TemplateId,
    name: 'Digital Readiness Assessment - Tier 2 (Detailed)',
    slug: 'digital-readiness-tier2',
    version: '1.0.0',
    tier: 'TIER2',
    sections: [
      {
        id: 'digitalization',
        title: 'Advanced Digitalization',
        description: 'Data foundation, FAIR data, governance, cybersecurity, identification systems, workflows, smart lab, analytics, and AI/ML'
      },
      {
        id: 'transformation',
        title: 'Digital Transformation',
        description: 'Executive sponsorship, digital literacy, collaborative mindset, knowledge management, and change management'
      },
      {
        id: 'value_scaling',
        title: 'Advanced Value Scaling',
        description: 'Market insights integration, supplier integration, customer-centric digitalization, manufacturing enablement, and external partnerships'
      }
    ],
    scoringConfig: {
      weights: {
        digitalization: 0.50,
        transformation: 0.25,
        value_scaling: 0.25
      },
      maturityToScore: {
        BASIC: 25,
        EMERGING: 50,
        ESTABLISHED: 75,
        WORLD_CLASS: 100
      }
    }
  }
];