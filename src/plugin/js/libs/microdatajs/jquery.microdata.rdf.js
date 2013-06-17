/* -*- mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */

// http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#rdf
(function() {
  var $ = jQuery;

  // a small set of prefixes used by the microdata spec.
  // additional prefixes can be added externally, e.g.:
  //
  // jQuery.extend(jQuery.microdata.rdf.prefix, {
  //   'foo': 'http://example.com/foo#'
  // });
  $.microdata.rdf = {};
  $.microdata.rdf.prefix = {
    'xhv': 'http://www.w3.org/1999/xhtml/vocab#',
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'owl': 'http://www.w3.org/2002/07/owl#',
    'cc': 'http://creativecommons.org/ns#',
    'dc': 'http://purl.org/dc/terms/'
  };

  function splitTokens(s) {
    if (s && /\S/.test(s))
      return s.replace(/^\s+|\s+$/g,'').split(/\s+/);
    return [];
  }

  function URI(uri) {
    if (uri)
      this.uri = uri; // URI node
    else
      this.uri = '_:n'+URI.prototype.blanks++; // blank node
  }
  URI.prototype.isBlank = function() {
    return this.uri.substr(0, 2) == '_:';
  };
  URI.prototype.equals = function(other) {
    return other instanceof URI && this.uri == other.uri;
  };
  function Literal(string, lang) {
    this.string = string;
    this.lang = lang;
  }

  function Triple(s, p, o) {
    this.s = s;
    this.p = p;
    this.o = o;
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/urls.html#absolute-url
  function isAbsoluteURL(url) {
    // FIXME: not really!
    return url.substr(0, 7) == 'http://';
  }

  function getLang($elem) {
    for (; $elem[0].getAttribute; $elem = $elem.parent()) {
      if ($elem.attr('lang'))
        return $elem.attr('lang');
    }
    return undefined;
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/urls.html#fragment-escaped
  function fragmentEscape(s) {
    return s.replace(/[\"\#\%\<\>\[\\\]\^\{\|\}]/g, function(c) {
      return '%'+c.charCodeAt(0).toString(16).toUpperCase();
    });
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#extracting-rdf
  function extractDocumentTriples(triples) {
    var $title = $('title').first();
    if ($title.length == 1)
      triples.push(new Triple(new URI(document.location.href),
                              new URI('http://purl.org/dc/terms/title'),
                              new Literal($title.text(), getLang($title))));

    $('a[rel][href],area[rel][href],link[rel][href]').each(function(i, elm) {
      var $elm = $(elm);
      var tokens = {};
      $.each(splitTokens($elm.attr('rel')), function(i, t) {
        t = t.toLowerCase();
        if (tokens[t])
          tokens[t]++;
        else
          tokens[t] = 1;
      });
      if (tokens.up && tokens.up > 1)
        delete tokens.up;
      if (tokens.alternate && tokens.stylesheet) {
        delete tokens.alternate;
        delete tokens.stylesheet;
        tokens['ALTERNATE-STYLESHEET'] = 1;
      }
      for (t in tokens) {
        var predicate;
        if (t.indexOf(':') == -1)
          predicate = 'http://www.w3.org/1999/xhtml/vocab#'+fragmentEscape(t);
        else if (isAbsoluteURL(t))
          predicate = t;
        else
          continue;
        // FIXME: resolve href
        triples.push(new Triple(new URI(document.location.href),
                                new URI(predicate),
                                new URI(elm.href)));
      }
    });

    $('meta[name][content]').each(function(i, meta) {
      var $meta = $(meta);
      var name = $meta.attr('name');
      var predicate;
      if (name.indexOf(':') == -1)
        predicate = 'http://www.w3.org/1999/xhtml/vocab#'+fragmentEscape(name.toLowerCase());
      else if (isAbsoluteURL(name))
        predicate = name;
      else
        return;
      triples.push(new Triple(new URI(document.location.href),
                              new URI(predicate),
                              new Literal($meta.attr('content'), getLang($meta))));
    });

    $('blockquote[cite],q[cite]').each(function(i, elm) {
      // FIXME: resolve cite attribute
      triples.push(new Triple(new URI(document.location.href),
                              new URI('http://purl.org/dc/terms/source'),
                              new URI($(elm).attr('cite'))));
    });

    // list of {item: ..., subject: ...} objects
    var memory = [];
    $(document).items().each(function(i, item) {
      var t = new Triple(new URI(document.location.href),
                         new URI('http://www.w3.org/1999/xhtml/microdata#item'),
                         generateItemTriples(triples, item, memory));
      triples.push(t);
    });
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#generate-the-triples-for-an-item
  function generateItemTriples(triples, item, memory, fallbackType) {
    var $item = $(item);
    var subject;
    $.each(memory, function(i, e) {
      if (e.item == item) {
        subject = e.subject;
        return false;
      }
    });
    if (subject)
      return subject;
    subject = isAbsoluteURL($item.itemId()) ? new URI($item.itemId()) : new URI(/*blank*/);
    memory.push({item: item, subject: subject});
    var type = '';
    if (isAbsoluteURL($item.itemType())) {
      type = $item.itemType();
      triples.push(new Triple(subject,
                              new URI('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                              new URI(type)));
      if (type.indexOf('#') == -1)
        type += '#';
      if (type.indexOf(':') < type.indexOf('#'))
        type += ':';
    }
    if (!type && fallbackType)
      type = fallbackType;
    $item.properties().each(function(i, prop) {
      var $prop = $(prop);
      $prop.itemProp().each(function(i, name) {
        if (!type && !isAbsoluteURL(name))
          return;
        var value;
        if ($prop.itemScope()) {
          value = generateItemTriples(triples, prop, memory, type);
        } else if (/^A|AREA|AUDIO|EMBED|IFRAME|IMG|LINK|OBJECT|SOURCE|TRACK|VIDEO$/.test(prop.tagName.toUpperCase())) {
          value = new URI($prop.itemValue());
        } else {
          value = new Literal($prop.itemValue(), getLang($prop));
        }
        var predicate;
        if (isAbsoluteURL(name)) {
          predicate = name;
        } else if (name.indexOf(':') == -1) {
          predicate = 'http://www.w3.org/1999/xhtml/microdata#'+fragmentEscape(type+name);
        }
        triples.push(new Triple(subject, new URI(predicate), value));
      });
    });
    return subject;
  }

  function getTurtle(triples) {
    var used = [];

    function format(term) {
      if (term instanceof Triple) {
        return format(term.s)+' '+format(term.p)+' '+format(term.o)+' .';
      } else if (term instanceof URI) {
        // blank nodes
        if (term.isBlank())
          return term.uri;
        // prefixed notation
        for (name in $.microdata.rdf.prefix) {
          var uri = $.microdata.rdf.prefix[name];
          if (term.uri.substr(0, uri.length) == uri) {
            if ($.inArray(name, used) == -1)
              used.push(name);
            return name+':'+term.uri.substr(uri.length);
          }
        }
        // plain URIs
        return '<'+term.uri+'>';
      } else if (term instanceof Literal) {
        return '"'+term.string.replace(/([\\"])/g, '\\$1').replace(/\r/g, '\\r').replace(/\n/g, '\\n')+'"'+
          (term.lang ? ('@'+term.lang) : '');
      }
    }

    var body = '';
    while (triples.length) {
      var subject = triples[0].s;
      var batch = [];
      // extract all triples that share same subject into batch
      triples = $.grep(triples, function (t) {
        if (subject.equals(t.s)) {
          batch.push(t);
          return false;
        }
        // leave for the next round
        return true;
      });

      // print batch with same subject
      if (batch.length == 1) {
        // single-line output
        body += format(batch[0])+'\n';
      } else {
        // subject on first line, predicate-objects follow indented
        body += format(batch[0].s)+'\n';
        $.each(batch, function(i, t) {
          body += '  '+format(t.p)+' '+format(t.o)+' '+((i+1<batch.length)?';':'.')+'\n';
        });
      }
    }

    var head = '';
    $.each(used, function(i, name) {
        head += '@prefix '+name+': <'+$.microdata.rdf.prefix[name]+'> .\n';
    });
    return head+'\n'+body;
  }

  $.microdata.turtle = function(selector, options) {
    options = $.extend({owl:false}, options);

    URI.prototype.blanks = 0;
    var triples = [];
    if (selector) {
      var memory = [];
      $(selector).each(function(i, item) {
        generateItemTriples(triples, item, memory);
      });
    } else {
      extractDocumentTriples(triples);
    }

    if (options.owl) {
      triples.push(new Triple(new URI('http://www.w3.org/1999/xhtml/microdata#http%3A%2F%2Fn.whatwg.org%2Fwork%23%3Awork'),
                              new URI('http://www.w3.org/2002/07/owl#equivalentProperty'),
                              new URI('http://www.w3.org/2002/07/owl#sameAs')));
      triples.push(new Triple(new URI('http://www.w3.org/1999/xhtml/microdata#http%3A%2F%2Fn.whatwg.org%2Fwork%23%3Atitle'),
                              new URI('http://www.w3.org/2002/07/owl#equivalentProperty'),
                              new URI('http://purl.org/dc/terms/title')));
      triples.push(new Triple(new URI('http://www.w3.org/1999/xhtml/microdata#http%3A%2F%2Fn.whatwg.org%2Fwork%23%3Aauthor'),
                              new URI('http://www.w3.org/2002/07/owl#equivalentProperty'),
                              new URI('http://creativecommons.org/ns#attributionName')));
      triples.push(new Triple(new URI('http://www.w3.org/1999/xhtml/microdata#http%3A%2F%2Fn.whatwg.org%2Fwork%23%3Alicense'),
                              new URI('http://www.w3.org/2002/07/owl#equivalentProperty'),
                              new URI('http://www.w3.org/1999/xhtml/vocab#license')));
    }

    return getTurtle(triples);
  };
})();
