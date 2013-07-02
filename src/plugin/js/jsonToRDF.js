// http://europeana.eu/api//v2/search.json?wskey=uhpgWiaD5&query=flower&start=1&rows=12&profile=standard
/*

PREFIX dc: <http://purl.org/dc/elements/1.1/>
INSERT INTO <http://europeana.eu/api//v2/search.json?wskey=uhpgWiaD5&query=flower&start=1&rows=12&profile=standard> {
    <http://example/egbook3> dc:title  "This is an example title"
}

*/

var API_KEY = "uhpgWiaD5";
var SPARQL_URL = "http://localhost/xmlProjektBackend/sparqlEndpoint.php";

if(document.URL.indexOf("wskey=" + API_KEY) > 0) {
    console.log("parsing JSON from: " + document.URL);
    var json_string = document.body.getElementsByTagName("pre")[0].innerHTML;
    var json_object = $.parseJSON(json_string);

    var jrdf_items = new Array();
    
    for (var i=0; i<json_object.itemsCount; i++) {
        var item = json_object.items[i];
        // console.log(item);
        var j;
        var query;
        
        // Queries fuer Title
        for (j=0; j<item.title.length; j++) {
            query = "INSERT INTO <http://europeana.eu/api//v2> { <" + item.guid + "> <http://purl.org/dc/elements/1.1/title> '" + item.title[j] + "'} ";
            $.ajax({
                type:       "POST",
                url:        SPARQL_URL,
                data:       query,
                dataType:   "text",
                success:    function(text) {
                    console.log("Backend Response:\n" + text);
                }
            });
        }
        // console.log(query);
        // Queries fuer Provider
        for (j=0; j<item.provider.length; j++) {
            query = "INSERT INTO <http://europeana.eu/api//v2> { <" + item.guid + "> <http://purl.org/dc/elements/1.1/provider> '" + item.provider[j] + "'} ";
            $.ajax({
                type:       "POST",
                url:        SPARQL_URL,
                data:       query,
                dataType:   "text",
                success:    function(text) {
                    console.log("Backend Response:\n" + text);
                }
            });
        }
        // console.log(query);
        // Queries fuer dataProvider
        for (j=0; j<item.dataProvider.length; j++) {
            query = "INSERT INTO <http://europeana.eu/api//v2> { <" + item.guid + "> <http://purl.org/dc/elements/1.1/dataProvider> '" + item.dataProvider[j] + "'} ";
            $.ajax({
                type:       "POST",
                url:        SPARQL_URL,
                data:       query,
                dataType:   "text",
                success:    function(text) {
                    console.log("Backend Response:\n" + text);
                }
            });
        }
        // console.log(query);
        for (j=0; j<item.edmPreview.length; j++) {
            query = "INSERT INTO <http://europeana.eu/api//v2> { <" + item.guid + "> <http://purl.org/dc/elements/1.1/preview> '" + item.edmPreview[j] + "'} ";
            $.ajax({
                type:       "POST",
                url:        SPARQL_URL,
                data:       query,
                dataType:   "text",
                success:    function(text) {
                    console.log("Backend Response:\n" + text);
                }
            });
        }
        // console.log(query);
        query = "INSERT INTO <http://europeana.eu/api//v2> { <" + item.guid + "> <http://purl.org/dc/elements/1.1/type> '" + item.type + "'}";
        $.ajax({
            type:       "POST",
            url:        SPARQL_URL,
            data:       query,
            dataType:   "text",
            success:    function(text) {
                console.log("Backend Response:\n" + text);
            }
        });
        // console.log(query);
    }
}