<?php

// Zeige keine NOTICE Meldungen an
error_reporting (E_ALL ^ E_NOTICE);

/* ARC2 static class inclusion */
include_once('arc2/ARC2.php');
include_once('response.php');

/* MySQL and endpoint configuration */
$config = array(
  /* login data for mysql server.
   * Please try to configure your local database with these parameters
  */
  'db_host' => 'localhost',
  'db_name' => 'xmlproject',
  'db_user' => 'root', // <- consider rights
//TODO passwort einfuegen
  'db_pwd' => '',

  /* store name */
  'store_name' => 'xml_store',

  /* endpoint */
  'endpoint_features' => array(
    'select', 'construct', 'ask', 'describe',
    'load', 'insert', 'delete',
    'dump' /* dump is a special command for streaming SPOG export */
  ),
  'endpoint_timeout' => 60, /* not implemented in ARC2 preview */
  'endpoint_read_key' => '', /* optional */
  'endpoint_write_key' => 'REPLACE_THIS_WITH_SOME_KEY', /* optional, but without one, everyone can write! */
  'endpoint_max_limit' => 250, /* optional */
);

/* instantiation */
$ep = ARC2::getStoreEndpoint($config);

if (!$ep->isSetUp()) {
  $ep->setUp(); /* create MySQL tables */
}


if (!empty($_POST['url'])) {
    $url = $_POST['url'];

    $xml = new DOMDocument;
    $xml->load($url);

    $xsl = new DOMDocument;
    $xsl->load('transformer.xslt');

    $proc = new XSLTProcessor;
    $proc->importStyleSheet($xsl);

    extractOAI($proc->transformToXML($xml));

    $res = new Response(null, "URL $url successfully indexed!");
    return $res; 
}

/**
* Extrahiert eingebettetes rdfa aus einer beliebigen HTML Seite und
* speichert es im triple store
* @param string $url
* @return Response Ein Responseobjekt
*/
function extractOAI($rdf) {
    global $ep;
    // Wenn es die URL im Graph schon gibt, nichts machen
    if (graphContainsUrl($url)) {
        $res = new Response(null, "URL $url already visited, skip indexing");
        return $res;
        
    } else {
        $parser = ARC2::getRDFXMLParser();
        $base = '';
        $parser->parse($base, $rdf);
        
        // triple Darstellung
        $triples = $parser->getTriples();
        
        // Wenn kein OAI gefunden wurde
        if(count($triples) < 1) {
            $res = new Response(null, "URL $url contains no OAI-RDF");
            return $res;
        }
        
        // in Datenbank einfuegen
        $ep->insert($triples,"");
        
        $res = new Response(null, "URL $url: added ".count($triples)." triples");
        return $res;
    }
}

/**
* Üerprüb eine URL schon im Graphen _irgendwo_ vorhanden ist
* TODO: Vielleicht etwas zu streng, evt Teigraphen angeben
* @param string $url
* @return bool
*/
function graphContainsUrl($url) {
    global $ep;

    $q = "ASK { '$url' ?o ?u }";

    $res = $ep->query($q, "raw");

    if ($res)
        return true;
    else
        return false;
}

$res = new Response(null, "test");
return $res;

?>

