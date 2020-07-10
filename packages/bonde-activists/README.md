# Bonde Activists Module

Manage activists and their actions on the BONDE platform.

## Get started

### Basic commands:

**Setup package:**

- Clone repository: `git clone https://github.com/nossas/bonde-experiments.git`
- Open folder project: `cd bonde-experiments`
- Install global pnpm: `yarn global add pnpm`
- Install dependencies of package: `pnpm m i --filter bonde-activists`

**Run Unit Tests:**

- Run all tests: `pnpm m run coverage --filter bonde-activists`

**Run Development Server:**
- Configure a file `.env` with `GRAPHQL_HTTP_URL` and `HASURA_SECRET` to connect on Bonde API (API-GraphQL)
- Running API on port 3000: `pnpm m run dev --filter bonde-activists`

### How to test integration

We recommend using API-GraphQL at https://api-graphql.staging.bonde.org, you can publish a version to staging using the Continuous Integration or configure access to your local API with a tunnel like [ngrok](https://ngrok.com/).

## Concepts

### Actions

Actions are decisively linked to Widgets that can be configured in the Mobilization Module. Action is the completion of the interaction between an Activist and a Mobilization.

#### Kind Actions

Regardless of its Kind, the entire Action needs information about the ActivistInput, the WidgetID and the Input that will be used in processing the Action.

```
type Activist = {
  email: string
  name: string
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
}

interface BaseActionArgs {
  input: any
  activist: ActivistInput
  widget_id: number
}
```

- Donation
- Pressure (Phone / Email)
- Forms (Petition)

#### Mailchimp Integration

To synchronize an Action with your Mailchimp base, it is necessary to configure the integration in your Community by the BONDE platform.

**TODO:** Link to the tutorial "How to configure Community Integrations"

:heart_eyes: Made with love by ![Bonde](./bonde.svg)