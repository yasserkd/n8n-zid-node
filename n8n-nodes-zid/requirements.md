# Requirements and Specification Document
**Project:** n8n Integration Package for Zid API  
**Reference:** [Zid API Documentation](https://docs.zid.sa/start-here)  
**Date:** 2024-06-09

---

## 1. Overview

The goal is to develop an n8n node package that enables users to connect their n8n workflows to the Zid platform, leveraging the public Zid API. This will allow users to automate tasks such as order management, product updates, customer data retrieval, and more, directly from n8n.

---

## 2. Objectives

- Provide a user-friendly n8n node for Zid API.
- Support key Zid API endpoints (orders, products, customers, etc.).
- Allow authentication via Zid's OAuth2.
- Enable both trigger and action nodes (e.g., "New Order" trigger, "Create Product" action).
- Handle API errors gracefully and provide clear feedback in n8n.

---

## 3. Functional Requirements

### 3.1 Authentication

- Support OAuth2 authentication as per Zid API requirements.
- Allow users to connect their Zid account securely from n8n credentials UI.

### 3.2 Supported Operations

#### 3.2.1 Triggers
- **New Order**: Trigger workflow when a new order is created in Zid.
- **Order Status Updated**: Trigger on order status changes.
- **New Customer**: Trigger when a new customer is added.

#### 3.2.2 Actions
- **Get Orders**: Retrieve a list of orders (with filters).
- **Get Order by ID**: Fetch details of a specific order.
- **Create/Update Product**: Add or update product information.
- **Get Products**: Retrieve product list.
- **Get Customers**: Retrieve customer list.
- **Create/Update Customer**: Add or update customer information.
- **Other endpoints**: As per user demand and Zid API capabilities.

### 3.3 Node Configuration

- Each node should allow users to specify parameters (e.g., filters, fields, pagination).
- Support for mapping n8n input data to Zid API fields.
- Output should be in a format compatible with n8n's data structure.

### 3.4 Error Handling

- Display clear error messages for authentication, validation, and API errors.
- Allow users to handle errors in their workflows (e.g., via n8n's error branches).

---

## 4. Non-Functional Requirements

- **Documentation:** Provide clear usage documentation and example workflows.
- **Testing:** Unit and integration tests for all major functionalities.
- **Performance:** Efficient handling of large data sets (pagination, batching).
- **Security:** Secure storage and handling of OAuth tokens.

---

## 5. Technical Specification

### 5.1 Technology Stack

- **n8n Node Package:** TypeScript/JavaScript
- **API Communication:** REST (using axios or node-fetch)
- **Authentication:** OAuth2 (as per Zid API)
- **Testing:** Jest or similar

### 5.2 Node Structure

- **Credential Node:** For Zid OAuth2 connection.
- **Trigger Nodes:** For webhook-based or polling triggers.
- **Action Nodes:** For each supported Zid API endpoint.

### 5.3 API Endpoints

- Reference Zid API documentation for endpoint URLs, required parameters, and response formats.
- Implement pagination and filtering where supported.

### 5.4 Rate Limiting

- Respect Zid API rate limits.
- Implement retry logic for rate-limited requests.

---

## 6. Deliverables

- n8n node package (npm module)
- Documentation (README, usage examples)
- Test suite
- Example n8n workflows

---

## 7. Out of Scope

- Support for deprecated or undocumented Zid API endpoints.
- Custom business logic not supported by Zid API.

---

## 8. References

- [Zid API Documentation](https://docs.zid.sa/start-here)
- [n8n Node Development Docs](https://docs.n8n.io/integrations/creating-nodes/)

---

## 9. Acceptance Criteria

- Users can authenticate with Zid via OAuth2 in n8n.
- Users can perform all listed actions and triggers.
- Errors are handled and reported clearly.
- Documentation is complete and accurate. 