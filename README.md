### Speech - Библиотека для работы с сервисом синтеза и распознавания kloud.one

- Синтез речи
- Распознавание речи

#### Лицензия: 
MIT

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

#### Пример распознавания речи:
```sh
let speechLib = require('index.js');
let speech = new speechLib();

speech.on('sttInit', (err, data) => {
    if (err) {
        return console.warn('get event sttInit error', data.err);
    }
    console.log('get event sttInit', data);
});

speech.on('sttOn', (data) => {
    console.log('sttOn data.text', data.text);

    speech.sttStop();
});

function initSpeech() {
    let options = {
        developer_key: 'developer_key',
        model: 'general'
    };
    return speech.sttInit(options);
}


setInteravl(() => {
    if ( !speech.isReadyStt() ) {
        return initSpeech();
    }
    speech.speechToText([-8,0,0,-8,-8]); // Array 16-bit linear PCM 
}, 50);
```
