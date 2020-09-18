import { delay } from 'https://deno.land/std/async/delay.ts';
import { map } from 'https://deno.land/x/rubico/rubico.js'
import is from "https://deno.land/x/is_type/mod.ts";

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
    "authorization": "Bearer ",
    "content-type": "application/json",
  },
  "body": JSON.stringify({
    query,
  }),
  "method": "POST",
});

const data = await resp.json();

// https://cluster.bonde.org/v2-beta
let dockerComposeTemplate =
`version: '2'
services:`;

let dockerComposeServiceTemplate = (element_name:any, validatedDNS:any) => `
  ${slugify(element_name)}:
    image: nossas/bonde-public:0.17.2
    environment:
      REACT_APP_DOMAIN_API_REST: https://api-v1.bonde.org
      REACT_APP_DOMAIN_PUBLIC: bonde.org
      AWS_ACCESS_KEY_ID: 
      AWS_BUCKET: bonde-assets
      AWS_SECRET_ACCESS_KEY: 
      GOOGLE_FONTS_API_KEY: 
      REACT_APP_DOMAIN_API_GRAPHQL: https://api-v2.bonde.org/graphql
      NEW_RELIC_HOME: ./src
      NEW_RELIC_LICENSE_KEY: 
      NODE_ENV: production
      NODE_MODULES_CACHE: 'false'
      NO_VHOST: '1'
      NPM_CONFIG_PRODUCTION: 'false'
      REACT_APP_PAGARME_KEY: 
      PORT: '5001'
      REDIS_URL: redis://redis:6379
      VALIDATE_REGION: sa-east-1
      WEB_CONCURRENCY: '1'
      WEB_MEMORY: '256'
    command:
    - yarn
    - start
    labels:
      traefik.frontend.rule: Host:${validatedDNS.map((c:any) => c.custom_domain).join(',')};
      traefik.enable: 'true'
      traefik.port: '5001'
      traefik.acme: 'true'`;

const dockerComposeService = (element:any, validatedDNS:any) => {
  if (validatedDNS.length >= 50) {
    let dockerComposeContent:string = '',i:number,j:number,temparray:any,chunk = 50;
    for (i=0,j=validatedDNS.length; i<j; i+=chunk) {
      temparray = validatedDNS.slice(i,i+chunk);
      dockerComposeContent += dockerComposeServiceTemplate(`${element.name} ${Math.round(i/chunk)+1}`, temparray)
    }
    return dockerComposeContent;
  } else {
    return dockerComposeServiceTemplate(element.name, validatedDNS)
  }
}

const checkIP = async (m:any) => {
  // console.log(`validating DNS ${m.custom_domain}`);
  // await delay(4000)
  // https://stackoverflow.com/a/58299823/397927
  try {
    const r = await fetch(`https://dns.google/resolve?name=${m.custom_domain}`);
    const geoip = await r.json();
    // if (is(geoip.Answer) === 'Array' && geoip.Answer[0].data === '50.19.148.209') {
    if (is(geoip.Answer) === 'Array' && geoip.Answer[0].data === '54.156.173.29') {
      return m;
    }
  } catch (error) {
    // console.log(error);    
  }

  return {}
}

const validatedServices = await map(async (element:any) => {
    const { dns_hosted_zones, mobilizations } = element
    const allowedDomains = dns_hosted_zones.map((d:any) => d.domain_name);
    const generatedCertificates = mobilizations.filter((m:any) => allowedDomains.filter((d:any) => m.custom_domain.includes(d)));
    const validatedDNS: any[] = []
    for (let post of generatedCertificates) {
      validatedDNS.push(await checkIP(post));
    }
    return validatedDNS.length > 0 && typeof validatedDNS[0].custom_domain !== 'undefined' ? dockerComposeService(element, validatedDNS) : '';
})(data.data.communities)

console.log(dockerComposeTemplate + validatedServices.join(""))

// replicar dominios com www e sem no template docker compose
// atualizar no rancher serviços com novos dominios da comunidade
// criar página com botão para disparar sincronização
// replicar lógica de gerar certificados para domínios da mobilização