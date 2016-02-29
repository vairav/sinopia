'use strict';

module.exports = function (config) {
  var request = require('request');

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
      return new Promise(function (resolve, reject) {
        request({
          url: 'https://api.github.com/user', //URL to hit
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-agent': config.application_name,
            Authorization: 'token ' + access_token
          }
        }, function(error, response, body){
          if(error) {
            reject(error);
          } else {
            resolve(JSON.parse(body));
          }
        });
      });
    },

    organization: config.organization,

    get_orgs: function (access_token) {
      return new Promise(function (resolve, reject) {
        request({
          url: 'https://api.github.com/user/orgs', //URL to hit
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-agent': config.application_name,
            Authorization: 'token ' + access_token
          }
        }, function(error, response, body){
          if(error) {
            reject(error);
          } else {
            resolve(JSON.parse(body));
          }
        });
      });
    },
    login_url: function () {
      return config.login_url + '?client_id=' + config.client_id + '&scope=read:org';
    }
  };
};
