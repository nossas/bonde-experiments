# Bonde Activists Module

Manage activists and their actions on the BONDE platform.

## Actions

Actions are decisively linked to Widgets that can be configured in the Mobilization Module. Action is the completion of the interaction between an Activist and a Mobilization.

### Kind Actions

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

### Mailchimp Integration

To synchronize an Action with your Mailchimp base, it is necessary to configure the integration in your Community by the BONDE platform.

**TODO:** Link to the tutorial "How to configure Community Integrations"

:heart_eyes: Made with love by ![Bonde](./bonde.svg)