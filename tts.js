'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
const events = require('events');

class Tts extends events.EventEmitter {
    constructor(data) {
        super();
    }

    init(options) {
        let qs = require('querystring');

        let params = {};

        //required     
        params['text'] = options['text'];
        params['key'] = options['key'];

        //optional
        params['speaker'] = (options['speaker']) ? options['speaker'] : 'jane';
        params['format'] = (options['format']) ? options['format'] : 'mp3';
        params['quality'] = (options['quality']) ? options['quality'] : 'hi';
        params['platform'] = (options['platform']) ? options['platform'] : 'web';
        params['application'] = (options['application']) ? options['application'] : 'translate';
        params['lang'] = (options['lang']) ? options['lang'] : 'ru_RU';
        console.log('Text To Speech settings', params);

        return qs.stringify(params);
    };

    request(url, filePath, callback) {
        let request = require('request');
        let fs = require('fs');

        let yandex_tts_url = 'https://speech.kloud.one/tts?';

        let fullUrl = yandex_tts_url + url;

        function download(callback) {
            let file = fs.createWriteStream(filePath);

            file.on('finish', function () {
                file.close(callback);
            });

            request(fullUrl)
                .on('error', err => {
                    console.log('error');
                    if (err) {
                        callback(err);
                    }
                }).
                pipe(file);
        }

        download(callback);
    };
}

module.exports = Tts;