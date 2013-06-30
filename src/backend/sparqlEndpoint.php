<?php

/*
 * Endpoint for SPARQL requests.
 * In case of an empty request, the endpoint will generate an HTML form 
 * For further information see https://github.com/semsol/arc2/wiki/SPARQL-Endpoint-Setup
 * 
 */

/* ARC2 static class inclusion */ 
include_once('arc2/ARC2.php');
require_once './config/config.php';


/* instantiation */
$ep = ARC2::getStoreEndpoint($config);

if (!$ep->isSetUp()) {
  $ep->setUp(); /* create MySQL tables */
}

/* request handling */
$ep->go();

?>
