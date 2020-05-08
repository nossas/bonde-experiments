import gql from "graphql-tag";
import { client as GraphQLAPI } from "../../../graphql";

const MOBILIZATIONS_QUERY = gql`
query mobilizationExists($mobilization_name:String) {
  mobilizations(where: {name: {_eq: $mobilization_name}}) {
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

export const checkMobilizationExistence = async (mobilization_name) => {
  const { data: { mobilizationExists } } = await GraphQLAPI.query({
    query: MOBILIZATIONS_QUERY,
    variables: { mobilization_name }
  });

  return mobilizationExists;
};

