(function($){

// id of the last tweet received
var lastId = 1;

var tweetList = $('#tweet-holder ul');

// open a fetch request
function fetchTweets() {
    $.ajax({
        url: '/fetch',
		data: { lastId: lastId },
		dataType: 'json',
        success: function(data){
			var tweets = data.tweets,
				tweet;
            if (tweets && tweets.length) {
                for(var i=0, l=tweets.length; i<l; i++) {
					tweet = tweets[i];
					if(tweet) {
						$('#tweet_tmpl').render(tweets[i])
							.css('opacity',0)
    						.prependTo(tweetList)
							.animate({'opacity': 1});
						lastId = tweet.id;
					}
				}
				
            }
			
			// recursive goodness
			fetchTweets();
        }
    });
}

fetchTweets();

}(jQuery));




