import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

export const schema = a.schema({
  Company: a
    .model({
      id: a.id().required(),
      name: a.string(),
      primaryDomain: a.string().required(),
      // industry: a.enum(['CHEMICALS', 'PHARMACEUTICALS', 'BIOTECH', 'MATERIALS', 'OTHER']),
      // sizeBand: a.enum(['1-50', '51-200', '201-1k', '1k-5k', '5k+']),
      // region: a.enum(['NA', 'EU', 'APAC', 'OTHER']),
      // status: a.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
      users: a.hasMany("User", "companyId"),
      //assessments: a.hasMany("AssessmentInstance", "companyId"),
      createdAt: a.datetime().default(new Date().toISOString()),
      updatedAt: a.datetime().default(new Date().toISOString()),
      assessmentInstances: a.hasMany("AssessmentInstance", "companyId"),
      callScheduleRequest: a.hasMany("ScheduleRequest", "companyId"),
      config: a.json().default('{"tier2AccessEnabled": false}')
    })
    .identifier(["id"])
    .authorization((allow) => [
      allow.authenticated(),
      allow.publicApiKey().to(["read"]),
    ]),

  User: a
    .model({
      id: a.id().required(),
      email: a.email().required(),
      name: a.string(),
      jobTitle: a.string(),
      role: a.enum(["user", "admin", "superAdmin"]),
      companyId: a.id(),
      company: a.belongsTo("Company", "companyId"),
      createdAt: a.datetime().default(new Date().toISOString()),
      updatedAt: a.datetime().default(new Date().toISOString()),
      assessmentInstances: a.hasMany("AssessmentInstance", "initiatorUserId"),
      callScheduleRequest: a.hasMany("ScheduleRequest", "initiatorUserId")
    })
    .identifier(["id"])
    .authorization((allow) => [allow.authenticated()]),

  getAssessmentData: a
    .query()
    .returns(
      a.customType({
        focusAreas: a.string().array().required(),
        maturityLevels: a.string().array().required(),
        gridData: a.json().required(),
      })
    )
    .authorization((allow) => [allow.publicApiKey()])
    .handler(
      a.handler.custom({
        entry: "./get-assesment-data.js",
      })
    ),
  Question: a
    .model({
      templateId: a.id().required(),
      sectionId: a.string().required(),
      order: a.integer().required(),
      kind: a.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "SCALE", "TEXT"]),
      prompt: a.string().required(),
      helpText: a.string(),
      scale: a.json(),
      required: a.boolean().default(true),
      metadata: a.json(),
      template: a.belongsTo("AssessmentTemplate", "templateId"),
      options: a.hasMany("Option", "questionId"),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  AssessmentTemplate: a
    .model({
      id: a.string().required(),
      name: a.string().required(),
      slug: a.string().required(),
      version: a.string().required(),
      tier: a.enum(["TIER1", "TIER2"]),
      sections: a.json(),
      scoringConfig: a.json(),
      questions: a.hasMany("Question", "templateId"),
      assessmentInstances: a.hasMany("AssessmentInstance", "templateId"),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  // Question options
  Option: a
    .model({
      questionId: a.id().required(),
      label: a.string().required(),
      value: a.string().required(),
      score: a.float(),
      question: a.belongsTo("Question", "questionId"),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  // Assessment instances (runs)
  AssessmentInstance: a
    .model({
      id: a.id().required(),
      templateId: a.id().required(),
      companyId: a.id(),
      initiatorUserId: a.id(),
      assessmentType: a.enum(["TIER1", "TIER2"]),
      //status: a.enum(['IN_PROGRESS', 'SUBMITTED', 'SCORED']).default('IN_PROGRESS'),
      startedAt: a.datetime(),
      submittedAt: a.datetime(),
      scoredAt: a.datetime(),
      metadata: a.json(),
      template: a.belongsTo("AssessmentTemplate", "templateId"),
      company: a.belongsTo("Company", "companyId"),
      initiator: a.belongsTo("User", "initiatorUserId"),
      score: a.json(),
      responses: a.json(), // Storing responses as JSON for simplicity
      createdAt: a.datetime().default(new Date().toISOString()),
      updatedAt: a.datetime().default(new Date().toISOString()),
      //relations
      //assessor: a.belongsTo('User', 'assessorId'),
      //responses: a.hasMany('Response', 'assessmentInstanceId'),
      //scoreCard: a.hasOne('ScoreCard', 'assessmentInstanceId'),
      //participants: a.hasMany('Participant', 'assessmentInstanceId'),
      //workshopSessions: a.hasMany('WorkshopSession', 'assessmentInstanceId'),
      //assets: a.hasMany('Asset', 'assessmentInstanceId'),
    })
    .secondaryIndexes((index) => [
      index("initiatorUserId").sortKeys(["createdAt"]),
    ])
    .authorization((allow) => [allow.authenticated(), allow.owner()]),

  ScheduleRequest: a
    .model({
      type: a.enum(["TIER1_FOLLOWUP", "TIER2_REQUEST"]),
      initiatorUserId: a.id(),
      companyId: a.id(),
      preferredDate: a.date().required(),
      preferredTimes: a.string().array().required(), // Store as array of time strings
      remarks: a.string(),
      company: a.belongsTo("Company", "companyId"),
      metadata: a.json(),
      initiator: a.belongsTo("User", "initiatorUserId"),
      status: a.enum(["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"]),
      assessmentInstanceId: a.id(), // Link to assessment if applicable
      scheduledDateTime: a.datetime(), // Actual scheduled time
      meetingLink: a.string(), // Generated meeting link
      notificationsSent: a.boolean().default(false),
      createdAt: a.datetime().default(new Date().toISOString()),
      updatedAt: a.datetime().default(new Date().toISOString()),
    })
    .secondaryIndexes((index) => [
      index("initiatorUserId").sortKeys(["createdAt"]),
    ])
    .authorization((allow) => [allow.authenticated(), allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

