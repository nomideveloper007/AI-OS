import { CORE_SYSTEM_PROMPT } from './templates/system/coreSystem';
import { WEBSITE_SCAN_USER_PROMPT } from './templates/user/websiteScanUser';
import { JSON_SCHEMA_SHARED_PROMPT } from './templates/shared/jsonSchemaFormat';

export interface PromptTemplate {
  id: string;
  name: string;
  category: 'system' | 'user' | 'shared';
  version: string;
  templateText: string;
  variables: string[];
}

export class PromptLoader {
  public static loadBuiltInTemplates(): PromptTemplate[] {
    return [
      {
        id: 'sys-core',
        name: 'Core System Directive',
        category: 'system',
        version: '1.0.0',
        templateText: CORE_SYSTEM_PROMPT,
        variables: ['domain', 'purpose']
      },
      {
        id: 'usr-website-scan',
        name: 'Website Scan User Prompt',
        category: 'user',
        version: '1.0.0',
        templateText: WEBSITE_SCAN_USER_PROMPT,
        variables: ['domain', 'framework', 'statusCode']
      },
      {
        id: 'shd-json-format',
        name: 'Shared JSON Format Fragment',
        category: 'shared',
        version: '1.0.0',
        templateText: JSON_SCHEMA_SHARED_PROMPT,
        variables: []
      }
    ];
  }
}
