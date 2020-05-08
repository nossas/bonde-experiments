import { checkMobilizationExistence } from './generateMobilizations/checkMobilizationExistence';
import { sendEmail } from './generateMobilizations/sendEmail';
import { replaceVariablesFromTemplate } from './generateMobilizations/replaceVariablesFromTemplate'

const generateMobilizations = async (individuals: any): Promise<any> => {
  try {
    return await individuals.forEach(async element => {

      const refMobilization = await checkMobilizationExistence(element);

    await replaceVariablesFromTemplate(element, refMobilization);

      await sendEmail({ form: element, mob: refMobilization })
    });
  } catch (err) {
    console.error('failed on generate mobilizations: '.red, err)
    return undefined
  }
}

export default generateMobilizations;
