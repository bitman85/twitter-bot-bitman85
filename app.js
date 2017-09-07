var twitter = require('twitter');
const express = require('express'); // peticiones HTML
const fs = require('fs'); //libreria R/W archivos
const file = createLog();
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//const words = require('./config/words.js');
const bodyParser = require('body-parser');// parseador de las peticiones HTML
const auth = require('./config/auth.js');

const config = require('./config/config.js');

//const favoriteWords = require('./config/hastagsFavorites.js');

const messages = require('./config/messages.js');
//var stream = Twitter.stream('user')
const twit = new twitter(auth); //trabajaremos con el objeto twit

var nextTwit;

var words;

var port = process.env.PORT || config.port;

var randomWord;

var favoriteWords;

var start;

var favLoop;

var rtLoop;
//si alguien nos sigue
//stream.on('follow', followed)

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});

http.listen(port,function(){
    console.log('el servidor esta escuchando el puerto %s',port);
});


//conectamos bot

io.on('connection', function(socket) {

    socket.on('bot', function(confirm) {

       
        start= confirm;
        var stream = twit.stream('user')

        getWords();

     rtLoop =   setTimeout(searchRetwit,getRandomInt(2000,6000,true));
     favLoop =   setTimeout(searchFavorite, 10000);
    });
});

function followed(event){

    writeLogog(getFecha() + " " + messages.anyoneFollow);
    var name = event.source.name,
    screenName = event.source.screen_name;
    if(screenName !== config.userName)
        tweetNow('@' + screenName + " " + messages.thanks);
}

function tweetNow(twwetTxt){

    var tweet = {status: tweetTxt}

    Twitter.post('statuses/update', tweet, function(err, data, res){

        if(err){
                console.log("Error al twittear")

        } else {

            console.log("twiteado correctamente")
        }

    })

}

function getLog(){

   fLog =  fs.readFileSync(file).toString().replace("<br>", "\n");

   

   io.sockets.emit('log', fLog);

}

function getWords(){

words = fs.readFileSync('./config/words.txt').toString().split("\n");

favoriteWords = fs.readFileSync('./config/hastagsFavorites.txt').toString().split("\n");
    
}


//core bot retwits

function searchRetwit(){



    if(start == 'start'){
        
       

        var stream = twit.stream('user');

        stream.on('follow', followed);//activamos si nos siguen
        
       

       stringLog =  writeLog(getFecha() + " bot activado")

         
        
        var randomWord = "#"+words[getRandomInt(1,words.length,false) - 1];

       
        var params = {

            q: randomWord ,  //palabras o hashtag

            result_type: 'recent',  ///que sean recientes

            lang: config.lang  //idioma
        }


        twit.get('search/tweets', params, function(err, data, response) {

            if(!err){ //si no hay error twiteamos

                // console.log(data.statuses[0].favorite_count);

             //   console.log(randomWord);

               stringLog =  writeLog(getFecha() + " " + messages.searchRTS + " " + randomWord);


            


               stringLog =  writeLog(getFecha() + " " + messages.searchbetterTwit  + " "  + randomWord + "...");

                


                 bestTwit = getMostretweetedTwit(data.statuses);
                //bestTwit = data.statuses;

                 var retweetId = bestTwit.id_str;

             //    console.log(getFecha() + " Mejor twit con " + bestTwit.retweet_count + " retwits"); 

                 stringLog =  writeLog(getFecha() + " " + messages.betterTwit + " " + bestTwit.retweet_count + " retwits"); 

                 

                 makeRetwit(retweetId);//retuiteamos

            } else {

                console.log(err);

                stringLog = writeLog(err);

                

            }

        });


    //setTimeout(searchRetwit, getRandomInt(6000000,18000000,true));
    
    } else {
        
        io.sockets.emit('log', 'bot desactivado, esperando activación')
    }

rtLoop = setTimeout(searchRetwit, getRandomInt(600000,1000000,true));
}


function makeRetwit(twitId){


    twit.post('statuses/retweet/' + twitId, { }, function(error, response){
             
              //  io.sockets.emit('log',getFecha() + " retwiteado");

               

                
                    stringLog = writeLog(getFecha() + " " + messages.retwited);

                    

              



                //io.sockets.emit('log', getFecha() + " Proximo retwit: " + milisecondsToDate(nextTwit))

                stringLog = writeLog(getFecha() + " " +  messages.nextRT + " " + milisecondsToDate(nextTwit));
                
                

             // makeFavoriteTwit(retwitId);

            
            });


}


function searchFavorite(){


   if(favoriteWords.length > 0 ){
     var randomWord = "#" + favoriteWords[getRandomInt(1,favoriteWords.length,false) - 1];

    var params = {

        q: randomWord ,  //palabras o hashtag

        result_type: 'recent',  ///que sean recientes

        lang: 'es'  //idioma
    }
console.log(randomWord);

    twit.get('search/tweets', params, function(err, data, response) {

        if(!err){

            twits = data.statuses;


            for(var key in twits){
                makeFavoriteTwit(twits[key].id_str)

              //  console.log(twits[key].id_str);

            }
        }


    });

  favLoop = setTimeout(searchFavorite, 1800000);

   }

}
function makeFavoriteTwit(twitId){

    console.log("id " + twitId);

    twit.post('favorites/create', {id: twitId}, function(err, response) {
      if(err){

        //console.log("id " + twitId);
        return console.log(err[0].message);
        
    

      }

     write:

      
            writeLog(getFecha() + " " + messages.likeTwit);

     });


}


//fin retwits


   
function getRandomInt(min,max,time) {





    min = Math.ceil(min);

    max = Math.floor(max);

    rand= Math.floor(Math.random() * (max - min + 1 )) + min;

    //console.log("num"+ rand);
    if(time)
    {

        nextTwit = rand;

    }
  return rand;

}

function getMostretweetedTwit(twits){


    //console.log(twits[0].favorite_count);

    var mostretweeted = twits[0];

    
        var twitslist = fs.readFileSync('./twitslist.list').toString().split("\n");

    for (var key in twits) {
    //if (twits.hasOwnProperty(key)) {
        if(twits[key].retweet_count > mostretweeted.retweet_count && !twitslist.includes(twits[key].id_str) )
        {

            mostretweeted = twits[key];
            
            

        }
        
    //}
    }
    fs.appendFile('./twitslist.list', mostretweeted.id_str+"\n" )
    return mostretweeted;

}

function getFecha(){


    var fecha = new Date();

    hoy = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

    min = (fecha.getMinutes() >= 10) ? fecha.getMinutes() : "0"+ fecha.getMinutes();

    hora = fecha.getHours() + ":" + min + ":" + fecha.getSeconds();


    return hoy + " - " + hora;
}




function milisecondsToDate(mili){

    hora = Math.floor(mili/3600000);

    resthora = mili % 3600000;

    min = Math.floor(resthora / 60000);

    restmin = resthora % 60000;

    seg = restmin / 1000;


    date = new Date();


    hora = hora + date.getHours();

    if(hora >= 24)
    {

        hora = hora - 24;


    }

    min = min + date.getMinutes();

    if(min >= 60){

        min = min - 60;

        hora++;
    }


    hora = (hora < 10 ) ? "0"+hora : hora;

    min = (min < 10 ) ? "0"+min : min;
 
    return  hora + ":" + min;

}



app.get('/user/:user', function(req, res){

    user = req.params.user;

    

   stringLog = writeLog(getFecha() + messages.userTwits + " @"+user)

   

    searchapiTwits("@"+user, "user");
    //  res.send({message: username})

    res.send({message: `${user} retwiteado`})


})


app.get('/hash/:hash', function(req, res){

    hash = req.params.hash;



   stringLog= writeLog(getFecha() + " Buscando twits de #"+hash);

   

    searchapiTwits("#"+req.params.hash, "hash");

    res.send({message: `${hash} retwiteado`})
    //  res.send({message: username})

})

app.get('/list/:type',function(req, res){
    type = req.params.type;

    if(type == 'RT'){

        w = fs.readFileSync('./config/words.txt').toString();

       io.sockets.emit('listRT', w);


    } else {

        list = fs.readFileSync('./config/hastagsFavorites.txt').toString();

        io.sockets.emit('listFav', list);

    }

})


function searchapiTwits(apisearch, tipo){

    //var tipe = tipo;

    


    

        var retweetId;
        

            

            if(tipo !== "user"){//si es un hashtag
                params ={
                    q: apisearch ,  //palabras o hashtag

                    result_type: 'recent',  ///que sean recientes

                    lang: 'es'  //idioma


                }
                
                twit.get('search/tweets', params, function(err, data, response) {
                    if(!err){
                       

                      writeLog(getFecha() + " buscando mejor twit de " + apisearch + "...");

                       

                        bestTwit = getMostretweetedTwit(data.statuses);
                        
                      

                         var retweetId = bestTwit.id_str;
                        

                       writeLog(getFecha() + " Mejor twit con " + bestTwit.retweet_count + " retwits"); 

                       
                        //retuiteamos
                          makeRetwit(retweetId);

                    }
                })
            } else {//si es nombre de usuario
                
                params ={
                    screen_name: apisearch   //palabras o hashtag



                }
                
                twit.get('statuses/user_timeline', params, function(err, data, response) {
                    //c onsole.log(data);

                  

                 stringLog =  writeLog(getFecha() + " buscando ultimo twit de " + apisearch + "...");

                 

                    retweetId = data[0].id_str;

                //console.log(data[0].id_str);
                 // makeRetwit(retweetId);
                  makeRetwit(retweetId);//retuiteamos

          //   makeFavoriteTwit(retweetId);
    //retuiteamos

                })

}
             


}

function writeLog(sms){

    //console.log("archivo " + file);

    fs.appendFile(file, sms+"\n"+"<br>" , function (err) {
        // la funcion es la que maneja lo que sucede despues de termine el evento
        if (err) {
            return console.log(err);
        }
getLog();
     
        // las funciones de javascript en nodejs son asincronicas
        // por lo tanto lo que se quiera hacer debe hacerse dentro de la funcion que maneja el evento
        // si uno declara una variable arriba de la funcion, la manipula dentro y la quiere usar
        // despues afuera, se corre el riezgo de que nunca se realice la manipulacion.
       // console.log("The file was saved!");
    });

    

}


function createLog(){

    date = new Date();

    f = date.getFullYear().toString()+(date.getMonth()+1).toString()+date.getDate().toString()+date.getHours().toString()+date.getMinutes().toString();

    f ="./logs/"+f+".log";

    return f.toString();


}

