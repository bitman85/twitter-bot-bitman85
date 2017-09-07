# Twitter-Bot-bitman85 V1.0

My First twitter bot with node.js

The bot take every random time a random hastag from the list to Retwit and favorite

Features:

-GUI for controller the bot
-Search and RT the best twit from selected hashtag on the list (see instrucctions)
-Search and make Favorite the las 15 twits of selected hashtags on the list (see instrucctions)
-Input a user name in GUI to RT her last Twit
-Input a hastag in GUI to RT the most Retwited
-Start and Stop Bot
-LOG in the GUI and FILE
-Hastags are configurable
-Give thanks to new follower ( the twits its configurable)
-Show log when the next twit (hour).




# INSTRUCTIONS

The all config File has in the config dir

-config.js:
	
	- lang: put the code lang ( 'es' for spanish, 'en' for english, etc) to search twits
	
	- userName: put your twitter username
	
	- port: listen bot port
	
-auth.js: Your tokens from twitter


-messages.js: thanks is a twits to new follower, the other messages its only to log, translate to your language

	
	-thanks : respond to new follower

	-anyoneFollow : new follower message log

	-searchRTS :  searching twitter mesage log

	-searchBetterTwit :  searching the best twit of user message log

	-betterTwit : best twit message log

	-retwited : retwitted message log

	-nextRT : next RT message log

	-userTwits : search twits of use log message

	-likeTwit : like twit message log


-words.txt: put in the list your hastags to search and retwit

-favoritewords.txt: Put in the list your hastags to make favorite





Other Files:

-Twitslist.list: The bot looks at this file to see that it has not retweeted 	



# Coming Soon

-Select the range of random time.
-Put and Remove hastags from the GUI
-See the RT twits in the GUI
more xd
