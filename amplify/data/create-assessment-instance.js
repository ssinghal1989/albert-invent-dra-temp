export function request(ctx) {
  const { templateId, type, metadata } = ctx.arguments;
  const { identity } = ctx;
  
  return {
    version: '2018-05-29',
    operation: 'PutItem',
    key: {
      id: { S: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
    },
    attributeValues: {
      templateId: { S: templateId },
      type: { S: type },
      status: { S: 'IN_PROGRESS' },
      startedAt: { S: new Date().toISOString() },
      initiatorUserId: { S: identity.sub },
      metadata: metadata ? { S: JSON.stringify(metadata) } : { NULL: true },
      createdAt: { S: new Date().toISOString() },
      updatedAt: { S: new Date().toISOString() }
    }
  };
}

export function response(ctx) {
  if (ctx.error) {
    console.error('Error creating assessment instance:', ctx.error);
    return null;
  }
  
  const item = ctx.result;
  return {
    id: item.id.S,
    templateId: item.templateId.S,
    type: item.type.S,
    status: item.status.S,
    startedAt: item.startedAt.S,
    initiatorUserId: item.initiatorUserId.S,
    metadata: item.metadata && !item.metadata.NULL ? JSON.parse(item.metadata.S) : null,
    createdAt: item.createdAt.S,
    updatedAt: item.updatedAt.S
  };
}