import { 
  INodeType, 
  INodeTypeDescription, 
  ITriggerFunctions, 
  ITriggerResponse,
  IDataObject,
  NodeOperationError,
} from 'n8n-workflow';
import { GenericZidApi } from './GenericZidApi';

export class ZidOrderTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Zid Order Trigger',
    name: 'zidOrderTrigger',
    group: ['trigger'],
    version: 1,
    description: 'Triggers workflow on new Zid orders',
    defaults: {
      name: 'New Zid Order',
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
        displayName: 'Trigger On',
        name: 'triggerOn',
        type: 'options',
        options: [
          {
            name: 'New Order',
            value: 'newOrder',
          },
          {
            name: 'Order Status Updated',
            value: 'orderStatusUpdated',
          },
        ],
        default: 'newOrder',
        description: 'When to trigger the workflow',
      },
      {
        displayName: 'Polling Interval (minutes)',
        name: 'pollInterval',
        type: 'number',
        default: 5,
        description: 'How often to check for new orders (in minutes)',
        typeOptions: {
          minValue: 1,
          maxValue: 60,
        },
      },
      {
        displayName: 'Order Status Filter',
        name: 'statusFilter',
        type: 'string',
        default: '',
        description: 'Filter orders by status (optional)',
        displayOptions: {
          show: {
            triggerOn: ['newOrder'],
          },
        },
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        description: 'Maximum number of orders to fetch per poll',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const triggerOn = this.getNodeParameter('triggerOn') as string;
    const pollInterval = this.getNodeParameter('pollInterval') as number;
    const statusFilter = this.getNodeParameter('statusFilter') as string;
    const limit = this.getNodeParameter('limit') as number;

    const credentials = await this.getCredentials('zidOAuth2Api');
    if (!credentials) {
      throw new NodeOperationError(this.getNode(), 'No credentials found!');
    }

    // Initialize Zid API client
    const zidApi = new GenericZidApi(
      'https://api.zid.sa/v1', // Assuming Zid API base URL
      credentials.accessToken as string
    );

    let lastOrderId: string | null = null;
    let isFirstRun = true;

    const pollForOrders = async () => {
      try {
        const params: IDataObject = {
          limit,
          sort: 'created_at',
          order: 'desc',
        };

        if (statusFilter) {
          params.status = statusFilter;
        }

        if (lastOrderId && !isFirstRun) {
          params.since_id = lastOrderId;
        }

        const response = await zidApi.request<{ data: any[]; meta?: any }>({
          method: 'GET',
          url: '/orders',
          params,
        });

        const orders = response.data || [];

        if (orders.length > 0) {
          // Update lastOrderId to the most recent order
          lastOrderId = orders[0].id;

          // On first run, only set lastOrderId but don't emit orders to avoid flooding
          if (isFirstRun) {
            isFirstRun = false;
            return;
          }

          // Emit each order as a separate workflow execution
          for (const order of orders.reverse()) { // Reverse to process oldest first
            this.emit([this.helpers.returnJsonArray([order])]);
          }
        }

        isFirstRun = false;
      } catch (error: any) {
        this.emit([this.helpers.returnJsonArray([{
          error: `Failed to fetch orders: ${error.message}`,
          timestamp: new Date().toISOString(),
        }])]);
      }
    };

    // Initial poll
    await pollForOrders();

    // Set up interval polling
    const intervalId = setInterval(pollForOrders, pollInterval * 60 * 1000);

    return {
      closeFunction: async () => {
        clearInterval(intervalId);
      },
    };
  }
} 