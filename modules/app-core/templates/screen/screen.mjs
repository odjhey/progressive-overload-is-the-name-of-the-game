const dir = 'src/ui/screens'
const templateDir = 'templates/screen'

const screen = {
  description: '⚛ screen',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'screen name',
    },
  ],
  actions: [
    {
      type: 'add',
      path: `${dir}/{{kebabCase name}}/{{kebabCase name}}.screen.ts`,
      templateFile: `${templateDir}/screen-template.hbs`,
    },
    {
      type: 'add',
      path: `${dir}/{{kebabCase name}}/{{kebabCase name}}.types.ts`,
      templateFile: `${templateDir}/screen-types-template.hbs`,
    },
    {
      type: 'modify',
      path: `${dir}/../screens.types.ts`,
      pattern: /\/\* tag: screens-end \*\//,
      template:
        "  | 'screens/{{kebabCase name}}/temp' // @todo update me\n/* tag: screens-end */",
    },
  ],
}

const generator = (plop) => {
  plop.setDefaultInclude({ generators: true })
  plop.setGenerator('screen', screen)
}

export default generator
