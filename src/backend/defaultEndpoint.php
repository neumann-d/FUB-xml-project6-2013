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
    $resRDFa = extractRDFa($url);
    
    $origin = $_POST['url'];
    $ldurl = str_replace("/page/", "/data/", $origin);
    $ldurl .= ".ntriples";

    $resLD = extractLinkedData($ldurl,$origin);
    
    $response = new Response(null,$resRDFa->message." ".$resLD->message);
    
    echo(json_encode($response) );
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
        $ep->insert($triples, $url);

        $res = new Response(null, "URL $url: added " . count($triples) . " triples");
        return $res;
    }
}

/**
 * "Extrahier" linkedData
 * @global type $ep
 * @param type $link
 * @param type $origin
 * @return string|\Response
 */
function extractLinkedData($link, $origin) {
    global $ep;
    // Wenn es die URL im Graph schon gibt, nichts machen, TODO besser updaten?
    if (graphContainsUrl($link)) {
        $res = new Response(null, "URL $link already visited, skip indexing");
        return res;
    } else {
        $parser = ARC2::getTurtleParser();
        //$data = $_POST['turtle'];

        $parser->parse($link);

        $triples = $parser->getTriples();
        // print_r($triples);
        // Wenn keine Tripel gefunden wurden
        if (count($triples) < 1) {
            $res = new Response(null, "URL $link contains no triples");
        } else {
            // in Datenbank einfügen
            $ep->insert($triples, $origin);
            //echo "<pre>";
            //print_r($triples);
            //echo "</pre>";

            $res = new Response(null, "URL $link: added " . count($triples) . " triples");
        }

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

