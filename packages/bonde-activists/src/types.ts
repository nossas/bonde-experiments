export type Activist = {
  id: number
  email: string
  name: string
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
};

export type ActivistPressure = {
  id: number
  created_at: string
};

export type Community = {
  id: number
  mailchimp_api_key?: string
  mailchimp_list_id?: string
  email_template_from?: string
};

export type Mobilization = {
  id: number
  community: Community
};

export type Block = {
  mobilization: Mobilization
};

export type Widget = {
  id: number
  settings: any
  kind: string
  block: Block
};

export type ActivistInput = {
  email: string
  name: string
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
};

export type Field = {
  uid: string
  kind: string
  label: string
  placeholder: string
  required: boolean
  value: string
};

export type FormEntryInput = {
  fields: Field[]
}

export interface IBaseAction<T> {
  action?: T
  activist: Activist
  widget: Widget
};

export interface IBaseActionArgs {
  input?: any
  activist: ActivistInput
  widget_id: number
};

export interface IPreviousData {
  activist: Activist
  widget: Widget
};

export interface IActionData {
  data: any
  syncronize: DoneAction
};

export interface IResolverData {
  data: any
};

export type DoneAction = () => Promise<any>;
export type Resolver = (_: void, args: IBaseActionArgs) => Promise<IResolverData>;
export type Previous = (args: IBaseActionArgs) => Promise<IPreviousData>;
export type Action = <T>(args: IBaseAction<T>) => Promise<IActionData>;
export type Next = <T>(args: IBaseAction<T>, done: DoneAction) => Promise<any>;