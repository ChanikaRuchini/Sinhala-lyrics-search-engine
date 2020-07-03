# Sinhala-lyrics-search-engine
This repository contains the source code for Real-time Sinhala songs lyrics Search Engine With Node, Vue, and ElasticSearch.

### Setting Up Elasticsearch
1. Download and run [Elasticsearch](https://www.elastic.co/downloads/elasticsearch).Start Elasticsearch locally on port 9200.
2. Install [Kibana](https://www.elastic.co/downloads/kibana) for query operations(Optional).
3. Install [ICU Analysis](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu.html) plugin.

### Setting Up the Index
1. Create an index named `song_data` in the Elasticsearch executing following queries.
```
PUT /song_data
{
    "settings": {
      "index": {
        "number_of_shards": 1,
        "number_of_replicas": 1
      },
      "analysis": {
        "analyzer": {
          "si-names-analyser": {
            "type": "custom",
            "tokenizer": "icu_tokenizer",
            "char_filter": ["punctuation_char_filter"],
            "filter": ["edge_n_gram_filter"]
          },
          "si-lyrics-analyser": {
            "type": "custom",
            "tokenizer": "icu_tokenizer"
          }
        },
        "char_filter": {
          "punctuation_char_filter": {
            "type": "mapping",
            "mappings": [".=>", "|=>", "-=>", "_=>", "'=>", "/=>", ",=> "]
          }
        },
        "filter": {
          "edge_n_gram_filter": {
            "type": "edge_ngram",
            "min_gram": "2",
            "max_gram": "10"
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "id": {
          "type": "integer"
        },
        "title": {
          "type": "search_as_you_type",
          "analyzer": "si-names-analyser",
          "search_analyzer": "si-names-analyser"
        },
        "artist": {
          "type": "search_as_you_type",
          "analyzer": "si-names-analyser",
          "search_analyzer": "si-names-analyser"
        },
         "writer": {
          "type": "search_as_you_type",
          "analyzer": "si-names-analyser",
          "search_analyzer": "si-names-analyser"
        },
        "music": {
          "type": "search_as_you_type",
          "analyzer": "si-names-analyser",
          "search_analyzer": "si-names-analyser"
        },
        "genre": {
          "type": "search_as_you_type",
          "analyzer": "si-names-analyser",
          "search_analyzer": "si-names-analyser"
        }, 
        "visits": {
          "type": "integer",
          "index": false
        },
        "lyrics": {
          "type": "search_as_you_type",
          "analyzer": "si-lyrics-analyser"
        }
      }
    }
  }
  
```
2. Download [Sinhala-songs Corpus](https://github.com/ChanikaRuchini/Sinhala-lyrics-search-engine/blob/master/sinhala_songs.json) and add documents to the created index using the [Bulk API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html)(Use Kibana or other option).

> Insted of creating custom index can build index using default index settings and and insert data using Bulk API by running data.js file. But creating custom index using above mentioned steps is more efficient.


### Running the Project

1. Get all the dependencies using `npm install` command.
2. Start node server using `node index.js` command.
3. visit http://localhost:3001/ in a browser.
4. Enter the search query in the search bar.

## Main Functionalities

* Search songs by entering any phrase of the song.
    * Eg:- නාමල් පිපිලා -Search by a song title.  <br>
           පහන තියා බුදු සාදුට හිමිදිරියේ - Search by a lyrics.
* Search can be done based on artist, writer, musician or genre.  <br>
     * Eg:- අමරදේව ගැයූ ගීත - Filter search based on artist.  <br>
            සුනිල් ආරියරත්න ලියූ සින්දු - Filter search based on writter.  <br>
            ක්ලැරන්ස් විජේවර්ධන සංගීතමය ගීත - Filter search based on music producer.  <br>
             පැරණි පොප්ස් - Filter search based song genre.
* Synonyms support – Search phrases support synonyms of the keywords
    * Eg:- If the input contains keyword 'ගායනා කරන','ගයන', 'ගායනා', '‌ගේ', 'හඩින්', 'කියනා', 'කිව්ව', 'කිව්', 'කිව', 'ගායනය','ගායනා කළා', 'ගායනා කල', 'ගැයූ', system identifies it as a search for an artist.  <br>
        If the input contains keyword 'ලියා', 'ලියූ', 'ලිව්ව', 'ලිව්', 'රචනා', 'ලියා ඇති', 'රචිත', 'ලියන ලද', 'ලියන', 'හදපු', 'පද','රචනය', 'හැදූ', 'හැදුව', 'ලියන', 'ලියන්න', 'ලීව', 'ලියපු', 'ලියා ඇත', 'ලිඛිත', system identifies it as a search for an writter.
* Range Queries – The project supports search queries in a given range by the user.
    * Eg:- අමරදේව හොදම ගීත 10 – The search engine returns the 10 best songs of Amaradewa sorted on the number of visits. 
* Supports more advanced queries 
    * Eg:- වික්ටර් රත්නායක සංගීතය හොදම ගීත 5  <br>
           ගුණදාස කපුගේ ගැයූ පැරණි පොප්ස් 10 <br>

# Structure of the Data

Each song contains the following seven data fields.

1.title - name of the song (string)  <br>
2.Artist - Singer of the song (string)  <br>
3.Genre - Genre of the song (string)  <br>
4.Writter - Lyricist of the song (string)  <br>
5.Music - Music composer of the song (string)  <br>
6.Visits - Number of views for the song in original site (integer)  <br>
7.Lyrics - song lyric (string)  <br>

Data is scraped from the [https://sinhalasongbook.com/](https://sinhalasongbook.com/) site for educational purposes  and the English metadata fields were translated to Sinhala using the Google Translate API. The processed data are stored in the sinhala_songs.json. This corpus consists with 1050 song data.


## Querying Techniques

* To classify the user queries into different types of serches a **Rule based classification** has been used. User input is tokenized and based on the keywords present, different rules are applied.

Eg: If the prase contains the word 'හොදම', 'ප්‍රසිද්ධ', sort the result based on number of visits and return the    best matching songs.  <br>
 If the phrase contains a number,return the best matching number of songs equal to the given number


* This project uses **Boosting** as the main query optimization technique. According to the user input, keywords of each fields are identified and each field of a search is boosted by a certain value based on them.

Eg: If the phrase contains the word “ගායනා කල" artist field is boosted.  <br>
    If the phrase contains the word “ලියූ" writer field is boosted.  <br>

* **Fuzzy search** queries are used to optimize the search by locating results that are likely to be relevant to a search argument even when the argument does not exactly correspond to the desired information. Therefore system returns results that contain terms similar to the search term, as measured by a Levenshtein edit distance even though search phares and spellings are not exactly the same.

* Aditionally, below query types and query options were also used.
    - [query_string query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-dsl-query-string-query) 
    - [Sort](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/search-request-sort.html)
