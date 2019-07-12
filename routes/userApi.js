var express = require("express");
var router = express.Router();
var path = require("path");

const fs = require("fs");
const reqres = require("../helpers/reqres");

const dataPath = path.join(__dirname, "../data");
const avatarPath = path.join(dataPath, "avatar");

/*
## Part one - nodeJS rest API
You should implement a nodeJS server API communicating with this:
 https://reqres.in/ API. Your API should have three endpoints:
* GET http://localhost:3000/api/user/{userId} - This will make
 a request to https://reqres.in/api/users/{userId} and returns an
  user JSON representation.

* GET http://localhost:3000/api/user/{userId}/avatar - This will make
 a request to get the image by `avatar` URL. It should do 2 things: 
 Save the image into the FileSystem (plain file) and return back base64
  image representation. When another request with the same URL comes 
  in, the server should not make a HTTP call to get the image, but 
  should return the previously saved file in base64 format.

* DELETE http://localhost:3000/api/user/{userId}/avatar - This will remove 
the file from the FileSystem storage. When a new 
GET http://localhost:3000/api/user/{userId} comes in, 
it requires a new HTTP call to get image and has to save to the
 fileSystem (plain file).

*/

router.get("/:userId", function(req, res, next) {
  reqres.getUserObj(
    req.params.userId,
    obj => res.json(obj),
    err => res.status(500).json({ error: err })
  );
});

router.get("/:userId/avatar", function(req, res, next) {
  const fp = path.join(avatarPath, req.params.userId);

  reqres.getUserObj(
    req.params.userId,
    obj => {
      if (obj.data.avatar) {
        fs.exists(fp, ex => {
          if (ex) {
            fs.readFile(fp, (err, base64) => {
              if (err) return res.status(500).json({ error: err });
              res.send(base64);
            });
            return;
          }

          reqres.getImageByURL(
            obj.data.avatar,
            base64 => {
              fs.writeFile(fp, base64, err => {
                if (err) {
                  console.log("fs write error", err);
                  return;
                }
              });
              res.send(base64);
            },
            err => res.status(500).json({ error: err })
          );
        });
      } else {
        res.status(404).json({ error: { message: "not found" } });
      }
    },
    err => res.status(500).json({ error: err })
  );
});

router.delete("/:userId/avatar", function(req, res, next) {
  const fp = path.join(avatarPath, req.params.userId);
  fs.unlink(fp, err => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    res.json({ ok: true });
  });
});

module.exports = router;
