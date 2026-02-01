# n8n-nodes-zid

Custom n8n nodes for integrating with the Zid API (orders, products, customers, etc.)

## Overview

This package provides n8n nodes to connect your workflows to the Zid platform, enabling automation of order management, product updates, customer data retrieval, and more. Built with TypeScript and following n8n's best practices.

## Features

- **OAuth2 Authentication**: Secure authentication with Zid using OAuth2
- **Comprehensive API Coverage**: Support for orders, products, and customers
- **Trigger Nodes**: Automatically trigger workflows on new orders or customers
- **Action Nodes**: Perform CRUD operations on Zid resources
- **Error Handling**: Graceful error handling with clear feedback
- **Pagination Support**: Handle large datasets efficiently
- **Rate Limiting**: Respect Zid API rate limits with retry logic

## Installation

```bash
npm install n8n-nodes-zid
```

## Setup

### 1. OAuth2 Credentials

Before using the Zid nodes, you need to set up OAuth2 credentials:

1. Go to your Zid developer dashboard
2. Create a new application
3. Note down your `Client ID` and `Client Secret`
4. Set the redirect URI to your n8n instance

### 2. Configure Credentials in n8n

1. In n8n, go to **Settings** > **Credentials**
2. Click **Create New Credential**
3. Select **Zid OAuth2 API**
4. Fill in the required fields:
   - **Client ID**: Your Zid application client ID
   - **Client Secret**: Your Zid application client secret
   - **Authorization URL**: `https://accounts.zid.sa/oauth2/authorize`
   - **Access Token URL**: `https://accounts.zid.sa/oauth2/token`
   - **Scope**: (optional) Specific OAuth2 scopes if required

## Supported Operations

### Trigger Nodes

#### Zid Order Trigger
- **New Order**: Triggers when a new order is created
- **Order Status Updated**: Triggers when an order status changes
- **Configurable polling interval**: Set how often to check for new orders
- **Status filtering**: Filter orders by specific status
- **Limit control**: Control the number of orders fetched per poll

#### Zid Customer Trigger
- **New Customer**: Triggers when a new customer is registered
- **Configurable polling interval**: Set how often to check for new customers
- **Limit control**: Control the number of customers fetched per poll

### Action Nodes

#### Zid Node (Main Action Node)

**Order Operations:**
- **Get All Orders**: Retrieve a list of orders with optional filtering
- **Get Order**: Fetch details of a specific order by ID
- **Update Order**: Update order information

**Product Operations:**
- **Get All Products**: Retrieve a list of products
- **Get Product**: Fetch details of a specific product by ID
- **Create Product**: Create a new product
- **Update Product**: Update existing product information

**Customer Operations:**
- **Get All Customers**: Retrieve a list of customers
- **Get Customer**: Fetch details of a specific customer by ID
- **Create Customer**: Create a new customer
- **Update Customer**: Update existing customer information

## Usage Examples

### Example 1: New Order Notification

```json
{
  "nodes": [
    {
      "name": "Zid Order Trigger",
      "type": "n8n-nodes-zid.zidOrderTrigger",
      "parameters": {
        "triggerOn": "newOrder",
        "pollInterval": 5,
        "limit": 10
      }
    },
    {
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "subject": "New Order Received: {{$json.id}}",
        "text": "Order details: {{$json}}"
      }
    }
  ]
}
```

### Example 2: Sync Products

```json
{
  "nodes": [
    {
      "name": "Get Zid Products",
      "type": "n8n-nodes-zid.zid",
      "parameters": {
        "resource": "product",
        "operation": "getAll",
        "limit": 50
      }
    },
    {
      "name": "Process Products",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Process and transform product data\nreturn items.map(item => ({\n  json: {\n    id: item.json.id,\n    name: item.json.name,\n    price: item.json.price\n  }\n}));"
      }
    }
  ]
}
```

### Example 3: Create Customer

```json
{
  "nodes": [
    {
      "name": "Create Zid Customer",
      "type": "n8n-nodes-zid.zid",
      "parameters": {
        "resource": "customer",
        "operation": "create",
        "additionalFields": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        }
      }
    }
  ]
}
```

## Configuration Options

### Trigger Nodes

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `triggerOn` | Options | `newOrder` | What event to trigger on |
| `pollInterval` | Number | `5` | Polling interval in minutes (1-60) |
| `statusFilter` | String | `""` | Filter by order status (optional) |
| `limit` | Number | `50` | Max items per poll (1-100) |

### Action Nodes

| Parameter | Type | Description |
|-----------|------|-------------|
| `resource` | Options | Resource type (order, product, customer) |
| `operation` | Options | Operation to perform (getAll, get, create, update) |
| `id` | String | Resource ID (for get/update operations) |
| `limit` | Number | Max results for getAll operations |
| `additionalFields` | Collection | Additional fields for create/update |

## Error Handling

The nodes include comprehensive error handling:

- **Authentication Errors**: Clear messages for OAuth2 issues
- **API Errors**: Detailed error responses from Zid API
- **Network Errors**: Timeout and connection error handling
- **Validation Errors**: Parameter validation with helpful messages

## Rate Limiting

The package respects Zid API rate limits:

- Automatic retry logic for rate-limited requests
- Exponential backoff strategy
- Configurable request delays

## Development

### Building from Source

```bash
git clone <repository-url>
cd n8n-nodes-zid
npm install
npm run build
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## API Reference

The nodes interact with the following Zid API endpoints:

- `GET /orders` - List orders
- `GET /orders/{id}` - Get order details
- `PUT /orders/{id}` - Update order
- `GET /products` - List products
- `GET /products/{id}` - Get product details
- `POST /products` - Create product
- `PUT /products/{id}` - Update product
- `GET /customers` - List customers
- `GET /customers/{id}` - Get customer details
- `POST /customers` - Create customer
- `PUT /customers/{id}` - Update customer

## Troubleshooting

### Common Issues

**Authentication Failed**
- Verify your OAuth2 credentials are correct
- Check that your Zid application is properly configured
- Ensure the redirect URI matches your n8n instance

**API Rate Limiting**
- Reduce polling frequency for trigger nodes
- Implement delays between API calls in workflows
- Monitor your API usage in the Zid dashboard

**Connection Timeouts**
- Check your network connectivity
- Verify Zid API status
- Increase timeout values if needed

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
export DEBUG=n8n-nodes-zid:*
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- [Zid API Documentation](https://docs.zid.sa/start-here)
- [n8n Community Forum](https://community.n8n.io/)
- [GitHub Issues](https://github.com/your-repo/n8n-nodes-zid/issues)

## Changelog

### v0.1.0
- Initial release
- OAuth2 authentication support
- Order, Product, and Customer operations
- Trigger nodes for new orders and customers
- Comprehensive error handling and testing 