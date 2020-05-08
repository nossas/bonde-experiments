import gql from "graphql-tag";
import { client as GraphQLAPI } from "../../../graphql";
import { createMobilizationWithTemplate } from './createMobilizationWithTemplate';
// import { replaceVariablesFromTemplate } from './replaceVariablesFromTemplate'

const MOBILIZATIONS_QUERY = gql`
query mobilizationExists($mobilization_name:String, $slug:String) {
  mobilizations(where: { _or: [
        {name: {_eq: $mobilization_name}},
        {slug: {_eq: $slug}}
      ]
  }) {
    id
    name
    custom_domain
    slug
  }
}`;

export const checkMobilizationExistence = async (element) => {
  const mobilization_name = element.institution_type + " " + element.institution_name;
  // const custom_domain = (element.slug === undefined ? slugify(mobilization_name) : element.slug) + ".semaulasemenem.org.br";
  // console.log(mobilization_name,custom_domain);
  const { data: { mobilizations } } = await GraphQLAPI.query({
    query: MOBILIZATIONS_QUERY,
    variables: { mobilization_name, slug: slugify(mobilization_name) }
  });

  let refMobilization: any = {
    isNew : false
  }

  // console.log(element, mobilizations);
  if (mobilizations.length === 0) {
    const mob = {
      "mobilization": {
        "name": mobilization_name,
        // "custom_domain": custom_domain,
        "slug": slugify(mobilization_name),
        "goal": "Mobilização dos estudantes pelo adiamento do Enem.",
        "city": element.state,
        "community_id": process.env.COMMUNITY_ID || 1
      }
    };
    refMobilization = await createMobilizationWithTemplate(mob)
    refMobilization.isNew = true;
    // await replaceVariablesFromTemplate(refMobilization);
    return refMobilization;
  } else {
    refMobilization = Object.assign(refMobilization, mobilizations[0])
    return refMobilization;
  }

  // console.log(mobilizations);
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
