import fetch from 'node-fetch';
// import gql from "graphql-tag";
// import { client as GraphQLAPI } from "../../../graphql";

const getTemplateBySate = (state) => {
  switch (state) {
    case "AC": return 288;
    case "AL": return 287;
    case "AP": return 285;
    case "AM": return 284;
    case "BA": return 283;
    case "CE": return 281;
    case "DF": return 292;
    case "ES": return 280;
    case "GO": return 265;
    case "MA": return 278;
    case "MT": return 295;
    case "MS": return 272;
    case "MG": return 268;
    case "PA": return 266;
    case "PB": return 267;
    case "PR": return 293;
    case "PE": return 269;
    case "PI": return 270;
    case "RJ": return 271;
    case "RN": return 273;
    case "RS": return 279;
    case "RO": return 277;
    case "RR": return 276;
    case "SC": return 286;
    case "SP": return 274;
    case "SE": return 289;
    case "TO": return 290;
    default: return 0;
  }
}

export const createMobilizationWithTemplate = async (mob) => {
  // const input = {
  //   uid: element.email,
  //   provider: 'email',
  //   email: element.email,
  //   first_name: element.first_name,
  //   last_name: element.last_name,
  //   admin: true,
  // };

  // const insertUserMutation = gql`mutation createUser ($input: [users_insert_input!]!) {
  //     insert_users(
  //       objects: $input,
  //       on_conflict: {
  //         constraint: users_email_key
  //         update_columns: [updated_at]
  //       }
  //     ) {
  //       returning {
  //         id
  //         email
  //         first_name
  //         admin
  //       }
  //     }
  //   }`;

  // const { data } = await GraphQLAPI.mutate({ mutation: insertUserMutation, variables: { input } });

  // const user = data.insert_users.returning[0];
  // mob.mobilization.traefik_backend_address = JSON.stringify({ user_id: user.id, state: mob.mobilization.city })

  // console.log('insere user', user, input);

  const createdMobilization = await fetch(`${process.env.API_REST_URL}/mobilizations`, {
    "headers": {
      "access-token": process.env.API_REST_TOKEN || '111111111',
      "content-type": "application/json;charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    "body": JSON.stringify(mob),
    "method": "POST"
  });

  const createdMobilizationJson = await createdMobilization.json()
  // .then(res => res.json()).catch(err => console.error(err));

  // console.log('createdMobilization', createdMobilization);


  const template_mobilization_id = getTemplateBySate(mob.mobilization.city)

  const t = JSON.stringify(Object.assign(createdMobilizationJson, {
    "mobilization": {
      "id": createdMobilizationJson.id,
      "template_mobilization_id": template_mobilization_id,
    }
  }));

  // console.log(t);
  const updatedMobilization = await fetch(`${process.env.API_REST_URL}/mobilizations/${createdMobilizationJson.id}`, {
    "headers": {
      "access-token": process.env.API_REST_TOKEN || '111111111',
      "content-type": "application/json;charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    "body": t,
    "method": "PUT"
  });

  const updatedMobilizationJson = await updatedMobilization.json();
  // .then(res => res.json()).catch(err => console.error(err));

  console.log('updatedMobilization', updatedMobilizationJson);

  return updatedMobilizationJson;
}
