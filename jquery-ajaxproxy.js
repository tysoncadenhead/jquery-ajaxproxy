/*jslint evil: true */
/*global window, document, jQuery */

(function ($) {

	'use strict';

	var $ajax = $.ajax;

	$.extend({

			// These objects are used to store callback functions
			ajaxProxySuccess: {},
			ajaxProxyError: {},

	    /**
			* @function
			*/
			hashchange: function () {

				var hash = document.location.hash.replace('#', '');

				// If the hash is passing in one of our magic functions, eval it
				if (hash.indexOf('$.ajaxProxy') !== -1 || hash.indexOf('$.ajaxResponse') !== -1) {
					eval(hash);
				}

			},

			/**
			* @function
			* @param Object obj The response data
			*/
			ajaxResponse: function (obj) {

				// If we get a success
				if (obj.data.success) {
					window.parent.parent.jQuery.ajaxProxySuccess[obj.obj.cb](obj.data);

				// If we get an error
				} else {
					window.parent.parent.jQuery.ajaxProxyError[obj.obj.cb](obj.data);
				}
				
			},

			/**
			* @function
			* @param {Object} obj The object we used to create the iframe hash
			* @param {Object} data The response data
			*/
			ajaxProxyResponder: function (obj, data) {

				var $iframe = $('<iframe />');

				// The src will include a function that will call back to the top iframe
				$iframe.attr({
					'src': obj.responseProxy + '#$.ajaxResponse(' + JSON.stringify({ data: data, obj: obj }) + ');',
					'height': 0,
					'width': 0,
					'frameborder': 0
				});

				// Add the iframe to the DOM
				$('body').append($iframe);

			},

			/**
			* @function
			* @param {Object}
			*/
			ajaxProxy: function (obj) {

				// Call the native jQuery ajax function
				$ajax($.extend(obj, {

					// Success Callback
					success: function (data) {
						if (data.success !== false) {
							data.success = true;
						}
						$.ajaxProxyResponder(obj, data);
					},

					// Error Callback
					error: function (data) {
						data.success = false;
						$.ajaxProxyResponder(obj, data);
					}

				}));

			}

	});

	// Override jQuery's Ajax function by extending our own magic
	$.ajax = function (obj) {

		var $iframe = $('<iframe />');

		// Are we making a cross-domain request?
		if (
			
			// Make sure we're calling a domain starting with http.  Otherwise, it doesn't need to be crossdomain
			obj.url.indexOf('http') !== -1 && 
			
			// If the domains don't match, it is cross domain
			(obj.url.split('/')[2] !== window.location.host) &&

			// If we are using jsonp, the cross-domain issues are already taken care of
			obj.dataType !== 'jsonp'
		
		) {

			// Make sure a proxy is specified in the ajax object
			if (!obj.requestProxy) {
				console.warn('Please specify a requestProxy in your ajax call.');
				return false;
			}

			// If there isn't a response proxy declared, assume that it is proxy.html
			if (!obj.responseProxy) {
				obj.responseProxy = '//:' + document.location.host + '/proxy.html';
			}

			// Create a callback key based on the time string
			obj.cb = String(new Date().getTime());

			// Create a success callback
			$.ajaxProxySuccess[obj.cb] = function (data) {
				$('#iframe_' + obj.cb).remove();
				obj.success(data);
			};

			// Create an error callback
			$.ajaxProxyError[obj.cb] = function (data) {
				$('#iframe_' + obj.cb).remove();
				obj.error(data);
			};

			// Make the iFrame to make the cross-domain request
			$iframe.attr({
				'src': obj.requestProxy + '#$.ajaxProxy(' + JSON.stringify(obj) + ');',
				'height': 0,
				'width': 0,
				'frameborder': 0,
				'id': 'iframe_' + obj.cb
			});

			// Append the iframe
			$('body').append($iframe);

		// If we are not making a cross-domain request, use $.ajax as it is
		} else {
			$ajax(obj);
		}

	};

	// Listen for the hashtag to change
	$(window).bind('hashchange', $.hashchange);

	// Initialize the hashchange
	$.hashchange();

}(jQuery));