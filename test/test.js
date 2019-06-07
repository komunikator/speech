'use strict';

let speechLib = new require('..');
let fs = require('fs');
let developerKey = '';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

describe('Text To Speech To Text', function() {

    /*
    it('Text To Speech', function(done) {
        this.timeout(60000);

        let filename = 'test/text2speech';
        let dataToCheck = '157157157';
        let speech = new speechLib();

        speech.textToSpeech({
            text: dataToCheck,
            file: filename + '.tmp',
            key: developerKey,
            speaker: 'jane',
            cb: (err, data) => {
                fs.unlinkSync(filename + '.tmp');

                if (err) {
                    done(err);
                } else {
                    done();
                }
            }
        });
    });

    it('Speech To Text', function(done) {
        this.timeout(60000);

        let g711 = new (require('./lib/media/G711').G711)();
        let player_1 = require('./lib/media/player');
        let filename = 'test/speech2text';
        let dataToCheck = '157157157';
        let timer;
        let speech = new speechLib();

        speech.on('sttInit', (data) => {
            if (data.err) {
                console.warn('get event sttInit error', data.err);
            }
            console.log('get event sttInit', data.data);
        });

        speech.on('sttOn', (data) => {
            console.log('get event sttOn', data);

            clearTimeout(timer);
            
            if (data.text == dataToCheck) {
                done();
            } else {
                done('Recognized data does not match');
            }
            speech.sttStop();
        });

        function getTextFromVoice() {
            let player = new player_1.Player();
            let audioPayload = 0;

            let buf2array = (buf) => {
                var data = [];

                for (var i = 0; i < buf.length; i++) {
                    if (audioPayload) {
                        data.push(g711.alaw2linear(buf.readInt8(i)));
                    } else {
                        data.push(g711.ulaw2linear(buf.readInt8(i)));
                    }
                }
                return data;
            };

            let lastPacket;
            let timer;

            function sendLastPacket() {
                speech.speechToText(lastPacket);
            }

            player.on('buffer', (data) => {
                var newData = new Buffer(data.length - 12);
                data.copy(newData, 0, 12);

                newData = buf2array(newData);
                lastPacket = newData;

                if ( !speech.isReadyStt() ) {
                    initSpeech();
                }

                speech.speechToText(newData);

                // Запуск механизма имитации данных
                clearTimeout(timer);
                timer = setInterval(sendLastPacket, 50);
            });

            function initSpeech() {
                let options = {
                    developer_key: developerKey,
                    model: 'number'
                };
                return speech.sttInit(options);
            }
            initSpeech();

            player.emit('start_play', {
                params: {
                    file: filename + '.wav'
                }
            });
        }

        getTextFromVoice();
    });
    */


    it('Combo test -> Text To Speech To Text', function(done) {
        this.timeout(60000);

        let g711 = new (require('./lib/media/G711').G711)();
        let player_1 = require('./lib/media/player');
        let filename = 'test/text2speech2text';
        let dataToCheck = '157157157';
        let timer;
        let speech = new speechLib();

        speech.on('sttInit', (data) => {
            if (data.err) {
                console.warn('get event sttInit error', data.err);
            }
            console.log('get event sttInit', data.data);
        });

        speech.on('sttOn', (data) => {
            console.log('get event sttOn', data);

            clearTimeout(timer);

            function checkData() {
                console.log('checkData');

                speech.sttStop();
                if (data.text == dataToCheck) {
                    done();
                } else {
                    done('Recognized data does not match');
                }
            }

            fs.unlink(filename + '.wav', () => {
                console.log('delete wav');
            });
            fs.unlink(filename + '.tmp', checkData);
        });

        speech.textToSpeech({
            text: dataToCheck,
            file: filename + '.tmp',
            key: developerKey,
            cb: audioConvert
        });

        function audioConvert(err, filePath) {
            if (err) {
                return console.warn(err);
            }
            wavEncode(filename, getTextFromVoice);
        };

        function wavEncode(file, cb) {
            let spawn = require('child_process').spawn,
                args = ['-b', 16, '-r', 8000, '-c', 1, '-t', 'raw', '-L','-e', 'signed-integer', file + '.tmp', '-e', 'u-law', file + '.wav'],
                sox = spawn('sox', args);

            sox.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });

            sox.on('error', function (err) {
                console.error(err);

                fs.exists(file + '.tmp', function (exist) {
                    if (exist) {
                        fs.unlink(file + '.tmp');
                        fs.unlink(file + '.wav');
                    } else {
                        cb();
                    }
                });
            });

            sox.stdout.on('end', function () {
                cb();
            });
        }

        function getTextFromVoice() {
            let player = new player_1.Player();
            let audioPayload = 0;

            let buf2array = (buf) => {
                var data = [];

                for (var i = 0; i < buf.length; i++) {
                    if (audioPayload) {
                        data.push(g711.alaw2linear(buf.readInt8(i)));
                    } else {
                        data.push(g711.ulaw2linear(buf.readInt8(i)));
                    }
                }
                return data;
            };

            let lastPacket;

            function sendLastPacket() {
                speech.speechToText(lastPacket);
            }

            player.on('buffer', (data) => {
                var newData = new Buffer(data.length - 12);
                data.copy(newData, 0, 12);

                newData = buf2array(newData);
                lastPacket = newData;

                if ( !speech.isReadyStt() ) {
                    let options = {
                        developer_key: developerKey,
                        model: 'general'
                    };
                    return speech.sttInit(options);
                }

                speech.speechToText(newData);

                // Запуск механизма имитации данных
                clearTimeout(timer);
                timer = setInterval(sendLastPacket, 50);
            });

            player.emit('start_play', {
                params: {
                    file: filename + '.wav'
                }
            });
        }
    });
});