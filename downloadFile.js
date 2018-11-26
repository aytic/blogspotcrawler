const fs = require("fs");
const url = require("url");
const exec = require("child_process").exec;
const spawn = require("child_process").spawn;

const downloadFile = function(fileUrl, downloadDir, onProgress, callback) {
  const fileName = url
    .parse(fileUrl)
    .pathname.split("/")
    .pop();

  // Spawn wget process
  const child = spawn("wget", ["-c", "-O", downloadDir + fileName, fileUrl]);

  child.stderr.on("data", function(e) {
    const stdout = e.toString();
    const p = stdout.match(/([0-9]+?\%)+/g);
    if (p && p.length > 0) {
      onProgress && onProgress(p[0]);
    }
  });

  // Close Streams
  child.stdout.on("end", function(data) {
    callback && callback(null, downloadDir + fileName);
    child.kill();
  });

  child.on("exit", function(code) {
    if (code != 0) {
      console.log("Failed: " + code);
    }
  });
};

module.exports = downloadFile;
