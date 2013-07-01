
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

	  var bindings = json.results.bindings;
	  for (var i = 0; i < bindings.length; i++) {
		var boxID = "box"+i;
		$('#products').append("<div id=\""+ boxID +"\" class=\"span5\"></div>");
		$('#'+boxID).append("<div id=\"topRow\" class=\"row-fluid\"></div>");
		
		if(typeof(bindings[i].pImage) != "undefined") $('#'+boxID+' #topRow').append("<div class=\"span6\"><div class=\"img-rounded\"><img src=\""+ bindings[i].pImage.value +"\" ></div></div>");
		if(typeof(bindings[i].pName) != "undefined") $('#'+boxID+' #topRow').append("<div class=\"span6\"><h4 class=\"heading\">"+ bindings[i].pName.value +"</h4></div>");
		
	   
	   
		$('#'+boxID).append("<div class=\"content\"></div>");
		$('#'+boxID+' .content').append("<ul></ul>");
		if(typeof(bindings[i].pBrand) != "undefined") $('#'+boxID+' .content ul').append("<li><strong>Marke:</strong> "+ bindings[i].pBrand.value +"</li>");
		if(typeof(bindings[i].pModel) != "undefined") $('#'+boxID+' .content ul').append("<li><strong>Modell:</strong> "+ bindings[i].pModel.value +"</li>");
		if(typeof(bindings[i].pID) != "undefined") $('#'+boxID+' .content ul').append("<li><strong>Produkt ID:</strong> "+ bindings[i].pID.value +"</li>");
		if(typeof(bindings[i].pPrice) != "undefined") $('#'+boxID+' .content ul').append("<li><strong>Preis:</strong> "+ bindings[i].pPrice.value +"</li>");
		if(typeof(bindings[i].pRating) != "undefined") $('#'+boxID+' .content ul').append("<li><strong>Bewertung:</strong> "+ bindings[i].pRating.value +"</li>");
		if(typeof(bindings[i].pDescription) != "undefined") $('#'+boxID+' .content ul').append("<li><strong>Beschreibung:</strong> "+ bindings[i].pDescription.value +"</li>");
		if(typeof(bindings[i].pUrl) != "undefined"){
		  var prodURL = (bindings[i].pUrl.value.length > 50)? bindings[i].pUrl.value.substring(0,49)+"..." : bindings[i].pUrl.value;
		  $('#'+boxID+' .content ul').append("<li><strong>URL:</strong> <a href=\""+ bindings[i].pUrl.value +"\">"+ prodURL +"</a></li>");
		}

	  }
	  console.log("[Backend] Response: Bestbuy Select other products finished ("+ bindings.length +" found).");
	  console.log(json);
	  
	  // Graph Button
	  $('.header').append("<button class=\"btn btn-primary btn-large\" id=\"graph\">Zeige Graph</button>");
	  $('#graph').bind("click", selectstring, showGraph);
  }
}); 

function showGraph(event) {
  var graphQuery = encodeURIComponent(event.data);
  //graphQuery = "SELECT ?pName ?pBrand WHERE { "+ graphQuery +" }";
  chrome.tabs.create({url: "http://127.0.0.1/xmlProjektBackend/sgvizler-0.5/sgvizler.html?query=" + graphQuery});
}