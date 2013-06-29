// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function getReco(tags) {
    // Baue den Filtersing
    var filterString = "filter (";

    for (var i = 0; i < tags.length; i++) {
        filterString = filterString + "?tag = \"" + tags[i] + "\" ";
        if (i < tags.length - 1)
            filterString = filterString + " || ";
    }
    filterString = filterString + ")";

    console.log(filterString);


    // Beim Klick auf den Button soll der zugehörige Graph angezeigt werden
    $('#showGraph').bind("click", function() {
        var graphQuery = "select ?url ?tag WHERE { ?url ns2:tag ?tag .  "+filterString+" }";
        chrome.tabs.create({ url: "http://127.0.0.1/xmlProjektBackend/sgvizler-0.5/sgvizler.html?query="+graphQuery });
    });


    // Frage ähnliche Fragen ab
    $.ajax({
        type: "POST",
        url: so.sparqlEndpoint,
        data: "query= @prefix ns0: <http://purl.org/dc/elements/1.1/> .\n\
                   @prefix ns2: <http://poshrdf.org/ns/mf#> . \n\
                   select distinct ?url ?title WHERE {?url ns2:tag ?tag .\n ?url ns0:title ?title .\n " + filterString + "}",
        dataType: "json",
        success: function(json) {
            console.log(json);
            $('p').empty();
            $('body').append("<p>Ähnliche Fragen: </p>");
            $('body').append("<ul></ul>");
            
            var bindings = json.results.bindings;
            
            for(var i = 0; i < bindings.length; i++) {
                $('body ul').append("<li><a href='"+bindings[i].url.value+"'>"+ bindings[i].title.value+"</a></li>");
            }


        }
    });
    
    console.log("test");

}
;

var so = {
    sparqlEndpoint: "http://127.0.0.1/xmlProjektBackend/sparqlEndpoint.php",
    /**
     * Fragt das Backend zuerst nach den auf dieser Seite enthaltenen Tags ab.
     * Sucht danach im Backend nach Fragen mit den gleichen Tags und zeigt diese
     * im Popup an.
     * @public
     */
    getMyTags: function(url) {

        $.ajax({
            type: "POST",
            url: this.sparqlEndpoint,
            data: "query= @prefix ns2: <http://poshrdf.org/ns/mf#> . \n select ?tag { \"" + url + "\" ns2:tag ?tag } ",
            dataType: "json",
            success: function(json) {
                var tags = new Array();
                console.log(json);

                var tagBindings = json.results.bindings;


                for (var i = 0; i < tagBindings.length; i++) {
                    tags.push(tagBindings[i].tag.value);
                }
                console.log(tags);
                getReco(tags);

            }
        });
    }
};

// Run query as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function() {
    
    chrome.tabs.getSelected(function(tab) {
        var url = tab.url;
        if(url.indexOf("http://stackoverflow.com/") === 0)
            so.getMyTags(tab.url);
		if(url.indexOf("http://www.bestbuy.com/") === 0)
			getMyBrandname(tab.url);
		if(url.indexOf("GetRecord") !== -1)
			getMyCreator(tab.url);
    });
});


/**
  * Fragt das Backend nach dem Markennamen des Produkts auf der aktuellen Seite ab und sucht danach andere Produkte der gleichen Marke.
  */
function getMyBrandname(url) {
  var selectstring = "SELECT ?bName WHERE \n\
					  { GRAPH <"+ url +"> { \n\
						?b <http://www.w3.org/1999/xhtml/microdata#http://schema.org/Brand%23:name> ?bName \n\
						. } } LIMIT 100";
  console.log("[Frontend] Bestbuy Select Brandname at url: "+url);
  
  $.ajax({
	type: "POST",
	url: so.sparqlEndpoint,
	data: {query: selectstring},
	dataType: "json",
	success: function(json) {
		console.log(url);
		console.log(json);
		
		var brandBindings = json.results.bindings;
		var brandNames = new Array();
		for (var i = 0; i < brandBindings.length; i++) {
		  brandNames.push(brandBindings[i].bName.value);
		}
		console.log("[Backend] Response: Bestbuy Select Brandname finished ("+brandNames.length+" found).");
		
		// falls Markenname gefunden, dann andere Produkte suchen
		if(brandNames.length > 0){
		  console.log(brandNames);
		  getOtherProducts(brandNames);
		} 
	}
  });
}

/**
 * Fragt das Backend nach Produkten mit gegebenen Markennamen ab.
 */
function getOtherProducts(brandNames) {
  var brandNameSchemaUrl = "<http://www.w3.org/1999/xhtml/microdata#http://schema.org/Brand%23:name>";
  
  var brandNamesString = "";
  for (var i = 0; i < brandNames.length-1; i++) {
	brandNamesString += "{?b "+ brandNameSchemaUrl +" \""+ brandNames[i] +"\" } \n\ UNION ";
  }
  brandNamesString += "{?b "+ brandNameSchemaUrl +" \""+ brandNames[brandNames.length-1] +"\" } ";
  
  var selectstring = "SELECT ?producturl WHERE { \n\
					  "+ brandNamesString + " . \n\
					  ?product ?p ?b . \n\
					  ?product <http://www.w3.org/1999/xhtml/microdata#http://schema.org/Product%23:url> ?producturl . \n\
					  } LIMIT 100";
  // console.log(selectstring);
  console.log("[Frontend] Bestbuy Select other products");
  $.ajax({
	type: "POST",
	url: so.sparqlEndpoint,
	data: {query: selectstring},
	dataType: "json",
	success: function(json) {
		$('p').empty();
        $('body').append("<p>Andere Produkte der selben Marke: </p>");
        $('body').append("<ul></ul>");
		
		// TODO nicht nur url abfragen, sondern auch Name, Bild etc.
		var bindings = json.results.bindings;
		for (var i = 0; i < bindings.length; i++) {
		  $('body ul').append("<li><a href='"+bindings[i].producturl.value+"' >"+ bindings[i].producturl.value +"</a></li>");
		}
		console.log("[Backend] Response: Bestbuy Select other products finished ("+ bindings.length +" found).");
		console.log(json);
	}
  });
}
  
  /**
  * Fragt das Backend nach dem Autor der Publication auf der aktuellen Seite ab und sucht danach anderen Publicationen des gleichen Autors.
  */
function getMyCreator(url) {
console.log("query= @prefix ns0: <http://purl.org/dc/elements/1.1/> . \n select ?creator { \"" + url + "\" ns0:creator ?creator } ");
        $.ajax({
            type: "POST",
            url: so.sparqlEndpoint,
			data: {query: "@prefix ns0: <http://purl.org/dc/elements/1.1/> . \n select ?creator { \"" + url + "\" ns0:creator ?creator } "},
            dataType: "json",
            success: function(json) {
                var creators = new Array();
                console.log(json);

                var cBindings = json.results.bindings;


                for (var i = 0; i < cBindings.length; i++) {
                    creators.push(cBindings[i].creator.value);
                }
                console.log(creators);
                getOtherPubs(creators);
            }
        });
}

function getOtherPubs(creators) {
    // Baue den Filtersing
    var filterString = "filter (";

    for (var i = 0; i < creators.length; i++) {
        filterString = filterString + "?creator = \"" + creators[i] + "\" ";
        if (i < creators.length - 1)
            filterString = filterString + " || ";
    }
    filterString = filterString + ")";

    console.log(filterString);


    // Beim Klick auf den Button soll der zugehörige Graph angezeigt werden
    $('#showGraph').bind("click", function() {
        var graphQuery = "select ?url ?creator WHERE { ?url ns0:creator ?creator .  "+filterString+" }";
        chrome.tabs.create({ url: "http://127.0.0.1/xmlProjektBackend/sgvizler-0.5/sgvizler.html?query="+graphQuery });
    });
	
    // Frage weitere Publikationen ab
    $.ajax({
        type: "POST",
        url: so.sparqlEndpoint,
        data: "query= @prefix ns0: <http://purl.org/dc/elements/1.1/> .\n\
                   select distinct ?url ?title WHERE {?url ns0:creator ?creator .\n ?url ns0:title ?title .\n " + filterString + "}",
        dataType: "json",
        success: function(json) {
            console.log(json);
			      
			//Bild
            $('#topImage').attr('src', 'http://www.moroks.com/adm/zbl/images/image_not_found.jpg');
			
			//Überschrift
			var heading = "Weitere Artikel von ";
		    for (var i = 0; i < creators.length; i++) {
				heading = heading + creators[i];
				if (i < creators.length - 1)
					heading = heading + " / ";
			}

            $('#heading').html(heading);
			
			//Inhalt
            var bindings = json.results.bindings;
            
			$('#content').html("<ul>");
            for(var i = 0; i < bindings.length; i++) {
                $('#content').append("<li><a href='"+bindings[i].url.value+"'>"+ bindings[i].title.value+"</a></li>");
            }
			$('#content').append("</ul>");


        }
    });
    
}
;
