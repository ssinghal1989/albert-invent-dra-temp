import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // Company model
  Company: a
    .model({
      name: a.string().required(),
      primaryDomain: a.string().required(),
      domains: a.string().array(),
      industry: a.enum(['CHEMICALS', 'PHARMACEUTICALS', 'MATERIALS', 'BIOTECH', 'OTHER']),
      sizeBand: a.enum(['1-50', '51-200', '201-1k', '1k-5k', '5k+']),
      region: a.enum(['NA', 'EU', 'APAC', 'OTHER']),
      status: a.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
      externalSystemIds: a.json(),
      users: a.hasMany('User', 'companyId'),
      assessmentInstances: a.hasMany('AssessmentInstance', 'companyId'),
      assets: a.hasMany('Asset', 'companyId'),
    })
    .authorization((allow) => [
      allow.authenticated(),
      allow.publicApiKey().to(['read'])
    ]),

  // User model
  User: a
    .model({
      email: a.email().required(),
      firstName: a.string(),
      lastName: a.string(),
      role: a.enum(['member', 'admin', 'facilitator']).default('member'),
      companyId: a.id(),
      jobTitle: a.string(),
      consentVersionAccepted: a.string(),
      consentAcceptedAt: a.datetime(),
      marketingOptIn: a.boolean().default(false),
      company: a.belongsTo('Company', 'companyId'),
      consentRecords: a.hasMany('ConsentRecord', 'userId'),
      responses: a.hasMany('Response', 'userId'),
      initiatedAssessments: a.hasMany('AssessmentInstance', 'initiatorUserId'),
      assets: a.hasMany('Asset', 'userId'),
    })
    .authorization((allow) => [allow.owner()]),

  // Consent tracking
  ConsentRecord: a
    .model({
      userId: a.id().required(),
      consentText: a.string().required(),
      policyLinks: a.json(),
      version: a.string().required(),
      accepted: a.boolean().required(),
      acceptedAt: a.datetime(),
      ipAddress: a.string(),
      userAgent: a.string(),
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [allow.owner()]),

  // Assessment templates
  AssessmentTemplate: a
    .model({
      name: a.string().required(),
      slug: a.string().required(),
      version: a.string().required(),
      sections: a.json(),
      scoringConfig: a.json(),
      questions: a.hasMany('Question', 'templateId'),
      assessmentInstances: a.hasMany('AssessmentInstance', 'templateId'),
    })
    .authorization((allow) => [
      allow.authenticated(),
      allow.publicApiKey().to(['read'])
    ]),

  // Questions
  Question: a
    .model({
      templateId: a.id().required(),
      sectionId: a.string().required(),
      order: a.integer().required(),
      kind: a.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SCALE', 'TEXT']).required(),
      prompt: a.string().required(),
      helpText: a.string(),
      scale: a.json(),
      required: a.boolean().default(true),
      metadata: a.json(),
      template: a.belongsTo('AssessmentTemplate', 'templateId'),
      options: a.hasMany('Option', 'questionId'),
      responses: a.hasMany('Response', 'questionId'),
    })
    .authorization((allow) => [
      allow.authenticated(),
      allow.publicApiKey().to(['read'])
    ]),

  // Question options
  Option: a
    .model({
      questionId: a.id().required(),
      label: a.string().required(),
      value: a.string().required(),
      score: a.float(),
      question: a.belongsTo('Question', 'questionId'),
    })
    .authorization((allow) => [
      allow.authenticated(),
      allow.publicApiKey().to(['read'])
    ]),

  // Assessment instances (runs)
  AssessmentInstance: a
    .model({
      templateId: a.id().required(),
      companyId: a.id(),
      initiatorUserId: a.id(),
      type: a.enum(['HIGH_LEVEL', 'DETAILED']).required(),
      status: a.enum(['IN_PROGRESS', 'SUBMITTED', 'SCORED']).default('IN_PROGRESS'),
      startedAt: a.datetime(),
      submittedAt: a.datetime(),
      scoredAt: a.datetime(),
      metadata: a.json(),
      template: a.belongsTo('AssessmentTemplate', 'templateId'),
      company: a.belongsTo('Company', 'companyId'),
      initiator: a.belongsTo('User', 'initiatorUserId'),
      responses: a.hasMany('Response', 'assessmentInstanceId'),
      scoreCard: a.hasOne('ScoreCard', 'assessmentInstanceId'),
      participants: a.hasMany('Participant', 'assessmentInstanceId'),
      workshopSessions: a.hasMany('WorkshopSession', 'assessmentInstanceId'),
      assets: a.hasMany('Asset', 'assessmentInstanceId'),
    })
    .authorization((allow) => [
      allow.authenticated(),
      allow.owner()
    ]),

  // User responses
  Response: a
    .model({
      assessmentInstanceId: a.id().required(),
      questionId: a.id().required(),
      userId: a.id(),
      answer: a.json(),
      freeText: a.string(),
      confidence: a.integer(),
      assessmentInstance: a.belongsTo('AssessmentInstance', 'assessmentInstanceId'),
      question: a.belongsTo('Question', 'questionId'),
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow.authenticated(),
      allow.owner()
    ]),

  // Score cards
  ScoreCard: a
    .model({
      assessmentInstanceId: a.id().required(),
      overallScore: a.float().required(),
      sectionScores: a.json().required(),
      bucketLabel: a.string().required(),
      explanations: a.string(),
      recommendations: a.json(),
      pillarScores: a.json(),
      dimensionScores: a.json(),
      maturityLevels: a.json(),
      companyAverageAtRun: a.float(),
      assessmentInstance: a.belongsTo('AssessmentInstance', 'assessmentInstanceId'),
    })
    .authorization((allow) => [
      allow.authenticated(),
      allow.owner()
    ]),

  // Workshop sessions for detailed assessments
  WorkshopSession: a
    .model({
      assessmentInstanceId: a.id().required(),
      scheduledFor: a.datetime(),
      facilitatorUserId: a.id(),
      meetingLink: a.string(),
      notes: a.string(),
      assessmentInstance: a.belongsTo('AssessmentInstance', 'assessmentInstanceId'),
      facilitator: a.belongsTo('User', 'facilitatorUserId'),
    })
    .authorization((allow) => [allow.authenticated()]),

  // Participants in detailed assessments
  Participant: a
    .model({
      assessmentInstanceId: a.id().required(),
      userId: a.id().required(),
      roleInWorkshop: a.string(),
      attended: a.boolean().default(false),
      assessmentInstance: a.belongsTo('AssessmentInstance', 'assessmentInstanceId'),
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [allow.authenticated()]),

  // Assets (PDFs, reports, etc.)
  Asset: a
    .model({
      kind: a.enum(['PDF_HL_SCORE', 'PDF_DETAILED_REPORT', 'DASHBOARD_TEAM', 'CSV_EXPORT', 'IMAGE_CHART']).required(),
      title: a.string().required(),
      fileKey: a.string(),
      assessmentInstanceId: a.id(),
      companyId: a.id(),
      userId: a.id(),
      visibility: a.enum(['PRIVATE_USER', 'COMPANY', 'INTERNAL_ONLY']).required(),
      assessmentInstance: a.belongsTo('AssessmentInstance', 'assessmentInstanceId'),
      company: a.belongsTo('Company', 'companyId'),
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow.authenticated(),
      allow.owner()
    ]),

  // Email tracking
  EmailEvent: a
    .model({
      to: a.email().required(),
      template: a.string().required(),
      subject: a.string().required(),
      status: a.enum(['QUEUED', 'SENT', 'BOUNCED', 'OPENED', 'CLICKED']).default('QUEUED'),
      relatedAssetId: a.id(),
      relatedAssessmentId: a.id(),
      relatedAsset: a.belongsTo('Asset', 'relatedAssetId'),
      relatedAssessment: a.belongsTo('AssessmentInstance', 'relatedAssessmentId'),
    })
    .authorization((allow) => [allow.authenticated()]),

  // Audit logging
  AuditLog: a
    .model({
      actorUserId: a.id(),
      action: a.string().required(),
      objectType: a.string().required(),
      objectId: a.string().required(),
      before: a.json(),
      after: a.json(),
      actor: a.belongsTo('User', 'actorUserId'),
    })
    .authorization((allow) => [allow.authenticated()]),

  // Custom queries
  getAssessmentTemplate: a
    .query()
    .arguments({
      slug: a.string().required(),
      version: a.string()
    })
    .returns(a.ref('AssessmentTemplate'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.custom({ entry: './get-assessment-template.js' })),

  createAssessmentInstance: a
    .mutation()
    .arguments({
      templateId: a.string().required(),
      type: a.string().required(),
      metadata: a.json()
    })
    .returns(a.ref('AssessmentInstance'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.custom({ entry: './create-assessment-instance.js' })),

  submitAssessment: a
    .mutation()
    .arguments({
      assessmentInstanceId: a.string().required(),
      responses: a.json().required()
    })
    .returns(a.ref('ScoreCard'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.custom({ entry: './submit-assessment.js' })),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});