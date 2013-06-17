<!doctype html>
<html>
<head>
	<meta charset="utf-8">
    <title>Microdata parsen</title>
    <?php
	  $microdatajsPath = "../../plugin/js/libs/microdatajs/";
	  $htmlTestFile = "simple_test.html";
    ?>
	<script src="<?php echo $microdatajsPath; ?>lib/jquery-1.4.4.min.js"></script>
	<script src="<?php echo $microdatajsPath; ?>jquery.microdata.js"></script>
	<script src="<?php echo $microdatajsPath; ?>jquery.microdata.rdf.js"></script>
	<script src="microdataToRDF.js"></script>
</head>
<body>
 
	<h1>Microdata Code:</h1>
	<?php
	  include($htmlTestFile);
	?>
	
	<h1>Gefundene Items:</h1>

	<script type="text/javascript">
	function pre(text) {
	  return '<pre>'+text.replace(/&/g, '&amp;').replace(/</g, '&lt;')+'</pre>';
	}
	var url = window.document.location;
	document.write(url);
	
	var turtleText = extractMicrodata();
	document.write(pre(turtleText));
	
	
	</script>
	
  </body>
</html>
