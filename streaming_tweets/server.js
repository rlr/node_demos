HOST = null;
PORT = 8000;

var sys = require('sys'),
    http = require('http'),
    url = require("url"),
    qs = require("querystring"),
    base64 = require('./libserver/base64'),
    fu = require("./libserver/fu"),
    twittercreds = require('./twittercreds');

// Command line args
var KEYWORD  = process.ARGV[2] || "iphone";

/*
 * Tweet Storage
 */
var MESSAGE_BACKLOG = 50;
var store = new function () {
  var messages = [];
  var callbacks = [];
  var buffer = '';

  this.appendTweet = function (chunk) {
  	var temp = chunk.split('\r'),
  		length = temp.length,
  		tweet;
  	if(length>1) {
  		for(var i=0, l=temp.length; i<l-1;i++) {
  			tweet = buffer + temp[i];
  			buffer = '';
  			try { // need to debug this to see why it randomly fails
  				tweet = JSON.parse(tweet);
  				messages.push(tweet);
  				sys.puts(tweet.id + ' [' + tweet.user.screen_name + '] ' + tweet.text);
  			}
  			catch (e) {}
  		}
  		buffer = temp[length] || '';
  	} else {
  		if(temp && temp[0]) {
  			buffer = buffer + temp[0];
  		}
 	}

    while (callbacks.length > 0) {
      callbacks.shift().callback([tweet]);
    }

    while (messages.length > MESSAGE_BACKLOG) {
      messages.shift();
    }
  };

  this.getTweetsSince = function (lastId, callback) {
    var matching = [];
    for (var i=messages.length-1; i>0 ; i--) {
      var message = messages[i];
      if (message.id > lastId) {
        matching.push(message);
      }
    }

    if (matching.length != 0) {
      callback(matching.reverse());
    } else {
      callbacks.push({ timestamp: new Date(), callback: callback });
    }
  };

  // clear old callbacks
  // they can hang around for at most 30 seconds.
  setInterval(function () {
    var now = new Date();
    while (callbacks.length > 0 && now - callbacks[0].timestamp > 30*1000) {
      callbacks.shift().callback([]);
    }
  }, 1000);
};

/*
 * Twitter streaming API client
 */
// Authentication Headers for Twitter
var headers = [];
var auth = base64.encode(twittercreds.USERNAME + ':' + twittercreds.PASSWORD);
headers['Authorization'] = "Basic " + auth;
headers['Host'] = "stream.twitter.com";

// Connection to Twitter's streaming API
var twitter = http.createClient(80, "stream.twitter.com");
var request = twitter.request("GET", "/1/statuses/filter.json?track=" + KEYWORD, headers);

request.addListener('response', function (response) {
  response.setBodyEncoding("utf8");
  response.addListener("data", function (chunk) {
    store.appendTweet(chunk);
  });
});
request.close();

/*
 * HTTP Server
 */
fu.listen(PORT, HOST);

// static files
fu.get("/", fu.staticHandler("index.html"));
fu.get("/style.css", fu.staticHandler("style.css"));
fu.get("/client.js", fu.staticHandler("client.js"));
fu.get("/libclient/ify.js", fu.staticHandler("libclient/ify.js"));
fu.get("/libclient/jquery-1.4.2.min.js", fu.staticHandler("libclient/jquery-1.4.2.min.js"));
fu.get("/libclient/jquery.tmpl.js", fu.staticHandler("libclient/jquery.tmpl.js"));

// the comet endpoint
fu.get("/fetch", function (req, res) {

  // check for lastId in the query string
  if (!qs.parse(url.parse(req.url).query).lastId) {
    res.simpleJSON(400, { error: "Must supply lastId parameter" });
    return;
  }

  var lastId = parseInt(qs.parse(url.parse(req.url).query).lastId, 10);

  store.getTweetsSince(lastId, function (tweets) {
    res.simpleJSON(200, { tweets: tweets });
  });
});

sys.puts ("Twitter Streaming API client listening for: " + KEYWORD); 
sys.puts("Server running at http://127.0.0.1:"+PORT+"/");