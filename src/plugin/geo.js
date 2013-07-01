var endpointURL = "http://127.0.0.1/xmlProjektBackend/sparqlEndpoint.php";

sgvizler.option.query = {
    // Endpoint output format. 
    'endpoint_output':      'json',  // 'xml', 'json' or 'jsonp'

    // Default chart type. 
    'chart':                'gMap'
};

sgvizler.option.chart = {
       'gMap': {
    	 'zoomLevel':           1
                 
       },
       'sMap': {
    	 'dataMode':           'markers',
    	 'showTip':            true,
    	 'useMapTypeControl':  true,
          'zoomLevel':           1
         } 
};

sgvizler.go();

function isPlace(url) {
    $.ajaxSetup({async: false});
    // Fragt ab, ob es sich um einen Ort handelt.
    var query = "PREFIX owl: <http://dbpedia.org/ontology/> . PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.\n\
                ASK\n\
                FROM <" + url + ">\n\
                {?s rdf:type owl:Place .}";

    // Query abfeuern
    var result = null;
    $.getJSON(endpointURL + "?output=json&query=" + escape(query), function(data) {
        result = data.boolean;
    });

    return result;
    $.ajaxSetup({async: true});
}

function getPlaceName(url) {
    // Query um den Ortsnamen abzufragen
    var query = "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n\
                SELECT ?name ?wiki\n\
                FROM <" + url + ">\n\
                WHERE { ?s foaf:name ?name .  ?s foaf:isPrimaryTopicOf ?wiki . }";

    // Query abfeuern
    $.getJSON(endpointURL + "?output=json&query=" + escape(query), function(data) {
        if (data.results.bindings.length > 0) {
            console.log(data);
            var name = data.results.bindings[0].name.value;
            var wiki = data.results.bindings[0].wiki.value;
            $('#heading').html("<a href ='" + wiki + "'>" + name + "</a>");
        }

    });

}

function getPlaceWikiUrl(url) {
    // Query um den Ortsnamen abzufragen
    var query = "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n\
                SELECT ?wiki\n\
                FROM <" + url + ">\n\
                WHERE { ?s foaf:primaryTopic ?wiki . }";

    // Query abfeuern
    $.getJSON(endpointURL + "?output=json&query=" + escape(query), function(data) {
        if (data.results.bindings.length > 0)
            return data.results.bindings[0].wiki.value;
        else
            return false;
    });
}

function getPlaceArea(url) {
    // Query um die Fläche abzufragen
    var query = "PREFIX dbpprop: <http://dbpedia.org/property/> .\n\
                SELECT ?area\n\
                FROM <" + url + ">\n\
                WHERE { {?s dbpprop:areaTotalKm ?area . } UNION {?s  dbpprop:areaKm  ?area . } }";

    // Query abfeuern
    $.getJSON(endpointURL + "?output=json&query=" + escape(query), function(data) {
        if (data.results.bindings.length > 0) {
            var area = data.results.bindings[0].area.value;
            $('#content').append("<p><strong>Fläche:</strong> " + area + " km² </p>");
        }

    });
}

function getPlacePopulation(url) {
    // Query um die Einwohnerzahl abzufragen
    var query = "PREFIX dbpprop: <http://dbpedia.org/property/> .\n\
                SELECT ?population\n\
                FROM <" + url + ">\n\
                WHERE { {?s dbpprop:populationTotal ?population .} UNION {?s dbpprop:populationCensus ?population .} }";

    // Query abfeuern
    $.getJSON(endpointURL + "?output=json&query=" + escape(query), function(data) {
        if (data.results.bindings.length > 0) {
            var population = data.results.bindings[0].population.value;
            $('#content').append("<p><strong>Einwohner:</strong> " + population + "</p>");
        }

    });
}

function getPlaceLocation(url) {
    // Query um die Koordinaten abzufragen abzufragen
    var query = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>  \n\
                SELECT ?lat ?long \n\
                FROM <" + url + ">\n\
                WHERE { ?s geo:lat ?lat . ?s geo:long ?long .}";

    // Query abfeuern
    $.getJSON(endpointURL + "?output=json&query=" + escape(query), function(data) {
        if (data.results.bindings.length > 0) {
            $('#content').append("<p><strong>Karte: </strong></p> <div id=\"sgvzl_example1\" data-sgvizler-endpoint=\"" + endpointURL + "\" data-sgvizler-query=\"" + query + "\" style=\"width:500px; height:400px;\" data-sgvizler-chart='gMap' data-sgvizler-chart-options=\"zoomlevel=1\"></div> ");
            sgvizler.drawContainerQueries();
        }
    });
}


