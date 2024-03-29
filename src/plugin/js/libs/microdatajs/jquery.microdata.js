/* -*- mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */

(function(){
  var $ = jQuery;

  $.microdata = {};

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#valid-time-string
  function validTimeStringLength(s) {
    var m = /^(\d\d):(\d\d)(:(\d\d)(\.\d+)?)?/.exec(s);
    if (m && m[1]<=23 && m[2]<=59 && (!m[4] || m[4]<=59))
      return m[0].length;
    return 0;
  }

  function isValidTimeString(s) {
    return s && validTimeStringLength(s) == s.length;
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#number-of-days-in-month-month-of-year-year
  function daysInMonth(year, month) {
    if (month==1 || month==3 || month==5 || month==7 ||
        month==8 || month==10 || month==12) {
      return 31;
    } else if (month==4 || month==6 || month==9 || month==11) {
      return 30;
    } else if (month == 2 && (year%400==0 || (year%4==0 && year%100!=0))) {
      return 29;
    } else {
      return 28;
    }
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#valid-date-string
  function validDateStringLength(s) {
    var m = /^(\d{4,})-(\d\d)-(\d\d)/.exec(s);
    if (m && m[1]>=1 && m[2]>=1 && m[2]<=12 && m[3]>=1 && m[3]<=daysInMonth(m[1],m[2]))
      return m[0].length;
    return 0;
  }

  function isValidDateString(s) {
    return s && validDateStringLength(s) == s.length;
  }

  // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#valid-global-date-and-time-string
  function isValidGlobalDateAndTimeString(s) {
    var skip = validDateStringLength(s);
    if (skip && s[skip] == 'T') {
      s = s.substr(skip+1);
      skip = validTimeStringLength(s);
      if (skip) {
        s = s.substr(skip);
        if (s == 'Z')
          return true;
        var m = /^[+-](\d\d):(\d\d)$/.exec(s);
        if (m && m[1]<=23 && m[2]<=59)
          return true;
      }
    }
    return false;
  }

  $.microdata.isValidGlobalDateAndTimeString = isValidGlobalDateAndTimeString;
  $.microdata.isValidDateString = isValidDateString;

  function splitTokens(s) {
    if (s && /\S/.test(s))
      return s.replace(/^\s+|\s+$/g,'').split(/\s+/);
    return [];
  }

  function getItems(types) {
    var doc = this[0];
    if (doc.getItems)
      return $(types ? doc.getItems(types) : doc.getItems());
    var selector = $.map(splitTokens(types), function(t) {
      return '[itemtype~="'+t.replace(/"/g, '\\"')+'"]';
    }).join(',') || '*';
    // filter results to only match top-level items.
    // because [attr] selector doesn't work in IE we have to
    // filter the elements. http://dev.jquery.com/ticket/5637
    return $(selector, this).filter(function() {
      return (this.getAttribute('itemscope') != null &&
              this.getAttribute('itemprop') == null);
    });
  }

  function resolve(url) {
    if (!url)
      return '';
    var img = document.createElement('img');
    img.setAttribute('src', url);
    return img.src;
  }

  function tokenList(attr) {
    return function() {
      return $(splitTokens(this.attr(attr)));
    };
  }

  function itemValue() {
    var elm = this[0];
    if (this.attr('itemprop') === undefined)
      return null;
    if (this.itemScope()) {
      return elm; // or a new jQuery object?
    }
    switch (elm.tagName.toUpperCase()) {
    case 'META':
      return this.attr('content') || '';
    case 'AUDIO':
    case 'EMBED':
    case 'IFRAME':
    case 'IMG':
    case 'SOURCE':
    case 'TRACK':
    case 'VIDEO':
      return resolve(this.attr('src'));
    case 'A':
    case 'AREA':
    case 'LINK':
      return resolve(this.attr('href'));
    case 'OBJECT':
      return resolve(this.attr('data'));
    case 'TIME':
      var datetime = this.attr('datetime');
      if (!(datetime === undefined))
        return datetime;
    default:
      return this.text();
    }
  }

  function properties(name) {
    // Find all elements that add properties to the item, optionally
    // filtered by a property name. Look in the subtrees rooted at the
    // item itself and any itemref'd elements. An item can never have
    // itself as a property, but circular reference is possible.

    var props = [];

    function crawl(root) {
      var toTraverse = [root];

      function traverse(node) {
        for (var i = 0; i < toTraverse.length; i++) {
          if (toTraverse[i] == node)
            toTraverse.splice(i--, 1);
        }
        var $node = $(node);
        if (node != root) {
          var $names = $node.itemProp();
          if ($names.length) {
            if (!name || $.inArray(name, $names.toArray()) != -1)
              props.push(node);
          }
          if ($node.itemScope())
            return;
        }
        $node.children().each(function() {
          traverse(this);
        });
      }

      var context = root;
      while (context.parentNode)
        context = context.parentNode;
      $(root).itemRef().each(function(i, id) {
        var $ref = $('#'+id, context);
        if ($ref.length)
          toTraverse.push($ref[0]);
      });
      $.unique(toTraverse);

      while (toTraverse.length) {
        traverse(toTraverse[0]);
      }
    }

    if (this.itemScope())
      crawl(this[0]);

    // properties are already sorted in tree order
    return $(props);
  }

  // feature detection to use native support where available
  var t = $('<div itemscope itemtype="type" itemid="id" itemprop="prop" itemref="ref">')[0];

  $.fn.extend({
    items: getItems,
    itemScope: t.itemScope ? function() {
      return this[0].itemScope;
    } : function () {
      return this.attr('itemscope') != undefined;
    },
    itemType: t.itemType ? function() {
      return this[0].itemType;
    } : function () {
      return this.attr('itemtype') || '';
    },
    itemId: t.itemId ? function() {
      return this[0].itemId;
    } : function () {
      return resolve(this.attr('itemid'));
    },
    itemProp: t.itemProp && t.itemProp.length ? function() {
      return $(this[0].itemProp);
    } : tokenList('itemprop'),
    itemRef: t.itemRef && t.itemRef.length ? function() {
      return $(this[0].itemRef);
    } : tokenList('itemref'),
    itemValue: t.itemValue ? function() {
      return this[0].itemValue;
    } : itemValue,
    properties: t.properties && t.properties.namedItem ? function(name) {
      return $(name ? this[0].properties.namedItem(name) : this[0].properties);
    } : properties
  });
})();
