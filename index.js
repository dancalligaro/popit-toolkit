var http = require('http');
var Q = require('q');

function createInstance(config) {

  function setConfig(_config) {
    config = _config;
  }

  function postItems(kind, items) {
    return enqueue(postThisJson, kind, items);
  }

  function deleteItems(kind, items) {
    return enqueue(deleteItem, kind, items);
  }

  function enqueue(fn, kind, items) {

    var deferred = Q.defer();

    // Max 50 simultaneous
    var currents = 0;
    var max = 50;

    function goNext() {

      var item;
      while ((max - currents) > 0 && (item = items.shift())) {
        currents++;

        (function(p) {

          fn(item, kind, function(result) {
            deferred.notify(result);
            currents--;
            if (items.length == 0 && currents == 0) {
              deferred.resolve();
            }
          });

        })(item);

      }

      if (items.length > 0) {
        setTimeout(goNext, 100);
      }

    }

    goNext();

    return deferred.promise;
  }

  function postThisJson(objToPost, api, cb) {

    // api can be one of ( persons, organizations, memberships, posts );

    var user = config.user;
    var pwd = config.password;

    var postString = JSON.stringify(objToPost);

    var headers = {
      'Authorization': 'Basic ' + new Buffer(user + ':' + pwd).toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postString)
    };

    var options = {
      host: config.host,
      port: 80,
      path: '/api/v0.1/' + api,
      method: 'POST',
      headers: headers
    };

    // Setup the request.  The options parameter is
    // the object we defined above.
    var req = http.request(options, function(res) {
      res.setEncoding('utf-8');

      var responseString = '';

      res.on('data', function(data) {
        responseString += data;
      });

      res.on('end', function() {

        if (typeof cb == "function") {
          cb(responseString);
        }

      });
    });

    req.on('error', function(e) {
      // TODO: handle error.
      console.log("ERROR", e);
    });

    req.write(postString);
    req.end();


  }

  function deleteItem(id, api, cb) {

    // api can be one of ( persons, organizations, memberships, posts );

    var user = config.user;
    var pwd = config.password;

    var headers = {
      'Authorization': 'Basic ' + new Buffer(user + ':' + pwd).toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': '0'
    };

    var options = {
      host: config.host,
      port: 80,
      path: '/api/v0.1/' + api + "/" + id,
      method: 'DELETE',
      headers: headers
    };

    // Setup the request.  The options parameter is
    // the object we defined above.
    var req = http.request(options, function(res) {
      res.setEncoding('utf-8');

      var responseString = '';

      res.on('data', function(data) {
        responseString += data;
      });

      res.on('end', function() {

        if (typeof cb == "function") {
          cb(responseString);
        }

      });
    });

    req.on('error', function(e) {
      // TODO: handle error.
      console.log("ERROR", e);
    });

    req.end();
  }

  function getJson(path) {

    var deferred = Q.defer();

    var headers = {};

    var options = {
      host: config.host,
      port: 80,
      path: path,
      method: 'GET',
      headers: headers
    };

    var req = http.request(options, function(res) {
      res.setEncoding('utf-8');

      var responseString = '';

      res.on('data', function(data) {
        responseString += data;
      });

      res.on('end', function() {

        try {
          deferred.resolve(JSON.parse(responseString));
        } catch (ex) {
          deferred.reject(ex);
        }

      });

    });

    req.on('error', function(e) {
      console.log("ERROR", e);
      deferred.reject(e);
    });

    req.end();

    return deferred.promise;

  }


  function loadAllItems(type) {

    var deferred = Q.defer();

    var url = '/api/v0.1/' + type + '?per_page=200&page={{page}}';
    var page = 1;
    var results = [];

    function getUrl(page) {
      return url.replace("{{page}}", page);
    }

    function loadPage() {

      getJson(getUrl(1)).then(function(response) {

        results = response.result;

        if (response.has_more) {

          var totalPages = Math.ceil(response.total / 200); //200 = items per page
          var queue = [];

          deferred.notify({
            totalPages: totalPages,
            totalItems: response.total
          });

          for (var i = 2; i <= totalPages; i++) {
            queue.push(getJson(getUrl(i)));
          }

          Q.all(queue).then(function(responses) {
            responses.forEach(function(response) {
              results = results.concat(response.result);
            });
            deferred.resolve(results);
          });

        } else {
          deferred.resolve(results);
        }

      }, function() {
        console.log("error loading");
      });
    }

    loadPage();

    return deferred.promise;
  }


  return {
    loadAllItems: loadAllItems,
    postItems: postItems,
    deleteItems: deleteItems,
    config: setConfig
  }

}

module.exports = function(config) {
  return createInstance(config);
}
