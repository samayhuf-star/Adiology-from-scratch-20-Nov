// ChatBot initialization script
// Moved from inline script to external file for CSP compliance

(function() {
  window.__ow = window.__ow || {};

  window.__ow.organizationId = "3cc3ee51-f63c-4c2d-b227-05e647ea6edc";
  window.__ow.template_id = "43657d31-2e0d-4fc9-a1cf-cefa6c106ad2";
  window.__ow.integration_name = "manual_settings";
  window.__ow.product_name = "chatbot";   

  ;(function(n,t,c){
    function i(n){
      return e._h ? e._h.apply(null,n) : e._q.push(n);
    }
    var e = {
      _q: [],
      _h: null,
      _v: "2.0",
      on: function(){ i(["on", c.call(arguments)]); },
      once: function(){ i(["once", c.call(arguments)]); },
      off: function(){ i(["off", c.call(arguments)]); },
      get: function(){
        if(!e._h) throw new Error("[OpenWidget] You can't use getters before load.");
        return i(["get", c.call(arguments)]);
      },
      call: function(){ i(["call", c.call(arguments)]); },
      init: function(){
        var n = t.createElement("script");
        n.async = !0;
        n.type = "text/javascript";
        n.src = "https://cdn.openwidget.com/openwidget.js";
        t.head.appendChild(n);
      }
    };
    if(!n.__ow.asyncInit) e.init();
    n.OpenWidget = n.OpenWidget || e;
  }(window, document, [].slice));
})();

