// http://www.europeana.eu/portal/record/08601/97D0837726642A5A66FF551FDE5625CEB4C9F4CC.html?utm_source=api&amp;utm_medium=api&amp;utm_campaign=uhpgWiaD5

var endpoint = "http://127.0.0.1/xmlProjektBackend/sparqlEndpoint.php";

function checkIfImage(img_uri) {
    var suffix = "IMAGE";
    return img_uri.indexOf(suffix, img_uri.length - suffix.length) !== -1;
}

function getImageURI(img_uri) {
    var parts = img_uri.split("=");
    var parts = parts[1].split("&");
    return parts[0];
}

function showSimilarArtworks(text) {
    // console.log(text);
    json_res = $.xml2json(text);
    // console.log(json_res);
		    
    for (var i=0; i<json_res.results.result.length; i++) {
	var target = json_res.results.result[i].binding[0].uri;
	// console.log(target);
	var title = json_res.results.result[i].binding[1].literal;
	// console.log(title);
	var img_src = json_res.results.result[i].binding[2].uri;
	img_src = decodeURIComponent(img_src);
	// console.log(img);
	if (checkIfImage(img_src)) {
	    var link = document.createElement("a");
	    link.href = target;
	    link.title = title;
			    
	    var img = document.createElement("img");
	    img.src = getImageURI(img_src);
			    
	    link.appendChild(img);
	    // console.log(link);
	    document.body.appendChild(link);
	}
    }
}

function getSelectByPublisher(publisher) {
    var select = "PREFIX ns: <http://purl.org/dc/elements/1.1/> . " +
	"SELECT ?url ?title ?preview WHERE {" +
	"?url ns:publisher '" + publisher + "' . " +
	"?url ns:title ?title . " +
	"?url ns:preview ?preview . " +
	"} LIMIT 100";
    return select;
}

function getSelectByProvider(provider) {
    var select = "PREFIX ns: <http://purl.org/dc/elements/1.1/> . " +
	"SELECT ?url ?title ?preview WHERE {" +
	"?url ns:provider '" + provider + "' . " +
	"?url ns:title ?title . " +
	"?url ns:preview ?preview . " +
	"} LIMIT 100";
    return select;
}

/**
 *  Fragt provider (creator) für diese URL ab und gibt die Bilder (Previews) dafür aus
 */
function getMyArt(url) {
    // console.log(url);
    var select = "PREFIX ns: <http://purl.org/dc/elements/1.1/> . " +
	"SELECT ?publisher ?provider WHERE {" + 
	"<" + url + "> ns:publisher ?publisher ."  +
	"<" + url + "> ns:provider ?provider . " +
	"}  LIMIT 100";
	
    // console.log(select);
    
    $.ajax({
        type: "POST",
        url: endpoint,
        data: {query: select},
        dataType: "text",
	success: function(text) {
	    // console.log(text);
	    var json_res = $.xml2json(text);
	    // console.log(json_res);
	    
	    var publisher = json_res.results.result.binding[0].literal;
	    var publisher_select = getSelectByPublisher(publisher);
	    // console.log(publisher_select);
		    
	    var provider = json_res.results.result.binding[1].literal;
	    var provider_select = getSelectByPublisher(provider);
	    // console.log(provider_select);
		    
	    $.ajax({
		type: "POST",
		url: endpoint,
		data: {query: publisher_select},
		dataType: "text",
		success: showSimilarArtworks
	    });
	    
	    $.ajax({
		type: "POST",
		url: endpoint,
		data: {query: provider_select},
		dataType: "text",
		success: showSimilarArtworks
	    });
	}
    });
}