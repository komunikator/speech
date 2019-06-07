var WebSocket = require('ws'),
        url = 'wss://speech.kloud.one/asrsocket.ws',
        settings = {
            uuid: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
                    /[xy]/g,
                    function (c) {
                        var r = Math.random() * 16 | 0;
                        var v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    }
            ),
            model: 'queries', //'numbers', //'general',//'queries',
            lang: 'ru-RU',
            format: "audio/x-pcm;bit=16;rate=8000",
            vad: false //???
        },
ws;

var dialog_url = 'wss://speech.kloud.one/asrsocket.ws';
var bufSize = 1024,
        dataBuf = new Int16Array(bufSize),
        dataArr = [];

let fs = require('fs');
var strm = fs.createWriteStream('example');

exports.send = function (data) {
    if (!isReady())
        return;

    var copyLen = bufSize - dataArr.length;
    dataArr = dataArr.concat(data.slice(0, copyLen));

    if (dataArr.length == bufSize) {
        for (var i = 0; i < bufSize; i++)
            dataBuf[i] = dataArr[i];

        console.log(dataBuf);
        strm.write(String(dataBuf));

        ws.send(dataBuf, {
            binary: true,
            mask: true
        });
        dataArr = data.slice(copyLen);
    }
};

var isReady = exports.isReady = function () {
    return (ws && ws.readyState == 1) //WebSocket.OPEN
}

exports.isConnecting = function () {
    return (ws && ws.readyState == 0) //WebSocket.CONNECTING
}

exports.stop = function () {
    //console.log('send ws stop');
    if (isReady())
        ws.close();
}
exports.init = function (options, cb) {
    if (!(options && options.developer_key)) {
        if (cb)
            cb({
                error: 'STT API key not found'
            });
        return;
    }
    settings.apikey = options.developer_key;
    // settings.key = settings.apiKey;

    if (options.model)
        settings.model = options.model;

    if (options.customGrammar) //for 'onthefly' model
        settings.customGrammar = options.customGrammar;
    else
        delete settings.customGrammar;

        if (!isReady()) {//WebSocket.OPEN
            if (options.to) {
                ws = new WebSocket(dialog_url);
            } else {
                ws = new WebSocket(url);
            }
        }
    ws.readyState = 0;
    var sessionId;
    ws.on('open', function () {
        console.log('settings', settings);
        ws.send(JSON.stringify({
            type: 'message',
            data: settings
        }));
        console.log('settings', settings);
        process.send('settings' +  JSON.stringify(settings));
    });

    ws.on('close', function () {
        //console.log('ws close');
        // require("fs").appendFileSync("dump.txt", JSON.stringify({sessionId: sessionId, state: 'closed'}))
        cb(null, {sessionId: sessionId, state: 'closed'});
    });

    ws.on('error', function (e) {
        console.log('ws error', e);
    });

    var lastText = '';
    var lastTime = Date.now();
    ws.on('message', function (message) {
        //console.log('received: %s', message);
        var obj;
        try {
            obj = JSON.parse(message);
            //console.log(obj);
        } catch (e) {
            if (cb)
                cb({
                    error: e
                });
        }
        ;
        if (obj)
            switch (obj.type) {
                case 'Error':
                    if (cb)
                        cb(obj.data);
                    break;

                case 'InitResponse':
                    sessionId = obj.data.sessionId;
                    if (cb)
                        cb(null, obj.data);
                    break;

                case 'AddDataResponse':
                    if (obj.data.text && obj.data.uttr // parametr "uttr" now working!!!
                            //(Date.now() - lastTime < 3000 ? true && (obj.data.text != lastText) : true)
                            ) {
                        process.send({
                            action: 'sttOn',
                            params: {
                                text: obj.data.text
                            }
                        });
                        lastText = obj.data.text;
                    }
                    lastTime = Date.now();
            }
    });
};
