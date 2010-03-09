/******************
 * Twita@talinkahashifyer
 * http://www.dustindiaz.com/basement/ify.html
 */
var ify = function() {
  return {
    "link": function(t) {
      return t.replace(/(^|\s+)(https*\:\/\/\S+[^\.\s+])/g, function(m, m1, link) {
        return m1 + '<a href="' + link + '">' + ((link.length > 25) ? link.substr(0, 24) + '...' : link) + '</a>';
      });
    },
    "at": function(t) {
      return t.replace(/(^|\s+)\@([a-zA-Z0-9_]{1,15})/g, function(m, m1, m2) {
        return m1 + '@<a href="http://twitter.com/' + m2 + '">' + m2 + '</a>';
      });
    },
    "hash": function(t) {
      return t.replace(/(^|\s+)\#([a-zA-Z0-9_]+)/g, function(m, m1, m2) {
        return m1 + '#<a href="http://search.twitter.com/search?q=%23' + m2 + '">' + m2 + '</a>';
      });
    },
    "clean": function(tweet) {
      return this.hash(this.at(this.link(tweet)));
    }
  };
}();