<?php

// Zeige keine NOTICE Meldungen an
error_reporting(E_ALL ^ E_NOTICE);

/* ARC2 static class inclusion */
include_once('arc2/ARC2.php');
include_once('response.php');
require_once './config/config.php';



/* instantiation */
$ep = ARC2::getStoreEndpoint($config);

if (!$ep->isSetUp()) {
    $ep->setUp(); /* create MySQL tables */
}


if (!empty($_POST['url'])) {
    $url = $_POST['url'];
    $res = extractRDFa($url);
    echo(json_encode($res) );
}

/**
 * Extrahiert eingebettetes rdfa aus einer beliebigen HTML Seite und
 * speichert es im triple store
 * @param string $url
 * @return Response Ein Responseobjekt
 */
function extractRDFa($url) {
    global $ep;
    // Wenn es die URL im Graph schon gibt, nichts machen
    if (graphContainsUrl($url)) {
        $res = new Response(null, "URL $url already visited, skip indexing");
        return $res;
    } else {
        $parser = ARC2::getSemHTMLParser();
        $parser->parse($url);
        $parser->extractRDF('rdfa');

        // triple Darstellung
        $triples = $parser->getTriples();

        // Wenn kein rdfa gefunden wurde
        if (count($triples) < 1) {
            $res = new Response(null, "URL $url contains no rdfa");
            return $res;
        }

        // in Datenbank einfügen
        $ep->insert($triples, "");

        $res = new Response(null, "URL $url: added " . count($triples) . " triples");
        return $res;
    }
}

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

