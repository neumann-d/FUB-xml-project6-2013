// http://europeana.eu/api//v2/search.json?wskey=uhpgWiaD5&query=flowers
//http://europeana.eu/api//v2/search.json?wskey=uhpgWiaD5&query=Det+Danske+Filminstitut

var API_KEY = "uhpgWiaD5";
var SPARQL_URL = "http://127.0.0.1/xmlProjektBackend/sparqlEndpoint.php";

if(document.URL.indexOf("wskey=" + API_KEY) > 0) {
    console.log("parsing JSON from: " + document.URL);
    var json_string = document.body.getElementsByTagName("pre")[0].innerHTML;
    var json_object = $.parseJSON(json_string);

    var jrdf_items = new Array();
    
    for (var i=0; i<json_object.itemsCount; i++) {
        var item = json_object.items[i];
        console.log(item);
        var j;
        var query_beg = "PREFIX ts: <" + encodeURIComponent("http://purl.org/dc/elements/1.1/") + "> INSERT INTO <" +
                            encodeURIComponent("http://europeana.eu/api//v2") + "> { <" + encodeURIComponent(item.guid) + ">";
        var query;
        
        // Queries fuer Title
        for (j=0; j<item.title.length; j++) {
            query = " ts:title '" + item.title[j] + "'}";
                
            $.ajax({
                type:       "POST",
                url:        SPARQL_URL,
                data:       "query= " + query_beg + query,
                dataType:   "text",
                success:    function(text) {
                    // console.log("Backend Response:\n" + text);
                }
            });
        }
        
        // Provider
        for (j=0; j<item.provider.length; j++) {
            query = " ts:provider '" + item.provider[j] + "'}";
            
            $.ajax({
                type:       "POST",
                url:        SPARQL_URL,
                data:       "query= " + query_beg + query,
                dataType:   "text",
                success:    function(text) {
                    // console.log("Backend Response:\n" + text);
                }
            });
        }
        
        // dataProvider / Publisher
        for (j=0; j<item.dataProvider.length; j++) {
            query = " ts:publisher '" + item.dataProvider[j] + "'}";
            
            $.ajax({
                type:       "POST",
                url:        SPARQL_URL,
                data:       "query= " + query_beg + query,
                dataType:   "text",
                success:    function(text) {
                    // console.log("Backend Response:\n" + text);
                }
            });
        }
        
        // Preview link
        for (j=0; j<item.edmPreview.length; j++) {
            query = " ts:preview <" + encodeURIComponent(item.edmPreview[j]) + ">}";
            
            $.ajax({
                type:       "POST",
                url:        SPARQL_URL,
                data:       "query= " + query_beg + query,
                dataType:   "text",
                success:    function(text) {
                    // console.log("Backend Response:\n" + text);
                }
            });
        }
        
        // type
        query = " ts:type '" + item.type + "'}";
        $.ajax({
            type:       "POST",
            url:        SPARQL_URL,
            data:       "query= " + query_beg + query,
            dataType:   "text",
            success:    function(text) {
                // console.log("Backend Response:\n" + text);
            }
        });
    }
}