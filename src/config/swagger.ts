import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'FinTrackPro API',
      version: '1.0.0',
      description:
        'Finance tracking API with credit card expense management',
    },

    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },

      schemas: {
        /* ---------------- TRANSACTION ---------------- */
        Transaction: {
          type: 'object',
          required: ['amount', 'type', 'category', 'date'],
          properties: {
            _id: {
              type: 'string',
              description: 'MongoDB ObjectId',
            },

            amount: {
              type: 'number',
            },

            type: {
              type: 'string',
              enum: [
                'income',
                'expense',
                'borrow',
                'repay',
                'credit',
                'credit-repay',
              ],
            },

            category: {
              type: 'string',
            },

            description: {
              type: 'string',
            },

            notes: {
              type: 'string',
            },

            date: {
              type: 'string',
              format: 'date-time',
            },

            paymentMode: {
              type: 'string',
            },

            isCredit: {
              type: 'boolean',
            },

            shared: {
              type: 'boolean',
            },

            people: {
              type: 'integer',
            },

            userShare: {
              type: 'number',
            },

            tags: {
              type: 'array',
              items: { type: 'string' },
            },

            createdAt: {
              type: 'string',
              format: 'date-time',
            },

            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        /* ---------------- TRANSACTION CREATE ---------------- */
        TransactionCreate: {
          type: 'object',
          required: ['amount', 'type', 'category'],
          properties: {
            amount: { type: 'number' },
            type: {
              type: 'string',
              enum: [
                'income',
                'expense',
                'borrow',
                'repay',
                'credit',
                'credit-repay',
              ],
            },
            category: { type: 'string' },
            description: { type: 'string' },
            notes: { type: 'string' },
            date: { type: 'string', format: 'date' },
            paymentMode: { type: 'string' },
            isCredit: { type: 'boolean' },
            shared: { type: 'boolean' },
            people: { type: 'integer' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },

        /* ---------------- CREDIT SUMMARY ---------------- */
        CreditCardSummary: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            cardName: { type: 'string' },
            totalSpent: { type: 'number' },
            totalRepaid: { type: 'number' },
            outstanding: { type: 'number' },
            transactionCount: { type: 'integer' },
            lastTransaction: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        /* ---------------- API RESPONSE ---------------- */
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },

            data: {
              type: 'object',
              nullable: true,
            },

            error: {
              type: 'object',
              nullable: true,
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },

            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],

    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Transactions', description: 'Transaction management' },
      { name: 'Credit Cards', description: 'Credit card tracking' },
      { name: 'System', description: 'Health & system APIs' },
    ],

    paths: {
      /* ---------------- HEALTH ---------------- */
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          security: [],
          responses: {
            '200': {
              description: 'API is healthy',
            },
          },
        },
      },

      /* ---------------- AUTH ---------------- */
      '/api/v1/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register user',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string' },
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    password: {
                      type: 'string',
                      minLength: 8,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'User created' },
          },
        },
      },

      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login success' },
          },
        },
      },

      /* ---------------- TRANSACTIONS ---------------- */
      '/api/v1/transactions': {
        post: {
          tags: ['Transactions'],
          summary: 'Create transaction',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TransactionCreate',
                },
              },
            },
          },
          responses: {
            '201': { description: 'Created' },
          },
        },

        get: {
          tags: ['Transactions'],
          summary: 'List transactions',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'OK' },
          },
        },
      },
    },
  },

  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);