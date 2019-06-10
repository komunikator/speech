### Speech - Библиотека для работы с сервисом синтеза и распознавания kloud.one

- Синтез речи
- Распознавание речи

#### Лицензия: 
GNU GPLv3

#### Описание:
- для корректной работы необходимо использовать Node.js версии >= v8.6.0
- рекомендованные операционные системы: Windows 8/Windows 10/ Ubuntu 16.04/ Debian 8.0.1/


#### Пример синтеза речи:
```sh
  let speechLib = require('index.js');
  let speech = new speechLib();

  speech.textToSpeech({
      text: 'Текст',
      file: 'filename.tmp',
      key: 'KEY',
      speaker: 'jane',
      cb: (err) => {
          if (err) {
              console.error(err);
          }
      }
  });
```
