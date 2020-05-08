import * as nodemailer from 'nodemailer';

export const sendEmail = async (element) => {
  const textEmail = element.mob.isNew ? `Oi ${element.form.first_name},

  Estamos juntos na luta por um Enem mais justo! Aqui está o site com a pressão direta nos deputados do seu estado. Divulgue entre os outros alunos e vamos fazer barulho para que os parlamentares saibam que não daremos nenhum passo para trás no sonho de uma universidade mais plural. Você pode acessá-lo aqui: ${element.mob.custom_domain}

  Preparamos também algumas dicas para você colocar no mundo uma campanha de sucesso.

  1. Faça um textinho de divulgação da campanha e envie em todos os grupos de whatsapp da sua escola. Não se esqueça de inserir o link da campanha!
  2. Sua escola tem um grêmio? Peça ajuda na divulgação!
  3. Há alguma base de contatos de emails dos estudantes? Peça para o responsável enviar a campanha por email para todos participarem.
  4. Poste em suas redes sociais a campanha e desafie seus amigos a fazerem o mesmo!

  Vamos nessa!

  Vitória do Nossas` : `Oi ${element.form.first_name},

  Estamos juntos na luta por um Enem mais justo! Vimos aqui que já existe uma campanha de pressão criada por um estudante da sua escola. Vamos fortalecer ela? Aqui está o site para você poder fazer uma pressão direta nos deputados do seu estado: ${element.mob.custom_domain}

  Vamos nessa!

  Vitória do Nossas`
  const htmlEmail = element.mob.isNew ? `<p>Oi ${element.form.first_name},</p>
  <p>Estamos juntos na luta por um Enem mais justo! Aqui está o site com a pressão direta nos deputados do seu estado. Divulgue entre os outros alunos e vamos fazer barulho para que os parlamentares saibam que não daremos nenhum passo para trás no sonho de uma universidade mais plural. <strong>Você pode acessá-lo aqui: <a href="${element.mob.custom_domain}">${element.mob.custom_domain}</a></strong></p>
  <p><strong>Preparamos também algumas dicas para você colocar no mundo uma campanha de sucesso.</strong></p>
  <p>1. Faça um textinho de divulgação da campanha e envie em todos os grupos de whatsapp da sua escola. Não se esqueça de inserir o link da campanha!</p>
  <p>2. Sua escola tem um grêmio? Peça ajuda na divulgação!</p>
  <p>3. Há alguma base de contatos de emails dos estudantes? Peça para o responsável enviar a campanha por email para todos participarem.</p>
  <p>4. Poste em suas redes sociais a campanha e desafie seus amigos a fazerem o mesmo!</p>
  <p>Vamos nessa!</p>
  <p>Vitória do Nossas</p>` : `<p>Oi ${element.form.first_name},</p>
  <p>Estamos juntos na luta por um Enem mais justo! Vimos aqui que já existe uma campanha de pressão criada por um estudante da sua escola. Vamos fortalecer ela? <strong>Aqui está o site para você poder fazer uma pressão direta nos deputados do seu estado: <a href="${element.mob.custom_domain}">${element.mob.custom_domain}</a></strong></p>
  <p>Vamos nessa! </p>
  <p>Vitória do Nossas</p>`
  const subjectEmail = element.mob.isNew ? `#SemAulaSemENEM: Clique para acessar seu site de pressão!` : `#SemAulaSemENEM: Clique para acessar seu site de pressão!`

  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp://fake-smtp.bonde.devel',
    port: process.env.SMTP_PORT || 1025,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  });

  return await transporter.sendMail({
    from: '"Vitória do Nossas" <vitoria@nossas.org>',
    to: element.form.email,
    subject: subjectEmail,
    text: textEmail,
    html: htmlEmail
  });
}