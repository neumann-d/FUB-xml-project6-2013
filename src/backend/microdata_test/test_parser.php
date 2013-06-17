<html>
  <head>
    <title></title>
    <meta content="">
    <style></style>
  </head>
  <body>

<pre>
<?php

// Zeige keine NOTICE Meldungen an
error_reporting (E_ALL ^ E_NOTICE);

/* ARC2 static class inclusion */ 
include_once('../arc2/ARC2.php');

$parser = ARC2::getTurtleParser();
$parser->parse("bestbuy.ttl");

$triples = $parser->getTriples();
print_r($triples);
 
?>
</pre>

  
  </body>
</html>