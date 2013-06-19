

var url = document.location;

// console.log("Parsing Microdata from: "+url);
var items = $(document).items();
var turtleText = $.microdata.turtle(items);

// console.log(items.length+" items found");
// console.log(turtleText);

if(items.length > 0){
  // zum Endpoint senden
  $.ajax({
	  type: "POST",
	  url: "http://127.0.0.1/xmlProjektBackend/turtleReceiver.php",
	  data: "url=" + escape(url) + "&turtle=" + escape(turtleText),
	  dataType: "text",
	  success: function(text) {
		  console.log("Backend Response: "+text);
	  }
  });
  

}


