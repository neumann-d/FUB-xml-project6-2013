var sparqlEndpoint = "http://127.0.0.1/xmlProjektBackend/sparqlEndpoint.php";

function getReco(tags) {
    // Baue den Filtersing
    var filterString = "filter (";

    for (var i = 0; i < tags.length; i++) {
        filterString = filterString + "?tag = \"" + tags[i] + "\" ";
        if (i < tags.length - 1)
            filterString = filterString + " || ";
    }
    filterString = filterString + ")";

    console.log(filterString);


    // Beim Klick auf den Button soll der zugehörige Graph angezeigt werden
    $('#showGraph').bind("click", function() {
        var graphQuery = "select ?url ?tag WHERE { ?url ns2:tag ?tag .  " + filterString + " }";
        chrome.tabs.create({url: "http://127.0.0.1/xmlProjektBackend/sgvizler-0.5/sgvizler.html?query=" + graphQuery});
    });


    // Frage ähnliche Fragen ab
    $.ajax({
        type: "POST",
        url: sparqlEndpoint,
        data: "query= @prefix ns0: <http://purl.org/dc/elements/1.1/> .\n\
                   @prefix ns2: <http://poshrdf.org/ns/mf#> . \n\
                   select distinct ?url ?title WHERE {?url ns2:tag ?tag .\n ?url ns0:title ?title .\n " + filterString + "}",
        dataType: "json",
        success: function(json) {
            console.log(json);
            //$('p').empty();
            $('#heading').html("Ähnliche Fragen:");
            $('#content').append("<ul></ul>");

            var bindings = json.results.bindings;

            for (var i = 0; i < bindings.length; i++) {
                $('#content ul').append("<li><a href='" + bindings[i].url.value + "'>" + bindings[i].title.value + "</a></li>");
            }


        }
    });

    console.log("test");

};

/**
 * Fragt das Backend zuerst nach den auf dieser Seite enthaltenen Tags ab.
 * Sucht danach im Backend nach Fragen mit den gleichen Tags und zeigt diese
 * im Popup an.
 * @public
 */
function getMyTags(url) {

    $.ajax({
        type: "POST",
        url: this.sparqlEndpoint,
        data: "query= @prefix ns2: <http://poshrdf.org/ns/mf#> . \n select ?tag { \"" + url + "\" ns2:tag ?tag } ",
        dataType: "json",
        success: function(json) {
            var tags = new Array();
            console.log(json);

            var tagBindings = json.results.bindings;


            for (var i = 0; i < tagBindings.length; i++) {
                tags.push(tagBindings[i].tag.value);
            }
            console.log(tags);
            getReco(tags);

        }
    });
}
