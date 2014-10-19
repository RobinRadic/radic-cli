# radic-cli
- Current version: ` 0.0.1 `
- Status: **under development**
- License: [MIT Licensed](http://radic.mit-license.org)
- Copyright 2014 [Robin Radic](https://github.com/RobinRadic)
- Platform: **Linux** but might run on a crapple, not tested yet. 

## Description
radic-cli is a NodeJS module that can be embedded into other projects to handle command line input/output. 
It consists out of several other modules and brings them together, **the way i want it**. The main focus i have is user interaction like wizards and cli UIs. 

radic-cli features a stand-alone application next to the embeddable features. The stand alone application can be invoked by the command `radic-cli` and will give you an overview of possible commands.



## Overview of main features

#### Bash PS1 and PS2 prompt
```bash
$ radic-cli ps1
```
Adds a custom ps1 and ps2 prompt to bash. Makes use of the [liquidprompt](https://github.com/nojhan/liquidprompt) library internally. It's also possible to export the theme so you can modify it to suit your needs.

![radic-cli custom ps1 prompt](https://raw.githubusercontent.com/RobinRadic/radic-cli/master/bash-prompt.jpeg)


#### Wizards
An example of what can be created. The preview shows `radic gitinit` from my [radic](http://npmjs.org/package/radic) tool, which utilizes radic-cli.

![radic gitinit preview](https://raw.githubusercontent.com/RobinRadic/radic-cli/master/wizard1.jpeg)

![radic gitinit preview2](https://raw.githubusercontent.com/RobinRadic/radic-cli/master/wizard2.jpeg)

#### UI's
Fast and painless UI creation with using blessed in the background. It uses pre-defined theme's, styles and widgets to quickly display content. Custom theme/style/widgets creation is supported and are able to inherit/extend from others. 

## Integration into existing project
```js


```



## Credits
- **radic-cli**: Robin Radic
- **async**: ..
- **blessed**: ..
- **celeri**: ..
- **cli**: ..
- **cli-color**: ..
- **cli-table**: ..
- **fs-extra**: ..
- **inquirer**: ..
- **moment**: ..
- **nconf**: ..
- **underscore**: ..
