(function($){
  $.fn.navpanel = function(method, options){
    if (typeof method === "string") {
      var fn = $.fn.navpanel.methods[method];
      return fn ? fn(this, options) : this.panel(method, options);
    } else {
      method = method || {};
      return this.each(function(){
        var state = $.data(this, "navpanel");
        if (state){
          $.extend(state.options, method);
        } else {
          $.data(this, "navpanel", {
            options: $.extend({}, $.fn.navpanel.defaults, $.fn.navpanel.parseOptions(this), method)
          });
        }
        $(this).panel($.data(this, "navpanel").options);
      });
    }
  };

  $.fn.navpanel.methods = {
    options: function(jq){
      return $.data(jq[0], "navpanel").options;
    }
  };

  $.fn.navpanel.parseOptions = function(el){
    return $.extend({}, $.fn.panel.parseOptions(el), $.parser.parseOptions(el, []));
  };

  $.fn.navpanel.defaults = $.extend({}, $.fn.panel.defaults, {
    fit: true,
    border: false,
    cls: "navpanel"
  });

  $.parser.plugins.push("navpanel");

})(jQuery);

(function($){
  $(function(){
    $.mobile.init();
  });

  $.mobile = {
    defaults: {
      animation: "slide",
      direction: "left",
      reverseDirections: {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
      }
    },
    panels: [],
    init: function(container){
      $.mobile.panels = [];
      var panels = $(container || "body").children(".navpanel:visible");
      if (panels.length){
        panels.not(":first").children(".panel-body").navpanel("close");
        var p = panels.eq(0).children(".panel-body");
        $.mobile.panels.push({ panel: p, animation: $.mobile.defaults.animation, direction: $.mobile.defaults.direction });
      }

      $(document).off(".mobile").on("click.mobile", function(e){
        var a = $(e.target).closest("a");
        if (a.length){
          var opts = $.parser.parseOptions(a[0], ["animation", "direction", { back: "boolean" }]);
          if (opts.back){
            $.mobile.back();
            e.preventDefault();
          } else {
            var href = $.trim(a.attr("href"));
            if (/^#/.test(href)){
              var to = $(href);
              if (to.length && to.hasClass("panel-body")){
                $.mobile.go(to, opts.animation, opts.direction);
                e.preventDefault();
              }
            }
          }
        }
      });

      $(window).off(".mobile").on("hashchange.mobile", function(){
        var len = $.mobile.panels.length;
        if (len > 1){
          var hash = location.hash;
          var p = $.mobile.panels[len - 2];
          if (!hash || hash.endsWith(p.panel.attr("id"))){
            $.mobile._back();
          }
        }
      });
    },
    nav: function(from, to, animation, direction){
      animation = animation !== undefined ? animation : $.mobile.defaults.animation;
      direction = direction !== undefined ? direction : $.mobile.defaults.direction;

      var className = "m-" + animation + (direction ? "-" + direction : "");
      var p1 = $(from).panel("open").panel("resize").panel("panel");
      var p2 = $(to).panel("open").panel("resize").panel("panel");

      if (typeof CSS !== "undefined" && CSS.supports("animation", "name")){
        p1.add(p2).on("animationend webkitAnimationEnd", function(){
          $(this).off("animationend webkitAnimationEnd");
          var panelBody = $(this).children(".panel-body");
          if ($(this).hasClass("m-in")){
            panelBody.panel("open").panel("resize");
          } else {
            panelBody.panel("close");
          }
          $(this).removeClass(className + " m-in m-out");
        });
        p2.addClass(className + " m-in");
        p1.addClass(className + " m-out");
      } else {
        $(to).panel("open").panel("resize");
        $(from).panel("close");
      }
    },
    _go: function(target, animation, direction){
      animation = animation !== undefined ? animation : $.mobile.defaults.animation;
      direction = direction !== undefined ? direction : $.mobile.defaults.direction;

      var current = $.mobile.panels[$.mobile.panels.length - 1].panel;
      var to = $(target);
      if (current[0] !== to[0]){
        $.mobile.nav(current, to, animation, direction);
        $.mobile.panels.push({ panel: to, animation: animation, direction: direction });
      }
    },
    _back: function(){
      if ($.mobile.panels.length < 2) return;
      var fromPanel = $.mobile.panels.pop();
      var toPanel = $.mobile.panels[$.mobile.panels.length - 1];
      var reverseDir = $.mobile.defaults.reverseDirections[fromPanel.direction] || "";
      $.mobile.nav(fromPanel.panel, toPanel.panel, fromPanel.animation, reverseDir);
    },
    go: function(target, animation, direction){
      animation = animation !== undefined ? animation : $.mobile.defaults.animation;
      direction = direction !== undefined ? direction : $.mobile.defaults.direction;
      location.hash = "#&" + $(target).attr("id");
      $.mobile._go(target, animation, direction);
    },
    back: function(){
      history.go(-1);
    }
  };

  $.map([
    "validatebox", "textbox", "passwordbox", "filebox", "searchbox", "combo", "combobox",
    "combogrid", "combotree", "combotreegrid", "datebox", "datetimebox", "numberbox",
    "spinner", "numberspinner", "timespinner", "datetimespinner"
  ], function(name){
    if ($.fn[name]){
      $.extend($.fn[name].defaults, { iconWidth: 28, tipPosition: "bottom" });
    }
  });

  $.map(["spinner", "numberspinner", "timespinner", "datetimespinner"], function(name){
    if ($.fn[name]){
      $.extend($.fn[name].defaults, { iconWidth: 56, spinAlign: "horizontal" });
    }
  });

  if ($.fn.menu){
    $.extend($.fn.menu.defaults, { itemHeight: 30, noline: true });
  }
})(jQuery);
