//require the Elasticsearch librray
const elasticsearch = require('elasticsearch');
// instantiate an elasticsearch client
const client = new elasticsearch.Client({
    hosts: ['http://localhost:9200']
});
//require Express
const express = require('express');
// instanciate an instance of express and hold the value in a constant called app
const app = express();
//require the body-parser library. will be used for parsing body requests
const bodyParser = require('body-parser')
//require the path library
const path = require('path');

// ping the client to be sure Elasticsearch is up
client.ping({
    requestTimeout: 30000,
}, function (error) {
    // at this point, eastic search is down, please check your Elasticsearch service
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('Everything is ok');
    }
});


// use the bodyparser as a middleware  
app.use(bodyParser.json())
// set port for the app to listen on
app.set('port', process.env.PORT || 3001);
// set path to serve static files
app.use(express.static(path.join(__dirname, 'public')));
// enable CORS 
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// defined the base route and return with an HTML file called tempate.html
app.get('/', function (req, res) {
    console.log('sending template...');
    res.sendFile('template1.html', {
        root: path.join(__dirname, 'views')
    });
})


// define the /search route that should return elastic search results 
app.get('/search', function (req, res) {
    console.log('In search...', req.query.q);

    let body = '';
    let field = [];
    let size = 10;
    let sort = [];
    is_title = true;
    is_artist = false;
    is_lyrics = false;
    is_writer = false;
    is_music = false;
    is_genre = false;
    new_query = " ";
    fields_list = [];
    output_size = -1;


    var inputlist = req.query.q.split(' ').map(item => item.trim());
    console.log(inputlist);

    movie_list = ['චිත්‍රපට', 'සිනමා']
    music_keywords_list = ['සංගීතමය', 'සංගීතවත්', 'අධ්‍යක්ෂණය', 'සංගීත']
    genre_keywords_list = ['පැරණි', 'පොප්ස්', 'පොප්', 'පරණ', 'ක්ලැසික්', 'ක්ලැසි', 'ඉල්ලීම', 'චිත්‍රපට', 'නව']
    artist_keywords_list = ['කීව', 'කී', 'ගායනා කරන', 'ගයන', 'ගායනා', '‌ගේ', 'හඩින්', 'කියනා', 'කිව්ව', 'කිව්', 'කිව', 'ගායනය',
                   'ගායනා කළා', 'ගායනා කල', 'ගැයූ']
    writer_keywords_list = ['ලියා', 'ලියූ', 'ලිව්ව', 'ලිව්', 'රචනා', 'ලියා ඇති', 'රචිත', 'ලියන ලද', 'ලියන', 'හදපු', 'පද',
                    'රචනය', 'හැදූ', 'හැදුව', 'ලියන', 'ලියන්න', 'ලීව', 'ලියපු', 'ලියා ඇත', 'ලිඛිත']
    is_popular_query = false
    quality_keyword_list = ['හොඳම', 'හොදම', 'ප්‍රසිද්ධ', 'ප්‍රසිද්ධම', 'ජනප්‍රිය', 'ජනප්‍රියතම', 'ඉස්තරම්', 'ඉස්තරම්ම', 'සුපිරි', 'සුපිරිම', 'පට්ට', 'මරු', 'ප්‍රචලිත'];



    inputlist.forEach(element => {
        //check input contains music keyword
        if(music_keywords_list.includes(element)){
            is_music = true;
        }
         //check input contains genre keyword
        else if (genre_keywords_list.includes(element)){
            is_genre = true;
        }
         //check input contains quality keyword
        else if( quality_keyword_list.includes(element)){
            is_popular_query = true;
        }
         //check input contains writer keyword
        else if(writer_keywords_list.includes(element)){
            is_writer = true;
        }
         //check input contains a number
        else if (!isNaN(element)){
            output_size= element;

        }
        else{    
            new_query = new_query + element + " "}  
    });
    console.log(new_query)
    input_query = new_query
    
    title_d = "title*";
    artist_d = "artist*";
    lyrics_d = "lyrics*";
    writer_d = "writer*";
    music_d = "music*";
    genre_d = "genre";

    if (writer_d || artist_d || music_d || genre_d){
        is_title = false
    }
    if (is_music){
        if (is_popular_query)
            fields_list.push(music_d);
        else
            music_d += "^4";
        }
    if (is_artist){
        if (is_popular_query)
            fields_list.push(artist_d);
        else
            artist_d += "^4";
        }
    if (is_writer){
        if (is_popular_query)
            fields_list.push(writer_d);
        else
            writer_d += "^4";
        }
    if (is_genre){
        if (is_popular_query)
            fields_list.push(genre_d)
        else
            genre_d += "^4"
        }
    if (is_title){
        if (is_popular_query)
            fields_list.push(title_d);
        else
            title_d += "^4";
    }
    if (is_popular_query){
        if (output_size == -1)
            output_size = 40
        if (input_query.trim().length == 0){
            body = {
                "sort": [{
                    "visits": {
                    "order": "desc"
                        }
                }
                    ],
                "size": output_size
                }
            }
           
        else{
            body = {
                "query": {
                    "query_string": {
                        "query": input_query,
                        "type": "bool_prefix",
                        "fields": fields_list,
                        "fuzziness": "AUTO",
                        "analyze_wildcard": true
                    }
                },
                "sort": [
                    {
                        "visits": {
                            "order": "desc"
                        }
                    }
                ],
                "size": output_size
            }
            
        }
    }
    else{
        fields_list = [title_d, artist_d, lyrics_d, writer_d, music_d, genre_d]
        body = {
            "query": {
                "query_string": {
                    "query": input_query,
                    "type": "bool_prefix",
                    "fields": fields_list,
                }
            }
        }
    }

    // perform the actual search passing in the index, the search query and the type
    client.search({
        //q: req.query.q,
        index: 'song_data',
        type: 'songs_list',
        body: body
    })
        .then(results => {
            res.send(results.hits.hits);
        })
        .catch(err => {
            console.log(err)
            res.send([]);
        });

})
// listen on the specified port
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});



  // decare a new route. This route serves a static HTML template called template2.html
  app.get('/v2', function(req, res){
    res.sendFile('template2.html', {
       root: path.join( __dirname, 'views' )
     });
  })