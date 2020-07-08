export type Activist = {
  id: number
  email: string
  name: string
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
}

export type Community = {
  id: number;
  mailchimp_api_key: string
  mailchimp_list_id: string
}

export type Mobilization = {
  id: number
  community: Community
}

export type Block = {
  mobilization: Mobilization
}

export type Widget = {
  id: number
  settings: any
  kind: string
  block: Block
}

export type ActivistInput = {
  email: string
  name: string
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
}