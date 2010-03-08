var sys = require("sys"),
   http = require("http");

http.createServer(function (request, response) {
  response.writeHeader(200, {"Content-Type": "text/plain"});
  response.write("Hello World\n");
  response.close();
}).listen(8081);

sys.puts("Server running at http://127.0.0.1:8081/");
