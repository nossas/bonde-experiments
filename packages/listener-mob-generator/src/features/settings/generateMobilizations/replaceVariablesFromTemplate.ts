import gql from "graphql-tag";
import { client as GraphQLAPI } from "../../../graphql";
import _ from 'underscore';

const WIDGETS_MUTATION = gql`
mutation saveWidget($widget_id:Int, $settings: String){
  update_widgets(
      _set: { settings: $settings }
      where: { id: { _eq: $widget_id } }
    ) {
      returning {
        id
        updated_at
      }
    }
}`;

const WIDGETS_QUERY = gql`
query widgetsFromMob($mobilization_id:Int) {
  mobilizations(where: {id: {_eq: $mobilization_id}}) {
    blocks(order_by: {position: asc}) {
      widgets {
        id,
        settings,
        kind
      }
    }
  }
}`;

export const replaceVariablesFromTemplate = async (element, refMobilization) => {
  const { data: { mobilizations } } = await GraphQLAPI.query({
    query: WIDGETS_QUERY,
    variables: { mobilization_id: Number(refMobilization.id) }
  })

  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  // console.log(refMobilization, mobilizations)
  mobilizations.forEach(m => {
    m.blocks.forEach(b => {
      b.widgets.forEach(async w => {
        // console.log(w)
        if (w.kind === 'content') {
          const template = _.template(w.settings);
          w.settings = template({
            NOME_ATIVISTA: element.first_name,
            SOBRENOME_ATIVISTA: element.last_name,
            "TIPO_INSTITUIÇÃO": getInstitution(element.institution_type),
            "NOME_INSTITUIÇÃO": element.institution_name
          });
        } else if (w.kind === 'pressure') {
          const template = _.template(w.settings);
          w.settings = template({
            "LINK_MOBILIZATION": `http://www.${refMobilization.slug}.bonde.org`
          });
        }
        const { data: { update_widgets: { returning } } } = await GraphQLAPI.mutate({
          mutation: WIDGETS_MUTATION,
          variables: { widget_id: Number(w.id), settings: w.settings }
        })
        console.log(returning);

      });
    });
  });
  return mobilizations
}

const getInstitution = (institution_type) => {
  switch (institution_type) {
    case "Instituto":
      return "do Instituto";
    case "Centro Educacional":
      return "do Centro Educacional";
    case "Escola":
      return "da Escola";
    case "EJA":
      return "do EJA";
    case "Pré Vestibular":
      return "do Pré Vestibular";

    default:
      return institution_type;
  }
}