/*
PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
SELECT ?nameX ?nameY ?nickY
WHERE
  { ?x foaf:knows ?y ;
       foaf:name ?nameX .
    ?y foaf:name ?nameY .
    OPTIONAL { ?y foaf:nick ?nickY }
  }
*/

var endpoint = "http://localhost/xmlProjektBackend/sparqlEndpoint.php";

/**
 *  Fragt provider (creator) für diese URL ab und gibt die Bilder (Previews) dafür aus
 */
function getMyArt(url) {
    var selectstring = "PREFIX ns: <http://purl.org/dc/elements/1.1/> ." +
    "SELECT ?preview ?title WHERE" +
    "{ GRAPH <http://europeana.eu/api//v2> {<" + url + "> ns:provider ?x ." +
    "?x ns:provider ?preview . " +
    "?x ns:provider ?title . " +
    "} } LIMIT 100";
    console.log(selectstring);
    // var pre = document.createElement("pre");
    // pre.innerHTML = selectstring;
    // document.body.appendChild(pre);
    
    $.ajax({
        type: "POST",
        url: endpoint,
        data: {query: selectstring},
        dataType: "text",
	success: function(json) {
			console.log(url);
			console.log(json);
		}
    });
}