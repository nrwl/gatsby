import { JsonObject } from '@angular-devkit/core';

export interface GatsbyPluginBuilderSchema extends JsonObject {
  host: string;
  port: string;
  open: boolean;
  https: boolean;
}
