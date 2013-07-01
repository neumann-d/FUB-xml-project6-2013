/**
 * Frage label und wikipedia url eines Dings ab
 * @param {type} url
 * @returns {undefined}
 */
function getThingName(url) {
    var query = "PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\
                SELECT ?name ?wiki\n\
                FROM <" + url + ">\n\
                WHERE { {?s rdfs:label ?name . FILTER(langMatches(lang(?name), \"DE\"))} OPTIONAL {?s foaf:isPrimaryTopicOf ?wiki .}}";

    // Query abfeuern
    $.getJSON(endpointURL + "?output=json&query=" + escape(query), function(data) {
        if (data.results.bindings.length > 0) {
            // Label
            var name = "";
            if(data.results.bindings[0].name) 
                name = data.results.bindings[0].name.value;
            
            // Wikipedia URL
            // Link <a href..> nur wenn es einen Link auch wirklich gibt
            if(data.results.bindings[0].wiki)
                $('#heading').html("<a href ='" + data.results.bindings[0].wiki.value + "'>" + name + "</a>");
            else
                $('heading').html(name);

        }

    });

}

/**
 * Gucks ob es ein Thumbnail gibt und zeigt dieses an.
 * @param {type} url
 * @returns {undefined}
 */
function getThingThumbnail(url) {
    // Query um ein Thumbnail abzufragen abzufragen
    var query = "PREFIX owl: <http://dbpedia.org/ontology/>  .\n\
                SELECT ?thumbnail\n\
                FROM <" + url + ">\n\
                WHERE { ?s owl:thumbnail ?thumbnail .}";

    // Query abfeuern
    $.getJSON(endpointURL + "?output=json&query=" + escape(query), function(data) {
        if (data.results.bindings.length > 0) {
            var thumbnail = data.results.bindings[0].thumbnail.value;
            $('#topImage').attr("src", thumbnail);
        }

    });
}

/**
 * Holt sich ein Abstract eines Dings
 * @param {type} url
 * @returns {undefined}
 */
function getThingAbstract(url) {
    // Query um die Zusammenfassung abzufragen
    var query = "PREFIX owl: <http://dbpedia.org/ontology/>  .\n\
                SELECT ?abstract\n\
                FROM <" + url + ">\n\
                WHERE { ?s owl:abstract ?abstract . FILTER(langMatches(lang(?abstract), \"DE\"))}";

    // Query abfeuern
    $.getJSON(endpointURL + "?output=json&query=" + escape(query), function(data) {
        if (data.results.bindings.length > 0) {
            var abstract = data.results.bindings[0].abstract.value;
            $('#content').append("<p><strong>Abstract:</strong></br> " + abstract + "</p>");
        }

    });

}