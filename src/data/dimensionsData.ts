export interface SubDimension {
  name: string;
  whyItMatters: string;
  basic: string;
  emerging: string;
  established: string;
  worldClass: string;
}

export interface Dimension {
  name: string;
  subdimensions: SubDimension[];
}

export interface Pillar {
  name: string;
  displayName: string;
  color: string;
  dimensions: Dimension[];
}

export const dimensionsData: Pillar[] = [
  {
    name: 'DIGITALIZATION',
    displayName: 'Digitalization',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    dimensions: [
      {
        name: 'Data Foundation',
        subdimensions: [
          {
            name: 'Architecture',
            whyItMatters: 'A modular and scalable architecture organizes data, workflows and advanced analytics. It also ensures data can be easily accessed, analyzed, and shared across platforms and teams.',
            basic: 'Data is scattered across local drives, spreadsheets, and siloed tools. No defined structure for how data is modeled or nested across sites/labs. Redundancies, inconsistencies, and data silos are common.',
            emerging: 'Some efforts to standardize data formats and naming conventions. Basic schemas or data models are developed for key R&D data types (e.g., samples, results). Metadata is applied inconsistently.',
            established: 'A unified data architecture governs how data is organized, linked, and stored across systems. Controlled vocabularies, ontologies, and master data standards are adopted. Metadata is applied consistently.',
            worldClass: 'Strategic infrastructure is fully enterprise-wide, scalable, and supports all structured and unstructured data. Semantic modeling, graph-based representations, and ontology alignment enable rich contextualization and reuse.'
          },
          {
            name: 'Systems Integration and Interoperability',
            whyItMatters: 'Connecting disparate data sources from experiment and simulation enables comprehensive insights across the product development lifecycle. Integration reduces rework and ensures that decisions are based on complete, high-quality data.',
            basic: 'Systems (e.g., ELN, LIMS, instruments, PLM) operate in isolation. Data transfer is manual or reliant on spreadsheets and email. No integration standards or governance. No unified data model.',
            emerging: 'Point-to-point integrations are established for select systems via custom scripts (e.g., LIMS to ERP). Some use of APIs or middleware to automate data movement. Integration is project or site specific and not scalable.',
            established: 'A well-defined integration framework links core R&D systems, instruments, and business platforms. APIs and middleware enable consistent data flow. Data consistency and validation rules are enforced.',
            worldClass: 'Plug-and-play interoperability enables seamless data exchange across the ecosystem (e.g., LLMs, modeling tools, sub instruments, and ELN suites can be connected via standards APIs or connector). Integration enables predictive, closed-loop decision-making (e.g., formulation optimization, analytics/ method tuning, safety monitoring, material screening). Orchestrated pipelines connect internal labs and external partners.'
          },
          {
            name: 'Scalable Infrastructure',
            whyItMatters: 'Cloud-based platforms support large datasets from high-throughput screening and help simulate physical, chemical, biological experimentation. Scalable infrastructure also enables organizations to incorporate AI/ML capacities without needing expensive systems infrastructure.',
            basic: 'No centralized servers or standardized protocols. Infrastructure is on-prem, fragmented, and difficult to expand. Limited ability to handle large volumes or high-velocity data. No redundancy, backups, or support for large files (e.g., microscopy images, simulations).',
            emerging: 'Hybrid models (cloud/on-prem) begin to support expanding data needs; some centralized servers and some private cloud pilots. Manual provisioning and limited elasticity. Some capacity planning is in place.',
            established: 'Cloud-first or hybrid infrastructure supports elastic scaling of storage and compute resources. Data pipelines, backup systems, and monitoring are standardized and automated. Cost, performance, and availability are optimized.',
            worldClass: 'Fully cloud-native, modular, self-optimizing, and globally-distributed infrastructure enables on-demand data storage, advanced ML/AI acceleration, and secure throughput experiments. Infrastructure meets high-throughput experiments and global collaboration. AI/ML Ops, and API-driven containerization and automation drive agility. Infrastructure evolves dynamically with business and scientific demand.'
          }
        ]
      },
      {
        name: 'FAIR Data',
        subdimensions: [
          {
            name: 'Data Model and Semantics',
            whyItMatters: 'A shared data model enables cross-team collaboration, reduces silos, and makes it easier to build integrations and analytics. Semantic standards and vocabularies ensure consistency and help reuse data across different systems.',
            basic: 'There\'s no shared data model in R&D; formats and labels vary by team, making integration difficult. Data is stored in siloed systems with no consistent structure. No use of standard vocabularies or ontologies. Interoperability is near impossible.',
            emerging: 'Some teams start using naming conventions and simple data models for specific data types (e.g., samples, experiments). Domain vocabularies or ontologies are referenced but not consistently applied. Limited integration and reuse across systems.',
            established: 'A shared data model exists for critical R&D entities (e.g., samples, materials, experiments) and supports interoperability across systems. Standard vocabularies and ontologies (e.g., ORD, IUPAC, UniProt) are adopted and enforced. Data is structured, tagged, and ready for advanced analytics.',
            worldClass: 'An ontology-driven, enterprise-wide data model connects all R&D systems and evolves with industry standards and regulations. Semantic reasoning, graph databases, and federated queries enable rich data exploration. AI models leverage this structure for automated knowledge extraction.'
          },
          {
            name: 'Metadata and Context',
            whyItMatters: 'Metadata (e.g., who, when, where, why) provides essential context for understanding and reusing data. It enables discovery, reproducibility, and compliance. Automated metadata capture reduces manual errors and enriches datasets over time.',
            basic: 'Metadata is minimal or missing entirely. No standard vocabularies are used, so data reuse is rare or impossible. Experimental, operational, and business context (e.g., project, collaborators, purpose) is usually lost, and users can\'t tell how or why data was generated.',
            emerging: 'Some metadata is captured manually (e.g., sample ID, date, operator) but is inconsistent and incomplete. Domain vocabularies and tags are starting to emerge but are applied inconsistently. Context (e.g., project or equipment) is captured for some data but not queryable.',
            established: 'Metadata is consistently captured using controlled vocabularies, ontologies, and tagging standards. Automation extracts metadata from instruments, ELNs, and workflows. Data is linked to its full lifecycle context (e.g., batch, protocol, scientist, facility) and can be explored via dashboards.',
            worldClass: 'Metadata is auto-generated at creation and enriched throughout the data lifecycle. Semantic metadata supports AI reasoning, knowledge graphs, and federated search. Context (e.g., hypotheses, decisions, outcomes) is captured in real-time and used to improve analytics, models, and compliance audits.'
          },
          {
            name: 'Data Discovery and Searchability',
            whyItMatters: 'Data discovery tools allow scientists and analysts to find relevant datasets quickly, reducing duplication and accelerating innovation. Search and indexing capabilities make historical data actionable and support regulatory compliance.',
            basic: 'Data discovery is manual and slow, relying on folder browsing or asking colleagues. There\'s no centralized catalog or repository. People may not even know what data exists beyond their immediate team.',
            emerging: 'Some basic portals or spreadsheet-based indexes exist to catalog limited datasets. Users can search by filename, date, or simple tags, but search capabilities are rudimentary and disconnected from workflows.',
            established: 'Internal data catalogs (or data lakes) enable team-wide discovery using metadata, tags, and full-text search. Dashboards and portals index data across multiple sources (e.g., ELN, LIMS, file shares). Data lineage and provenance are tracked.',
            worldClass: 'Enterprise-grade data catalogs index and rank data across the organization and external partners. Semantic search, natural language queries, and AI-driven recommendations surface relevant datasets. Lineage views and federated discovery enable cross-system, cross-geography data access.'
          }
        ]
      },
      {
        name: 'Governance and Stewardship',
        subdimensions: [
          {
            name: 'Ownership and Accountability',
            whyItMatters: 'Clear ownership prevents data and model decay, ensures continuity during personnel changes, and establishes accountability for data quality and digital asset performance.',
            basic: 'There\'s no clear ownership of digital assets—teams rely on informal roles or "tribal knowledge," and that knowledge is often lost when people leave the organization. No governance framework exists.',
            emerging: 'Some systems or datasets have informal owners or stewards, but accountability is inconsistent and not well documented. Roles may be defined for certain high-value assets but lack enforcement or visibility.',
            established: 'Ownership roles (e.g., data stewards, model owners) are formally defined and documented for different asset types (data, models, tools). Governance is embedded in workflows, with clear responsibilities and handoffs.',
            worldClass: 'Ownership is fully institutionalized across all digital assets (data, algorithms, dashboards, APIs), supported by metadata, automation, and governance frameworks. Real-time dashboards show asset ownership, usage, and health.'
          },
          {
            name: 'Data Quality Monitoring',
            whyItMatters: 'Proactive tracking of anomalies, outliers, or gaps in experimental data ensures integrity for advanced analytics and regulatory use. Poor-quality data produces bad insights, wasted R&D effort, and compliance risks.',
            basic: 'Data quality isn\'t monitored consistently. Issues (e.g., missing values, duplicates, outliers) are typically found manually or only after they cause problems. Analytical tools and models are used without validation or version control.',
            emerging: 'Some basic quality checks or logs are in place for select data types (e.g., sample IDs, instrument readings). Dashboards or periodic audits flag quality issues, but remediation is still manual and reactive.',
            established: 'Automated validation checks are embedded in data workflows (e.g., ELN, LIMS). Rules check for completeness, format, range, and consistency. Quality metrics and exceptions are monitored via dashboards, with alerts triggering remediation workflows.',
            worldClass: 'AI-driven systems continuously monitor data quality, tool usage, and model performance in real-time. Anomalies and drift are detected automatically using statistical and ML techniques. Quality scores and recommendations feed into governance dashboards and trigger alerts.'
          },
          {
            name: 'Policies and Enforcement',
            whyItMatters: 'Clear policies and enforcement (e.g., access rights, retention, lineage) ensure regulatory standards ensure descriptive policies around data access and lifecycle management (e.g., FAIR, ALCOA+, 21 CFR Part 11) and protect intellectual property. Standards reduce risks of data misuse, non-compliance, or loss.',
            basic: 'There are few or no formal policies around data access, retention, usage rights, or lifecycle management. Practices are inconsistent across teams, leading to security gaps, compliance risks, and lack of traceability.',
            emerging: 'Access policies, naming conventions, and some retention practices exist for a few high-priority systems, but enforcement is mostly manual and varies by team or site. Version control and audit trails may be incomplete.',
            established: 'Comprehensive governance policies (e.g., access rights, data classification, retention schedules) are defined, documented, and consistently applied. Enforcement is built into tools (e.g., role-based access in ELN, automated archiving). Violations trigger remediation workflows.',
            worldClass: 'Governance policies are dynamic, data-driven, and continuously evolved based on usage analytics, regulatory changes, and risk assessments. Enforcement is proactive, automated, and integrated across all systems (ELN, LIMS, cloud storage). AI monitors compliance in real time.'
          },
          {
            name: 'Lifecycle Management',
            whyItMatters: 'Managing data through creation, use, archival, and deletion ensures storage costs stay manageable, compliance requirements are met, and outdated logic doesn\'t propagate errors.',
            basic: 'Data, models, and digital assets pile up over time with no formal versioning, archival, or retention process. Old or deprecated data is kept indefinitely or discarded without clear rules. Outdated models or analytical logic may be unknowingly reused.',
            emerging: 'Some manual processes exist to archive or delete old data (e.g., moving files to archives or backups), but there\'s no consistent end-of-life workflow. Versioning may be tracked in specific tools (e.g., Git for code) but not universally applied.',
            established: 'Formal lifecycle rules define how data is created, stored, archived, versioned, and eventually retired or deleted. Some automation exists (e.g., scheduled archival scripts, retention policies in LIMS). Governance reviews ensure compliance.',
            worldClass: 'Every digital asset is tracked through its full lifecycle using metadata and intelligent automation. Predictive systems recommend when to archive, deprecate, or migrate data. AI flags dependencies and ensures continuity. Compliance and audits are seamless and automated.'
          }
        ]
      },
      {
        name: 'Cybersecurity',
        subdimensions: [
          {
            name: 'Incident Response Readiness',
            whyItMatters: 'Fast and coordinated responses to cyber incidents minimize R&D downtime, protect intellectual property, and reduce exposure to compliance penalties and reputation risk. Regular simulations ensure teams can handle real incidents swiftly.',
            basic: 'Security incidents are handled reactively with no defined incident response plan or clear responsibilities. Breaches or anomalies are often detected late or not thoroughly investigated. There\'s limited forensic capability.',
            emerging: 'Teams have a basic incident response process in place for major systems, but roles, workflows, and communication protocols are not fully defined. Limited simulation or tabletop exercises occur.',
            established: 'A full incident response plan exists, with clearly defined roles, escalation paths, and communication protocols. Alerts are configured for high-risk events. Periodic simulations (e.g., tabletop exercises) test readiness and improve response time.',
            worldClass: 'Incident response is fast, coordinated, and AI-assisted. Automated playbooks trigger workflows and investigations. Post-incident reviews feed lessons learned back into security architecture. Continuous monitoring and threat intelligence enable proactive response.'
          },
          {
            name: 'Data Encryption and Audit Trails',
            whyItMatters: 'Encrypting data and tracking access ensures integrity, security, audit readiness, and post-incident accountability. Tamper-proof logs also support regulatory compliance (e.g., 21 CFR Part 11, GDPR).',
            basic: 'Sensitive data (e.g., formulations, clinical data, IP) may not be encrypted at rest or in transit. Audit trails (logs of who accessed or changed what) are missing or incomplete, making forensic investigations and compliance audits difficult.',
            emerging: 'Some encryption is used for particularly sensitive systems or datasets (e.g., databases, file shares). Limited logs or version control exist, but monitoring and review are not routine. Audit capabilities are reactive.',
            established: 'Sensitive data is encrypted by default (both in transit and at rest). Comprehensive audit trails track data access, modifications, and transfers. Logs are retained and periodically reviewed for compliance and anomaly detection.',
            worldClass: 'Encryption and audit trails are enforced enterprise-wide in real time, embedded into all tools and platforms. Logs are immutable and feed directly into analytics, compliance dashboards, and threat intelligence. AI detects suspicious patterns proactively.'
          },
          {
            name: 'Access Control',
            whyItMatters: 'Proper access rights ensure that only authorized individuals can view, edit, or delete sensitive R&D data, reducing insider threats, accidental data loss, and non-compliance risks.',
            basic: 'Access to data, tools, and systems is manual and inconsistent. Teams may share logins or use broad permissions (e.g., "everyone can edit"). There\'s no formal user or role management, and access reviews are rare or nonexistent.',
            emerging: 'Role-based access control (RBAC) exists for some key systems (e.g., ELN, file servers), but policies are inconsistently applied and access reviews are manual. Some use of directory services (e.g., Active Directory) for authentication.',
            established: 'Access rights are centrally managed and tied to roles or organizational groups (e.g., R&D scientist, lab manager). Directory integration (e.g., LDAP, SSO) simplifies provisioning and de-provisioning. Regular audits ensure access aligns with job roles.',
            worldClass: 'Access control is dynamic, context-aware, and automated—adapting based on user, device, location, and data sensitivity. Zero-trust principles and continuous authentication ensure security. AI flags unusual access patterns in real time.'
          }
        ]
      },
      {
        name: 'Physical-to-Digital Identification Systems',
        subdimensions: [
          {
            name: 'Sample and Lot Tracking',
            whyItMatters: 'Accurate sample and lot tracking ensures data integrity, traceability, and regulatory compliance. It also prevents duplication, sample loss, and formulation errors during R&D and scale-up.',
            basic: 'Samples and material lots are tracked manually using spreadsheets or handwritten labels. IDs may be reused, inconsistent, or lost, leading to traceability gaps and potential compliance violations.',
            emerging: 'Some labs use barcode labels or unique sample IDs, but data capture is fragmented and not consistently linked to experiments or results. Material lot numbers may be logged but not searchable or tied to digital systems.',
            established: 'All samples and material lots have standardized, unique IDs that are connected to ELN, LIMS, and inventory systems. Barcodes or RFID tags enable automated tracking. Chain of custody is documented and auditable.',
            worldClass: 'End-to-end traceability of high-value assets, samples, and lots is achieved using automated tagging (e.g., RFID, QR codes) and real-time location systems. Digital sample twins carry metadata, chain of custody, and lifecycle information. AI helps predict issues like expiration or contamination risk.'
          },
          {
            name: 'Equipment Identification Systems',
            whyItMatters: 'Associating instruments and tools with digital IDs enables usage tracking, calibration scheduling, automated data lineage, and better resource planning—improving R&D reliability and regulatory readiness.',
            basic: 'Equipment is tracked on paper or spreadsheets with no unique identifiers or links to experiments/workflows. Calibration and maintenance data is poorly recorded or missing. Instrument usage is not digitally captured.',
            emerging: 'Major equipment may have asset tags or barcodes, and some tools are connected to inventory or maintenance systems (e.g., CMMS). However, usage data (e.g., which samples or experiments) remains unstructured or siloed.',
            established: 'All equipment is uniquely tagged and digitally linked to maintenance schedules, calibration records, and experimental workflows. Usage and performance data are captured automatically and tied to ELN/LIMS entries.',
            worldClass: 'Equipment is fully mapped and tracked in real time via IoT sensors and digital twins. Data on usage, health, and location feeds into analytics for predictive maintenance, scheduling optimization, and quality control. Instruments auto-report issues or recommend recalibration.'
          },
          {
            name: 'Real-Time Tracking',
            whyItMatters: 'Knowing the exact location and status of high-value samples, reagents, or experimental materials (e.g., biologics, clinical materials) reduces waste, prevents loss, and improves operational efficiency.',
            basic: 'No real-time tracking capabilities exist. Location and movement of materials or samples are logged manually, if at all, increasing the risk of loss, misidentification, or duplication.',
            emerging: 'RFID tags or mobile scanners may be piloted for high-value or critical samples. However, real-time tracking is limited to specific labs or projects and is not integrated with broader inventory systems.',
            established: 'Real-time tracking systems are in place for priority materials and samples in key labs or facilities. Movement, storage conditions, and alerts (e.g., temperature excursions) are visible to teams via dashboards or mobile apps.',
            worldClass: 'Continuous, enterprise-wide tracking of all materials and samples is enabled by IoT sensors, RFID/NFC, and digital twins. Location and condition data feed real-time analytics for asset flow optimization, loss prevention, and intelligent reallocation.'
          }
        ]
      },
      {
        name: 'Digital Workflows',
        subdimensions: [
          {
            name: 'Workflow Automation',
            whyItMatters: 'Automating repetitive or time-intensive tasks (e.g., data entry, report generation, scheduling) frees up scientists to focus on innovation and reduces human error. Automated workflows improve consistency, traceability, and speed.',
            basic: 'Workflows are entirely manual and rely on individual memory, habits, or paper checklists. There\'s no standardization or automation—leading to inefficiencies, rework, and lost tribal knowledge.',
            emerging: 'Some common workflows are documented (e.g., SOPs, protocols), and simple automation (e.g., Excel macros, scheduled scripts) is being piloted. However, automation is isolated and not broadly adopted.',
            established: 'Standard operating procedures (SOPs) are digitized and executed through lab execution systems (e.g., ELN workflows, LIMS protocols). Scripts, bots, or robotic process automation (RPA) reduce manual data entry and repetitive work.',
            worldClass: 'Workflows are fully adaptive and automated. Intelligent agents coordinate experiments, schedules, equipment, and analytics. Automation spans planning, execution, analysis, and reporting—enabling closed-loop, autonomous R&D processes.'
          },
          {
            name: 'Data Integration',
            whyItMatters: 'Seamless data flow across lab instruments, notebooks, and enterprise systems ensures scientists have access to complete, high-quality data when they need it—accelerating analysis and decision-making.',
            basic: 'Data is siloed across tools (e.g., instruments, ELNs, spreadsheets) and shared by copying and pasting or emailing files. Metadata is often missing or inconsistent, making it hard to trace or reuse data.',
            emerging: 'Some ELNs or instruments are connected, but integration is manual, one-off, or reactive. Data may be uploaded in batches, and metadata is incomplete. Standardization is limited.',
            established: 'Data flows automatically from instruments, equipment, and systems into centralized repositories (e.g., LIMS, data lake) via APIs or middleware. Metadata is harmonized, enabling seamless analysis and modeling.',
            worldClass: 'Data moves seamlessly and in real time across lab systems, enterprise platforms, and external partners. Automated data lineage, versioning, and validation ensure trustworthiness. Integration enables AI, digital twins, and real-time decision automation.'
          },
          {
            name: 'Electronic Lab Notebooks (ELNs)',
            whyItMatters: 'ELNs improve data integrity, searchability, and collaboration. They enable regulatory compliance (e.g., 21 CFR Part 11) and ensure experimental context is captured, making data findable and reusable.',
            basic: 'Experiments are recorded in paper notebooks or generic digital formats (e.g., Word, Excel). There\'s no standardization, and finding or sharing past experiments is difficult. Data integrity and audit trails are weak.',
            emerging: 'Some labs or teams use Electronic Lab Notebooks (ELNs), but adoption is inconsistent. Basic templates or forms are just being introduced. ELNs are largely used as digital paper, with limited integration to other systems.',
            established: 'ELNs are widely used across R&D with standardized templates and links to samples, materials, and instruments. Protocols are reusable, and data is searchable and auditable. ELNs integrate with LIMS, inventory, and data repositories.',
            worldClass: 'ELNs are fully integrated with inventory, LIMS, instruments, and data systems. AI-driven features (e.g., auto-tagging, smart search, real-time recommendations) enhance usability. ELNs support collaboration, versioning, and audit-ready workflows.'
          }
        ]
      },
      {
        name: 'Smart Lab',
        subdimensions: [
          {
            name: 'Monitoring and Control',
            whyItMatters: 'Real-time dashboards and alert systems help personnel monitor critical parameters, intervene when needed, on ensure continuous monitoring critical parameters (e.g., temperature, humidity, overnight, and experimental reliability. Predictive alerts reduce downtime and improve safety.',
            basic: 'Monitoring is manual—scientists check instruments or lab conditions periodically. Issues (e.g., equipment failure, out-of-spec conditions) are noticed only after the fact, often leading to lost samples or experiments.',
            emerging: 'Some key instruments or lab facilities have basic sensors and alerts (e.g., temperature monitors, equipment status LEDs). Logging happens separately, and equipment usage or anomalies are recorded in spreadsheets.',
            established: 'Centralized monitoring platforms track instrument health, usage, and environmental conditions in real time. Alerts notify teams of anomalies or maintenance needs. Data feeds into dashboards, enabling preventative maintenance.',
            worldClass: 'AI-powered systems monitor all lab conditions and equipment in real time. Predictive analytics identify potential failures before they happen. Automated adjustments (e.g., temperature control, workflow re-routing) optimize experiments and reduce downtime.'
          },
          {
            name: 'Automated Data Capture',
            whyItMatters: 'Capturing data directly from instruments and systems reduces manual errors, improves data quality and traceability, and accelerates analysis. Automated capture also supports regulatory compliance and FAIR data principles.',
            basic: 'Data is collected manually from instruments via USB drives, printouts, or screenshots. Manual entry into spreadsheets or notebooks is error-prone and time-consuming, and metadata is often lost.',
            emerging: 'Some instruments are networked or connected to ELNs/LIMS for basic data uploads. Data capture is partially automated for specific instrument types or file formats, but metadata is still added manually.',
            established: 'Data is automatically captured and stored in structured formats (e.g., JSON, HDF5, databases) with associated metadata. Instruments are linked via APIs, lab middleware, or IoT systems to centralized repositories.',
            worldClass: 'Data capture is fully automated, real-time, and context-aware. Instruments and sensors feed live data into dashboards, data lakes, and AI models. Metadata is auto-generated and enriched, enabling closed-loop experiments and advanced analytics.'
          },
          {
            name: 'Robotics',
            whyItMatters: 'Lab robotics accelerate high-throughput experimentation, reduce variability, and free scientists to focus on hypothesis generation and interpretation rather than repetitive manual tasks.',
            basic: 'Labs don\'t use robotics—all sample handling, pipetting, and preparation is done manually by operators. Throughput is limited, and results vary by individual.',
            emerging: 'A few standalone robots or automated systems (e.g., liquid handlers, plate readers) are used for repetitive tasks like pipetting. Programming and setup require expert knowledge, and robots are not integrated with lab systems.',
            established: 'Robotics are integrated with lab systems (e.g., ELN, LIMS, scheduling tools) and can be programmed or reconfigured more easily. Automated workflows reduce manual effort and improve reproducibility in key experiments.',
            worldClass: 'Robotics are orchestrated by AI across multiple labs and sites. Autonomous or semi-autonomous operations enable high-throughput screening, formulation, and testing. Robots dynamically adjust tasks based on real-time data and priorities.'
          },
          {
            name: 'Scheduling',
            whyItMatters: 'Effective resource and experiment scheduling reduces bottlenecks, equipment conflicts, and idle time—improving lab productivity and accelerating R&D timelines.',
            basic: 'Scheduling is done manually using whiteboards, spreadsheets, or email threads. There\'s no central coordination, leading to frequent conflicts, double-booking, or inefficient resource use.',
            emerging: 'Digital scheduling tools (e.g., shared calendars, basic booking systems) are used, but they\'re disconnected from experiments, instruments, or lab execution platforms. Coordination still relies on manual communication.',
            established: 'Centralized scheduling systems are integrated with ELNs, LIMS, and robotics platforms. Lab managers can see equipment availability, personnel schedules, and experiment timelines in one place. Conflict detection and resource allocation are automated.',
            worldClass: 'Scheduling is optimized by AI across labs, sites, and time zones. Real-time data on equipment status, personnel, and priorities inform dynamic planning. Predictive models balance constraints (e.g., urgency, capacity, cost) to maximize throughput.'
          },
          {
            name: 'Instrument Connectivity',
            whyItMatters: 'Connecting lab instruments to digital systems enables automatic data capture, better traceability, and real-time monitoring—reducing errors and supporting compliance and advanced analytics.',
            basic: 'Most instruments are standalone, with data collected manually via USB drives or printouts. There\'s no centralized tracking of instrument usage, calibration, or performance.',
            emerging: 'Some instruments are networked or connected to ELNs/LIMS for basic data uploads. Connectivity is limited to specific makes/models, and integration requires manual setup or expert support.',
            established: 'Instruments are widely connected via LAN, Wi-Fi, or lab middleware. Data is automatically uploaded with metadata, and instrument usage logs, calibration records, and performance data are tracked centrally.',
            worldClass: 'Instruments are part of a smart lab architecture with plug-and-play connectivity. Open protocols and APIs (e.g., SiLA, OPC-UA) enable seamless integration. Real-time data feeds analytics, AI models, and closed-loop experiments.'
          }
        ]
      },
      {
        name: 'Centralized R&D Analytics and Dashboards',
        subdimensions: [
          {
            name: 'Self-Service Analytics',
            whyItMatters: 'Empowering scientists to access and analyze data independently reduces bottlenecks, accelerates insights, and democratizes data-driven decision-making across R&D teams.',
            basic: 'Most users cannot run queries or create visualizations—they rely on IT or data experts to generate static reports. Tools are complex, access is limited, and turnaround is slow.',
            emerging: 'A few users (e.g., data analysts or power users) can run basic queries or create visuals in BI tools (e.g., Power BI, Tableau). However, training and access remain limited, and most scientists still rely on others for insights.',
            established: 'Scientists and managers can use guided, self-service tools to explore data, filter dashboards, and generate reports without relying on experts. Templates, training, and governance reduce dependency on centralized analytics teams.',
            worldClass: 'Self-service analytics is intuitive, widespread, and embedded into workflows. Natural language queries, no-code tools, or AI copilots allow users at all levels to generate insights. Collaboration features let teams build and improve dashboards together.'
          },
          {
            name: 'Predictive and Prescriptive Analytics',
            whyItMatters: 'Moving beyond descriptive reporting to predictive and prescriptive insights accelerates innovation, reduces costs, and supports strategic R&D decisions (e.g., prioritization, resource allocation).',
            basic: 'Predictive or prescriptive models are not in use. Analysis is mostly backward-looking (e.g., "What happened?"). Hypotheses are generated manually without data-driven or structured methods.',
            emerging: 'Early predictive models (e.g., simple regressions, time-series forecasts) are being piloted or used in specific domains (e.g., equipment maintenance). Results are typically shared in slide decks or offline reports, and their impact on decisions is minimal.',
            established: 'Predictive models are integrated into dashboards and decision-support tools, enabling "what if" scenario planning, prioritization, and forecasting. Teams trust and use these models as part of routine decision-making.',
            worldClass: 'Prescriptive analytics drives decisions by recommending actions (e.g., optimal formulations, experiment designs, resource allocations). Models are continuously updated and improved through automated ML pipelines. Insights trigger actions in real time via workflow integrations.'
          },
          {
            name: 'Data Access and Discoverability',
            whyItMatters: 'Centralizing and indexing R&D data improves findability, reduces duplication, and accelerates analysis. Discoverable data supports collaboration, reproducibility, and knowledge reuse.',
            basic: 'Data is scattered across emails, spreadsheets, personal folders, and disconnected systems. There\'s no central repository or catalog, so finding relevant data is time-consuming and often unsuccessful.',
            emerging: 'Some teams have started building shared drives, data repositories, or rudimentary data lakes. However, data remains siloed, poorly indexed, and difficult to discover without insider knowledge.',
            established: 'Data from multiple R&D systems (e.g., ELN, LIMS, instruments) is pulled into centralized repositories like data lakes, warehouses, or cloud storage. Metadata and search tools help users find and access relevant datasets.',
            worldClass: 'Live data pipelines continuously feed data from all sources into unified repositories. AI-powered search and discovery tools suggest relevant datasets based on context, projects, or past usage. Federated queries enable cross-system, cross-geography data access.'
          },
          {
            name: 'Visualization and Dashboards',
            whyItMatters: 'Well-designed dashboards and visual tools make complex data accessible and actionable, enabling faster decisions, better communication, and alignment across R&D teams.',
            basic: 'Visualizations are static, manually created in Excel or PowerPoint, and rarely updated. There\'s no shared analytics environment, and dashboards (if they exist) are not easily discoverable.',
            emerging: 'Some teams have started building dashboards in BI tools (e.g., Power BI, Tableau), but they\'re often disconnected from live data sources. Visuals are developed independently with limited standards or reuse.',
            established: 'Dashboards are widely used and track key R&D KPIs, project status, resource utilization, and experimental metrics. Visuals follow consistent standards and are updated automatically from centralized data sources.',
            worldClass: 'Live, fully interactive dashboards are personalized by role and embedded directly into R&D workflows (e.g., ELN, planning tools). Analytics are proactive, leveraging AI to deliver alerts, insights, and recommendations in real time.'
          }
        ]
      },
      {
        name: 'AI/ML',
        subdimensions: [
          {
            name: 'Failure Analysis and Root Cause Discovery',
            whyItMatters: 'Using ML to identify patterns in failures accelerates troubleshooting, prevents recurring issues, and improves product quality and reliability.',
            basic: 'Failures are logged (if at all) but not analyzed systematically. Root cause analysis is manual, reactive, and speculative. There\'s no central database or structured approach to learning from past failures.',
            emerging: 'Teams analyze failure logs using scripts, dashboards, or statistical methods. Basic alerts or reports highlight frequent issues, but root cause identification is still largely manual and depends on expert intuition.',
            established: 'ML algorithms and statistical tools are used to identify patterns in failure modes, correlate them with process or material variables, and suggest root causes. Failure databases feed predictive models that reduce resolution time.',
            worldClass: 'AI systems continuously monitor experiments, production, and field performance to predict and prevent failures. ML models simulate outcomes, prioritize corrective actions, and recommend design changes proactively.'
          },
          {
            name: 'Lab Resource Optimization',
            whyItMatters: 'AI can recommend how to best allocate instruments, SoR, alignment of equipment, and materials based on usage needs. Optimizing lab operations reduces bottlenecks, idle time, and costs while accelerating project timelines.',
            basic: 'Lab scheduling and resource planning are done manually, often leading to conflicts, idle equipment, or delays. There\'s no visibility into future demand or capacity constraints.',
            emerging: 'Digital scheduling tools and usage logs provide some visibility into equipment availability and utilization. However, planning is still reactive and doesn\'t account for cross-project dependencies or priorities.',
            established: 'ML models help align lab availability with project needs, flagging bottlenecks and optimizing schedules. Predictive analytics forecast demand for equipment, materials, and personnel, enabling data-driven capacity planning.',
            worldClass: 'Labs are dynamically scheduled and optimized in real time using AI. Equipment, personnel, and experiment priorities are balanced across sites. Predictive models simulate capacity scenarios and recommend reallocation or investment decisions.'
          },
          {
            name: 'Lifecycle Impact Assessment',
            whyItMatters: 'Evaluating carbon, toxicity, and circularity early helps R&D teams design more sustainable products, avoid costly late-stage redesigns, and meet regulatory or customer sustainability requirements.',
            basic: 'Sustainability is rarely considered during R&D. Lifecycle or environmental impact is addressed late in the process, primarily for compliance or reporting purposes.',
            emerging: 'Lifecycle assessment (LCA) tools are used occasionally during review gates to estimate environmental footprint. However, these tools are separate from R&D workflows and rely on high-level assumptions or generic databases.',
            established: 'Sustainability metrics (e.g., carbon footprint, water use, hazard scores) are built into formulation and process design tools. Teams can visualize tradeoffs (e.g., performance vs. environmental impact) during early R&D stages.',
            worldClass: 'AI-powered design tools incorporate carbon, toxicity, circularity, and regulatory predictions from the start. Real-time scoring guides material selection and formulation decisions, enabling truly sustainable-by-design R&D.'
          },
          {
            name: 'Material Discovery',
            whyItMatters: 'AI can suggest novel materials or identify better-performing alternatives by learning from structure-property relationships, reducing time to discovery and enabling innovation at scale.',
            basic: 'Property prediction is mostly done using simple calculations, rules of thumb, or manual lookup tables. Material selection relies on experience, trial-and-error, or small screening libraries.',
            emerging: 'Computational models (e.g., QSAR, molecular dynamics) are used to predict certain properties or screen libraries. Some ML models are being developed, though they may be narrow in scope or require significant tuning.',
            established: 'Validated ML models predict material properties (e.g., solubility, toxicity, performance) for use in screening, simulation, and formulation optimization. Models close the loop with experimental data, improving over time.',
            worldClass: 'Generative AI and advanced ML models propose novel materials, structures, or formulations and validate them in silico or via automated experiments. Real-time feedback loops between prediction and lab results accelerate discovery.'
          },
          {
            name: 'Manual Discovery',
            whyItMatters: 'AI can accelerate literature review, identify prior art, connect dispersed knowledge, and surface hidden insights—freeing scientists to focus on hypothesis generation and strategy.',
            basic: 'Researchers manually read papers, patents, and internal reports to find insights. Searching is slow and incomplete, and it\'s hard to reuse or discover prior internal knowledge that isn\'t well documented.',
            emerging: 'Some tools (e.g., keyword search, citation databases) help with literature review. NLP tools may extract key terms or topics from documents, and teams are piloting knowledge graphs or document clustering.',
            established: 'AI tools scan, index, and connect internal and external knowledge bases (e.g., patents, publications, ELN entries). Semantic search and tagging help scientists quickly find relevant prior art, collaborators, or experimental precedents.',
            worldClass: 'Generative AI and knowledge systems combine text, data, images, and experimental context to suggest hypotheses, predict outcomes, or recommend collaborators. Intelligent assistants auto-summarize literature and highlight connections across domains.'
          },
          {
            name: 'Experiment Design',
            whyItMatters: 'AI/ML-driven experiment design accelerates R&D cycles, improves efficiency, and uncovers non-obvious relationships between variables—leading to faster innovation and better products.',
            basic: 'Experiments are designed manually based on intuition, experience, or literature. Iterations are slow, and experiments are often repeated unnecessarily. There\'s limited use of statistical methods like DoE.',
            emerging: 'Some teams use statistical tools like Design of Experiments (DoE) to optimize experiments and reduce the number of tests. Machine learning models are being explored for specific use cases (e.g., predicting formulation performance).',
            established: 'ML models are routinely used to design experiments, suggest next steps, and refine hypotheses with each iteration. Multi-objective optimization tools balance performance, cost, time, and other constraints.',
            worldClass: 'Experiments are designed and run with minimal human input, guided by AI and closed-loop optimization. Reinforcement learning accelerates discovery by learning from each cycle and adapting strategies in real time to optimize speed, cost, and scientific novelty.'
          }
        ]
      }
    ]
  },
  {
    name: 'TRANSFORMATION',
    displayName: 'Transformation',
    color: 'bg-green-50 border-green-200 text-green-900',
    dimensions: [
      {
        name: 'Executive Sponsorship',
        subdimensions: [
          {
            name: 'Leadership Vision',
            whyItMatters: 'Clear articulation of digital goals drives the organization and inspires commitment to transformation. It fosters shared understanding, prioritizes initiatives, and guides portfolio decision-making.',
            basic: 'The organization is in the early stages of defining its digital direction. Teams may have varying interpretations of what digital transformation means, and communication around goals and priorities is still forming.',
            emerging: 'A digital vision is beginning to take shape and may be included in leadership communications, though broader alignment and engagement are still developing.',
            established: 'A clear and well-communicated digital vision is in place, with alignment to broader R&D and business objectives. Digital outcomes are increasingly tied to performance and cross-functional priorities.',
            worldClass: 'Digital transformation is fully embedded in corporate strategy and is widely embraced across teams. Leadership communicates a compelling vision that inspires action and long-term commitment.'
          },
          {
            name: 'Leadership Visibility',
            whyItMatters: 'Senior leaders actively participate digitally, prioritize commitments, and build better alignment. In-person participation signals priority and builds trust that change efforts will be supported.',
            basic: 'Digital responsibilities are often delegated to technical teams, and initiatives can struggle to gain momentum without consistent sponsorship or resources.',
            emerging: 'Leaders show interest in digital efforts, often through support for pilots or innovation projects. While investment may be more tactical than strategic, there is a growing foundation to build on.',
            established: 'Executives regularly participate in digital programs and serve as visible sponsors at key milestones. Investment in people, systems, and tools is sustained.',
            worldClass: 'Leadership is highly engaged and proactive—modeling digital behaviors, celebrating successes, and inspiring teams with a compelling vision. Transformation is positioned as a core driver of R&D innovation and value creation.'
          },
          {
            name: 'Resource and Investment',
            whyItMatters: 'Dedicated funding ensures continuity, guards digital talent, and enables teams to focus on implementation rather than fundraising for each initiative.',
            basic: 'Digital initiatives may lack dedicated funding or are addressed opportunistically without strategic planning.',
            emerging: 'Some budget and resources are allocated for digital projects, but funding is often project-based and short-term.',
            established: 'Sustained investment in digital systems, platforms, and talent is prioritized, with multi-year planning and governance.',
            worldClass: 'Digital efforts receive strategic, long-term funding aligned to business outcomes. Resources are flexibly allocated to high-impact areas with clear governance and KPIs.'
          }
        ]
      },
      {
        name: 'Digital Literacy and Upskilling',
        subdimensions: [
          {
            name: 'Digital Awareness and Innovation Mindset',
            whyItMatters: 'Encouraging curiosity about digital advancements (e.g., ALML, automation, cloud) and fostering innovation enables teams to identify valuable use cases and champions for exploration.',
            basic: 'Awareness of digital possibilities tends to be limited to immediate tools, and digital is often viewed as an IT responsibility. Innovation feels driven from the top down.',
            emerging: 'There is growing curiosity about how digital can enhance R&D, supported by a few internal champions. Teams are starting to explore emerging technologies in a limited way.',
            established: 'Innovation is increasingly seen as a shared responsibility, with teams exploring emerging technologies and participating in organized idea-generation activities. Digital roles and career paths are introduced.',
            worldClass: 'Innovation is employee-led as much as leadership-driven, with a strong culture of digital experimentation and empowerment. Teams actively experiment with advanced technologies and automation.'
          },
          {
            name: 'Training and Development Mechanisms',
            whyItMatters: 'Structured, ongoing training programs empower teams to effectively use digital tools, adapt to new systems, and contribute to continuous improvement.',
            basic: 'Upskilling is informal, with few structured learning opportunities and little visibility into digital competencies across roles.',
            emerging: 'Some structured training exists, especially for those in technical roles, but learning paths remain inconsistent and depend on individual initiative.',
            established: 'Organization-wide training programs and competency models help build digital fluency. Capabilities are beginning to be assessed formally and tied to career development.',
            worldClass: 'Continuous learning is part of the organizational fabric, with AI-curated, role-based development paths. Digital skills are embedded in career progression and performance management.'
          },
          {
            name: 'Tool Adoption and Use',
            whyItMatters: 'High and consistent adoption of digital tools ensures the intended benefits (e.g., data quality, efficiency, collaboration) are realized and scales across the organization.',
            basic: 'Digital tools like ELNs and LIMS are available but are inconsistently used, with many processes still relying on spreadsheets or paper-based methods.',
            emerging: 'Teams have begun using core digital platforms in select workflows, though adoption is uneven and often team- or site-specific.',
            established: 'Standardized digital tools are widely adopted and integrated into daily work, supporting consistent execution and improved data quality.',
            worldClass: 'Digital tools are seamlessly embedded across end-to-end R&D workflows. Teams actively experiment with advanced technologies and contribute to tool improvement.'
          }
        ]
      },
      {
        name: 'Collaborative Digital Mindset',
        subdimensions: [
          {
            name: 'Use of Collaborative Digital Tools',
            whyItMatters: 'Enabling digital spaces for collaboration (e.g., Teams, Slack, shared platforms) breaks down silos and accelerates R&D by improving coordination and knowledge sharing.',
            basic: 'Project tracking and coordination rely on static, disconnected tools like Excel or paper. There are no shared collaboration platforms, and knowledge rarely moves beyond individual groups.',
            emerging: 'Some cross-team digital efforts have begun, using shared drives, email, or tools like Teams or Slack. Digital collaboration tools are available but inconsistently adopted, leading to confusion and limited reuse.',
            established: 'Collaboration tools are embedded into daily work, with shared dashboards, integrated platforms, and clear communication standards across functions. Teams align on shared goals and timelines, and receive support to use digital tools effectively.',
            worldClass: 'Collaboration is fluid and embedded into how R&D operates, with interdisciplinary teams co-developing, testing, and improving solutions in real time. Tools are fully integrated—from planning to retrospectives—and connect with systems like ELNs and data platforms.'
          },
          {
            name: 'Cross-Functional Collaboration',
            whyItMatters: 'Breaking down silos between R&D, manufacturing, commercial, and other functions enables faster problem-solving, better alignment, and more effective execution.',
            basic: 'Cross-functional collaboration is minimal, with siloed teams and limited communication across labs or departments.',
            emerging: 'Some cross-team digital efforts have begun, but coordination is ad hoc and tools are not standardized.',
            established: 'Digital tools and workflows support structured collaboration across functions, with shared timelines, goals, and data visibility.',
            worldClass: 'Cross-functional teams work seamlessly using integrated digital platforms. Collaboration is proactive, continuous, and embedded into the R&D operating model.'
          },
          {
            name: 'Communities of Practice',
            whyItMatters: 'Formal or informal CoPs enable peer learning, best practice sharing, and faster adoption of digital tools and scientific methods across teams and geographies.',
            basic: 'Communities of Practice (CoPs) are absent, and the culture does not actively support knowledge sharing.',
            emerging: 'Informal communities are starting to form around shared interests, but participation is voluntary and not widely visible.',
            established: 'Recognized CoPs focus on digital and scientific topics, contributing to best practices and process improvement with leadership support.',
            worldClass: 'Strategic CoPs drive innovation, evolve continuously through feedback, and foster a learning culture across roles and geographies.'
          }
        ]
      },
      {
        name: 'Knowledge Management',
        subdimensions: [
          {
            name: 'Knowledge Capture and Documentation',
            whyItMatters: 'Structured handoff protocols and transfer ensure insights, know-how, and historical context are preserved and accessible, reducing rework and enabling faster onboarding.',
            basic: 'Knowledge is inconsistently documented, often stored in offline or disconnected files, leading to version control issues and frequent rework.',
            emerging: 'Basic systems like wikis or LIMS begin consolidating documents, though usage is inconsistent and metadata incomplete. Some teams pilot templates or folder structures.',
            established: 'Standardized documentation practices and shared repositories support consistent recording of data, results, and lessons learned. Knowledge is proactively captured and searchable across teams.',
            worldClass: 'Knowledge capture is embedded into digital workflows and enriched through AI-driven annotation, summarization, and linking. Metadata enables full traceability and contextualization.'
          },
          {
            name: 'Knowledge Transfer',
            whyItMatters: 'Structured handoff protocols and transfer processes ensure insights, lessons learned, and historical context move effectively across generations of teams, reducing dependency on individual memory.',
            basic: 'Transfer depends on informal conversations or trial-and-error, with no structured onboarding or retention practices.',
            emerging: 'Some teams appoint "knowledge champions" or hold handoff meetings. Sharing occurs in ad hoc formats like meetings or training sessions.',
            established: 'Formal onboarding, handoff, and mentoring programs improve transfer. Digital platforms enable asynchronous access to knowledge and support collaboration across time zones.',
            worldClass: 'Knowledge flows seamlessly across roles and generations via AI-personalized platforms and embedded transfer processes. LLMs and digital avatars create accessible institutional memory from reports, interviews, and experiments.'
          },
          {
            name: 'AI for Knowledge Discovery',
            whyItMatters: 'AI can mine literature, internal data, and past experiments to surface insights, predict outcomes, and connect disparate pieces of information—fueling new hypotheses and faster problem-solving.',
            basic: 'Discovery is manual and slow, with insights duplicated or lost due to the absence of AI tools.',
            emerging: 'Teams begin experimenting with AI tools such as keyword search or NLP pilots but lack formal support or scale.',
            established: 'AI tools are actively used to mine literature and internal data, surfacing insights that inform design and strategy. Semantic search and tagging accelerate knowledge discovery.',
            worldClass: 'Intelligent discovery systems suggest experiments, surface hidden insights, and enable fully contextual and traceable decision-making. AI continuously learns from new data and literature.'
          }
        ]
      },
      {
        name: 'Change Management',
        subdimensions: [
          {
            name: 'Change Saturation',
            whyItMatters: 'Tracking change load helps avoid overwhelming teams, enables better prioritization, and improves the success rate of individual initiatives.',
            basic: 'Multiple projects may be launched at once without coordination, leading to confusion and fatigue.',
            emerging: 'Leadership begins recognizing change fatigue and starts sequencing initiatives more carefully.',
            established: 'Tools like dashboards or surveys help monitor saturation, and capacity is factored into planning.',
            worldClass: 'Change load is carefully managed using real-time analytics. AI helps forecast capacity and optimize the timing and sequencing of initiatives.'
          },
          {
            name: 'Change Adoption',
            whyItMatters: 'Effective change management reduces resistance, improves user adoption, and ensures that digital tools and processes deliver their intended benefits.',
            basic: 'Change efforts face resistance, with teams preferring established methods and limited trust in digital initiatives.',
            emerging: 'Some openness to new ways of working is taking root, especially through pilots or innovation teams.',
            established: 'Change is actively managed with lessons learned applied across initiatives. Communication strategies are audience-specific and supported by feedback loops.',
            worldClass: 'Change is embraced across the organization as a driver of progress. Agile teams, proactive communication, and continuous reinforcement enable smooth transitions.'
          },
          {
            name: 'Training',
            whyItMatters: 'Providing tailored, ongoing training ensures users feel confident with new tools and processes, reducing frustration and accelerating value realization.',
            basic: 'Training is minimal and mostly informal, leading to low confidence and poor adoption.',
            emerging: 'Initial training is offered but lacks follow-up and consistency.',
            established: 'Training is structured, reinforced by managers, and tailored to user needs. Support is available through multiple channels.',
            worldClass: 'Learning is embedded into workflows through in-app support, AI coaches, and peer learning—making change feel purposeful and sustainable.'
          }
        ]
      }
    ]
  },
  {
    name: 'VALUE_SCALING',
    displayName: 'Value Scaling',
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    dimensions: [
      {
        name: 'Market and Product Insights Integration',
        subdimensions: [
          {
            name: 'Customer Co-Design Interfaces',
            whyItMatters: 'Involving customers directly in R&D formulation systems, simulate performance, or suggest feature enhances ensures products meet real needs and market expectations early in the development cycle, reducing risk and improving time-to-value.',
            basic: 'R&D receives anecdotal or secondhand feedback through intermediaries (e.g., sales, technical service), making it hard to understand real use cases, application contexts, or unmet needs.',
            emerging: 'Feedback is captured through customer visits, technical support tickets, or trade events and documented in CRM or service logs. However, it remains qualitative and is not systematically analyzed or integrated into R&D workflows.',
            established: 'R&D integrates Voice of Customer (VOC) from service reports, field trials, and dashboards. Personas and application data guide product decisions, and performance is digitally captured and linked to formulations.',
            worldClass: 'R&D collaborates with customers in real time through digital platforms and connected products. AI analyzes VOC by region, segment, and trend, guiding proactive decisions.'
          },
          {
            name: 'Real-Time Feedback Integration',
            whyItMatters: 'Capturing and acting on customer usage data and feedback in real time enables R&D to optimize products continuously, respond to field issues faster, and drive customer-centric innovation.',
            basic: 'Feedback loops are manual, late-stage, and disconnected from innovation cycles. R&D rarely hears directly from end users until after product launch.',
            emerging: 'R&D reviews feedback during stage gates, but tools remain presentation-based and are not tied to design workflows.',
            established: 'Performance data is digitally captured and linked to formulations, with documented corrective actions that close the loop.',
            worldClass: 'Feedback loops operate continuously using real-time product performance data, driving agile, customer-centric innovation.'
          },
          {
            name: 'Market Analytics for R&D',
            whyItMatters: 'Using market trends, competitive intelligence, and demand signals to inform R&D priorities ensures that innovation efforts are aligned with business potential and customer needs.',
            basic: 'Market trends and customer needs are largely invisible to scientists, and product decisions rely on technical feasibility or legacy inputs.',
            emerging: 'Market data is shared occasionally by commercial teams, though it is often outdated or siloed.',
            established: 'Market analytics and business potential inform prioritization earlier in the pipeline. Tools provide visibility into trends, competitor activity, and customer segments.',
            worldClass: 'AI analyzes market data and ML-based prioritization is embedded in planning tools. R&D decisions are continuously informed by real-time market intelligence.'
          }
        ]
      },
      {
        name: 'Supplier and Procurement Integration',
        subdimensions: [
          {
            name: 'Supply Chain Traceability',
            whyItMatters: 'End-to-end mapping supports sustainability claims and risk scaleability. Traceability into raw materials and supplier processes helps R&D understand variability, ensure quality, and meet regulatory or sustainability requirements.',
            basic: 'Traceability into raw materials is low. R&D works from disconnected or outdated specification data.',
            emerging: 'Some digital records are uploaded to shared drives or portals, but systems remain siloed.',
            established: 'Digital traceability links batch data, test results, and material history, improving root cause analysis and formulation design.',
            worldClass: 'Digital twins model the full supply chain. Smart specifications are governed by APIs, enriched with material fingerprints, and monitored by AI to flag risk or performance deviations instantly.'
          },
          {
            name: 'Shared Specification Platforms',
            whyItMatters: 'Collaboratively platforms where suppliers and internal R&D teams can co-manage material specs and test protocols in real time (e.g., APIs, PLM) reduce errors, improve alignment, and accelerate problem-solving.',
            basic: 'Supplier interactions are transactional and handled via email or spreadsheets, with limited structure or shared systems. COAs, specs, and SDS files are manually requested and stored in static formats.',
            emerging: 'Basic supplier portals and procurement tools provide access to SDS, TDS, and limited lot tracking. Specification updates are manual, and supplier input is not yet integrated into R&D workflows.',
            established: 'Suppliers collaborate through digital portals or APIs integrated into R&D tools (e.g., ELN, PLM). Material specifications are co-authored, version-controlled, and searchable.',
            worldClass: 'R&D and suppliers operate in real-time on integrated platforms. AI evaluates supplier risk and sustainability alignment.'
          }
        ]
      },
      {
        name: 'Customer-Centric Digitalization',
        subdimensions: [
          {
            name: 'Customer-Facing R&D Tools',
            whyItMatters: 'Giving commercial teams and customers digital access to R&D data, tools, or configurators improves collaboration, accelerates solutioning, and enhances customer experience.',
            basic: 'R&D data is isolated in lab notebooks or spreadsheets, with commercial teams relying on tribal knowledge or informal queries.',
            emerging: 'Basic R&D specs and TDSs are available via CRM or internal portals.',
            established: 'R&D databases are integrated with tools used by sales and service teams. AI-powered configurators support solutioning based on R&D data.',
            worldClass: 'AI-curated R&D insights are accessible to commercial teams, field service reps, and even customers. Digital tools like simulators and recommenders allow for real-time solutioning.'
          },
          {
            name: 'Customer Request and Collaboration Platforms',
            whyItMatters: 'Structured digital channels for customer requests, technical inquiries, or co-development improve responsiveness, traceability, and customer satisfaction.',
            basic: 'Customer requests are vague and relayed through reps. Field feedback is anecdotal and delayed, limiting R&D\'s ability to respond or adapt.',
            emerging: 'Customer portals collect structured requests using templates. Field feedback is gathered via service portals or apps, and processes exist for periodic review, though updates are manual.',
            established: 'CRM and IoT platforms feed structured, real-time field data into models that help inform formulation updates.',
            worldClass: 'Predictive models detect and interpret field anomalies to guide proactive product adaptation and new development.'
          }
        ]
      },
      {
        name: 'Manufacturing and Operations 4.0 Enablement',
        subdimensions: [
          {
            name: 'Scale-up Data Transfer',
            whyItMatters: 'Seamless handoff ensures consistency between lab and production, process conditions, and testing protocols from R&D to manufacturing accelerates scale-up, reduces trial-and-error, and improves first-time-right rates.',
            basic: 'Scale-up data is shared manually via emails or spreadsheets, leading to misalignment and frequent trial-and-error.',
            emerging: 'R&D provides scale-up templates and lab data in structured formats, though coordination happens through meetings or shared folders.',
            established: 'Digital workflows and shared platforms manage structured data transfer and store searchable historical data.',
            worldClass: 'Seamless, interoperable systems enable automated data transfer and simulate scale-up outcomes.'
          },
          {
            name: 'Process Optimization',
            whyItMatters: 'AI improves yield, efficiency, or quality. Using advanced analytics and AI to optimize manufacturing processes helps achieve cost, performance, or sustainability targets faster.',
            basic: 'Process monitoring is reactive and relies on operator experience, with limited data analysis after the fact.',
            emerging: 'Optimization efforts apply basic statistics or Six Sigma, with findings documented in static reports.',
            established: 'AI/ML models support optimization, with real-time dashboards tracking performance.',
            worldClass: 'Optimization is adaptive, co-developed by R&D and operations, and driven by AI to support sustainable, high-performance manufacturing.'
          },
          {
            name: 'Digital Partner Integration',
            whyItMatters: 'Digital twins of production processes allow R&D to simulate scale-up scenarios, test formulation changes, and predict manufacturing outcomes—reducing costly physical trials and accelerating time-to-market.',
            basic: 'R&D and manufacturing operate independently, with no digital twins or real-time process visibility.',
            emerging: 'Some unit operations are simulated, but models are isolated from real plant data.',
            established: 'Digital models of key production units are linked to historical and live data, allowing R&D and manufacturing to collaborate on scale-up and design decisions.',
            worldClass: 'Fully integrated digital twins span lab to production scale, using real-time sensor data for predictive control and lifecycle management.'
          }
        ]
      },
      {
        name: 'External Partnerships, Digital Ecosystem',
        subdimensions: [
          {
            name: 'Partnership Integration',
            whyItMatters: 'Digital platforms that connect R&D with academic, industry, and government partners enable faster knowledge exchange, collaboration, and access to complementary capabilities.',
            basic: 'External partners like universities or vendors are engaged on a case-by-case basis through email or file exchange. Collaboration is limited to specific projects, with little digital infrastructure.',
            emerging: 'The organization participates in some funded collaborations or consortia, but integration is still manual and offline.',
            established: 'Strategic partnerships are digitally enabled via APIs, shared dashboards, and collaboration platforms.',
            worldClass: 'Partner integration is seamless, API-driven, and spans academia, industry, and government. Real-time collaboration occurs across federated data platforms with fine-grained access control.'
          },
          {
            name: 'Data Sharing and IP Management',
            whyItMatters: 'Secure, trackable data-sharing protocols and IP tools enable R&D to collaborate externally without compromising competitive advantage or violating regulatory constraints.',
            basic: 'Data sharing is manual, slow, and lacks structure, with IP handled offline and no support for broader joint initiatives.',
            emerging: 'File-sharing portals or cloud storage are used with a few select partners, and IP terms are defined in contracts but not automated. Versioning and tagging are managed manually.',
            established: 'Joint projects use structured repositories, calendars, and shared workspaces with defined roles and access policies. Data sharing and IP workflows are partially automated with audit trails and compliance support.',
            worldClass: 'Data sharing is dynamic and scalable, supported by cloud workspaces, standardized schemas, and blockchain-enabled IP tracking and compliance tools.'
          }
        ]
      }
    ]
  }
];
