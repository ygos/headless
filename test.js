const exec = require('child_process').exec;

function launchHeadlessChrome(url, callback) {
    const CHROME = '/usr/bin/google-chrome';
    exec(`${CHROME} --headless --disable-gpu --remote-debugging-port=9222 ${url}`, callback);
}

launchHeadlessChrome('http://www.ifeng.com', function(err, stdout, stderr){
    printf(stdout);
});
