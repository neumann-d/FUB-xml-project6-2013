
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
		var boxID = "box"+i;
		$('body').append("<div id=\""+ boxID +"\"></div>");
		
		if(typeof(bindings[i].pName) != "undefined") $('#'+boxID).append("<h4 class=\"heading\">"+ bindings[i].pName.value +"</h4>");
		if(typeof(bindings[i].pImage) != "undefined") $('#'+boxID).append("<img class=\"topImage\" src=\""+ bindings[i].pImage.value +"\" >");
	   
	   
		$('#'+boxID).append("<div class=\"content\"></div>");
		$('#'+boxID+' .content').append("<ul></ul>");
		if(typeof(bindings[i].pBrand) != "undefined") $('#'+boxID+' .content ul').append("<li><b>Marke:</b> "+ bindings[i].pBrand.value +"</li>");
		if(typeof(bindings[i].pModel) != "undefined") $('#'+boxID+' .content ul').append("<li><b>Modell:</b> "+ bindings[i].pModel.value +"</li>");
		if(typeof(bindings[i].pID) != "undefined") $('#'+boxID+' .content ul').append("<li><b>Produkt ID:</b> "+ bindings[i].pID.value +"</li>");
		if(typeof(bindings[i].pPrice) != "undefined") $('#'+boxID+' .content ul').append("<li><b>Preis:</b> "+ bindings[i].pPrice.value +"</li>");
		if(typeof(bindings[i].pRating) != "undefined") $('#'+boxID+' .content ul').append("<li><b>Bewertung:</b> "+ bindings[i].pRating.value +"</li>");
		if(typeof(bindings[i].pDescription) != "undefined") $('#'+boxID+' .content ul').append("<li><b>Beschreibung:</b> "+ bindings[i].pDescription.value +"</li>");
		if(typeof(bindings[i].pUrl) != "undefined") $('#'+boxID+' .content ul').append("<li><b>URL:</b> <a href=\""+ bindings[i].pUrl.value +"\">Microdata URL</a></li>");

	  }
	  console.log("[Backend] Response: Bestbuy Select other products finished ("+ bindings.length +" found).");
	  console.log(json);
  }
}); 
