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
        var graphQuery = "select ?url ?tag WHERE { ?url ns2:tag ?tag .  " + filterString + " }";
        chrome.tabs.create({url: "http://127.0.0.1/xmlProjektBackend/sgvizler-0.5/sgvizler.html?query=" + graphQuery});
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

            for (var i = 0; i < bindings.length; i++) {
                $('body ul').append("<li><a href='" + bindings[i].url.value + "'>" + bindings[i].title.value + "</a></li>");
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
        
        // StackOverflow.com Beispiel
        if (url.indexOf("http://stackoverflow.com/") === 0)
            so.getMyTags(tab.url);
        
        // BestBuy.com Beispiel
        if (url.indexOf("http://www.bestbuy.com/") === 0)
            getMyBrandname(tab.url);
        
        // XML Beispiel
        if (url.indexOf("GetRecord") !== -1)
            getMyCreator(tab.url);

        $('#databtn').bind("click", function() {
            var graphQuery = "SELECT * FROM <" + url + "> WHERE { { ?s ?p ?o . } FILTER(langMatches(lang(?o), \"EN\") || langMatches(lang(?o), \"DE\") || LANG(?o) = \"\")}";
            chrome.tabs.create({url: "http://127.0.0.1/xmlProjektBackend/sparqlEndpoint.php?output=htmltab&query=" + graphQuery + ""});
        });
    });


});


/**
 * Fragt das Backend nach den Markennamen der Produkte auf der aktuellen Seite ab und sucht dazu weitere Produktdetails.
 */
function getMyBrandname(url) {
    var selectstring = "@prefix nsP: <http://www.w3.org/1999/xhtml/microdata#http://schema.org/Product%23> . \n\
						@prefix nsBrand: <http://www.w3.org/1999/xhtml/microdata#http://schema.org/Brand%23> . \n\
						@prefix nsPrice: <http://www.w3.org/1999/xhtml/microdata#http://schema.org/Offer%23> . \n\
						@prefix nsRating: <http://www.w3.org/1999/xhtml/microdata#http://schema.org/AggregateRating%23> . \n\
						@prefix nsURL: <"+ url +"> \n\
						SELECT DISTINCT ?pUrl ?pName ?pImage ?pModel ?pID ?pDescription ?pBrand ?pPrice ?pRating WHERE \n\
						{ GRAPH nsURL: { \n\
						  ?product nsP::url ?pUrl . \n\
						  OPTIONAL { ?product nsP::name ?pName } . \n\
						  OPTIONAL { ?product nsP::image ?pImage } . \n\
						  OPTIONAL { ?product nsP::model ?pModel } . \n\
						  OPTIONAL { ?product nsP::productID ?pID } . \n\
						  OPTIONAL { ?product nsP::description ?pDescription } . \n\
						  OPTIONAL { ?product nsP::brand ?b . ?b nsBrand::name ?pBrand } . \n\
						  OPTIONAL { ?product nsP::aggregateRating ?rating . ?rating nsRating::ratingValue ?pRating } . \n\
						  OPTIONAL { ?product nsP::offers ?offer . ?offer nsPrice::price ?pPrice } \n\
						} } LIMIT 100";
    console.log("[Frontend] Bestbuy Select Brandname at url: " + url);
    // console.log("[Frontend] Bestbuy Select Brandname with SELECT STRING:\n "+selectstring);

    $.ajax({
        type: "POST",
        url: so.sparqlEndpoint,
        data: {query: selectstring},
        dataType: "json",
		success: function(json) {
			console.log(url);
			console.log(json);
			
			var bindings = json.results.bindings;
			
			// Produktdetails im Popup ausgeben (nur für das 1. gefundene Produkt)
			if(bindings.length > 0){
			  if(typeof(bindings[0].pName) != "undefined") $('#heading').html(bindings[0].pName.value);
			  if(typeof(bindings[0].pImage) != "undefined") $('#topImage').attr('src', bindings[0].pImage.value);
			  
			  $('#content').empty();
			  $('#content').append("<ul></ul>");
			  if(typeof(bindings[0].pBrand) != "undefined") $('#content ul').append("<li><b>Marke:</b> "+ bindings[0].pBrand.value +"</li>");
			  if(typeof(bindings[0].pModel) != "undefined") $('#content ul').append("<li><b>Modell:</b> "+ bindings[0].pModel.value +"</li>");
			  if(typeof(bindings[0].pID) != "undefined") $('#content ul').append("<li><b>Produkt ID:</b> "+ bindings[0].pID.value +"</li>");
			  if(typeof(bindings[0].pPrice) != "undefined") $('#content ul').append("<li><b>Preis:</b> "+ bindings[0].pPrice.value +"</li>");
			  if(typeof(bindings[0].pRating) != "undefined") $('#content ul').append("<li><b>Bewertung:</b> "+ bindings[0].pRating.value +"</li>");
			  if(typeof(bindings[0].pDescription) != "undefined") $('#content ul').append("<li><b>Beschreibung:</b> "+ bindings[0].pDescription.value +"</li>");
			  if(typeof(bindings[0].pUrl) != "undefined") $('#content ul').append("<li><b>URL:</b> <a href=\""+ bindings[0].pUrl.value +"\">Microdata URL</a></li>");
			}
			
			// Markennamen merken
			var brandNames = new Array();
			
			// Bemerkung: in der Regel sollte nur 1 Produkt(1 Markenname) auf der aktuellen Seite auftreten
			for (var i = 0; i < bindings.length; i++) {
			  if(typeof(bindings[i].pBrand) != "undefined") brandNames.push(bindings[i].pBrand.value);
			}
			console.log("[Backend] Response: Bestbuy Select Brandname finished ("+brandNames.length+" found).");
			
			// falls Marke gefunden, dann Button anbieten, um andere Produkte zu suchen
			if(brandNames.length > 0) {
			  $('#content').append("<p>Alle Produkte mit gleichem Markennamen: </p>");
			  $('#content p').append("<button id=\"getOtherProducts\">Anzeigen</button>");
			  $('#getOtherProducts').bind("click", brandNames, getOtherProducts);
			} 
		}
    });
}

/**
 * Fragt das Backend nach Produkten mit gegebenen Markennamen ab.
 */
function getOtherProducts(event) {
	var brandNames = event.data;
	console.log(brandNames);
	
	var brandNamePrefix = "nsBrand:";
	var brandNamesString = "";
	for (var i = 0; i < brandNames.length-1; i++) {
	  brandNamesString += "{?b "+ brandNamePrefix +":name \""+ brandNames[i] +"\" } \n\ UNION ";
	}
	brandNamesString += "{?b "+ brandNamePrefix +":name \""+ brandNames[brandNames.length-1] +"\" } ";
	  
	var selectstring = "@prefix nsP: <http://www.w3.org/1999/xhtml/microdata#http://schema.org/Product%23> . \n\
						@prefix "+ brandNamePrefix +" <http://www.w3.org/1999/xhtml/microdata#http://schema.org/Brand%23> . \n\
						@prefix nsPrice: <http://www.w3.org/1999/xhtml/microdata#http://schema.org/Offer%23> . \n\
						@prefix nsRating: <http://www.w3.org/1999/xhtml/microdata#http://schema.org/AggregateRating%23> . \n\
						SELECT DISTINCT ?pUrl ?pName ?pImage ?pModel ?pID ?pDescription ?pBrand ?pPrice ?pRating  WHERE { \n\
						  ?product nsP::brand ?b . \n\
						  "+ brandNamesString + " . \n\
						  ?b "+ brandNamePrefix +":name ?pBrand . \n\
						  OPTIONAL { ?product nsP::url ?pUrl } . \n\
						  OPTIONAL { ?product nsP::name ?pName } . \n\
						  OPTIONAL { ?product nsP::image ?pImage } . \n\
						  OPTIONAL { ?product nsP::model ?pModel } . \n\
						  OPTIONAL { ?product nsP::productID ?pID } . \n\
						  OPTIONAL { ?product nsP::description ?pDescription } . \n\
						  OPTIONAL { ?product nsP::aggregateRating ?rating . ?rating nsRating::ratingValue ?pRating } . \n\
						  OPTIONAL { ?product nsP::offers ?offer . ?offer nsPrice::price ?pPrice } \n\
						} LIMIT 100";
	// console.log(selectstring);
		  
	// Erzeuge neuen Tab
	chrome.tabs.create({ url: "./microdataSimilarProducts.html?q="+encodeURIComponent(selectstring) });
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
        var graphQuery = "select ?url ?creator WHERE { ?url ns0:creator ?creator .  " + filterString + " }";
        chrome.tabs.create({url: "http://127.0.0.1/xmlProjektBackend/sgvizler-0.5/sgvizler.html?query=" + graphQuery});
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
            for (var i = 0; i < bindings.length; i++) {
                $('#content').append("<li><a href='" + bindings[i].url.value + "'>" + bindings[i].title.value + "</a></li>");
            }
            $('#content').append("</ul>");


        }
    });

}
;
