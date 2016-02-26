'use strict';

module.exports = function login_web(app, config, auth) {
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

  app.get('/-/github/login', function (req, res, next) {
    var code = req.query.code;
    var error = req.query.error;
    if (error) {return next(Error[409](error));}

    github.access_token(code).then(function (access_token) {
      req.log.warn(access_token);
      github.get_user(access_token).then(function (github_user) {
        var login = access_token; // on purpose, we identify user by her access_token
        var password = github_user.login;
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
      });
    });
  });

  return {
    login_url: function (req) {
      return github.login_url() + '&redirect_uri=' + base_url(req) + '/-/github/login';
    }
  };
};
