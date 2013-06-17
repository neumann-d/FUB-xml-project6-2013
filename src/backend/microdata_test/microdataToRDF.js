function extractMicrodata() {

  var items = $(document).items();
  var turtleText = $.microdata.turtle(items);

  if(items.length > 0){
	return turtleText;
  }
  
  return ""; 
}