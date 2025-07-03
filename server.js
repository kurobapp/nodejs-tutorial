// server.js
const http = require('http');
const querystring = require('querystring'); // POSTデータの解析に使うモジュール

const hostname = '0.0.0.0'; // 任意のIPアドレスからの接続を許可（スマホからのアクセス用）
const port = 3000;

// --- ここからHTML/JSの内容を直接埋め込み ---
const EMBEDDED_JS = `
// assets/js/script.js - メッセージ送信の非同期処理とアラート表示
document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.getElementById('messageForm');

    if (messageForm) {
        messageForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // デフォルトのフォーム送信（ページ移動）をキャンセル

            const formData = new FormData(messageForm);
            const message = formData.get('message'); // 'name="message"' の値を取得

            try {
                // サーバーにPOSTリクエストを送信
                const response = await fetch('/submit-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded', // フォームデータ形式
                    },
                    body: new URLSearchParams(formData).toString(), // FormDataをURLエンコード形式に変換
                });

                if (response.ok) {
                    const result = await response.json(); // サーバーからのJSON応答を解析
                    alert('✅ ' + result.message + '\\n（ターミナルも確認してください）'); // アラートで成功メッセージを表示
                    messageForm.reset(); // フォームをリセット
                } else {
                    const errorText = await response.text(); // エラーメッセージを取得
                    alert('❌ メッセージ送信に失敗しました: ' + errorText); // アラートでエラーメッセージを表示
                }
            } catch (error) {
                console.error('送信エラー:', error);
                alert('❌ 通信エラーが発生しました。'); // アラートで通信エラーメッセージを表示
            }
        });
    }
});
`;


const EMBEDDED_HTML_FORM = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Node.jsシンプルサーバー</title> </head>
<body>
    <main>
        <section>
            <h2>メッセージ送信フォーム</h2>
            <p>このフォームからサーバーへテキストメッセージを送信し、サーバーのコンソールログで確認します。</p>

            <h3>メッセージ送信</h3>
            <form id="messageForm" action="/submit-message" method="post">
                <label for="message">メッセージを入力してください:</label><br>
                <input type="text" id="message" name="message" value="こんにちは、Node.jsサーバー！" size="40"><br><br>
                <input type="submit" value="サーバーに送信">
            </form>

            <p style="font-size: 0.9em; color: #666; font-style: italic; margin-top: 15px;">
                送信されたメッセージは、このNode.jsサーバーを起動しているターミナルに表示されます。
            </p>
        </section>
    </main>

    <script>
        ${EMBEDDED_JS}
    </script>
</body>
</html>
`;

// --- HTML/JSの埋め込みここまで ---

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET' && pathname === '/') {
        // トップページ（メッセージ送信フォームのあるページ）を返す
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(EMBEDDED_HTML_FORM); // 埋め込んだHTMLを直接返す
    } else if (req.method === 'POST' && pathname === '/submit-message') {
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
            console.log(`送信元IPアドレス: ${req.connection.remoteAddress || req.socket.remoteAddress}`);
            console.log(`受信メッセージ: "${message}"`);
            console.log('-------------------------------------------');

            // クライアント（ブラウザ）への応答をJSON形式に変更
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ status: 'success', message: 'メッセージを受信しました！' }));
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