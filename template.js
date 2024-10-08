const Mustache = require('mustache');
const fs = require('fs');
const path = require('path');
const { input, number, select  } = require('@inquirer/prompts');

const template = fs.readFileSync('templates/fetch.ts.mustache', 'utf8');

function ensureDirExistence(file) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

(async () => {
  // Prompt
  const scriptName = await input({ message: 'Please enter the name for new script', required: true });
  const regions = await input({ 
    message: 'Please enter the regions for new script',
    required: true,
    default: 'global, us',
    transformer: (value) => value.split(',').map((item) => item.trim()).join(', '),
   });
  
  const tags = await input({
    message: 'Please enter the tags for new script',
    required: true,
    default: 'stream, live',
    transformer: (value) => value.split(',').map((item) => item.trim()).join(', '),
  });

  const priority = await number({ message: 'Please enter the priority for new script', default: 50, required: true});

  const is_mobile = await select({ message: 'Use User-Agent for mobile?', choices: [{ name: 'Yes', value: true }, { name: 'No', value: false }], required: true});

  const filepath = await input({ message: 'Please enter the path for new script, eg: new/example.ts', default: 'new/' + scriptName.toLowerCase().replace(/ /g, '_') + '.ts', required: true });

  // input data
  const view = {
    name: scriptName,
    regions: regions,
    tags: tags,
    priority: priority,
    is_mobile: is_mobile,
  }

  // Render the template with the data
  const output = Mustache.render(template, view)
  const path = `scripts/${filepath}`

  // Write the rendered template to a file
  ensureDirExistence(path);
  fs.writeFileSync(path, output, 'utf8')
})();