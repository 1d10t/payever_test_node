const https = require("https");
const url = require("url");
const reqres = {};

reqres.getJSON = (path, onsuccess, onerror) => {
  let output = "";

  const httpsReq = https.request(
    {
      host: "reqres.in",
      port: 443,
      path: path,
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    },
    httpsRes => {
      httpsRes.setEncoding("utf8");
      httpsRes.on("data", chunk => {
        output += chunk;
      });
      httpsRes.on("end", () => {
        let obj = JSON.parse(output);
        onsuccess(obj);
      });
    }
  );

  httpsReq.on("error", err => {
    onerror(err);
  });

  httpsReq.end();
};

reqres.getUserObj = (userId, onsuccess, onerror) => {
  reqres.getJSON(`/api/users/${userId}`, onsuccess, onerror);
};

reqres.getImageByURL = (imgUrl, onsuccess, onerror) => {
  var data = [];

  const urlParsed = url.parse(imgUrl);

  const httpsReq = https.request(
    {
      host: urlParsed.host,
      port: 443,
      path: urlParsed.path,
      method: "GET",
      headers: {
        "Content-Type": "image/*"
      }
    },
    httpsRes => {
      httpsRes.on("data", chunk => {
        data.push(chunk);
      });
      httpsRes.on("end", () => {
        var buffer = Buffer.concat(data);
        onsuccess(buffer.toString("base64"));
      });
    }
  );

  httpsReq.on("error", err => {
    onerror(err);
  });

  httpsReq.end();
};

module.exports = reqres;
