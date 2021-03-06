"use strict";
// Node
var util = require('util');
// 3rd party
var _ = require('lodash');
var co = require('co');
var RegexTrie = require('regex-trie');
var debug = require('debug')('app:cache');
var assert = require('better-assert');
// 1st party
var db = require('./db');
var pre = require('./presenters');
var config = require('./config');
var belt = require('./belt');

// TODO: Handle failure
function Cache() {
  this.store = {};
  this.intervals = [];
  var self = this;

  this.get = function(key) {
    var val = self.store[key];
    //assert(val);
    return val;
  };

  this.set = function(key, val) {
    self.store[key] = val;
    debug('setting cache key: %s', key);
    return val;
  };

  // genFn failed
  function errBack(err) {
    console.error('Error', err, err.stack);
    throw err;
  }

  this.once = function(genFn) {
    co(genFn.bind(self)).then(_.noop, errBack);
  };

  this.every = function(ms, genFn) {
    // Run the genFn on initial load, and then run it at an interval

    // Initial run successful, so create an interval
    function succBack() {
      var interval = setInterval(function() {
        co(genFn.bind(self)).then(_.noop, errBack);
      }, ms);
      self.intervals.push(interval);
    }

    co(genFn.bind(self)).then(succBack, errBack);
  };
}

var cache;
module.exports = function() {
  // There can only be one cache instance
  if (cache) return cache;

  cache = new Cache();

  // cache.once(function*() {
  //
  // Every 60 seconds
  // Need to fetch at interval now that homepage shows the latest reply
  cache.every(1000 * 60, function*() {
    if (config.LATEST_RPGN_TOPIC_ID) {
      var topic = yield db.findRGNTopicForHomepage(config.LATEST_RPGN_TOPIC_ID);
      this.set('latest-rpgn-topic', topic);
    }
  });

  // Every 60 seconds
  cache.every(1000 * 60, function*() {
    this.set('stats', yield db.getStats());
  });

  // Every 5 min
  cache.every(1000 * 60 * 5, function*() {
    console.log('[CACHE] Populating uname-regex-trie');
    var trie = new RegexTrie();
    var unames = yield db.findAllUnames();
    trie.add(unames.map(function(uname) {
      return uname.toLowerCase();
    }));
    this.set('uname-regex-trie', trie);
  });

  // Every 10 seconds
  cache.every(1000 * 10, function*() {
    var result;
    try {
      result = yield db.getForumViewerCounts();
    } catch(ex) {
      console.error('Error', ex, ex.stack);
      result = { users: [], guests: [] };
    }
    // Map of ForumId->Int (includes all ForumIds in database)
    this.set('forum-viewer-counts', result);
  });

  // Every 15 seconds
  cache.every(1000 * 15, function*() {
    var categories = yield db.findCategoriesWithForums();
    this.set('categories', categories);
  });

  // Every 15 seconds
  cache.every(1000 * 15, function*() {
    var results = yield [
      db.findLatestChecks(),
      db.findLatestRoleplays(),
      db.findLatestStatuses()
    ];
    this.set('latest-checks', results[0]);
    this.set('latest-roleplays', results[1]);
    this.set('latest-statuses', results[2]);
  });

  // Every 60 minutes
  cache.every(1000 * 60 * 60, function*() {
    console.log('[CACHE] Populating unames->ids');
    var unamesToIds = yield db.getUnamesMappedToIds();
    this.set('unames->ids', unamesToIds);
  });

  // Every 12 hours
  cache.every(1000 * 60 * 60 * 12, function*() {
    console.log('[CACHE] Populating sitemap.txt');
    var MAX_SITEMAP_URLS = 50000;
    var results = yield [
      db.findAllPublicTopicUrls(),
      db.findAllUsers()
    ];
    var publicTopicUrls = results[0];
    var users = results[1];

    var urls = users.map(function(user) {
      return pre.presentUser(user).url;
    }).concat(publicTopicUrls).map(function(url) {
      return config.HOST + url;
    });
    console.log('Sitemap URLs: %s', urls.length);
    if (urls.length > MAX_SITEMAP_URLS)
      console.warn('Too many sitemap URLs, only using the first '
                   + MAX_SITEMAP_URLS);

    this.set('sitemap.txt', urls.slice(0, MAX_SITEMAP_URLS).join('\n'));
  });

  // Every hour
  cache.every(1000 * 60 * 60 * 1, function*() {
    this.set('arena-leaderboard', yield db.getArenaLeaderboard(5));
  });

  // Every 12 seconds
  if (config.CHAT_SERVER_URL) {
    cache.every(1000 * 12, function*() {
      // Initialize if it's not set
      if (typeof this.get('chat-server-stats') === 'undefined') {
        this.set('chat-server-stats', {
          member_count: 0
        });
      }

      var response = yield belt.request(config.CHAT_SERVER_URL + '/stats');

      // Only update on response success
      if (response.statusCode === 200) {
        this.set('chat-server-stats', JSON.parse(response.body));
      }
    });
  } else {
    console.log('[cache.js] Skipping chat-server stats ping since CHAT_SERVER_URL is not set');
  }

  // Update current-sidebar-contest every 45 seconds
  cache.every(1000 * 45, function*() {
    this.set('current-sidebar-contest', yield db.getCurrentSidebarContest());
  });

  return cache;
};
