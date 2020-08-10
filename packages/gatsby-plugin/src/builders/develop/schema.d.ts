import { JsonObject } from '@angular-devkit/core';

export interface GatsbyPluginBuilderSchema extends JsonObject {
  host?: string;
  port?: string;
  open?: boolean;
  https?: boolean;
  keyFile?: string;
  caFile?: string;
  openTracingConfigFile?: string;
  graphqlTracing?: boolean;
  json?: boolean;
  noColor: boolean;
}
