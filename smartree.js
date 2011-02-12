var Smartree = (function(){
    var RE_EMPTY=/^\s*$/;
    // DOM.
    var D = {
        append: function(elem, child) {
            if (elem.nodeType == 1)
                elem.appendChild( child );
        },
        prepend: function(elem, child) {
            if (elem.nodeType == 1)
                elem.insertBefore( child, elem.firstChild );
        },
        before: function(elem, child) {
            elem.parentNode.insertBefore( child, elem );
        },
        after: function(elem, child) {
            elem.parentNode.insertBefore( child, elem.nextSibling );
        },
        hasClass : function(elem, cls){
            var c = elem.className;
            if (!c || RE_EMPTY.test(c)){return false;}
            return (c.search('(^|\\s)'+cls+'(\\s|$)') != -1);
        },
        addClass : function(elem, cls){
            if(!elem || D.hasClass(elem, cls)){return;}
            var c=elem.className;
            if(!c || RE_EMPTY.test(c)){elem.className = cls;}
            else{elem.className += (" "+cls);}
        },
        removeClass : function(elem, cls){
            if(!elem || !D.hasClass(elem, cls)){return;}
            var c=elem.className, a=c.split(" "), n=[];
            for(var i=a.length-1; i>-1; i--){
                if(cls==a[i]){n[n.length]=a[i];}
            }
            elem.className = n.join(" ");
        },
        children : function(elem){
            if(!elem){return null;}
            var c=elem.childNodes,r=[];
            for(var i=0,l=c.length; i<l; i++){
                if(1==c[i].nodeType){
                    r[r.length] = c[i];
                }
            }
            return r;
        }
    };
    // Event.
    var E = {
        KEY_BACKSPACE: 8,
        KEY_TAB     : 9,
        KEY_RETURN  : 13,
        KEY_SHIFT   : 16,
        KEY_CTRL    : 17,
        KEY_CAPSLOCK: 20,
        KEY_ESC     : 27,
        KEY_LEFT    : 37,
        KEY_UP      : 38,
        KEY_RIGHT   : 39,
        KEY_DOWN    : 40,
        KEY_DELETE  : 46,
        KEY_HOME    : 36,
        KEY_END     : 35,
        KEY_PAGEUP  : 33,
        KEY_PAGEDOWN: 34,
        KEY_INSERT  : 45,
        KEY_0       : 48,
        KEY_1       : 49,
        KEY_2       : 50,
        KEY_3       : 51,
        KEY_4       : 52,
        KEY_5       : 53,
        KEY_6       : 54,
        KEY_7       : 55,
        KEY_8       : 56,
        KEY_9       : 57,
        KEY_WINDOWS : 91,
        KEY_COMMA   : 188,
        KEY_SEMICOLON: 186,
        KEY_QUOTATION: 222,
        KEY_SIGN    : 49,
        stop : function(evt){
            if(evt.stopPropagation){
                evt.stopPropagation();
                evt.preventDefault();
            }else{
                evt.cancelBubble = true;
                evt.returnValue = false;
            }
        },
        pause : function(evt){
            if(evt.stopPropagation){
                evt.stopPropagation();
                //evt.preventDefault();
            }else{
                evt.cancelBubble = true;
                //evt.returnValue = false;
            }
        },
        // for keypress handler.
        key : function(evt){
            evt = window.event || evt;
            var keycode = evt.keyCode || evt.which || evt.charCode;
            var keyname = String.fromCharCode(keycode);
            if(E.KEY_SHIFT==keycode || E.KEY_CTRL==keycode){
                return;
            }
            if((evt.shiftKey && E.CapsLock(evt)) || (!evt.shiftKey &&!E.CapsLock(evt))){
                keyname = keyname.toLowerCase();
            }
            return keyname;
        },
        // for keypress handler.
        CapsLock : function(evt){
            var e = evt||window.event;
            var o = e.target||e.srcElement;
            var oTip = o.nextSibling;
            var keyCode  =  e.keyCode||e.which;
            var isShift  =  e.shiftKey ||(keyCode  ==   16 ) || false ;
            // 判断shift键是否按住
            if (
                ((keyCode >=   65   &&  keyCode  <=   90 )  &&   !isShift)
                // Caps Lock 打开，且没有按住shift键
                || ((keyCode >=   97   &&  keyCode  <=   122 )  &&  isShift)
                // Caps Lock 打开，且按住shift键
            ){return true;}
            else{return false;}
        },
        add : function(elem, evt, handler){
            if (elem.addEventListener) {
                elem.addEventListener(evt, handler, false);
            } else if(elem.attachEvent) {
                elem.attachEvent("on"+evt, handler);
            }
        },
        remove : function(elem, evt, handler){
            if (elem.removeEventListener) {
                elem.removeEventListener(evt, handler, false);
            } else {
                elem.detachEvent("on"+evt, handler);
            }
        }
    };
    // Function.
    var F = {
        createDelegate : function(instance, method) {
            //var args = Array.from(arguments).splice(2,arguments.length - 2);
            return function() {
                return method.apply(instance, arguments);
            }
        }
    };

    /**
     * 树包含 0 或多个节点，
     * 节点包含的子节点组成一棵子树，
     * 节点包含 0 或 1 颗子树；
     */

    // 节点代表 li 元素。
    var Node = function(){
        this.parent = null;
        this.children = null;
        this.text = "";
        this.title = "";
        this.uri = "javascript:void(0);";
        this.target = "_this";
        this.handler = null;
    };
    Node.prototype.expand = function(){
        D.addClass(this._elem, "expand");
        if(!this.children){return;}
        this.children.expand();
    };
    Node.prototype.fold = function(){
        D.addClass(this._elem, "fold");
        if(!this.children){return;}
        this.children.fold();
    };
    Node.prototype.addChild = function(node){
        node.parent = this;
        if(!this.children){
            this.children = new Tree();
        }
        this.children.push(node);
    };
    Node.prototype.toString = function(){
        return '<li>'+
            '<ins></ins>'+
            '<a href="'+this.uri+'" target="'+this.target+'" title="'+this.title+'">'+
            '<ins></ins>'+this.text+'</a>'+
                (this.children ? this.children.toString() : '')+
            '</li>';
    };

    // 树代表 ul 元素。
    var Tree = function(container){
        this.nodes = [];
    };
    Tree.prototype.expand = function(){
        // hacks for IE6.
        this._elem.style.display = "block";
    };
    Tree.prototype.fold = function(){
        // hacks for IE6.
        this._elem.style.display = "none";
    };
    Tree.prototype.toString = function(){
        var s = '';
        if(this.nodes.length <= 0){return s;}

        for(var i=0,l=this.nodes.length; i<l; i++){
            s += this.nodes[i].toString();
        }
        return '<ul>'+s+'</ul>';
    };
    Tree.prototype.add = function(node){
        this.nodes.push(node);
    };
    Tree.prototype.remove = function(node){};
    Tree.prototype.filter = function(){
    };

    // TODO:
    function parseArray(arr, rootId, handler){
        var cache={};
        for(var i=0,pid,l=arr.length; i<l; i++){
            pid = arr[i].pid;
            if(!cache[pid]){ cache[pid] = []; }
            cache[arr[i].pid].push(arr[i]);
        }
        var root = tree = new Tree();
        var nodeId = rootId;
        var node;
        var cacheT = {};
        do{
            var nodes = cache[nodeId];
                    //alert(nodes[1].id)
            if(!nodes){
                if(node && node.pid){
                    //TODO:
                    nodeId = node.pid;
                    //tree = cacheT[nodeId];
                    continue;
                }else{
                    break;
                }
            }
            for(var i=0,l=nodes.length; i<l; i++){
                node = new Node();
                node.id = nodes[i].id;
                node.pid = nodes[i].pid;
                node.uri = nodes[i].uri || "javascript:void(0);";
                node.text = nodes[i].text || "(empty)";
                node.title = nodes[i].title || "";
                node.target = nodes[i].target || "_this";
                node.handler = nodes[i].handler;

                tree.add(node);
                nodeId = node.id;
            }
        }while(cache[nodeId]);
        return root;
    }
    function parseDOM(container){
        D.addClass(container, "smartree");
        // ADD handler elements for fold/expand.
        var list = container.getElementsByTagName("li");
        for(var i=0,l=list.length; i<l; i++){
            D.prepend(list[i], document.createElement('ins'));
        }
        // ADD handler for fold/expand.
        // ADD last className for last-child in IE6.
        var uls = document.getElementsByTagName("ul");
        for(var i=0,p,lis,l=uls.length; i<l; i++){
            p = uls[i].parentNode;
            D.addClass(p, "fold");
            lis = uls[i].childNodes;
            D.addClass(lis[lis.length-1], "last");
        }
        var links = container.getElementsByTagName("a");
        for(var i=0,l=links.length; i<l; i++){
            D.prepend(links[i], document.createElement('ins'));
        }
    };
    function Smartree(){
        if(arguments[0] instanceof Array){
            return parseArray(arguments[0], arguments[1]);
        }else{
            return parseDOM(arguments[0]);
        }
    }
    return Smartree;
})();
