import { checkMobilizationExistence } from './generateMobilizations/checkMobilizationExistence';
import { createMobilizationWithTemplate } from './generateMobilizations/createMobilizationWithTemplate';
import { sendEmail } from './generateMobilizations/sendEmail';
import { replaceVariablesFromTemplate } from './generateMobilizations/replaceVariablesFromTemplate'

const generateMobilizations = async (individuals: any): Promise<any> => {
  try {
    individuals.forEach(async element => {
      const mobilization_name = element.institution_type + " " + element.institution_name;
      const custom_domain = element.slug + ".semaulasemenem.org.br";
      const mob = {
        "mobilization": {
          "name": mobilization_name,
          "custom_domain": custom_domain,
          "goal": "c",
          "community_id": process.env.COMMUNITY_ID || 1
        }
      };
      const mobilizationExists = await checkMobilizationExistence(mobilization_name);

      let refMobilization: any = {
        isNew : false
      }
      if (typeof mobilizationExists.length !== undefined && mobilizationExists.length < 0) {
        refMobilization = createMobilizationWithTemplate(mob)
        refMobilization.isNew = true;
      } else {
        refMobilization = Object.assign(refMobilization, mobilizationExists)
      }

      await replaceVariablesFromTemplate(refMobilization);

      await sendEmail({ form: element, mob: refMobilization })
    });

    return
  } catch (err) {
    console.error('failed on generate mobilizations: '.red, err)
    return undefined
  }
}

export default generateMobilizations;