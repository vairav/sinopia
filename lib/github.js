'use strict';

/*
 This function converts a node callback function to a promise.
 I don't understand why there is no such function in standard node.
 */
function promisify(f) {
  var g = function () {
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function (fulfill, reject) {
      var callback = function (err) {
        if (err) {return reject(err);}
        var args2 = Array.prototype.slice.call(arguments, 1);
        fulfill.apply(undefined, args2);
      };
      args.push(callback);
      f.apply(undefined, args);
    });
  };
  return g;
}

var GitHubApi = require('github');

module.exports = function (config) {
  var request = require('request');
  var github = new GitHubApi({
    version: "3.0.0",
    headers: {
      "user-agent": config.application_name
    }
  });

  return {
    access_token: function (code) {
      return new Promise(function(resolve, reject) {
        request({
          url: 'https://github.com/login/oauth/access_token', //URL to hit
          method: 'POST',
          headers: {
            Accept: 'application/json'
          },
          form: {
            client_id:	config.client_id,
            client_secret:	config.client_secret,
            code:	code
          }
        }, function(error, response, body){
          var access_token;
          if(error) {
            reject(error);
          } else {
            access_token = JSON.parse(body).access_token;
            console.log(access_token);
            resolve(access_token);
          }
        });
      });
    },
    get_user: function (access_token) {
      github.authenticate({type: 'oauth', token: access_token});
      return promisify(github.user.get)({});
    },

    organization: config.organization,

    get_orgs: function (access_token) {
      github.authenticate({type: 'oauth', token: access_token});
      return promisify(github.user.getOrgs)({});
    },
    login_url: function () {
      return config.login_url + '?client_id=' + config.client_id + '&scope=read:org';
    }
  };
};
