
var sparqlEndpoint = "http://127.0.0.1/xmlProjektBackend/sparqlEndpoint.php";

var selectstring = decodeURIComponent(location.search.substring(3, location.search.length));

console.log("[Frontend] Bestbuy Select other products"+selectstring);
$.ajax({
  type: "POST",
  url: sparqlEndpoint,
  data: {query: selectstring},
  dataType: "json",
  success: function(json) {
	  $('p').empty();
	  $('body').append("<h1>Alle Produkte der gleichen Marke: </h1>");

	  var bindings = json.results.bindings;
	  for (var i = 0; i < bindings.length; i++) {
		// TODO box selector + html korrigieren
		$('body').append("<div id=\"box"+ i +"\"></div>");
		$('body').append("<img class=\"topImage\" src=\""+ bindings[0].pImage.value +"\" >");
		$('body').append("<h4 class=\"heading\">"+ bindings[0].pName.value +"</h4>");
		$('body').append("<div class=\"content\">");
		$('body').append("<ul>");
		$('body').append("<li><b>Marke:</b> "+ bindings[i].bName.value +"</li>");
		$('body').append("<li><b>Modell:</b> "+ bindings[i].pModel.value +"</li>");
		$('body').append("<li><b>Produkt ID:</b> "+ bindings[i].pID.value +"</li>");
		$('body').append("<li><b>Preis:</b> "+ bindings[i].pPrice.value +"</li>");
		$('body').append("<li><b>Bewertung:</b> "+ bindings[i].pRating.value +"</li>");
		$('body').append("<li><b>Beschreibung:</b> "+ bindings[i].pDescription.value +"</li>");
		$('body').append("<li><b>URL:</b> <a href=\""+ bindings[i].pUrl.value +"\">Microdata URL</a></li>");
		$('body').append("</ul>");
		$('body').append("</div>");
	  }
	  console.log("[Backend] Response: Bestbuy Select other products finished ("+ bindings.length +" found).");
	  console.log(json);
  }
}); 
