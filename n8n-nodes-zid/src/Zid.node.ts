import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  IDataObject,
} from 'n8n-workflow';
import { GenericZidApi } from './GenericZidApi';

export class Zid implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Zid',
    name: 'zid',
    group: ['transform'],
    version: 1,
    description: 'Interact with Zid API',
    defaults: {
      name: 'Zid',
    },
    inputs: ['main'] as unknown as import('n8n-workflow').NodeConnectionType[],
    outputs: ['main'] as unknown as import('n8n-workflow').NodeConnectionType[],
    credentials: [
      {
        name: 'zidOAuth2Api',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Order',
            value: 'order',
          },
          {
            name: 'Product',
            value: 'product',
          },
          {
            name: 'Customer',
            value: 'customer',
          },
        ],
        default: 'order',
      },
      // Order Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['order'],
          },
        },
        options: [
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all orders',
            action: 'Get all orders',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get an order by ID',
            action: 'Get an order',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update an order',
            action: 'Update an order',
          },
        ],
        default: 'getAll',
      },
      // Product Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['product'],
          },
        },
        options: [
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all products',
            action: 'Get all products',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a product by ID',
            action: 'Get a product',
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new product',
            action: 'Create a product',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a product',
            action: 'Update a product',
          },
        ],
        default: 'getAll',
      },
      // Customer Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['customer'],
          },
        },
        options: [
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all customers',
            action: 'Get all customers',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a customer by ID',
            action: 'Get a customer',
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new customer',
            action: 'Create a customer',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a customer',
            action: 'Update a customer',
          },
        ],
        default: 'getAll',
      },
      // Common ID field for get/update operations
      {
        displayName: 'ID',
        name: 'id',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            operation: ['get', 'update'],
          },
        },
        default: '',
        description: 'The ID of the resource',
      },
      // Limit for getAll operations
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: {
          show: {
            operation: ['getAll'],
          },
        },
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        default: 50,
        description: 'Maximum number of results to return',
      },
      // Additional fields for create/update operations
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        displayOptions: {
          show: {
            operation: ['create', 'update'],
          },
        },
        default: {},
        options: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Description',
            name: 'description',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Price',
            name: 'price',
            type: 'number',
            default: 0,
            displayOptions: {
              show: {
                '/resource': ['product'],
              },
            },
          },
          {
            displayName: 'Email',
            name: 'email',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/resource': ['customer'],
              },
            },
          },
          {
            displayName: 'Phone',
            name: 'phone',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/resource': ['customer'],
              },
            },
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('zidOAuth2Api');
    if (!credentials) {
      throw new NodeOperationError(this.getNode(), 'No credentials found!');
    }

    const zidApi = new GenericZidApi(
      'https://api.zid.sa/v1',
      credentials.accessToken as string
    );

    const executeOrderOperation = async (operation: string, itemIndex: number): Promise<any> => {
      switch (operation) {
        case 'getAll':
          const limit = this.getNodeParameter('limit', itemIndex) as number;
          const response = await zidApi.request({
            method: 'GET',
            url: '/orders',
            params: { limit },
          });
          return response.data || response;

        case 'get':
          const orderId = this.getNodeParameter('id', itemIndex) as string;
          return await zidApi.request({
            method: 'GET',
            url: `/orders/${orderId}`,
          });

        case 'update':
          const updateOrderId = this.getNodeParameter('id', itemIndex) as string;
          const additionalFields = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
          return await zidApi.request({
            method: 'PUT',
            url: `/orders/${updateOrderId}`,
            data: additionalFields,
          });

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
    };

    const executeProductOperation = async (operation: string, itemIndex: number): Promise<any> => {
      switch (operation) {
        case 'getAll':
          const limit = this.getNodeParameter('limit', itemIndex) as number;
          const response = await zidApi.request({
            method: 'GET',
            url: '/products',
            params: { limit },
          });
          return response.data || response;

        case 'get':
          const productId = this.getNodeParameter('id', itemIndex) as string;
          return await zidApi.request({
            method: 'GET',
            url: `/products/${productId}`,
          });

        case 'create':
          const createData = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
          return await zidApi.request({
            method: 'POST',
            url: '/products',
            data: createData,
          });

        case 'update':
          const updateProductId = this.getNodeParameter('id', itemIndex) as string;
          const updateData = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
          return await zidApi.request({
            method: 'PUT',
            url: `/products/${updateProductId}`,
            data: updateData,
          });

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
    };

    const executeCustomerOperation = async (operation: string, itemIndex: number): Promise<any> => {
      switch (operation) {
        case 'getAll':
          const limit = this.getNodeParameter('limit', itemIndex) as number;
          const response = await zidApi.request({
            method: 'GET',
            url: '/customers',
            params: { limit },
          });
          return response.data || response;

        case 'get':
          const customerId = this.getNodeParameter('id', itemIndex) as string;
          return await zidApi.request({
            method: 'GET',
            url: `/customers/${customerId}`,
          });

        case 'create':
          const createData = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
          return await zidApi.request({
            method: 'POST',
            url: '/customers',
            data: createData,
          });

        case 'update':
          const updateCustomerId = this.getNodeParameter('id', itemIndex) as string;
          const updateData = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
          return await zidApi.request({
            method: 'PUT',
            url: `/customers/${updateCustomerId}`,
            data: updateData,
          });

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
    };

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        let responseData: any;

        if (resource === 'order') {
          responseData = await executeOrderOperation(operation, i);
        } else if (resource === 'product') {
          responseData = await executeProductOperation(operation, i);
        } else if (resource === 'customer') {
          responseData = await executeCustomerOperation(operation, i);
        }

        if (Array.isArray(responseData)) {
          returnData.push(...responseData.map(item => ({ json: item })));
        } else {
          returnData.push({ json: responseData });
        }
      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
} 