'use strict';

var Error = require('http-errors');

module.exports = function login_web(config, auth) {
  var this_router = require('express').Router();
  var github = require('./github')(config.github);

  function base_url(req){
    var base = config.url_prefix ? config.url_prefix.replace(/\/$/, '')
      : req.protocol + '://' + req.get('host')
        return base;
  }

  function session_login(res, login, password) {
    var str = login + ':' + password;
    res.cookies.set('token', auth.aes_encrypt(str).toString('base64'))
  }

  function login_url(req) {
    return github.login_url() + '&redirect_uri=' + base_url(req) + '/-/github/callback';
  }

  this_router.get('/-/login', function (req, res, next) {
    res.redirect(login_url(req));
  });

  this_router.get('/-/github/callback', function (req, res, next) {
    var code = req.query.code;
    var error = req.query.error;
    if (error) {return next(Error[409](error));}

    github.access_token(code).then(function (access_token) {
      github.get_user(access_token).then(function (github_user) {
        github.get_orgs(access_token).then(function (orgs) {
          github_user.orgs = orgs;
          console.log(github_user);
          if (orgs.find(function (org) {return org.login === github.organization})) {
            var login = github_user.login;
            var password = access_token;
            auth.authenticate(login, password, function(err, groups) {
              if (!err) {
                session_login(res, login, password);
                res.redirect(base_url(req))
              } else {
                auth.add_user(login, password, function(err, success) {
                  if (err) { return next(err) }
                  session_login(res, login, password);
                  res.redirect(base_url(req))
                });
              }
            });
          } else {
            next(Error[401]('Unauthorized'));
          }

        });
      });
    }).catch(function (reason) {
      return next(Error[409](reason));
    });
  });

  return this_router;
};
