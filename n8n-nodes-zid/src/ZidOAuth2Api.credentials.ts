import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class ZidOAuth2Api implements ICredentialType {
  name = 'zidOAuth2Api';
  displayName = 'Zid OAuth2 API';
  documentationUrl = 'https://docs.zid.sa/start-here';
  extends = [
    'oAuth2Api',
  ];
  properties: INodeProperties[] = [
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
    },
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'string',
      default: 'https://accounts.zid.sa/oauth2/authorize',
      required: true,
    },
    {
      displayName: 'Access Token URL',
      name: 'accessTokenUrl',
      type: 'string',
      default: 'https://accounts.zid.sa/oauth2/token',
      required: true,
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'string',
      default: '',
      description: 'Optional OAuth2 scopes',
    },
  ];
} 