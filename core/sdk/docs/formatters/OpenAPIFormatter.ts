// core/sdk/docs/formatters/OpenAPIFormatter.ts

private generateSchemas(docs: PluginDoc): OpenAPIV3.ComponentsObject['schemas'] {
  const schemas: OpenAPIV3.ComponentsObject['schemas'] = {};

  // Add types
  for (const type of docs.api.types) {
    schemas[type.name] = this.convertTypeToSchema(type);
  }

  // Add interfaces
  for (const interface_ of docs.api.interfaces) {
    schemas[interface_.name] = this.convertInterfaceToSchema(interface_);
  }

  // Add event payloads
  for (const event of docs.events.emitted) {
    if (event.payload) {
      schemas[`${event.name}Payload`] = this.convertTypeToSchema(event.payload);
    }
  }

  return schemas;
}

private generateSecuritySchemes(): OpenAPIV3.ComponentsObject['securitySchemes'] {
  return {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    },
    apiKey: {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key'
    }
  };
}

private convertParameters(parameters: any[]): OpenAPIV3.ParameterObject[] {
  return parameters.map(param => ({
    name: param.name,
    in: this.determineParameterLocation(param),
    description: param.description,
    required: !param.optional,
    schema: this.convertTypeToSchema(param.type)
  }));
}

private generateResponses(endpoint: any): OpenAPIV3.ResponsesObject {
  const responses: OpenAPIV3.ResponsesObject = {
    '200': {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: this.convertTypeToSchema(endpoint.returnType.type)
        }
      }
    },
    '400': {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    },
    '401': {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          }
        }
      }
    }
  };

  return responses;
}

private generateSecurity(endpoint: any): OpenAPIV3.SecurityRequirementObject[] {
  const security: OpenAPIV3.SecurityRequirementObject[] = [];

  if (endpoint.requiresAuth) {
    security.push({ bearerAuth: [] });
  }

  if (endpoint.requiresApiKey) {
    security.push({ apiKey: [] });
  }

  return security;
}

private convertTypeToSchema(type: any): OpenAPIV3.SchemaObject {
  if (typeof type === 'string') {
    return this.convertBasicTypeToSchema(type);
  }

  if (type.type === 'object') {
    return {
      type: 'object',
      properties: Object.fromEntries(
        Object.entries(type.properties).map(([key, value]: [string, any]) => [
          key,
          this.convertTypeToSchema(value)
        ])
      ),
      required: type.required || []
    };
  }

  if (type.type === 'array') {
    return {
      type: 'array',
      items: this.convertTypeToSchema(type.items)
    };
  }

  return { type: 'string' };
}

private convertInterfaceToSchema(interface_: any): OpenAPIV3.SchemaObject {
  return {
    type: 'object',
    properties: Object.fromEntries(
      interface_.properties.map((prop: any) => [
        prop.name,
        this.convertTypeToSchema(prop.type)
      ])
    ),
    required: interface_.properties
      .filter((prop: any) => !prop.optional)
      .map((prop: any) => prop.name)
  };
}

private convertBasicTypeToSchema(type: string): OpenAPIV3.SchemaObject {
  const typeMap: Record<string, OpenAPIV3.SchemaObject> = {
    string: { type: 'string' },
    number: { type: 'number' },
    integer: { type: 'integer' },
    boolean: { type: 'boolean' },
    null: { type: 'null' }
  };

  return typeMap[type] || { type: 'string' };
}

private determineParameterLocation(param: any): string {
  if (param.in) {
    return param.in;
  }
  if (param.name.toLowerCase().includes('body')) {
    return 'body';
  }
  if (param.name.toLowerCase().includes('query')) {
    return 'query';
  }
  return 'path';
}
