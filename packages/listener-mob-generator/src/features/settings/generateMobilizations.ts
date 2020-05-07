import gql from "graphql-tag";
import { client as GraphQLAPI } from "../../graphql";

const WIDGET_MUTATION = gql`
mutation update_widgets($forms: [Int!]) {
  update_widgets(
    _set: { rede_syncronized: true }
    where: { id: { _in: $forms } }
  ) {
    returning {
      id
      updated_at
    }
  }
}
`;

const generateMobilizations = async (individuals: any): Promise<any> => {
  try {
    const createdMobilization = await fetch("https://api-rest.bonde.devel/mobilizations", {
      "headers": {
        "access-token": "",
        "content-type": "application/json;charset=UTF-8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
      },
      "referrer": "https://app.bonde.devel/mobilizations/new",
      "referrerPolicy": "no-referrer-when-downgrade",
      "body": "{\"mobilization\":{\"name\":\"c\",\"slug\":\"c\",\"goal\":\"c\",\"community_id\":8}}",
      "method": "POST",
      "mode": "cors"
    });

    const updatedMobilization = await fetch("https://api-rest.bonde.devel/mobilizations/1399", {
      "headers": {
        "access-token": "",
        "content-type": "application/json;charset=UTF-8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
      },
      "referrer": "https://app.bonde.devel/mobilizations/1399/templates/choose/custom",
      "referrerPolicy": "no-referrer-when-downgrade",
      "body": `{"mobilization":{"id":${createdMobilization['data'].id},"template_mobilization_id":197}}`,
      "method": "PUT",
      "mode": "cors"
    });

    const { data: { update_widgets: { returning } } } = await GraphQLAPI.mutate({
      mutation: WIDGET_MUTATION,
      variables: { individuals }
    })

    return returning
  } catch (err) {
		console.error('failed on generate mobilizations: '.red, err)
		return undefined
	}
}

export default generateMobilizations;

// OI FNAME,

// Estamos juntos na luta por um ENEM mais justo! Aqui está o site com a pressão direta nos deputados do seu estado. Divulgue entre os outros alunos e vamos fazer barulho para que os parlamentares saibam que não daremos nenhum passo para trás no sonho de uma universidade mais plural. Você pode acessá-lo aqui: link

// Preparamos também uma cartilha com algumas dicas sobre como colocar no mundo uma campanha de sucesso. Para acessar o material, é só clicar no aqui: link

// Ativistas do Nossas, uma das organizações a frente da campanha, vão se reunir via Zoom com todos os estudantes que quiserem compartilhar suas experiências na campanha. Se você quiser se juntar, será dia xx às xx horas. É só acessar esse link no horário indicado: link

// Vamos nessa!
