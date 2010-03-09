HOST = null;
PORT = 8080;

var sys = require('sys'), 
    http = require('http'),
    url = require("url"),
    qs = require("querystring"),
    fu = require("./libserver/fu");

/*
 * Live Value
 */
var liveValue = new function() {
	var value = "42",
		callbacks = [];
	
	this.setValue = function(newValue) {
		value = newValue;
		
		while (callbacks.length > 0) {
            callbacks.shift()(value);
        }
	}
	
	this.addListener = function(callback) {
		callbacks.push(callback);
	}
};

/*
 * HTTP Server
 */
fu.listen(PORT, HOST);

// static files
fu.get("/", fu.staticHandler("index.html"));
fu.get("/setvalue/", fu.staticHandler("setvalue.html"));
fu.get("/libclient/jquery-1.4.2.min.js", fu.staticHandler("libclient/jquery-1.4.2.min.js"));

// the comet endpoint
fu.get("/listen", function(req, res){
   	liveValue.addListener(function(value){
        res.simpleJSON(200, {
            value: value
        });
    });
});

// the value setter
fu.get("/set", function(req, res){
   	// check for value in the query string
   	var value = qs.parse(url.parse(req.url).query).value;
    if (!value) {
        res.simpleText(200, "Must supply value parameter");
        return;
    }
    
    liveValue.setValue(value);
    
    res.redirect(302, "/setvalue/");
    
    
});

sys.puts("Server running at http://127.0.0.1:" + PORT + "/");
