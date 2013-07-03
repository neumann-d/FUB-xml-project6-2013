// http://www.europeana.eu/portal/record/08701/9CDED76786E8F16716ABAE4A7E7AB2A7E57A3726.html?utm_source=api&amp;utm_medium=api&amp;utm_campaign=uhpgWiaD5

var endpoint = "http://127.0.0.1/xmlProjektBackend/sparqlEndpoint.php";

/**
 *  Fragt provider (creator) für diese URL ab und gibt die Bilder (Previews) dafür aus
 */
function getMyArt(url) {
    var parts = url.split("?");
    var parts = parts[0].split(".");
    var uri = ""
    for (var j=0; j<(parts.length - 1); j++) {
	if (j === 0) {
	    uri += parts[j];
	    continue;
	}
	uri += "." + parts[j];
    }
    
    uri = uri.replace(/portal/, "resolve");
    console.log(uri);
    var select = "PREFIX ns: <http://purl.org/dc/elements/1.1/> . " +
	"SELECT ?title ?creator ?subject WHERE {" + 
	"<" + uri + "> ns:publisher 'Penn Pub. Co., Philadelphia' ."  +
	"<" + uri + "> ns:creator ?creator . " +
	"<" + uri + "> ns:subject ?subject . " +
	"<" + uri + "> ns:title ?title . " +
	"}  LIMIT 100";
	
    $.ajax({
        type: "POST",
        url: endpoint,
        data: {query: select},
        dataType: "text",
	success: function(text) {
		    var pre = document.createElement("pre");
		    pre.innerHTML = text;
		    document.body.appendChild(pre);
		}
    });
}