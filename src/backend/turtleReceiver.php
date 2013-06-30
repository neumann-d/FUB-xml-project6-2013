<?php

// Zeige keine NOTICE Meldungen an
error_reporting (E_ALL ^ E_NOTICE);

/* ARC2 static class inclusion */ 
include_once('arc2/ARC2.php');
include_once('response.php');
require_once './config/config.php';

/* instantiation */
$ep = ARC2::getStoreEndpoint($config);

if (!$ep->isSetUp()) {
  $ep->setUp(); /* create MySQL tables */
}

 
// Empfängt RDF Daten im Turtle Format und speichert diese im Triplestore.
if(!empty($_POST['url']) && !empty($_POST['turtle']) ){
	$url = $_POST['url'];
	
    // Wenn es die URL im Graph schon gibt, nichts machen, TODO besser updaten?
    if (graphContainsUrl($url)) {        
        $res = new Response(null, "URL $url already visited, skip indexing");
        
    } else {
	  $parser = ARC2::getTurtleParser();
	  $data = $_POST['turtle'];
	  
	  $parser->parse($url, $data);
	  
	  $triples = $parser->getTriples();
	  // print_r($triples);
	  
	  // Wenn keine Tripel gefunden wurden
	  if(count($triples) < 1) {
		  $res = new Response(null, "URL $url contains no triples");        

	  } else {
		// in Datenbank einfügen mit URL als Graph Identifier
		$ep->insert($triples,$url);
		
		$res = new Response(null, "URL $url: added ".count($triples)." triples".$triples); 
	  }
	  
	}
	echo(json_encode($res) );
}

// TODO duplicate Code
/**
 * Überprüft, ob eine URL schon im Graphen _irgendwo_ vorhanden ist
 * TODO: Vielleicht etwas zu streng, evt Teigraphen angeben
 * @param string $url
 * @return bool
 */
function graphContainsUrl($url) {
    global $ep;
    $q = "ASK  { '$url' ?o  ?u }";

    $res = $ep->query($q, "raw");

    if ($res)
        return true;
    else
        return false;
}

?>