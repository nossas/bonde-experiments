import gql from "graphql-tag";
import { client as GraphQLAPI } from "../../../graphql";
import { createMobilizationWithTemplate } from './createMobilizationWithTemplate';

const MOBILIZATIONS_QUERY = gql`
query mobilizationExists($mobilization_name:String, $custom_domain:String) {
  mobilizations(where: { _or: [
        {name: {_eq: $mobilization_name}},
        {custom_domain: {_eq: $custom_domain}}
      ]
  }) {
    id
    name
    custom_domain
    blocks(order_by: {position: asc}) {
      id
      widgets(where: {kind:{_eq:"content"}}) {
        id,
        settings
      }
    }
  }
}`;

export const checkMobilizationExistence = async (element) => {
  const mobilization_name = element.institution_type + " " + element.institution_name;
  const custom_domain = (typeof element.slug === undefined || element.slug === 'null' || element.slug.length === 0 ? slugify(mobilization_name) : element.slug) + ".semaulasemenem.org.br";

  const { data: { mobilizations } } = await GraphQLAPI.query({
    query: MOBILIZATIONS_QUERY,
    variables: { mobilization_name, custom_domain }
  });

  let refMobilization: any = {
    isNew : false
  }

  console.log(element, typeof mobilizations, mobilizations)

  if (typeof mobilizations === undefined || mobilizations.length === 0) {
    const mob = {
      "mobilization": {
        "name": mobilization_name,
        "custom_domain": custom_domain,
        "goal": "Mobilização dos estudantes pelo adiamento do Enem.",
        "city": element.state,
        "community_id": process.env.COMMUNITY_ID || 1
      }
    };
    refMobilization = await createMobilizationWithTemplate(mob)
    refMobilization.isNew = true;
  } else {
    refMobilization = Object.assign(refMobilization, mobilizations)
  }

  // console.log(mobilizations);
  return refMobilization;
};

function slugify(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return string.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}
