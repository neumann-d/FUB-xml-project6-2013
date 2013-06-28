// http://europeana.eu/api//v2/search.json?wskey=uhpgWiaD5&query=flower&start=1&rows=12&profile=standard
/*

PREFIX dc: <http://purl.org/dc/elements/1.1/>
INSERT INTO <http://europeana.eu/api//v2/search.json?wskey=uhpgWiaD5&query=flower&start=1&rows=12&profile=standard> {
    <http://example/egbook3> dc:title  "This is an example title"
}

*/

const API_KEY = 'uhpgWiaD5';
const SPARQL_URL = "http://localhost/backend/sparqlEndpoint.php";

if(document.URL.indexOf("wskey=" + API_KEY) > 0) {
    console.log("parsing JSON from: " + document.URL);
    var json_string = document.body.getElementsByTagName("pre")[0].innerHTML;
    var json_object = $.parseJSON(json_string);

    var jrdf_items = new Array();
    
    for (var i=0; i<json_object.itemsCount; i++) {
        var item = json_object.items[i];
        var j;
        var query = "PREFIX dc: <http://purl.org/dc/elements/1.1/> ";
        
        // Queries fuer Title
        for (j=0; j<item.title.length; j++) {
            query += "INSERT INTO <http://europeana.eu/api//v2> { " + item.link + " dc:title " + item.title[j] + "} ";
        }
        
        // Queries fuer Provider
        for (j=0; j<item.provider.length; j++) {
            query += "INSERT INTO <http://europeana.eu/api//v2> { " + item.link + " dc:provider " + item.provider[j] + "} ";
        }
    
        // Queries fuer dataProvider
        for (j=0; j<item.dataProvider.length; j++) {
            query += "INSERT INTO <http://europeana.eu/api//v2> { " + item.link + " dc:dataProvider " + item.dataProvider[j] + "} ";
        }
        
        query += "INSERT INTO <http://europeana.eu/api//v2> { " + item.link + " dc:type " + item.type + "}";
        // console.log(query);
        
        $.ajax({
        type:       "POST",
	url:        SPARQL_URL,
        data:       query,
        dataType:   "text",
        success:    function(text) {
                        console.log("Backend Response: " + text);
                    }
        });
    }
}