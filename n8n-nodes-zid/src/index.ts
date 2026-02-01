// Entry point for n8n to discover nodes and credentials

import { ZidOAuth2Api } from './ZidOAuth2Api.credentials';
import { ZidOrderTrigger } from './ZidOrderTrigger.node';
import { ZidCustomerTrigger } from './ZidCustomerTrigger.node';
import { Zid } from './Zid.node';

export const nodes = [ZidOrderTrigger, ZidCustomerTrigger, Zid];
export const credentials = [ZidOAuth2Api]; 