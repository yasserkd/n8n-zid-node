import { 
  INodeType, 
  INodeTypeDescription, 
  ITriggerFunctions, 
  ITriggerResponse,
  IDataObject,
  NodeOperationError,
} from 'n8n-workflow';
import { GenericZidApi } from './GenericZidApi';

export class ZidCustomerTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Zid Customer Trigger',
    name: 'zidCustomerTrigger',
    group: ['trigger'],
    version: 1,
    description: 'Triggers workflow on new Zid customers',
    defaults: {
      name: 'New Zid Customer',
    },
    inputs: [],
    outputs: ['main'] as unknown as import('n8n-workflow').NodeConnectionType[],
    credentials: [
      {
        name: 'zidOAuth2Api',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Polling Interval (minutes)',
        name: 'pollInterval',
        type: 'number',
        default: 10,
        description: 'How often to check for new customers (in minutes)',
        typeOptions: {
          minValue: 1,
          maxValue: 60,
        },
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        description: 'Maximum number of customers to fetch per poll',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const pollInterval = this.getNodeParameter('pollInterval') as number;
    const limit = this.getNodeParameter('limit') as number;

    const credentials = await this.getCredentials('zidOAuth2Api');
    if (!credentials) {
      throw new NodeOperationError(this.getNode(), 'No credentials found!');
    }

    const zidApi = new GenericZidApi(
      'https://api.zid.sa/v1',
      credentials.accessToken as string
    );

    let lastCustomerId: string | null = null;
    let isFirstRun = true;

    const pollForCustomers = async () => {
      try {
        const params: IDataObject = {
          limit,
          sort: 'created_at',
          order: 'desc',
        };

        if (lastCustomerId && !isFirstRun) {
          params.since_id = lastCustomerId;
        }

        const response = await zidApi.request<{ data: any[]; meta?: any }>({
          method: 'GET',
          url: '/customers',
          params,
        });

        const customers = response.data || [];

        if (customers.length > 0) {
          lastCustomerId = customers[0].id;

          if (isFirstRun) {
            isFirstRun = false;
            return;
          }

          for (const customer of customers.reverse()) {
            this.emit([this.helpers.returnJsonArray([customer])]);
          }
        }

        isFirstRun = false;
      } catch (error: any) {
        this.emit([this.helpers.returnJsonArray([{
          error: `Failed to fetch customers: ${error.message}`,
          timestamp: new Date().toISOString(),
        }])]);
      }
    };

    await pollForCustomers();
    const intervalId = setInterval(pollForCustomers, pollInterval * 60 * 1000);

    return {
      closeFunction: async () => {
        clearInterval(intervalId);
      },
    };
  }
} 