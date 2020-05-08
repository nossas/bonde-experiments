import fetch from 'node-fetch';

export const createMobilizationWithTemplate = async (mob) => {
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
  }).then(res => res.json()).catch(err => console.error(err));

  // console.log('createdMobilization', createdMobilization);

  const updatedMobilization = await fetch(`${process.env.API_REST_URL}/mobilizations/${createdMobilization.id}`, {
    "headers": {
      "access-token": process.env.API_REST_TOKEN || '111111111',
      "content-type": "application/json;charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    "body": JSON.stringify(Object.assign(createdMobilization, { "mobilization": { "id": createdMobilization.id, "template_mobilization_id": 197 } })),
    "method": "PUT"
  }).then(res => res.json()).catch(err => console.error(err));

  // console.log('updatedMobilization', updatedMobilization);

  return updatedMobilization;
}
