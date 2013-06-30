<?
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

$link = $_GET['link'];
$link = str_replace("/page/", "/data/", $link);
$link .= ".ntriples";



	
    // Wenn es die URL im Graph schon gibt, nichts machen, TODO besser updaten?
    if (graphContainsUrl($link)) {        
        $res = new Response(null, "URL $link already visited, skip indexing");        
        
    } else {
	  $parser = ARC2::getTurtleParser();
	  $data = $_POST['turtle'];
	  
	  $parser->parse($link);
	  
	  $triples = $parser->getTriples();
	  // print_r($triples);
	  
	  // Wenn keine Tripel gefunden wurden
	  if(count($triples) < 1) {
		  $res = new Response(null, "URL $link contains no triples");        

	  } else {
		// in Datenbank einfügen
		$ep->insert($triples,"");
		
		$res = new Response(null, "URL $url: added ".count($triples)." triples".$triples); 
	  }
	  
	}






?>
