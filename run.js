// Imports
const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const downloadFile = require("./downloadFile");
const downloadPath = "images/";
// Store
const url = process.argv.slice(2).toString();
// Get the first post of the Blog
function init() {
  fs.existsSync(downloadPath) || fs.mkdirSync(downloadPath);
  request(url, function(error, response, html) {
    if (!error) {
      const $ = cheerio.load(html);
      crawlPosts($(".post-title").children()[0].attribs.href);
    } else {
      console.error("Fetching first post failed: recheck url");
    }
  });
}

function crawlPosts(postURL) {
  request(postURL, function(error, response, html) {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(html);
      try {
        const foundTags = $(".post-body").find("img");
        const imageTags = Object.keys(foundTags)
          .filter(key => foundTags[key].name == "img")
          .reduce((obj, key) => {
            obj[key] = foundTags[key];
            return obj;
          }, {});
        for (let image in imageTags) {
          let { src } = imageTags[image].attribs;
          downloadFile(src, downloadPath, function(p) {
            console.log(
              `Downloading image from ${src} to ${downloadPath}: `,
              p
            );
          });
        }
      } catch (ex) {
        console.log("Tried to access invalid property: ", ex);
      }
      try {
        crawlPosts($(".blog-pager-older-link")[0].attribs.href);
      } catch (e) {
        console.log(e, "\nNo more older posts found\n");
      }
    }
  });
}

init();
