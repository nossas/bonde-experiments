import fetch from 'node-fetch';
import * as nodemailer from 'nodemailer';
import gql from "graphql-tag";
import { client as GraphQLAPI } from "../../graphql";

// const WIDGETS_MUTATION = gql`
// mutation update_widgets($forms: [Int!]) {
//   update_widgets(
//     _set: { rede_syncronized: true }
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

const generateMobilizations = async (individuals: any): Promise<any> => {
  try {
    individuals.forEach(async element => {
      // console.log(element);
      const mob = {
        "mobilization": {
          "name": element.institution_type + " " + element.institution_name,
          "custom_domain": element.slug + ".semaulasemenem.org.br",
          "goal": "c",
          "community_id": process.env.COMMUNITY_ID || 1
        }
      };

      const { data: { mobilizationExists } } = await GraphQLAPI.query({
        query: MOBILIZATIONS_QUERY,
        variables: { mobilization_name: element.institution_type + " " + element.institution_name }
      })

      console.log('mobilizationExists', mobilizationExists)

      let refMobilization: any = {};

      if (typeof mobilizationExists.length !== undefined && mobilizationExists.length < 0){
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

        refMobilization = updatedMobilization
      } else {
        refMobilization = mobilizationExists
      }

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp://fake-smtp.bonde.devel',
        port: process.env.SMTP_PORT || 1025,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"Sem Aula Sem Enem" <nao-responda@semaulasemenem.org.br>', // sender address
        to: element.email, // list of receivers
        subject: "Hello ✔", // Subject line
        text: `OI ${element.first_name},

Estamos juntos na luta por um ENEM mais justo! Aqui está o site com a pressão direta nos deputados do seu estado. Divulgue entre os outros alunos e vamos fazer barulho para que os parlamentares saibam que não daremos nenhum passo para trás no sonho de uma universidade mais plural. Você pode acessá-lo aqui: ${refMobilization.custom_domain}

Preparamos também uma cartilha com algumas dicas sobre como colocar no mundo uma campanha de sucesso. Para acessar o material, é só clicar no aqui: link

Ativistas do Nossas, uma das organizações a frente da campanha, vão se reunir via Zoom com todos os estudantes que quiserem compartilhar suas experiências na campanha. Se você quiser se juntar, será dia xx às xx horas. É só acessar esse link no horário indicado: link

Vamos nessa!`, // plain text body
        html: `<p>OI ${element.first_name},</p>
<p>Estamos juntos na luta por um ENEM mais justo! Aqui está o site com a pressão direta nos deputados do seu estado. Divulgue entre os outros alunos e vamos fazer barulho para que os parlamentares saibam que não daremos nenhum passo para trás no sonho de uma universidade mais plural. Você pode acessá-lo aqui: <a href="${refMobilization.custom_domain}">${refMobilization.custom_domain}</a></p>
<p>Preparamos também uma cartilha com algumas dicas sobre como colocar no mundo uma campanha de sucesso. Para acessar o material, é só clicar no aqui: link</p>
<p>Ativistas do Nossas, uma das organizações a frente da campanha, vão se reunir via Zoom com todos os estudantes que quiserem compartilhar suas experiências na campanha. Se você quiser se juntar, será dia xx às xx horas. É só acessar esse link no horário indicado: link</p>
<p>Vamos nessa!</p>` // html body
      });

      console.log("Message sent: %s", info);

      const { data: { widgetsFromMob } } = await GraphQLAPI.query({
        query: WIDGETS_QUERY,
        variables: { mobilization_id: refMobilization.id }
      })

      console.log(widgetsFromMob)
    });

    return
  } catch (err) {
    console.error('failed on generate mobilizations: '.red, err)
    return undefined
  }
}

export default generateMobilizations;