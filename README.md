jquery-ajaxproxy
================

Makes cross-domain ajax GET, POST, PUT and DELETE requests by using a proxy on each domain.

jQuery Ajax Proxy works like a regular jQuery $.ajax() call.  The only difference is that it expects a requestProxy and a responseProxy param.  The requestProxy is an html proxy file that will live on the domain you are trying to call and will need to include the jQuery library and the jquery-ajaxproxy.js file.  The responseProxy is an html proxy that lives on the domain that the user is on, which made the request and expects the same scripts to be included.

For example, if you are trying to post some data from foo.com to bar.com, the config would look like this:

<pre>
$.ajax({
	url: 'http://bar.com/my-url',
	requestProxy: 'http://bar.com/proxy.html',
	responseProxy: 'http://foo.com/proxy.html',
	success: function () {
	   // ....
  }
});
</pre>

Once you ensure that the proxy.html files are in the right place and that they include jQuery and jQuery AjaxProxy, you will be all set to make secure GET, POST, DELETE and PUT calls completely cross-domain.

For a working example of this, check it out <a href="http://sandbox1.tysonlloydcadenhead.com/ajaxproxy/example.html">here</a>.