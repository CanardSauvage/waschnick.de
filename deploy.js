var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();

console.info("### Current branch is: " + process.env.TRAVIS_BRANCH);

var config = {
    username: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: "ftp3.netclusive.de",
    port: 21,
    localRoot: "./public",
    remoteRoot: "/html",
    exclude: ['.git', '.idea', 'tmp/*']
};

ftpDeploy.on('uploading', function (data) {
    data.totalFileCount;       // total file count being transferred
    data.transferredFileCount; // number of files transferred
    data.percentComplete;      // percent as a number 1 - 100
    data.filename;             // partial path with filename being uploaded
});
ftpDeploy.on('uploaded', function (data) {
    console.log(data);         // same data as uploading event
});

ftpDeploy.deploy(config, function (err) {
    if (err) {
        console.log(err)
    }
    else {
        console.log('finished');
    }
});