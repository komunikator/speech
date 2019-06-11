'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
const events = require('events');

class Speech extends events.EventEmitter {
    constructor(data) {
        super();

        // ********************* TTS ********************* //
        let ttsLib = require('./tts');
        this.tts = new ttsLib();

        // ********************* STT ********************* //
        let sttLib = require('./stt');
        this.stt = new sttLib();
        this.stt.on('sttInit', (err, data) => {
            this.emit('sttInit', { err: err, data: data});
        });
        this.stt.on('sttOn', (data) => {
            this.emit('sttOn', data);
        });
    }

    // ********************* TTS ********************* //
    textToSpeech(data) {
        if ( (typeof data.text != 'string') && (typeof data.text != 'number') ) {
            return data.cb('tts Incorrect text format');
        }
        if (!data.text) {
            return data.cb('tts Not found text');
        }
        if (!data.file) {
            return data.cb('tts Missing file name');
        }
        if (!data.key) {
            return data.cb('tts Missing key');
        }

        let obj = {
            text: data.text,
            key: data.key,
            file: data.file,
            speaker: data.speaker || '',
            quality: data.quality || '',
            platform: data.platform || '',
            application: data.application || '',
            lang: data.lang || '',
            format: 'wav'
        };

        if (data.voice) obj.speaker = data.voice;

        let request = this.tts.init(obj);
        this.tts.request(request, obj.file, data.cb);
    }

    // ********************* STT ********************* //
    isReadyStt() {
        return this.stt.isReady();
    }
    
    isConnectingStt() {
        return this.stt.isConnecting();
    }
    
    sttStop() {
        this.stt.stop();
    }

    sttInit(options) {
        if ( !this.stt.isReady() ) {
            if ( !this.stt.isConnecting() ) {
                if (!options || !options.developer_key) {
                    let err = 'sttInit not found options or developer_key'
                    console.warn(err);
                    return this.emit('sttInit', { err: err });
                }

                let settings = {
                    developer_key: options.developer_key,
                    model: options.model || 'general'
                };

                this.stt.init(settings);
            }
        }
    }

    speechToText(payload) {
        if ( this.stt.isReady() ) {
            this.stt.send(payload);
        }
    }
}

module.exports = Speech;
