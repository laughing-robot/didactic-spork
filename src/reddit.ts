import snoowrap = require('snoowrap');

function fetchAnonymousToken() {
    const form = new FormData();
    form.set('grant_type', 'https://oauth.reddit.com/grants/installed_client');
    form.set('device_id', 'DO_NOT_TRACK_THIS_DEVICE');
    return fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'post',
        body: form,
        headers: { authorization: `Basic ${btoa('bNMBK9jcHAIISw:')}` },
        credentials: 'omit',
    }).then(response => response.text())
        .then(JSON.parse)
        .then(tokenInfo => tokenInfo.access_token)
        .then(anonymousToken => {
            const anonymousSnoowrap = new snoowrap({ userAgent: "web:didactic-spork:v1.0.0 (by /u/purisame)", accessToken: anonymousToken.toString() });
            anonymousSnoowrap.config({ proxies: false, requestDelay: 1000 });
            return anonymousSnoowrap;
        });
}

const r = fetchAnonymousToken();
export { r };
