export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date';

export interface ValidationRules {
  required?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
  email?: boolean;
  passwordRule?: boolean;
}

export interface DerivedFieldConfig {
  parents: string[];
  formula: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  defaultValue?: any;
  options?: string[];
  validations?: ValidationRules;
  derived?: DerivedFieldConfig | null;
}

export interface FormSchema {
  id: string;
  name: string;
  createdAt: string;
  fields: FormField[];
}
