// server.js
const http = require('http');
const querystring = require('querystring'); // POSTデータの解析に使うモジュール
const fs = require('fs'); // ファイルシステムモジュール（HTMLファイルを読み込むため）
const path = require('path'); // パス操作モジュール

const hostname = '0.0.0.0'; // 任意のIPアドレスからの接続を許可（スマホからのアクセス用）
const port = 3000;

const server = http.createServer((req, res) => {
    // リクエストメソッドとURLに基づいてルーティング
    if (req.method === 'GET') {
        if (req.url === '/') {
            // トップページ（メッセージ送信フォームのあるページ）
            const filePath = path.join(__dirname, 'chapter_03_send_message.html');
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.end('サーバー内部エラー: chapter_03_send_message.html が見つかりません。\n');
                    console.error('Error reading chapter_03_send_message.html:', err);
                    return;
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(data);
            });
        } else if (req.url.startsWith('/assets/')) {
            // CSSやJS、画像などの静的ファイル配信（簡易版）
            // 注意: 実際の運用ではexpressなどのフレームワークを使うか、
            // より堅牢な静的ファイルサーバーを別途用意します。
            const assetPath = path.join(__dirname, req.url);
            fs.readFile(assetPath, (err, data) => {
                if (err) {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.end('ファイルが見つかりません。\n');
                    return;
                }
                let contentType = 'application/octet-stream'; // デフォルト
                if (req.url.endsWith('.css')) {
                    contentType = 'text/css';
                } else if (req.url.endsWith('.js')) {
                    contentType = 'application/javascript';
                } else if (req.url.endsWith('.png')) {
                    contentType = 'image/png';
                } else if (req.url.endsWith('.jpg') || req.url.endsWith('.jpeg')) {
                    contentType = 'image/jpeg';
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', contentType);
                res.end(data);
            });
        }
        // その他のGETリクエスト（チュートリアルの各HTMLファイルなど）は、
        // GitHub Pagesで直接アクセスされるため、サーバー側で直接返す必要はありませんが、
        // もしローカルサーバーで全ページを動かしたい場合は、ここに追加のルーティングが必要です。
        else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end('お探しのGETページは見つかりませんでした。\n');
        }
    } else if (req.method === 'POST' && req.url === '/submit-message') {
        // POSTリクエストでデータを受け取る
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString(); // データを受信するたびに追加
        });
        req.on('end', () => {
            const parsedData = querystring.parse(body); // URLエンコードされたデータを解析
            const message = parsedData.message || 'メッセージなし'; // 'message'フィールドを取得

            // 受信したメッセージをターミナル（コンソール）に表示！
            console.log('-------------------------------------------');
            console.log('サーバーが新しいメッセージを受信しました！');
            console.log(`送信元IPアドレス: ${req.socket.remoteAddress}`);
            console.log(`受信メッセージ: "${message}"`);
            console.log('-------------------------------------------');

            // クライアント（ブラウザ）への応答
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(`
                <!DOCTYPE html>
                <html>
                <head><title>メッセージ受信完了</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; background-color: #e8f5e9; color: #333; }
                    h1 { color: #4CAF50; }
                    p { font-size: 1.1em; }
                    .message-box { background-color: #fff; border: 1px solid #ccc; padding: 20px; margin: 20px auto; max-width: 500px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    a { color: #007bff; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
                </head>
                <body>
                    <h1>メッセージがサーバーに届きました！</h1>
                    <div class="message-box">
                        <p><strong>あなたが送信したメッセージ:</strong></p>
                        <p>"${message}"</p>
                    </div>
                    <p>PCのターミナル（コマンドプロンプト/PowerShell/ターミナル）を確認してください。</p>
                    <p><a href="/">もう一度メッセージを送信する</a></p>
                </body>
                </html>
            `);
        });
    } else {
        // GET/POST以外のリクエスト、または不明なURL
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('お探しのページは見つかりませんでした。\n');
    }
});

server.listen(port, hostname, () => {
    console.log(`✨ Node.jsサーバーが起動しました！ ✨`);
    console.log(`PCからアクセス:   http://localhost:${port}/`);
    console.log(`ネットワークからアクセス: http://[あなたのPCのIPアドレス]:${port}/ (IPアドレスはPCの環境で確認してください)`);
    console.log(`\nサーバーにメッセージが届くと、ここにログが表示されます。`);
});