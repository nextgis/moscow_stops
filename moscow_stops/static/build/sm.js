/*

	jQuery Tags Input Plugin 1.3.3
	
	Copyright (c) 2011 XOXCO, Inc
	
	Documentation for this plugin lives here:
	http://xoxco.com/clickable/jquery-tags-input
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php

	ben@xoxco.com

*/

(function($) {

	var delimiter = new Array();
	var tags_callbacks = new Array();
	$.fn.doAutosize = function(o){
	    var minWidth = $(this).data('minwidth'),
	        maxWidth = $(this).data('maxwidth'),
	        val = '',
	        input = $(this),
	        testSubject = $('#'+$(this).data('tester_id'));
	
	    if (val === (val = input.val())) {return;}
	
	    // Enter new content into testSubject
	    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	    testSubject.html(escaped);
	    // Calculate new width + whether to change
	    var testerWidth = testSubject.width(),
	        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
	        currentWidth = input.width(),
	        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
	                             || (newWidth > minWidth && newWidth < maxWidth);
	
	    // Animate width
	    if (isValidWidthChange) {
	        input.width(newWidth);
	    }


  };
  $.fn.resetAutosize = function(options){
    // alert(JSON.stringify(options));
    var minWidth =  $(this).data('minwidth') || options.minInputWidth || $(this).width(),
        maxWidth = $(this).data('maxwidth') || options.maxInputWidth || ($(this).closest('.tagsinput').width() - options.inputPadding),
        val = '',
        input = $(this),
        testSubject = $('<tester/>').css({
            position: 'absolute',
            top: -9999,
            left: -9999,
            width: 'auto',
            fontSize: input.css('fontSize'),
            fontFamily: input.css('fontFamily'),
            fontWeight: input.css('fontWeight'),
            letterSpacing: input.css('letterSpacing'),
            whiteSpace: 'nowrap'
        }),
        testerId = $(this).attr('id')+'_autosize_tester';
    if(! $('#'+testerId).length > 0){
      testSubject.attr('id', testerId);
      testSubject.appendTo('body');
    }

    input.data('minwidth', minWidth);
    input.data('maxwidth', maxWidth);
    input.data('tester_id', testerId);
    input.css('width', minWidth);
  };
  
	$.fn.addTag = function(value,options) {
			options = jQuery.extend({focus:false, callback:true, 'css_class':'tag'},options);
			this.each(function() { 
				var id = $(this).attr('id');

				var tagslist = $(this).val().split(delimiter[id]);
				if (tagslist[0] == '') { 
					tagslist = new Array();
				}

				value = jQuery.trim(value);
		
				if (options.unique) {
					var skipTag = $(this).tagExist(value);
					if(skipTag == true) {
					    //Marks fake input as not_valid to let styling it
    				    $('#'+id+'_tag').addClass('not_valid');
    				}
				} else {
					var skipTag = false; 
				}
				
				if (value !='' && skipTag != true) { 
                    $('<span>').addClass(options.css_class).append(
                        $('<span>').text(value).append('&nbsp;&nbsp;'),
                        $('<a>', {
                            href  : '#',
                            title : 'Removing tag',
                            text  : 'x'
                        }).click(function () {
                            return $('#' + id).removeTag(escape(value));
                        })
                    ).insertBefore('#' + id + '_addTag');

					tagslist.push(value);
				
					$('#'+id+'_tag').val('');
					if (options.focus) {
						$('#'+id+'_tag').focus();
					} else {		
						$('#'+id+'_tag').blur();
					}
					
					$.fn.tagsInput.updateTagsField(this,tagslist);
					
					if (options.callback && tags_callbacks[id] && tags_callbacks[id]['onAddTag']) {
						var f = tags_callbacks[id]['onAddTag'];
						f.call(this, value);
					}
					if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
					{
						var i = tagslist.length;
						var f = tags_callbacks[id]['onChange'];
						f.call(this, $(this), tagslist[i-1]);
					}					
				}
		
			});		
			
			return false;
		};
		
	$.fn.removeTag = function(value) { 
			value = unescape(value);
			this.each(function() { 
				var id = $(this).attr('id');
	
				var old = $(this).val().split(delimiter[id]);
					
				$('#'+id+'_tagsinput .tag').remove();
				str = '';
				for (i=0; i< old.length; i++) { 
					if (old[i]!=value) { 
						str = str + delimiter[id] +old[i];
					}
				}
				
				$.fn.tagsInput.importTags(this,str);

				if (tags_callbacks[id] && tags_callbacks[id]['onRemoveTag']) {
					var f = tags_callbacks[id]['onRemoveTag'];
					f.call(this, value);
				}
			});
					
			return false;
		};
	
	$.fn.tagExist = function(val) {
		var id = $(this).attr('id');
		var tagslist = $(this).val().split(delimiter[id]);
		return (jQuery.inArray(val, tagslist) >= 0); //true when tag exists, false when not
	};
	
	// clear all existing tags and import new ones from a string
	$.fn.importTags = function(str) {
                id = $(this).attr('id');
		$('#'+id+'_tagsinput .tag').remove();
		$.fn.tagsInput.importTags(this,str);
	}
		
	$.fn.tagsInput = function(options) { 
    var settings = jQuery.extend({
      interactive:true,
      defaultText:'add a tag',
      minChars:0,
      width:'300px',
      height:'100px',
      autocomplete: {selectFirst: false },
      'hide':true,
      'delimiter':',',
      'unique':true,
      removeWithBackspace:true,
      placeholderColor:'#666666',
      autosize: true,
      comfortZone: 20,
      inputPadding: 6*2
    },options);

		this.each(function() { 
			if (settings.hide) { 
				$(this).hide();
			}
			var id = $(this).attr('id');
			if (!id || delimiter[$(this).attr('id')]) {
				id = $(this).attr('id', 'tags' + new Date().getTime()).attr('id');
			}
			
			var data = jQuery.extend({
				pid:id,
				real_input: '#'+id,
				holder: '#'+id+'_tagsinput',
				input_wrapper: '#'+id+'_addTag',
				fake_input: '#'+id+'_tag'
			},settings);
	
			delimiter[id] = data.delimiter;
			
			if (settings.onAddTag || settings.onRemoveTag || settings.onChange) {
				tags_callbacks[id] = new Array();
				tags_callbacks[id]['onAddTag'] = settings.onAddTag;
				tags_callbacks[id]['onRemoveTag'] = settings.onRemoveTag;
				tags_callbacks[id]['onChange'] = settings.onChange;
			}
	
			var markup = '<div id="'+id+'_tagsinput" class="tagsinput"><div id="'+id+'_addTag">';
			
			if (settings.interactive) {
				markup = markup + '<input id="'+id+'_tag" value="" data-default="'+settings.defaultText+'" />';
			}
			
			markup = markup + '</div><div class="tags_clear"></div></div>';
			
			$(markup).insertAfter(this);

			$(data.holder).css('width',settings.width);
			$(data.holder).css('min-height',settings.height);
			$(data.holder).css('height','100%');
	
			if ($(data.real_input).val()!='') { 
				$.fn.tagsInput.importTags($(data.real_input),$(data.real_input).val());
			}		
			if (settings.interactive) { 
				$(data.fake_input).val($(data.fake_input).attr('data-default'));
				$(data.fake_input).css('color',settings.placeholderColor);
		        $(data.fake_input).resetAutosize(settings);
		
				$(data.holder).bind('click',data,function(event) {
					$(event.data.fake_input).focus();
				});
			
				$(data.fake_input).bind('focus',data,function(event) {
					if ($(event.data.fake_input).val()==$(event.data.fake_input).attr('data-default')) { 
						$(event.data.fake_input).val('');
					}
					$(event.data.fake_input).css('color','#000000');		
				});
						
				if (settings.autocomplete_url != undefined) {
					autocomplete_options = {source: settings.autocomplete_url};
					for (attrname in settings.autocomplete) { 
						autocomplete_options[attrname] = settings.autocomplete[attrname]; 
					}
				
					if (jQuery.Autocompleter !== undefined) {
						$(data.fake_input).autocomplete(settings.autocomplete_url, settings.autocomplete);
						$(data.fake_input).bind('result',data,function(event,data,formatted) {
							if (data) {
								$('#'+id).addTag(data[0] + "",{focus:true,unique:(settings.unique)});
							}
					  	});
					} else if (jQuery.ui.autocomplete !== undefined) {
						$(data.fake_input).autocomplete(autocomplete_options);
						$(data.fake_input).bind('autocompleteselect',data,function(event,ui) {
							$(event.data.real_input).addTag(ui.item.value,{focus:true,unique:(settings.unique)});
							return false;
						});
					}
				
					
				} else {
						// if a user tabs out of the field, create a new tag
						// this is only available if autocomplete is not used.
						$(data.fake_input).bind('blur',data,function(event) { 
							var d = $(this).attr('data-default');
							if ($(event.data.fake_input).val()!='' && $(event.data.fake_input).val()!=d) { 
								if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
									$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
							} else {
								$(event.data.fake_input).val($(event.data.fake_input).attr('data-default'));
								$(event.data.fake_input).css('color',settings.placeholderColor);
							}
							return false;
						});
				
				}
				// if user types a comma, create a new tag
				$(data.fake_input).bind('keypress',data,function(event) {
					if (event.which==event.data.delimiter.charCodeAt(0) || event.which==13 ) {
					    event.preventDefault();
						if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
							$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
					  	$(event.data.fake_input).resetAutosize(settings);
						return false;
					} else if (event.data.autosize) {
			            $(event.data.fake_input).doAutosize(settings);
            
          			}
				});
				//Delete last tag on backspace
				data.removeWithBackspace && $(data.fake_input).bind('keydown', function(event)
				{
					if(event.keyCode == 8 && $(this).val() == '')
					{
						 event.preventDefault();
						 var last_tag = $(this).closest('.tagsinput').find('.tag:last').text();
						 var id = $(this).attr('id').replace(/_tag$/, '');
						 last_tag = last_tag.replace(/[\s]+x$/, '');
						 $('#' + id).removeTag(escape(last_tag));
						 $(this).trigger('focus');
					}
				});
				$(data.fake_input).blur();
				
				//Removes the not_valid class when user changes the value of the fake input
				if(data.unique) {
				    $(data.fake_input).keydown(function(event){
				        if(event.keyCode == 8 || String.fromCharCode(event.which).match(/\w+|[áéíóúÁÉÍÓÚñÑ,/]+/)) {
				            $(this).removeClass('not_valid');
				        }
				    });
				}
			} // if settings.interactive
		});
			
		return this;
	
	};
	
	$.fn.tagsInput.updateTagsField = function(obj,tagslist) { 
		var id = $(obj).attr('id');
		$(obj).val(tagslist.join(delimiter[id]));
	};
	
	$.fn.tagsInput.importTags = function(obj,val) {			
		$(obj).val('');
		var id = $(obj).attr('id');
		var tags = val.split(delimiter[id]);
		for (i=0; i<tags.length; i++) { 
			$(obj).addTag(tags[i],{focus:false,callback:false});
		}
		if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
		{
			var f = tags_callbacks[id]['onChange'];
			f.call(obj, obj, tags[i]);
		}
	};

})(jQuery);
/*!
 * jQuery imagesLoaded plugin v2.1.1
 * http://github.com/desandro/imagesloaded
 *
 * MIT License. by Paul Irish et al.
 */

/*jshint curly: true, eqeqeq: true, noempty: true, strict: true, undef: true, browser: true */
/*global jQuery: false */

;(function($, undefined) {
'use strict';

// blank image data-uri bypasses webkit log warning (thx doug jones)
var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

$.fn.imagesLoaded = function( callback ) {
	var $this = this,
		deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
		hasNotify = $.isFunction(deferred.notify),
		$images = $this.find('img').add( $this.filter('img') ),
		loaded = [],
		proper = [],
		broken = [];

	// Register deferred callbacks
	if ($.isPlainObject(callback)) {
		$.each(callback, function (key, value) {
			if (key === 'callback') {
				callback = value;
			} else if (deferred) {
				deferred[key](value);
			}
		});
	}

	function doneLoading() {
		var $proper = $(proper),
			$broken = $(broken);

		if ( deferred ) {
			if ( broken.length ) {
				deferred.reject( $images, $proper, $broken );
			} else {
				deferred.resolve( $images );
			}
		}

		if ( $.isFunction( callback ) ) {
			callback.call( $this, $images, $proper, $broken );
		}
	}

	function imgLoadedHandler( event ) {
		imgLoaded( event.target, event.type === 'error' );
	}

	function imgLoaded( img, isBroken ) {
		// don't proceed if BLANK image, or image is already loaded
		if ( img.src === BLANK || $.inArray( img, loaded ) !== -1 ) {
			return;
		}

		// store element in loaded images array
		loaded.push( img );

		// keep track of broken and properly loaded images
		if ( isBroken ) {
			broken.push( img );
		} else {
			proper.push( img );
		}

		// cache image and its state for future calls
		$.data( img, 'imagesLoaded', { isBroken: isBroken, src: img.src } );

		// trigger deferred progress method if present
		if ( hasNotify ) {
			deferred.notifyWith( $(img), [ isBroken, $images, $(proper), $(broken) ] );
		}

		// call doneLoading and clean listeners if all images are loaded
		if ( $images.length === loaded.length ) {
			setTimeout( doneLoading );
			$images.unbind( '.imagesLoaded', imgLoadedHandler );
		}
	}

	// if no images, trigger immediately
	if ( !$images.length ) {
		doneLoading();
	} else {
		$images.bind( 'load.imagesLoaded error.imagesLoaded', imgLoadedHandler )
		.each( function( i, el ) {
			var src = el.src;

			// find out if this image has been already checked for status
			// if it was, and src has not changed, call imgLoaded on it
			var cached = $.data( el, 'imagesLoaded' );
			if ( cached && cached.src === src ) {
				imgLoaded( el, cached.isBroken );
				return;
			}

			// if complete is true and browser supports natural sizes, try
			// to check for image status manually
			if ( el.complete && el.naturalWidth !== undefined ) {
				imgLoaded( el, el.naturalWidth === 0 || el.naturalHeight === 0 );
				return;
			}

			// cached images don't fire load sometimes, so we reset src, but only when
			// dealing with IE, or image is complete (loaded) and failed manual check
			// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
			if ( el.readyState || el.complete ) {
				el.src = BLANK;
				el.src = src;
			}
		});
	}

	return deferred ? deferred.promise( $this ) : $this;
};

})(jQuery);L.BingLayer = L.TileLayer.extend({
	options: {
		subdomains: [0, 1, 2, 3],
		type: 'Aerial',
		attribution: 'Bing',
		culture: ''
	},

	initialize: function(key, options) {
		L.Util.setOptions(this, options);

		this._key = key;
		this._url = null;
		this.meta = {};
		this.loadMetadata();
	},

	tile2quad: function(x, y, z) {
		var quad = '';
		for (var i = z; i > 0; i--) {
			var digit = 0;
			var mask = 1 << (i - 1);
			if ((x & mask) != 0) digit += 1;
			if ((y & mask) != 0) digit += 2;
			quad = quad + digit;
		}
		return quad;
	},

	getTileUrl: function(p, z) {
		var z = this._getZoomForUrl();
		var subdomains = this.options.subdomains,
			s = this.options.subdomains[Math.abs((p.x + p.y) % subdomains.length)];
		return this._url.replace('{subdomain}', s)
				.replace('{quadkey}', this.tile2quad(p.x, p.y, z))
				.replace('{culture}', this.options.culture);
	},

	loadMetadata: function() {
		var _this = this;
		var cbid = '_bing_metadata_' + L.Util.stamp(this);
		window[cbid] = function (meta) {
			_this.meta = meta;
			window[cbid] = undefined;
			var e = document.getElementById(cbid);
			e.parentNode.removeChild(e);
			if (meta.errorDetails) {
				alert("Got metadata" + meta.errorDetails);
				return;
			}
			_this.initMetadata();
		};
		var url = "http://dev.virtualearth.net/REST/v1/Imagery/Metadata/" + this.options.type + "?include=ImageryProviders&jsonp=" + cbid + "&key=" + this._key;
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = url;
		script.id = cbid;
		document.getElementsByTagName("head")[0].appendChild(script);
	},

	initMetadata: function() {
		var r = this.meta.resourceSets[0].resources[0];
		this.options.subdomains = r.imageUrlSubdomains;
		this._url = r.imageUrl;
		this._providers = [];
		for (var i = 0; i < r.imageryProviders.length; i++) {
			var p = r.imageryProviders[i];
			for (var j = 0; j < p.coverageAreas.length; j++) {
				var c = p.coverageAreas[j];
				var coverage = {zoomMin: c.zoomMin, zoomMax: c.zoomMax, active: false};
				var bounds = new L.LatLngBounds(
						new L.LatLng(c.bbox[0]+0.01, c.bbox[1]+0.01),
						new L.LatLng(c.bbox[2]-0.01, c.bbox[3]-0.01)
				);
				coverage.bounds = bounds;
				coverage.attrib = p.attribution;
				this._providers.push(coverage);
			}
		}
		this._update();
	},

	_update: function() {
		if (this._url == null || !this._map) return;
		this._update_attribution();
		L.TileLayer.prototype._update.apply(this, []);
	},

	_update_attribution: function() {
		var bounds = this._map.getBounds();
		var zoom = this._map.getZoom();
		for (var i = 0; i < this._providers.length; i++) {
			var p = this._providers[i];
			if ((zoom <= p.zoomMax && zoom >= p.zoomMin) &&
					bounds.intersects(p.bounds)) {
				if (!p.active)
					this._map.attributionControl.addAttribution(p.attrib);
				p.active = true;
			} else {
				if (p.active)
					this._map.attributionControl.removeAttribution(p.attrib);
				p.active = false;
			}
		}
	},

	onRemove: function(map) {
		for (var i = 0; i < this._providers.length; i++) {
			var p = this._providers[i];
			if (p.active) {
				this._map.attributionControl.removeAttribution(p.attrib);
				p.active = false;
			}
		}
        	L.TileLayer.prototype.onRemove.apply(this, [map]);
	}
});
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

(function (root, factory) {
  if (typeof exports === "object" && exports) {
    module.exports = factory; // CommonJS
  } else if (typeof define === "function" && define.amd) {
    define(factory); // AMD
  } else {
    root.Mustache = factory; // <script>
  }
}(this, (function () {

  var exports = {};

  exports.name = "mustache.js";
  exports.version = "0.7.2";
  exports.tags = ["{{", "}}"];

  exports.Scanner = Scanner;
  exports.Context = Context;
  exports.Writer = Writer;

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var nonSpaceRe = /\S/;
  var eqRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  var _test = RegExp.prototype.test;
  var _toString = Object.prototype.toString;

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  function testRe(re, string) {
    return _test.call(re, string);
  }

  function isWhitespace(string) {
    return !testRe(nonSpaceRe, string);
  }

  var isArray = Array.isArray || function (obj) {
    return _toString.call(obj) === '[object Array]';
  };

  function escapeRe(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  exports.escape = escapeHtml;

  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function () {
    return this.tail === "";
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function (re) {
    var match = this.tail.match(re);

    if (match && match.index === 0) {
      this.tail = this.tail.substring(match[0].length);
      this.pos += match[0].length;
      return match[0];
    }

    return "";
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function (re) {
    var match, pos = this.tail.search(re);

    switch (pos) {
    case -1:
      match = this.tail;
      this.pos += this.tail.length;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, pos);
      this.tail = this.tail.substring(pos);
      this.pos += pos;
    }

    return match;
  };

  function Context(view, parent) {
    this.view = view;
    this.parent = parent;
    this._cache = {};
  }

  Context.make = function (view) {
    return (view instanceof Context) ? view : new Context(view);
  };

  Context.prototype.push = function (view) {
    return new Context(view, this);
  };

  Context.prototype.lookup = function (name) {
    var value = this._cache[name];

    if (!value) {
      if (name == '.') {
        value = this.view;
      } else {
        var context = this;

        while (context) {
          if (name.indexOf('.') > 0) {
            value = context.view;
            var names = name.split('.'), i = 0;
            while (value && i < names.length) {
              value = value[names[i++]];
            }
          } else {
            value = context.view[name];
          }

          if (value != null) break;

          context = context.parent;
        }
      }

      this._cache[name] = value;
    }

    if (typeof value === 'function') value = value.call(this.view);

    return value;
  };

  function Writer() {
    this.clearCache();
  }

  Writer.prototype.clearCache = function () {
    this._cache = {};
    this._partialCache = {};
  };

  Writer.prototype.compile = function (template, tags) {
    var fn = this._cache[template];

    if (!fn) {
      var tokens = exports.parse(template, tags);
      fn = this._cache[template] = this.compileTokens(tokens, template);
    }

    return fn;
  };

  Writer.prototype.compilePartial = function (name, template, tags) {
    var fn = this.compile(template, tags);
    this._partialCache[name] = fn;
    return fn;
  };

  Writer.prototype.getPartial = function (name) {
    if (!(name in this._partialCache) && this._loadPartial) {
      this.compilePartial(name, this._loadPartial(name));
    }

    return this._partialCache[name];
  };

  Writer.prototype.compileTokens = function (tokens, template) {
    var self = this;
    return function (view, partials) {
      if (partials) {
        if (typeof partials === 'function') {
          self._loadPartial = partials;
        } else {
          for (var name in partials) {
            self.compilePartial(name, partials[name]);
          }
        }
      }

      return renderTokens(tokens, self, Context.make(view), template);
    };
  };

  Writer.prototype.render = function (template, view, partials) {
    return this.compile(template)(view, partials);
  };

  /**
   * Low-level function that renders the given `tokens` using the given `writer`
   * and `context`. The `template` string is only needed for templates that use
   * higher-order sections to extract the portion of the original template that
   * was contained in that section.
   */
  function renderTokens(tokens, writer, context, template) {
    var buffer = '';

    var token, tokenValue, value;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];
      tokenValue = token[1];

      switch (token[0]) {
      case '#':
        value = context.lookup(tokenValue);

        if (typeof value === 'object') {
          if (isArray(value)) {
            for (var j = 0, jlen = value.length; j < jlen; ++j) {
              buffer += renderTokens(token[4], writer, context.push(value[j]), template);
            }
          } else if (value) {
            buffer += renderTokens(token[4], writer, context.push(value), template);
          }
        } else if (typeof value === 'function') {
          var text = template == null ? null : template.slice(token[3], token[5]);
          value = value.call(context.view, text, function (template) {
            return writer.render(template, context);
          });
          if (value != null) buffer += value;
        } else if (value) {
          buffer += renderTokens(token[4], writer, context, template);
        }

        break;
      case '^':
        value = context.lookup(tokenValue);

        // Use JavaScript's definition of falsy. Include empty arrays.
        // See https://github.com/janl/mustache.js/issues/186
        if (!value || (isArray(value) && value.length === 0)) {
          buffer += renderTokens(token[4], writer, context, template);
        }

        break;
      case '>':
        value = writer.getPartial(tokenValue);
        if (typeof value === 'function') buffer += value(context);
        break;
      case '&':
        value = context.lookup(tokenValue);
        if (value != null) buffer += value;
        break;
      case 'name':
        value = context.lookup(tokenValue);
        if (value != null) buffer += exports.escape(value);
        break;
      case 'text':
        buffer += tokenValue;
        break;
      }
    }

    return buffer;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens(tokens) {
    var tree = [];
    var collector = tree;
    var sections = [];

    var token;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];
      switch (token[0]) {
      case '#':
      case '^':
        sections.push(token);
        collector.push(token);
        collector = token[4] = [];
        break;
      case '/':
        var section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : tree;
        break;
      default:
        collector.push(token);
      }
    }

    return tree;
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens(tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, len = tokens.length; i < len; ++i) {
      token = tokens[i];
      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          lastToken = token;
          squashedTokens.push(token);
        }
      }
    }

    return squashedTokens;
  }

  function escapeTags(tags) {
    return [
      new RegExp(escapeRe(tags[0]) + "\\s*"),
      new RegExp("\\s*" + escapeRe(tags[1]))
    ];
  }

  /**
   * Breaks up the given `template` string into a tree of token objects. If
   * `tags` is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. ["<%", "%>"]). Of
   * course, the default is to use mustaches (i.e. Mustache.tags).
   */
  exports.parse = function (template, tags) {
    template = template || '';
    tags = tags || exports.tags;

    if (typeof tags === 'string') tags = tags.split(spaceRe);
    if (tags.length !== 2) throw new Error('Invalid tags: ' + tags.join(', '));

    var tagRes = escapeTags(tags);
    var scanner = new Scanner(template);

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length) {
          delete tokens[spaces.pop()];
        }
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var start, type, value, chr, token;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(tagRes[0]);
      if (value) {
        for (var i = 0, len = value.length; i < len; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push(['text', chr, start, start + 1]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr == '\n') stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(tagRes[0])) break;
      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(eqRe);
        scanner.scan(eqRe);
        scanner.scanUntil(tagRes[1]);
      } else if (type === '{') {
        value = scanner.scanUntil(new RegExp('\\s*' + escapeRe('}' + tags[1])));
        scanner.scan(curlyRe);
        scanner.scanUntil(tagRes[1]);
        type = '&';
      } else {
        value = scanner.scanUntil(tagRes[1]);
      }

      // Match the closing tag.
      if (!scanner.scan(tagRes[1])) throw new Error('Unclosed tag at ' + scanner.pos);

      token = [type, value, start, scanner.pos];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        if (sections.length === 0) throw new Error('Unopened section "' + value + '" at ' + start);
        var openSection = sections.pop();
        if (openSection[1] !== value) throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        tags = value.split(spaceRe);
        if (tags.length !== 2) throw new Error('Invalid tags at ' + start + ': ' + tags.join(', '));
        tagRes = escapeTags(tags);
      }
    }

    // Make sure there are no open sections when we're done.
    var openSection = sections.pop();
    if (openSection) throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    tokens = squashTokens(tokens);

    return nestTokens(tokens);
  };

  // All Mustache.* functions use this writer.
  var _writer = new Writer();

  /**
   * Clears all cached templates and partials in the default writer.
   */
  exports.clearCache = function () {
    return _writer.clearCache();
  };

  /**
   * Compiles the given `template` to a reusable function using the default
   * writer.
   */
  exports.compile = function (template, tags) {
    return _writer.compile(template, tags);
  };

  /**
   * Compiles the partial with the given `name` and `template` to a reusable
   * function using the default writer.
   */
  exports.compilePartial = function (name, template, tags) {
    return _writer.compilePartial(name, template, tags);
  };

  /**
   * Compiles the given array of tokens (the output of a parse) to a reusable
   * function using the default writer.
   */
  exports.compileTokens = function (tokens, template) {
    return _writer.compileTokens(tokens, template);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  exports.render = function (template, view, partials) {
    return _writer.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.
  exports.to_html = function (template, view, partials, send) {
    var result = exports.render(template, view, partials);

    if (typeof send === "function") {
      send(result);
    } else {
      return result;
    }
  };

  return exports;

}())));
(function ($) {
	$.sm = {};
	$.viewmodel = {};
	$.view = {};
	$.templates = {};

	$.extend($.viewmodel, {
		version : null
	});
	$.extend($.view, {
		$document: null
	});

	$.sm.loader = {};
	$.extend($.sm.loader, {
		templates: ['osmPopupTemplate', 'stopPopupTemplate', 'stopPopupInfoTemplate', 'searchResultsTemplate', 'userLogsTemplate'],

		init: function () {
			this.setDomOptions();
			this.compileTemplates();
		},

		initModules: function () {
			try {
				$.sm.common.init();
				$.sm.map.init();
				$.sm.searcher.init();
				$.sm.editor.init();
				$.sm.osm.init();
				$.sm.user.init();
				$.sm.stops.init();
			} catch (e) {
				alert(e);
			}
		},

		setDomOptions: function () {
			$.view.$document = $(document);
		},

		compileTemplates: function () {
			var context = this, deferreds = [], templates = [], htmlTemplates = [], templateIndex,
				templatesCount = this.templates.length;
			for (templateIndex = 0; templateIndex < templatesCount; templateIndex++) {
				deferreds.push($.get(document['url_root'] + 'static/js/templates/' + this.templates[templateIndex] + '.htm', function (doc, state, response) {
					htmlTemplates.push({
						'name' : this.url.substr((this.url.lastIndexOf("/") + 1)).replace('.htm', ''),
						'html' : response.responseText });
				}));
			}
			$.when.apply(null, deferreds).done(function () {
				for (templateIndex = 0; templateIndex < templatesCount; templateIndex++) {
					var name = htmlTemplates[templateIndex].name;
					$.templates[name] = Mustache.compile(htmlTemplates[templateIndex].html);
				}
				window.setTimeout(function() {
					context.initModules();
					$('img').imagesLoaded( function () {
						$.view.$body.removeClass('loading');
					});
				}, 1000);
			});
		}
	});
	$(document).ready(function () {
		$.sm.loader.init();
	});
})(jQuery);
(function ($) {
	$.sm.helpers = {};
	$.extend($.sm.helpers, {
		getIcon: function (cssClass, iconSize) {
			return L.divIcon({
				className: cssClass,
				iconSize: [iconSize, iconSize],
				iconAnchor: [iconSize / 2, iconSize / 2],
				popupAnchor: [0, 2 - (iconSize / 2)]
			});
		},

		hashToArrayKeyValues: function (hash) {
			var res = [];
			if (Object.prototype.toString.call(hash) === '[object Array]') {
				return hash;
			}
			for (var prop in hash) {
				if (!hash.hasOwnProperty(prop)) continue;
				res.push({ 'key' : prop, 'val' : hash[prop]});
			}
			return res;
		},

		boolToString: function (bool, is_coded) {
			switch (bool) {
				case null:
					return is_coded ? 'null' : '';
					break;
				case true:
					return is_coded ? 'true' : 'Да';
					break;
				case false:
					return is_coded ? 'false' : 'Нет';
					break;
			}
			throw 'The bool value is not convertible to string'
		},

		valueNullToString: function (val) {
			if (val === null) { return ''; }
			return val;
		},

		valueCheckToString: function (val) {
			switch (val) {
				case 0:
					return 'Не нужна';
					break;
				case 1:
					return 'Нужна';
					break;
				case 2:
					return 'Проверена';
					break;
				case 3:
					return 'Проверена по Бингу';
					break;
				default:
					return 'Не нужна';
					break;
			}
		},

		sortByFields: function () {
			var props = arguments,
				context = this;
			return function (obj1, obj2) {
				var i = 0, result = 0, numberOfProperties = props.length;
				while(result === 0 && i < numberOfProperties) {
					result = context.dynamicSort(props[i])(obj1, obj2);
					i++;
				}
				return result;
			}
		},

		dynamicSort: function (property) {
			var sortOrder = 1;
			if(property[0] === "-") {
				sortOrder = -1;
				property = property.substr(1, property.length - 1);
			}
			return function (a,b) {
				var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
				return result * sortOrder;
			}
		}
	});
})(jQuery);(function ($) {
	$.extend($.viewmodel, {
		bodyPanelsVisible: [true, true, true, true]
	});

	$.extend($.view, {
		$body: null,
		$popup: null
	});

	$.sm.common = {};
	$.extend($.sm.common, {
		init: function () {
			this.setDomOptions();
			this.bindEvents();
		},

		bindEvents: function () {
			var context = this;
			$.view.$document.on('/sm/common/openPopup', function (e, header, contentPopup) {
				context.openPopup(header, contentPopup);
			});
			$.view.$popup.find('a.close').off('click').on('click', function () {
				$.view.$body.removeClass('popup');
			});
			$.view.$document.on('/sm/common/setMainLoad', function () {
				$.view.$body.addClass('loader');
			});
		},

		openPopup: function (header, content) {
			var $popup = $.view.$popup,
				marginLeft, marginTop;
			$popup.find('div.header').text(header);
			$popup.find('div.content').html(content);
			marginLeft = $popup.width() / 2;
			marginTop = $popup.height() / 2;
			$popup.css({
				'margin-left' : -marginLeft + 'px',
				'margin-top' :  -marginTop  + 'px'
			});
			$.view.$body.addClass('popup');
		},

		closePopup: function () {

		},

		setDomOptions: function () {
			$.view.$body = $('body');
			$.view.$popup = $('#popup');
		}
	});
})(jQuery);
(function ($) {
	$.extend($.viewmodel, {
		map: null,
		mapLayers: {},
		isPopupOpened: false
	});
	$.extend($.view, {
		$map: null
	});

	$.sm.map = {};
	$.extend($.sm.map, {
		init: function () {
			this.buildMap();
			this.buildLayerManager();
			this.bindEvents();
		},

		bindEvents: function () {
			var context = this;
			$.viewmodel.map.on('moveend', function (e) {
				var map = e.target;
				$.view.$document.trigger('/sm/map/updateAllLayers');
				context.manageOsmLayer();
				context.setLastExtent(map.getCenter(), map.getZoom());
			});
			$.view.$document.on('/sm/map/updateAllLayers', function () {
				$.view.$document.trigger('/sm/map/validate');
				$.view.$document.trigger('/sm/stops/updateStops');
				$.view.$document.trigger('/sm/osm/updateOsmLayer');
			});
			$.view.$document.on('/sm/map/openPopup', function (e, latlng, html) {
				var vm = $.viewmodel,
					selectLayer = vm.mapLayers.select,
					map = vm.map;
				map.panTo(latlng);
				map.openPopup(L.popup().setLatLng(latlng).setContent(html));

			});
			$.viewmodel.map.on('popupclose', function () {
				var vm = $.viewmodel;
				vm.isPopupOpened = false;
				vm.mapLayers.select.clearLayers();
			});
		},

		buildMap: function () {
			var context = this,
				vm = $.viewmodel,
				selectLayer = L.layerGroup(),
				lastExtent = this.getLastExtent();
			$.view.$map = $('#map');
			vm.map = new L.Map('map');
			L.control.scale().addTo(vm.map);

			if (lastExtent) {
				vm.map.setView(lastExtent.latlng, lastExtent.zoom);
			} else {
				vm.map.setView(new L.LatLng(55.742, 37.658), 14);
				this.setLastExtent(new L.LatLng(55.742, 37.658), 14);
			}

			vm.map.addLayer(selectLayer);
			vm.mapLayers['select'] = selectLayer;
		},

		getLastExtent: function () {
			var lat = parseFloat($.cookie('map.lat'), 10),
				lng = parseFloat($.cookie('map.lng'), 10),
				zoom = parseInt($.cookie('map.zoom'), 10);
			if (lat && lng && zoom) {
				return {'latlng': new L.LatLng(lat, lng), 'zoom': zoom};
			} else {
				return null;
			}
		},

		setLastExtent: function (latLng, zoom) {
			$.cookie('map.lat', latLng.lat, { expires: 7, path: '/' });
			$.cookie('map.lng', latLng.lng, { expires: 7, path: '/' });
			$.cookie('map.zoom', zoom, { expires: 7, path: '/' });
		}
	});
})(jQuery);

(function ($) {
	$.extend($.sm.map, {
		getIcon: function (cssClass, iconSize, innerHtml) {
			return L.divIcon({
				className: cssClass,
				iconSize: [iconSize, iconSize],
				iconAnchor: [iconSize / 2, iconSize / 2],
				popupAnchor: [0, 2 - (iconSize / 2)],
				html: innerHtml
			});
		}
	});
})(jQuery);(function ($) {

	$.extend($.viewmodel, {
		currentTileLayer: null
	});

	$.extend($.view, {
		$tileLayers: null,
		$manager: null,
		isLabelsButtonOn: false
	});

	$.extend($.sm.map, {

		_layers: {},
		_lastIndex: 0,

		layersName: {
			osm: 'osm',
			osm19: 'osm_19',
			bing: 'bing'
		},


		buildLayerManager: function () {
			var v = $.view;
			$.view.$manager = $('#manager');
			this.buildLabelsButton();
			// http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
			// http://{s}.tile.osmosnimki.ru/kosmo/{z}/{x}/{y}.png
			// http://{s}.tiles.mapbox.com/v3/karavanjo.map-opq7bhsy/{z}/{x}/{y}.png
			this.addTileLayer(this.layersName.osm, 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', '© OpenStreetMap contributors', 8, 18, 'osm');
			this.addTileLayer(this.layersName.osm19, 'http://nextgis.ru/data/moscow-stops/Tiles/moscow-stops/{z}/{x}/{y}.png', '© OpenStreetMap contributors', 19, 19, 'osm');
			this.addBingLayer('AujH--7B6FRTK8b81QgPhuvw_Sb3kc8hBO-Lp5OLNyhCD4ZQoGGW4cQS6zBgaeEh');
			$.view.$tileLayers = v.$map.find('div.leaflet-tile-pane div.leaflet-layer');
			this.bindLayerManagerEvents();
			this.onLayer('osm');
			this.manageOsmLayer();
		},


		buildLabelsButton: function () {
			$.view.$body.toggleClass('no-button-labels', $.viewmodel.map.getZoom() <= 15);
		},


		bindLayerManagerEvents: function () {
			var context = this;

			$.viewmodel.map.off('zoomend').on('zoomend', function () {
				context.onLayer();
				context.validateLabelsRendering();
			});
			$.view.$manager.find('div.tile-layers div.icon').off('click').on('click', function (e) {
				var layer = $(this).data('layer');
				if (layer === context.layersName.osm) {
					context.onLayer(layer);
					context.manageOsmLayer();
				} else {
					context.onLayer(layer);
				}
			});

			$('#labelsButton').off('click').on('click', function (e) {
				var viewmodel = $.viewmodel,
					isRenderedLabels = !viewmodel.isRenderedLabels;
				$.view.$body.toggleClass('labels', isRenderedLabels);
				viewmodel.isRenderedLabels = isRenderedLabels;
				viewmodel.isLabelsMode = !viewmodel.isLabelsMode;
				$.view.$document.trigger('/sm/stops/updateStops');
			});

			$.view.$document.on('/sm/map/validate', function () {
				context.validateLabelsRendering();
			});
		},


		onLayer: function (nameLayer) {
			var vm = $.viewmodel;
			if (vm.currentTileLayer == nameLayer) return false;
			var v = $.view,
				$tileLayers = $($.viewmodel.map.getPanes().tilePane).find('div.leaflet-layer');
			if (nameLayer) {
				if (vm.currentTileLayer) {
					v.$body.removeClass(this._layers[vm.currentTileLayer].css).addClass(this._layers[nameLayer].css);
				} else {
					v.$body.addClass(this._layers[nameLayer].css); // For initialization map
				}
				vm.currentTileLayer = nameLayer;
				$tileLayers.hide().eq(this._layers[nameLayer].index).show();
			} else {
				$tileLayers.hide().eq(this._layers[vm.currentTileLayer].index).show();
			}
		},


		addTileLayer: function (nameLayer, url, attribution, minZoom, maxZoom, css) {
			var layer = new L.TileLayer(url, {minZoom: minZoom, maxZoom: maxZoom, attribution: attribution});
			this._layers[nameLayer] = {
				'layer' : $.viewmodel.map.addLayer(layer, true),
				'index' : this._lastIndex,
				'css': css || nameLayer
			};
			this._lastIndex += 1;
		},


		addBingLayer: function (key) {
			var bingLayer = new L.BingLayer(key, {minZoom: 8, maxZoom: 19});
			this._layers['bing'] = {
				'layer' : $.viewmodel.map.addLayer(bingLayer, true),
				'index' : this._lastIndex,
				'css': this.layersName.bing
			};
			this._lastIndex += 1;
		},


		manageOsmLayer: function () {
			var vm = $.viewmodel,
				layersName = this.layersName,
				zoom = vm.map.getZoom();
			if (zoom > 18 && vm.currentTileLayer === layersName.osm) {
				this.onLayer(layersName.osm19);
			}
			if (zoom <= 18 && vm.currentTileLayer === layersName.osm19) {
				this.onLayer(layersName.osm);
			}
			return true;
		},


		validateLabelsRendering: function () {
			var zoom = $.viewmodel.map.getZoom();
			this.buildLabelsButton();
			$.viewmodel.isRenderedLabels = zoom >= 16 && $.viewmodel.isLabelsMode;
		}
	});
})(jQuery);(function ($) {
	$.extend($.viewmodel, {
		searcherCollapsed: false,
		filter: {'id' : '', 'name' : '', 'is_help' : ''},
		isFilterValidated: true
	});
	$.extend($.view, {
		$searchContainer: null,
		$filterName: null,
		$filterId: null,
		$filterIsHelp: null,
		$searchButton: null,
		$searchResults: null
	});
	$.sm.searcher = {};
	$.extend($.sm.searcher, {
		min_characters_name: 3,

		init: function () {
			this.setDomOptions();
			this.bindEvents();
		},

		bindEvents: function () {
			var context = this,
				v = $.view;
			v.$searchContainer.find('span.icon-collapse, div.title').off('click').on('click', function () {
				$.viewmodel.searcherCollapsed = !$.viewmodel.searcherCollapsed;
				$.view.$body.toggleClass('searcher-collapsed', context.searcherCollapsed);
			});
			v.$filterName.off('keyup').on('keyup', function (e) {
				context.keyUpHandler(e);
			});
			v.$filterId.off('keyup').on('keyup', function (e) {
				context.keyUpHandler(e);
			});
			$('#filter_name, #filter_id').off('focus').on('focus', function () {
				$.view.$searchResults.prop('class', 'description');
			});
//			v.$filterIsHelp.off('change').on('change', function() {
//				context.updateFilter();
//			});
			$('#searchResults p.description').off('click').on('click', function () {
				$.view.$searchResults.prop('class', 'active');
			});
			v.$searchButton.off('click').on('click', function () {
				if ($.viewmodel.isFilterValidated) {
					context.applyFilter();
				}
			});
			v.$document.on('/sm/searcher/update', function () {
				context.updateSearch();
			});
			v.$document.on('/sm/stops/startUpdate', function () {
				var v = $.view;
				v.$searchResults.prop('class', 'update');
				v.$filterName.prop('disabled', true);
				v.$filterId.prop('disabled', true);
			});
			v.$document.on('/sm/stops/endUpdate', function () {
				var v = $.view;
				v.$searchResults.prop('class', 'active');
				v.$filterName.prop('disabled', false);
				v.$filterId.prop('disabled', false);
			});
		},

		setDomOptions: function () {
			var v = $.view;
			v.$searchContainer = $('#searchContainer');
			v.$filterName = $('#filter_name');
			v.$filterId = $('#filter_id');
			v.$filterIsHelp = $('#filter_is_help');
			v.$searchButton = $('#search');
			v.$searchResults = $('#searchResults');
		},

		keyUpHandler: function (e) {
			this.validateSearch();
			if(e.keyCode == 13) {
				this.applyFilter();
			}
		},

		validateSearch: function () {
			var intRegex = /^\d+$/,
				min_characters_name = this.min_characters_name,
				v = $.view,
				vm = $.viewmodel,
				id = v.$filterId.val(),
				name = v.$filterName.val();

			if (name.length <= min_characters_name && name != '') {
				v.$filterName.addClass('invalid');
			} else {
				v.$filterName.removeClass('invalid');
			}

			if (!intRegex.test(id) && id != '') {
				v.$filterId.addClass('invalid');
			} else {
				v.$filterId.removeClass('invalid')
			}

			if ((name.length > min_characters_name && id == '') ||
				((name == '' || name.length <= min_characters_name)  && intRegex.test(id)) ||
				(name.length > min_characters_name && intRegex.test(id)) ||
				(name == '' && id == '' )) {
				vm.isFilterValidated = true;
			} else {
				vm.isFilterValidated = false;
			}

			$.view.$searchButton.toggleClass('active', $.viewmodel.isFilterValidated);
		},

		applyFilter: function () {
			if ($.viewmodel.isFilterValidated) {
				this.updateFilter();
				this.search();
			}
		},

		updateFilter: function () {
			var $v = $.view,
				vm = $.viewmodel;
			vm.filter.name = $v.$filterName.val();
			vm.filter.id = $v.$filterId.val();
			vm.filter.is_help = $v.$filterIsHelp.is(':checked');
		},

		search: function () {
			$.view.$document.trigger('/sm/stops/updateStops');
		},

		updateSearch: function () {
			var stops = $.viewmodel.stops,
				$divSearchResults = $.view.$searchResults.find('div'),
				html;
			html = this.getHtmlForSearchResults('non_check', stops.non_block.non_check.elements)
			html += this.getHtmlForSearchResults('check', stops.non_block.check.elements)
			html += this.getHtmlForSearchResults('block', stops.block.elements)
			$divSearchResults.empty().append(html);
			$divSearchResults.find('a').on('click', function () {
				var $li = $(this).parent();
				$.viewmodel.map.setView(new L.LatLng($li.data('lat'), $li.data('lon')), 18);
				$('#target').show().delay(1000).fadeOut(1000);
			});
			$.view.$searchResults.prop('class', 'active');
//			$.view.$searchResults.addClass('active');
		},

		getHtmlForSearchResults: function (cssClass, stops) {
			return $.templates.searchResultsTemplate({
				cssClass: cssClass,
				stops: stops
			});
		}
	});
})(jQuery);

(function ($) {
	$.extend($.viewmodel, {
		editorCollapsed: false,
		editable: false,
		routeTypeSelected: null
	});

	$.extend($.view, {
		$editorContainer: null
	});

	$.sm.editor = {};
	$.extend($.sm.editor, {
		regex: { url : new RegExp("(https?)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]") },

		init: function () {
			this.setDomOptions();
			this.buildTags();
			this.buildEditLayer();
			this.buildRoutesSelector();
			this.bindEvents();
		},

		bindEvents: function () {
			var context = this;
			$.view.$editorContainer.find('span.icon-collapse, div.title').off('click').on('click', function () {
				$.viewmodel.editorCollapsed = !$.viewmodel.editorCollapsed;
				$.view.$body.toggleClass('editor-collapsed', context.editorCollapsed);
			});
			$('#pan_link').off('input').on('input', function () {
				context.validateLink();
			});
			$.view.$document.on('/sm/editor/startEdit', function (e) {
				context.startAjaxEdition();
			});
			$('#save').off('click').on('click', function (e) {
				e.stopPropagation();
				context.save();
			});
			$('#discard').off('click').on('click', function (e) {
				e.stopPropagation();
				context.finishAjaxEdition();
			});
			$('#route_type').off('change').on('change', function (e) {
				var newRouteType = e.target.value;
				$('#route_type_' + $.viewmodel.routeTypeSelected).hide();
				$('#route_type_' + newRouteType).show();
				$.viewmodel.routeTypeSelected = newRouteType;
			});
			$('#add-route').off('click').on('click', function (e) {
				var $selectedOption = $('#route_type_' + $.viewmodel.routeTypeSelected).find(":selected");
				context.addRoute($selectedOption.val(), $selectedOption.text());
			});
			$('#editorForm').find(':checkbox').off('click').on('click', function () {
				var checkbox = $(this),
					hidden = $('#' + checkbox.data('id'));
					if(checkbox.is(':checked')) {
						hidden.val(1);
					} else {
						hidden.val(0);
					}
			});
		},

		setDomOptions: function () {
			$.view.$editorContainer = $('#editorContainer');
		},

		buildTags: function () {
			var context = this;
			$('#routes').tagsInput({
				'defaultText': '+',
				'width': '185px',
				'maxChars' : 5,
				'interactive': false,
				'onRemoveTag': function (e) {
					context.removeRoute(e);
				}
			});
		},

		buildEditLayer: function () {
			var editedLayer = L.layerGroup();
			$.viewmodel.mapLayers['edit'] = $.viewmodel.map.addLayer(editedLayer);
		},

		buildRoutesSelector: function () {
			var route_type_selected = $('#route_type').find(":selected").val();
			$('#route_type_' + route_type_selected).show();
			$.viewmodel.routeTypeSelected = route_type_selected;
		},

		validateLink: function () {
			var pan_link_a = $('#pan_link_a'),
				val = $('#pan_link').val();
			if (this.regex.url.test(val)) {
				pan_link_a.attr('class', 'active')
					.prop('href', val);
			} else {
				pan_link_a.removeAttr('href')
					.attr('class', '');
			}
		},

		save: function () {
			var context = this,
				frm = $('#editorContainer form'),
				data_serialized = frm.serializeArray(),
				i = 0,
				ds_length = data_serialized.length,
				stop_selected = $.viewmodel.stopSelected,
				url = document['url_root'] + 'stop/' + stop_selected.id,
				stop = { 'id' :  stop_selected.id },
				name;
			for (i; i < ds_length; i += 1) {
				name = data_serialized[i].name;
				switch (name) {
					case name === 'lon':
						stop['geom']['lon'] = data_serialized[i].value;
						break;
					case name === 'lat':
						stop['geom']['lat'] = data_serialized[i].value;
						break;
					default:
						stop[data_serialized[i].name] = data_serialized[i].value;
						break;
				}
			}
			stop['routes'] = this.getRoutesToSave(stop_selected);
			stop['stop_types'] = this.getStopTypes(stop_selected);
			$.ajax({
				type: 'POST',
				url: url,
				data: { 'stop' : JSON.stringify(stop)}
			}).done(function () {
					context.finishAjaxEdition();
			});
		},

		getRoutesToSave: function (stop) {
			var routes = stop.routes.routes,
				count_routes = routes.length,
				stop_id = stop.id,
				i = 0,
				saved_routes = [];
			for (i; i < count_routes; i += 1) {
				saved_routes.push({'stop_id' : stop_id, 'route_id' : routes[i].id });
			}
			return saved_routes;
		},

		getStopTypes: function (stop) {
			var stop_id = stop.id;
			if ($('#stype_0').is(':checked')) {
				return [{'stop_id' : stop_id, 'stop_type_id' : 0 }];
			} else {
				var result = [];
				$('#types .parameter.sub input:checked').each(function () {
					result.push({'stop_id' : stop_id, 'stop_type_id' : $(this).data('id') });

				});
				return result;
			}
		},

		startAjaxEdition: function () {
			var context = this;
			$.ajax({
				type: 'GET',
				url: document['url_root'] + 'stop/block/' + $.viewmodel.stopSelected.id
			}).done(function () {
					context.startEdit();
				});
		},

		startEdit: function () {
			var icon = $.sm.helpers.getIcon('stop-editable', 25),
				vm = $.viewmodel,
				v = $.view,
				marker;
			v.$body.addClass('editable');
			v.$editorContainer.find('input, select, textarea, button').removeAttr('disabled');
			v.$editorContainer.find('form').removeClass('disabled');
			vm.editable = true;
			marker = L.marker([vm.stopSelected.geom.lat, vm.stopSelected.geom.lon], {icon: icon, draggable: true});
			marker.on('dragend', function (e) {
				var latLon = e.target.getLatLng();
				$('#lat').val(latLon.lat);
				$('#lon').val(latLon.lng);
			});
			vm.mapLayers['edit'].addLayer(marker);
			this.fillEditor(vm.stopSelected);
			this.bindEventsForTypes();
			$('#chb_is_help').off('change').on('change', function () {
				if (this.checked) {
					$('#is_help').val(1);
				} else {
					$('#is_help').val(0);
				}
			});
			vm.map.closePopup();
		},

		bindEventsForTypes: function () {
			var v = $.view;
			$('#stype_0').off('change').on('change', function () {
				if (this.checked) {
					$('#types .parameters input').not('#stype_0').prop('checked', false).not('#other_stype').prop('disabled', true);
					$('#types .parameter.sub label').addClass('disabled');
				} else {
					$('#types .parameters input').not('#stype_0').prop('disabled', false);
					$('#other_stype').prop('checked', true);
					$('#types .parameter.sub label').removeClass('disabled');
				}
			});
			$('#other_stype').off('change').on('change', function () {
				if (this.checked) {
					$('#types .parameters input').prop('disabled', false);
					$('#stype_0').prop('checked', false);
					$('#types .parameter.sub label').removeClass('disabled');
				} else {
					$('#stype_0').prop('checked', true);
					$('#types .parameters input').not('#stype_0').prop('checked', false).not('#other_stype').prop('disabled', true);
					$('#types .parameter.sub label').addClass('disabled');
				}
			});
		},

		fillEditor: function (stop) {
			var helpers = $.sm.helpers;
			$('#name').val(stop.name);
			$('#id').val(stop.id).attr('disabled', 'disabled');
			$('#lat').val(stop.geom.lat);
			$('#lon').val(stop.geom.lon);
			this.fillRoutes(stop.routes);
			for (var i = 0, tl = stop.types.length; i < tl; i += 1) {
				$('#stype_' + stop.types[i].id).prop('checked', true);
			}
			if (stop.types.length > 0 && stop.types[0].id === 0) {
				$('#types .parameters input').not('#stype_0').prop('checked', false).not('#other_stype').prop('disabled', true);
				$('#types .parameter.sub label').addClass('disabled');
			} else if (stop.types.length > 0 && stop.types[0].id !== 0) {
				$('#types .parameters input').not('#stype_0').prop('disabled', false);
				$('#other_stype').prop('checked', true);
				$('#types .parameter.sub label').removeClass('disabled');
			} else {
				$('#types .parameter.sub label').addClass('disabled');
				$('#types .parameter.sub input').prop('disabled', true);
			}
			$('#is_shelter').val(helpers.boolToString(stop.is_shelter, true));
			$('#is_bench').val(helpers.boolToString(stop.is_bench, true));
			$('#pan_link').val(helpers.valueNullToString(stop.panorama_link));
			this.validateLink();
			$('#auto_link').prop('href', this.getPanoramaAutoLink(stop.geom));
			$('#comment').val(helpers.valueNullToString(stop.comment));
			$('#is_check').val(stop.check_status_type_id);

			if (stop.is_help) {
				$('#is_help').val(1);
				$('#chb_is_help').prop('checked', true);
			} else {
				$('#is_help').val(0);
				$('#chb_is_help').prop('checked', false);
			}
		},

		getPanoramaAutoLink: function (stopGeom) {
			var coordinateCenter = stopGeom.lon + ',' + stopGeom.lat;
			// API from http://clubs.ya.ru/mapsapi/replies.xml?item_no=6331
			return 'http://maps.yandex.ru/?ll=' + coordinateCenter +
				'&spn=0.011795,0.004087&l=map,stv&ol=stv&oll=' + coordinateCenter +
				'&ost=dir:0,0~spn:90,73.739795';
		},

		fillRoutes: function (routes) {
			var helpers = $.sm.helpers,
				routes_sorted = routes.sort(helpers.sortByFields('route_type_id', 'name')),
				i = 0,
				routesCount= routes_sorted.length,
				routesEditable = {'ids' : {}, 'routes' : routes_sorted};

			for (i; i < routesCount; i += 1) {
				routesEditable.ids[routes_sorted[i].id] = true;
				$('#routes').addTag(routes_sorted[i].name, { 'css_class' : 'tag type-id-' + routes_sorted[i].route_type_id});
			}

			$.viewmodel.stopSelected['routes'] = routesEditable;
		},

		addRoute: function (id, name) {
			var vm = $.viewmodel,
				routeTypeId = vm.routeTypeSelected,
				routes = vm.stopSelected.routes;
			if (routes.ids[id]) {
				return false;
			} else {
				routes.ids[id] = true;
			}
			routes.routes.push({
				"route_type_id": routeTypeId,
				"id": id,
				"name": name
			});
			this.updateUIRoutes(routes.routes);
		},

		removeRoute: function (name) {
			var vm = $.viewmodel,
				routes = vm.stopSelected.routes,
				removedRoute,
				i = 0,
				routesCount = routes.routes.length;
			for (i; i < routesCount; i += 1) {
				if (routes.routes[i].name === name) {
					removedRoute = routes.routes[i];
					routes.ids[removedRoute.id] = false;
					routes.routes.splice(i, 1);
					break;
				}
			}
			this.updateUIRoutes(routes.routes);
		},

		updateUIRoutes: function (routes) {
			var i = 0,
				routesCount= routes.length;

			routes = routes.sort($.sm.helpers.sortByFields('route_type_id', 'name'));
			this.clearUIRoutes();

			for (i; i < routesCount; i += 1) {
				$('#routes').addTag(routes[i].name, { 'css_class' : 'tag type-id-' + routes[i].route_type_id});
			}
		},

		clearUIRoutes: function() {
			$('#routes').importTags('');
		},

		finishAjaxEdition: function () {
			var context = this;
			$.ajax({
				type: 'GET',
				url: document['url_root'] + 'stop/unblock/' + $.viewmodel.stopSelected.id
			}).done(function () {
					context.finishEditing();
				});
		},

		finishEditing: function () {
			var vd = $.view.$document,
				vm = $.viewmodel,
				v = $.view;
			vm.map.closePopup();
			vm.mapLayers['edit'].clearLayers();
			vm.editable = false;
			v.$body.addClass('editable');
			v.$editorContainer.find('input, textarea').val('');
			v.$editorContainer.find('input:checkbox').prop('checked', false);
			v.$editorContainer.find('input, select, textarea, button').attr('disabled', 'disabled');
			v.$editorContainer.find('form').addClass('disabled');
			$('#auto_link').prop('href', '');
			$('#routes').importTags('');
			$.view.$document.trigger('/sm/map/updateAllLayers');
		}
	});
})(jQuery);

(function ($) {
	$.extend($.viewmodel, {
		osmStops: {}
	});
	$.extend($.view, {

	});
	$.sm.osm = {};
	$.extend($.sm.osm, {
		osmMaxClusterRadius: 80,

		init: function () {
			this.setDomOptions();
			this.buildOsmStopsLayer();
			this.updateStopsFromXapi();
			this.bindEvents();
		},

		bindEvents: function () {
			var context = this;
			$.view.$document.on('/sm/osm/updateOsmLayer', function () {
				context.updateOsmLayer();
			});
		},

		setDomOptions: function () {

		},

		buildOsmStopsLayer: function () {
			var osmStopsLayerGroup  = new L.layerGroup();
			$.viewmodel.map.addLayer(osmStopsLayerGroup);
			$.viewmodel.mapLayers['osmStops'] = osmStopsLayerGroup;
		},

		updateOsmLayer: function () {
			var validateZoom = this.validateZoom();
			$.viewmodel.mapLayers.osmStops.clearLayers();
			if (!validateZoom) { return; }

			this.updateStopsFromXapi();
		},

		offOsmLayer: function () {
			$.viewmodel.mapLayers.osmStops.clearLayers();
		},

		onOsmLayer: function () {
			this.updateOsmLayer(false);
		},

		renderStops: function (overpassStops) {
			var stops = overpassStops.elements,
				vm = $.viewmodel,
				osmLayer = vm.mapLayers.osmStops,
				icon = $.sm.map.getIcon('osm-bus-stop', 16),
				marker;
			vm.osmStops = {};
			popupHtml = $.templates.stopPopupTemplate({
				css: 'block'
			});
			for (var i = 0, stopsCount = stops.length; i < stopsCount; i++) {
				vm.osmStops[stops[i].id] = stops[i];
				marker = L.marker([stops[i].lat, stops[i].lon], {icon:icon})
					.on('click', function (e) {
						$.view.$document.trigger('/sm/map/MarkerClick');
						var marker = e.target,
							stop = $.viewmodel.osmStops[marker.id_osm],
							html = $.templates.osmPopupTemplate({
								tags: $.sm.helpers.hashToArrayKeyValues(stop.tags),
								id: stop.id,
								link: 'http://www.openstreetmap.org/browse/node/' + stop.id
							});
							$.view.$document.trigger('/sm/map/openPopup', [marker.getLatLng(), html]);
					});
				marker['id_osm'] = stops[i].id;
				osmLayer.addLayer(marker);
			}
		},

		updateStopsFromXapi: function () {
			var context = this,
				url = context.getApiUrl($.viewmodel.map.getBounds());
			$.ajax({
					type: "GET",
					url: url,
					dataType: 'json',
					success: context.renderStops,
					context: context
				});
		},

		getApiUrl: function (boundingbox) {
			var sw = boundingbox.getSouthWest(),
				ne = boundingbox.getNorthEast(),
				overpassUrl = "http://overpass-api.de/api/interpreter?data=[out:json];(node[highway=bus_stop]("
				+ sw.lat + "," + sw.lng
				+ "," + ne.lat
				+ "," + ne.lng
				+ ");>;);out;";
			return overpassUrl;
		},

		validateZoom: function () {
			if ($.viewmodel.map.getZoom() < 14) {
				return false;
			}
			return true;
		}
	});
})(jQuery);

(function ($) {
	$.extend($.viewmodel, {
		stopSelected: null,
		stopSelectedId: null,
		stops: null,
		isRenderedLabels: false,
		isLabelsMode: false
	});
	$.extend($.view, {

	});
	$.sm.stops = {};
	$.extend($.sm.stops, {
		init: function () {
			this.setDomOptions();
			this.buildStopsLayers();
			this.updateStops();
			this.bindEvents();
		},

		bindEvents: function () {
			var context = this;
			$.view.$document.on('/sm/stops/updateStops', function () {
				context.updateStops();
			});
		},

		setDomOptions: function () {

		},

		buildStopsLayers: function () {
			var stopsGroup = new L.layerGroup(),
				editGroup = new L.layerGroup();
			$.viewmodel.map.addLayer(stopsGroup);
			$.viewmodel.mapLayers['stops'] = stopsGroup;

			$.viewmodel.map.addLayer(editGroup);
			$.viewmodel.mapLayers['edit'] = editGroup;
		},

		updateStops: function () {
			var validateZoom = this.validateZoom();
			$.viewmodel.mapLayers.stops.clearLayers();
			if (!validateZoom) { return; }
			$.view.$document.trigger('/sm/stops/startUpdate');
			this.updateStopsByAjax();
		},

		updateStopsByAjax: function () {
			var context = this,
				url = document['url_root'] + 'stops',
				filter = $.viewmodel.filter;
			$.ajax({
				type: "GET",
				url: url,
				data: {
					'bbox' : JSON.stringify($.viewmodel.map.getBounds()),
					'filter' : JSON.stringify(filter)
				},
				dataType: 'json',
				success: function(data) {
					context.renderStops(data);
					$.view.$document.trigger('/sm/searcher/update');
					$.view.$document.trigger('/sm/stops/endUpdate');
				},
				context: context
			});
		},

		renderStops: function (data) {
			var map = $.sm.map,
				viewmodel = $.viewmodel,
				isRenderedLabels = viewmodel.isRenderedLabels, label,
				stopsLayer = viewmodel.mapLayers.stops,
				stopsIterable, stopsIterableLength, indexStop,
				stop, marker, popupHtml,
				htmlPopup = $.templates.stopPopupTemplate({ css: 'edit' }),
				context = this;

			viewmodel.stops = data.stops;

			stopsIterable = data.stops.block.elements;
			stopsIterableLength = data.stops.block.count;
			for (indexStop = 0; indexStop < stopsIterableLength; indexStop += 1) {
				stop = stopsIterable[indexStop];
				label = isRenderedLabels ?
					'<div class="marker-label">' + stop.name + '</br>' + stop.id + '</div><div class="pointer"></div>' :
					null;
				marker = L.marker([stop.lat, stop.lon], {icon: map.getIcon('stop-block', 20, label)})
					.on('click', function (e) {
						var marker = e.target;
						$.view.$document.trigger('/sm/map/openPopup', [marker.getLatLng(), htmlPopup]);
						context.buildStopPopup(marker.stop_id);
					});
				marker['stop_id'] = stop.id;
				stopsLayer.addLayer(marker);
			}

			stopsIterable = data.stops.non_block.non_check.elements;
			stopsIterableLength = data.stops.non_block.non_check.count;
			for (indexStop = 0; indexStop < stopsIterableLength; indexStop += 1) {
				stop = stopsIterable[indexStop];
				label = isRenderedLabels ?
					'<div class="marker-label">' + stop.name + '</br>' + stop.id + '</div><div class="pointer"></div>' :
					null;
				marker = L.marker([stop.lat, stop.lon], {icon: map.getIcon('stop-edit', 20, label)})
					.on('click', function (e) {
						var marker = e.target;
						$.view.$document.trigger('/sm/map/openPopup', [marker.getLatLng(), htmlPopup]);
						context.buildStopPopup(marker.stop_id);
					});
				marker['stop_id'] = stop.id;
				stopsLayer.addLayer(marker);
			}


			stopsIterable = data.stops.non_block.check.elements;
			stopsIterableLength = data.stops.non_block.check.count;
			for (indexStop = 0; indexStop < stopsIterableLength; indexStop += 1) {
				stop = stopsIterable[indexStop];
				label = isRenderedLabels ?
					'<div class="marker-label">' + stop.name + '</br>' + stop.id + '</div><div class="pointer"></div>' :
					null;
				marker = L.marker([stop.lat, stop.lon], {icon: map.getIcon('stop-check', 20, label)}).on('click', function (e) {
					var marker = e.target;
					$.view.$document.trigger('/sm/map/openPopup', [marker.getLatLng(), htmlPopup]);
					context.buildStopPopup(marker.stop_id);
				});
				marker['stop_id'] = stop.id;
				stopsLayer.addLayer(marker);
			}
		},

		buildStopPopup: function (stopId) {
			return $.getJSON(document['url_root'] + 'stop/' + stopId,function (data) {
				if (!$.viewmodel.editable) {
					$.viewmodel.stopSelected = data.stop;
				}
				var helper = $.sm.helpers,
					html = $.templates.stopPopupInfoTemplate({
						id: data.stop.id,
						name: data.stop.name,
						is_shelter: helper.boolToString(data.stop.is_shelter),
						is_bench: helper.boolToString(data.stop.is_bench),
						stop_type_id: helper.valueNullToString(data.stop.stop_type_id),
						routes: data.stop.routes,
						types: data.stop.types,
						check_status: helper.valueCheckToString(data.stop.check_status_type_id),
						comment: helper.valueNullToString(data.stop.comment),
						isUserEditor: $.viewmodel.isAuth,
						editDenied: $.viewmodel.editable || data.stop.is_block,
						isBlock: data.stop.is_block,
						userBlock: data.stop.user_block,
						isUnBlock: data.stop.is_unblock
					});
				$('#stop-popup').removeClass('loader').empty().append(html);
				$('button#edit').off('click').on('click', function (e) {
					$.view.$document.trigger('/sm/editor/startEdit');
				});
				if (data.stop.is_unblock) {
					$('#unblock').off('click').on('click', function (e) {
						$.ajax({
							type: 'GET',
							url: document['url_root'] + 'stop/unblock/' + $.viewmodel.stopSelected.id
						}).done(function () {
							$.viewmodel.map.closePopup();
							$.view.$document.trigger('/sm/map/updateAllLayers');
						});
					});
				}
			}).error(function () {
					$('#stop-popup').removeClass('loader').empty().append('Error connection');
				});
		},

		validateZoom: function () {
			if ($.viewmodel.map.getZoom() < 14) {
				return false;
			}
			return true;
		}
	});
})(jQuery);

(function ($) {
	$.extend($.viewmodel, {
		isAuth: false
	});
	$.extend($.view, {
		$userContainer: null,
		$signInForm: null,
		$signOutForm: null
	});
	$.sm.user = {};
	$.extend($.sm.user, {
		init: function () {
			this.setDomOptions();
			this.bindEvents();
		},

		setDomOptions: function () {
			$.view.$userContainer = $('#userContainer');
			$.view.$signInForm = $('#signInForm');
			$.view.$signOutForm = $('#signOutForm');
			if ($.view.$userContainer.hasClass('inner')) { $.viewmodel.isAuth = true; }
		},

		bindEvents: function () {
			var context = this;
			$('#signOutForm div.log').off('click').on('click', function () {
				context.renderLogs();
			});
		},

		renderLogs: function () {
			var url = document['url_root'] + 'logs';
			$.view.$document.trigger('/sm/common/setMainLoad');
			$.ajax({
				type: "GET",
				url: url,
				dataType: 'json',
				success: function(data) {
					var html = $.templates.userLogsTemplate({
						user_logs: data.stops_by_users,
						count_all: data.count.all,
						count_editable: data.count.editable,
						percent: (data.count.editable / data.count.all * 100).toFixed(2)
					});
					$.view.$body.removeClass('loader');
					$.view.$document.trigger('/sm/common/openPopup', ['Статистика пользователей', html]);
				}
			});
		}
	});
})(jQuery);

