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
        url: sparqlEndpoint,
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
			  if(typeof(bindings[0].pBrand) != "undefined") $('#content ul').append("<li><strong>Marke:</strong> "+ bindings[0].pBrand.value +"</li>");
			  if(typeof(bindings[0].pModel) != "undefined") $('#content ul').append("<li><strong>Modell:</strong> "+ bindings[0].pModel.value +"</li>");
			  if(typeof(bindings[0].pID) != "undefined") $('#content ul').append("<li><strong>Produkt ID:</strong> "+ bindings[0].pID.value +"</li>");
			  if(typeof(bindings[0].pPrice) != "undefined") $('#content ul').append("<li><strong>Preis:</strong> "+ bindings[0].pPrice.value +"</li>");
			  if(typeof(bindings[0].pRating) != "undefined") $('#content ul').append("<li><strong>Bewertung:</strong> "+ bindings[0].pRating.value +"</li>");
			  if(typeof(bindings[0].pDescription) != "undefined") $('#content ul').append("<li><strong>Beschreibung:</strong> "+ bindings[0].pDescription.value +"</li>");
			  if(typeof(bindings[0].pUrl) != "undefined"){
				var prodURL = (bindings[0].pUrl.value.length > 50)? bindings[0].pUrl.value.substring(0,49)+"..." : bindings[0].pUrl.value;
				$('#content ul').append("<li><strong>URL:</strong> <a href=\""+ bindings[0].pUrl.value +"\">"+ prodURL +"</a></li>");
			  }
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
			  $('#content p').append("<button class=\"btn btn-primary\" id=\"getOtherProducts\">Anzeigen</button>");
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
						SELECT DISTINCT ?pBrand ?pName ?pUrl ?pImage ?pModel ?pID ?pDescription ?pPrice ?pRating  WHERE { \n\
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
