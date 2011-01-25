(function(){
    $.fn.smartree = function(opt){
        var ie6=$.browser.msie && $.browser.version <= 6;
        var defaults = {
        };
        var options = $.extend(defaults, opt);
        this.each(function(){
            var ME = $(this);

            ME.addClass("smartree");

            // expand/fold bar.
            ME.find("li").prepend("<ins></ins>");

            // nodes focus handler.
            ME.find("li>a").click(function(evt){
                var ctrl = evt.ctrlKey,
                    me = $(this),
                    c = "focus";
                if(!ctrl){
                    ME.find("li>a."+c).removeClass(c);
                    me.addClass(c);
                }else{
                    if(me.hasClass(c)){
                        me.removeClass(c);
                    }else{
                        me.addClass(c);
                    }
                    return false;
                }
            }).prepend("<ins></ins>"); // node type icons.

            // init subnode status.
            ME.find("li:has(>ul)").addClass("fold");
            if(ie6){
                ME.find("li>ul").hide();
            }

            // last node for ie6.
            ME.find("li:last-child").addClass("last");

            // handler for expand/fold.
            ME.find("li:has(>ul)>ins").click(function(){
                var o=$(this).parent("li");
                if(o.hasClass("fold")){
                    o.removeClass("fold").addClass("expand");
                    if(ie6){
                        o.find(">ins:first").removeClass("fold").addClass("expand");
                        o.find(">ul").show();
                    }
                }else{
                    o.removeClass("expand").addClass("fold");
                    if(ie6){
                        o.find(">ins:first").removeClass("expand").addClass("fold");
                        o.find(">ul").hide();
                    }
                }
            });

            // checkbox.
            if("checkbox" in options){
                ME.find("li>ins").after('<ins class="checkbox"></ins>');
                ME.find("li>ins.checkbox").click(function(){
                    var me=$(this),
                        c = "checked";
                    if(me.hasClass(c)){
                        me.removeClass(c);
                    }else{
                        me.addClass(c);
                    }
                });
            }

            // hacks for ie6.
            if(!ie6){return;}
            ME.find(">ul>li").addClass("root");
            //ME.find("li>ins").addClass("none");
            ME.find("li>a>ins").addClass("folder");
            ME.find("li.expand>ins:first-child").addClass("expand");
            ME.find("li.fold>ins:first-child").addClass("fold");
            ME.find("li:last-child>ins:first-child").addClass("last");
        });
    };
})(jQuery);
