'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
const events = require('events');

let WebSocket = require('ws'),
    url = 'wss://speech.kloud.one/asrsocket.ws',
    settings = {
        uuid: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
                /[xy]/g,
                (c) => {
                    let r = Math.random() * 16 | 0;
                    let v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                }
        ),
        // model: 'queries', //'numbers', //'general',//'queries',
        model: 'queries',
        lang: 'ru-RU',
        format: "audio/x-pcm;bit=16;rate=8000",
        vad: false //???
    },
    ws;

let dialog_url = 'wss://speech.kloud.one/asrsocket.ws';
let bufSize = 1024,
dataBuf = new Int16Array(bufSize),
dataArr = [];

class Stt extends events.EventEmitter {
    constructor(data) {
        super();
    }

    send(data) {
        // console.log('data', data.length);
        if (!this.isReady())
            return;

        let copyLen = bufSize - dataArr.length;
        dataArr = dataArr.concat(data.slice(0, copyLen));

        if (dataArr.length == bufSize) {
            for (let i = 0; i < bufSize; i++)
                dataBuf[i] = dataArr[i];

            ws.send(dataBuf, {
                binary: true,
                mask: true
            });
            dataArr = data.slice(copyLen);
        }
    };

    isReady() {
        return (ws && ws.readyState == 1) //WebSocket.OPEN
    }

    isConnecting() {
        return (ws && ws.readyState == 0) //WebSocket.CONNECTING
    }

    stop() {
        if ( this.isReady() ) {
            ws.close();
        }
    }

    init(options) {
        if ( !(options && options.developer_key) ) {
            this.emit('sttInit', 'STT API key not found');
        }
        settings.apikey = options.developer_key;
        settings.key = settings.apiKey;

        if (options.model)
            settings.model = options.model;

        if (options.customGrammar) //for 'onthefly' model
            settings.customGrammar = options.customGrammar;
        else
            delete settings.customGrammar;

            if (!this.isReady()) {//WebSocket.OPEN
                if (options.to) {
                    ws = new WebSocket(dialog_url);
                } else {
                    ws = new WebSocket(url);
                }
            }
        ws.readyState = 0;
        let sessionId;

        ws.on('open', () => {
            console.log('Stt Websocket open');
            console.log('Send settings', settings);

            ws.send(JSON.stringify({
                type: 'message',
                data: settings
            }));
        });

        ws.on('close', () => {
            console.log('Stt Websocket close');
            this.emit('sttInit', null, {sessionId: sessionId, state: 'closed'});
        });

        ws.on('error', (err) => {
            console.error('Websocket Error', err);
            this.emit('sttInit', 'Stt init. Websocket Error' + JSON.stringify(err));
        });

        let lastText = '';
        let lastTime = Date.now();
        ws.on('message', (message) => {
            console.log('received: %s', message);

            let obj;
            try {
                obj = JSON.parse(message);
            } catch (err) {
                this.emit('sttInit', err);
            };

            if (obj)
                switch (obj.type) {
                    case 'Error':
                        this.emit('sttInit', obj.data);
                        break;

                    case 'InitResponse':
                        sessionId = obj.data.sessionId;
                        this.emit('sttInit', null, obj.data);
                        break;

                    case 'AddDataResponse':
                        if (obj.data.text && obj.data.uttr) {
                            this.emit('sttOn', { text: obj.data.text});
                            lastText = obj.data.text;
                        }
                        lastTime = Date.now();
                }
        });
    };
}

module.exports = Stt;