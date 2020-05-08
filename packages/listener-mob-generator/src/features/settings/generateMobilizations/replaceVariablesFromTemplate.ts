import gql from "graphql-tag";
import { client as GraphQLAPI } from "../../../graphql";

// const WIDGETS_MUTATION = gql`
// mutation update_widgets($forms: [Int!]) {
//   update_widgets(
//     _set: { settings: true }
//     where: { id: { _in: $forms } }
//   ) {
//     returning {
//       id
//       updated_at
//     }
//   }
// }`;

const WIDGETS_QUERY = gql`
query widgetsFromMob($mobilization_id:Int) {
  mobilizations(where: {id: {_eq: $mobilization_id}}) {
    id
    name
    blocks(order_by: {position: asc}) {
      id
      widgets(where: {kind:{_eq:"content"}}) {
        id,
        settings
      }
    }
  }
}`;

export const replaceVariablesFromTemplate = async (refMobilization) => {
  const { data: { widgetsFromMob } } = await GraphQLAPI.query({
    query: WIDGETS_QUERY,
    variables: { mobilization_id: refMobilization.id }
  })

  console.log(widgetsFromMob)
  return widgetsFromMob
}