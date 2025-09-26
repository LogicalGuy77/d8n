export interface NodeSchema {
  label: string;
  type: string;
  node_data?: Record<string, any>;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}