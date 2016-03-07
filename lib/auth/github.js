'use strict';
var memory_cache = function (options) {
  var store = {};
  var dates = {};
  return {
    set: function (key, val) {
      store[key] = val;
      dates[key] = new Date();
    },
    get: function (key) {
      if (new Date() - dates[key] > options.ttl) {
        return undefined;
      }
      return store[key];
    }
  }
};

var cache = memory_cache({ttl: 20000});

module.exports = githubAuth;

function githubAuth(config, stuff) {
  var self = Object.create(githubAuth.prototype);
  self.github = require('../github')(stuff.config.github);
  return self;
}

githubAuth.prototype.authenticate = function (user, password, done) {
  var self = this;
  var cached_teams = cache.get(password);
  if (!cached_teams) {
    self.github.get_authorized_user(password).then(function (github_user) {
      var teams = github_user.teams.map(function (team) {return team.slug;});
      cache.set(password, teams);
      console.log(teams);
      done(false, teams);
    }, function (reason) {
      done(null, false);
    });
  } else {
    done(false, cached_teams);
  }
};

githubAuth.prototype.adduser = function (user, password, extra, done) {
  done(null, user);
};
