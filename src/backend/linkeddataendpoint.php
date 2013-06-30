<?

// Zeige keine NOTICE Meldungen an
//error_reporting (E_ALL ^ E_NOTICE);

/* ARC2 static class inclusion */
include_once('arc2/ARC2.php');
include_once('response.php');
require_once './config/config.php';

/* instantiation */
$ep = ARC2::getStoreEndpoint($config);

if (!$ep->isSetUp()) {
    $ep->setUp(); /* create MySQL tables */
}

if (!empty($_GET['url'])) {
    $origin = $_GET['url'];
    $url = str_replace("/page/", "/data/", $origin);
    $url .= ".ntriples";

    $res = extractLinkedData($url,$origin);
    print_r($res);
}

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
