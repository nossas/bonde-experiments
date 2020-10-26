import { pooledMap } from 'https://deno.land/std@0.70.0/async/pool.ts';
import { delay } from 'https://deno.land/std@0.70.0/async/delay.ts';

import * as log from "https://deno.land/std/log/mod.ts";

import { map } from 'https://deno.land/x/rubico@v1.3.1/es.js'
import { isArray } from "https://deno.land/x/is_what@v3.11.1b/dist/index.esm.js";

log.info(123456);

function createQueue(tasks: any, maxNumOfWorkers = 4) {
  var numOfWorkers = 0;
  var taskIndex = 0;

  return new Promise(done => {
    const handleResult = (index:number) => (result:any) => {
      tasks[index] = result;
      numOfWorkers--;
      getNextTask();
    };
    const getNextTask = () => {
      console.log('getNextTask numOfWorkers=' + numOfWorkers);
      if (numOfWorkers < maxNumOfWorkers && taskIndex < tasks.length) {
        tasks[taskIndex]().then(handleResult(taskIndex)).catch(handleResult(taskIndex));
        taskIndex++;
        numOfWorkers++;
        getNextTask();
      } else if (numOfWorkers === 0 && taskIndex === tasks.length) {
        done(tasks);
      }
    };
    getNextTask();
  });
}

const slugify = (string: string) => {
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

const query = `query myEntries($widgetId: Int) {
  communities(order_by: {created_at: desc}) {
    id
    name
    dns_hosted_zones(where: {ns_ok: {_eq: true}}) {
      id,
      domain_name
    }
    mobilizations(where: {custom_domain: {_neq: "null"}}){
      id,
      name,
      custom_domain
    }
  }
}`

const resp: Response = await fetch("https://api-graphql.bonde.org/v1/graphql", {
  "headers": {
    "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwb3N0Z3JhcGhxbCIsInJvbGUiOiJhZG1pbiIsInVzZXJfaWQiOjMxLCJpc19hZG1pbiI6MSwiaWF0IjoxNTk1NjAyNTgyLCJhdWQiOiJwb3N0Z3JhcGhpbGUifQ.j51nfJTw0HU2BMQD85L-DG48yg0mltSG8tC2_-Aqe48",
    "content-type": "application/json",
  },
  "body": JSON.stringify({
    query,
  }),
  "method": "POST",
});

const data = await resp.json();


const checkIP = async (m:any) => {
  // console.log(`validating DNS ${m.custom_domain}`);
  // https://stackoverflow.com/a/58299823/397927
  await delay(1000)
  let geoip = { Answer: [{data:''}]};
  try {
    const r = await fetch(`https://dns.google/resolve?name=${m.custom_domain}`);
    geoip = await r.json();
    console.log((isArray(geoip.Answer) && geoip.Answer[0].data === '54.156.173.29'));
    return ((isArray(geoip.Answer) && geoip.Answer[0].data === '54.156.173.29') ? m : false);
  } catch (error) {
    console.log(error);
    return false;
  }
}

// const createTask = value => () => {
//   if (value === 6) return Promise.reject(new Error('sorry'));
//   return new Promise(resolve => setTimeout(() => resolve(value), value));
// }

createQueue(data.data.communities.map((v:any) => checkIP(v))).then(result => console.log(result));


// https://cluster.bonde.org/v2-beta
let dockerComposeTemplate =
`version: '2'
services:`;

// sofisticar o valor do host do serviço para incluir domínios com www e sem www
let dockerComposeServiceTemplate = (element_name:any, validatedDNS:any) => `
  ${slugify(element_name)}:
    image: nossas/bonde-public-ts:0.3.2
    environment:
      REACT_APP_DOMAIN_API_REST: https://api-rest.bonde.org
      REACT_APP_DOMAIN_PUBLIC: bonde.org
      AWS_ACCESS_KEY_ID: AKIAIXSJEDJ4LKMWO2VQ
      AWS_BUCKET: bonde-assets
      AWS_SECRET_ACCESS_KEY: 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
      GOOGLE_FONTS_API_KEY: AIzaSyBcamsqE6nutNqMkB37TkJqOgqaAfKaM0o
      REACT_APP_DOMAIN_API_GRAPHQL: https://api-graphql.bonde.org/v1/graphql
      NODE_ENV: production
      REACT_APP_PAGARME_KEY: ek_live_Xb2ZtWGTWobBy541rZojEbuNNDEGuF
      PORT: '3000'
      VALIDATE_REGION: sa-east-1
      WEB_CONCURRENCY: '1'
      WEB_MEMORY: '256'
    command:
    - yarn
    - start
    labels:
      traefik.frontend.rule: Host:${validatedDNS.map((c:any) => c.custom_domain).join(',')};
      traefik.enable: 'true'
      traefik.port: '3000'
      traefik.acme: 'true'`;

const dockerComposeService = (community:any, validatedDNS:any) => {
  if (validatedDNS.length >= 50) {
    let dockerComposeContent:string = '',i:number,j:number,temparray:any,chunk = 50;
    for (i=0,j=validatedDNS.length; i<j; i+=chunk) {
      temparray = validatedDNS.slice(i,i+chunk);
      dockerComposeContent += dockerComposeServiceTemplate(`${community.name} ${Math.round(i/chunk)+1}`, temparray)
    }
    return dockerComposeContent;
  } else {
    return dockerComposeServiceTemplate(community.name, validatedDNS)
  }
}

// const validatedServices = map(async (community:any) => {
//     const { dns_hosted_zones, mobilizations } = community
//     const ownerDomains = dns_hosted_zones.map((d:any) => d.domain_name);

//     // checar se o dominio esta apontando para o ip correto
//     // const mobsToCertificatebyHTTP = async (): Promise<any[]> => await mobilizations.filter(async (m:any) => await checkIP(m, '54.156.173.29'));
//       // const mobsToCertificatebyHTTP = await pooledMap(1, mobilizations, checkIP);
//     const mobsToCertificatebyHTTP = Promise.all(async () => {
//       return await pooledMap(1, mobilizations, checkIP);

//     }).map(checkIP))
//     // const domainsToCertificatebyHTTP = mobsToCertificatebyHTTP.map((d:any) => d.custom_domain);

//     // checar se o dominio é gerado via http, se está cadastrado no BONDE e se está apontando para o ip correto
//     // const mm = mobilizations.filter((m:any) => domainsToCertificatebyHTTP.filter((d:any) => !m.custom_domain.includes(d)));
//     // const mmm = mm.filter((m:any) => ownerDomains.filter((d:any) => m.custom_domain.includes(d)));
//     // const mobsToCertificatebyDNS = mmm.filter((m:any) => {
//     //   if (checkIP(m, '50.19.148.209')) {
//     //     return m;
//     //   }
//     // });
//     // await delay(30000);
//     // mobsToCertificatebyHTTP.next().then(v => console.log(community.name, v));
//     console.log(mobsToCertificatebyHTTP);
//     const generateService = (community:any, mobs: AsyncIterableIterator<any>) => {
//       console.log(community.name, mobs.map((v) => v.custom_domain));
//       // return mobs.length > 0 && typeof mobs[0].custom_domain !== 'undefined' ? dockerComposeService(community, mobs) : '';
//     };

//     return generateService(community, mobsToCertificatebyHTTP);
//     // + generateService(community, mobsToCertificatebyDNS);

//     // salvar arquivos separados com as configuracoes

// })(data.data.communities)

// console.log(dockerComposeTemplate + validatedServices.join(""))
