{
  "Name": "Cadastro Sem Aula Sem Enem",
  "CreationDate": "2020-5-12",
  "Commands": [
    {
      "Command": "csvReadArray",
      "Target": "[relatório][formulário] sem aula sem enem.csv",
      "Value": "myCSV"
    },
    {
      "Command": "forEach",
      "Target": "myCSV",
      "Value": "row"
    },
    {
      "Command": "open",
      "Target": "https://semaulasemenem.org.br",
      "Value": ""
    },
    {
      "Command": "click",
      "Target": "name=input-field-1588860958854-55",
      "Value": ""
    },
    {
      "Command": "type",
      "Target": "name=input-field-1588860958854-55",
      "Value": "${row[3]}"
    },
    {
      "Command": "type",
      "Target": "name=input-field-1588860971126-48",
      "Value": "${row[6]}"
    },
    {
      "Command": "type",
      "Target": "name=input-field-1588860996818-24",
      "Value": "${row[1]}"
    },
    {
      "Command": "type",
      "Target": "name=input-field-1588861040051-78",
      "Value": "${row[0]}"
    },
    {
      "Command": "select",
      "Target": "name=input-field-1588861063724-23",
      "Value": "label=${row[2]}"
    },
    {
      "Command": "executeScript",
      "Target": "const evt = document.createEvent(\"HTMLEvents\"); evt.initEvent(\"change\", true, true); const el = document.getElementsByName(\"input-field-1588861063724-23\")[0]; el.dispatchEvent(evt);",
      "Value": ""
    },
    {
      "Command": "select",
      "Target": "name=input-field-1588861176318-77",
      "Value": "label=${row[5]}"
    },
    {
      "Command": "type",
      "Target": "name=input-field-1588861198345-77",
      "Value": "${row[4]}"
    },
    {
      "Command": "executeScript",
      "Target": "const evt = document.createEvent(\"HTMLEvents\"); evt.initEvent(\"change\", true, true); const el = document.getElementsByName(\"input-field-1588861176318-77\")[0]; el.dispatchEvent(evt);",
      "Value": ""
    },
    {
      "Command": "click",
      "Target": "xpath=//*[@id=\"block-14890\"]/div/div/div[1]/div/div[1]/div/form/div[8]/button",
      "Value": ""
    },
    {
      "Command": "assertText",
      "Target": "xpath=//*[@id=\"block-14890\"]/div/div/div[1]/div/div[1]/div/div/div/div[2]/span/span/strong/span/span",
      "Value": "Obrigada por criar sua campanha! "
    },
    {
      "Command": "pause",
      "Target": "3000",
      "Value": ""
    },
    {
      "Command": "end",
      "Target": "",
      "Value": ""
    }
  ]
}
