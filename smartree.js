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
                if(cls!=a[i]){n[n.length]=a[i];}
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
    var AJAX = {
        sent : function(){},
        get:function(){},
        post:function(){}
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
        this.text = "";                     // node link's display name.
        this.title = "";                    // link's title attribute.
        this.uri = "javascript:void(0);";   // link's href attribute.
        this.target = "_this";              // link's target attribute.
        this.handler = null;                // expand & fold bar.
        // READ_ONLY.
        this.isLast = false;                // is the last node of tree.
        this.expanded = false;              // node status is expanded.
    };
    Node.prototype.expand = function(){
        D.removeClass(this._elem, "fold");
        D.addClass(this._elem, "expand");
        if(!this.children){return;}
        this.children.expand();
        this.expanded = true;
    };
    Node.prototype.fold = function(){
        D.removeClass(this._elem, "expand");
        D.addClass(this._elem, "fold");
        if(!this.children){return;}
        this.children.fold();
        this.expanded = false;
    };
    Node.prototype.toggle = function(){
        if(this.expanded){
            this.fold();
        }else{
            this.expand();
        }
    };
    Node.prototype.hasChild = function(){
        return !!this.children;
    };
    Node.prototype.addChild = function(node){
        if(!this.children){
            this.children = new Tree();
            this.children.parent = this;
        }
        this.children.add(node);
    };
    Node.prototype.focus = function(){
        D.addClass(this._achor, "focus");
    };
    Node.prototype.blur = function(){
        D.removeClass(this._achor, "focus");
    };
    Node.prototype.focused = function(){
        return D.hasClass(this._achor, "focus");
    };
    Node.prototype.root = function(){
        return this.parent.root();
    };
    Node.prototype._clickAchor = function(evt){
        evt = window.event || evt;
        var ctrl = evt.ctrlKey;
        if(!ctrl){
            var focused = this.root().focusedNodes;
            for(var i=0,l=focused.length; i<l; i++){
                focused[i].blur();
            }
            this.root().blurAll();
            this.focus();
            this.root().addFocusNode(this);
        }else{
            if(this.focused()){
                this.blur();
                this.root().removeFocusNode(this);
            }else{
                this.focus();
                this.root().addFocusNode(this);
            }
            E.stop(evt);
            return false;
        }
    };
    Node.prototype.text = function(){
        return this._text.nodeValue;
    };
    /*
     *
     * <li>
     *   <ins></ins>
     *   <a href="javascript:void(0);">
     *     <ins></ins>
     *     Node Text
     *   </a>
     * </li>
     */
    Node.prototype.valueOf = function(){
        var node = document.createElement("li");
        if(this.isLast){D.addClass(node, "last");}
        var bar = document.createElement("ins");
        var link = document.createElement("a");
        link.href = this.uri;
        var icon = document.createElement("ins");
        var text = document.createTextNode(this.text);
        node.appendChild(bar);
        node.appendChild(link);
        link.appendChild(icon);
        link.appendChild(text);

        this._elem = node;
        this._expandHandle = bar;
        this._achor = link;
        this._nodeTypeIcon = icon;
        this._text = text;

        E.add(link, "click", F.createDelegate(this, this._clickAchor));

        if(this.hasChild()){
            D.addClass(node, "fold");

            var _toggle = F.createDelegate(this, this.toggle);
            E.add(bar, "click", _toggle);

            node.appendChild(this.children.valueOf());
        }
        return node;
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
        this.parent = null;
        this._elem = null;
        this.nodes = [];
        this.expanded = false;
    };
    Tree.prototype.root = function(){
        var root = this;
        // FIXME: return node.
        //while(root.parent && root.parent.parent){
        //    root = root.parent.parent;
            //          |         +-- Tree<ul>.
            //          +-- Node<li>.
        //}
        while(!!root.parent){
            root = root.parent;
        }
        return root;
    };
    Tree.prototype.expand = function(){
        // hacks for IE6.
        this._elem.style.display = "block";
        this.expanded = true;
    };
    Tree.prototype.fold = function(){
        // hacks for IE6.
        this._elem.style.display = "none";
        this.expanded = false;
    };
    Tree.prototype.toggle = function(){
        if(this.expanded){
            this.fold();
        }else{
            this.expand();
        }
    };
    Tree.prototype.valueOf = function(){
        if(0 == this.nodes.length){
            return document.createTextNode("");
        }
        var tree = document.createElement("ul");
        for(var i=0,l=this.nodes.length; i<l; i++){
            tree.appendChild(this.nodes[i].valueOf());
        }
        this._elem = tree;
        return tree;
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
        if(0 < this.nodes.length){
            this.nodes[this.nodes.length-1].isLast = false;
        }
        node.isLast = true;
        node.parent = this;
        this.nodes.push(node);
    };
    Tree.prototype.remove = function(node){};
    Tree.prototype.filter = function(){
    };

    // ROOT Tree.
    var Root = function(){
        this.focusedNodes = [];
    };
    Root.prototype = new Tree();
    Root.prototype.constructor = Root;
    /**
     * Add focused node to tree cache.
     * @param {Node} node, target node.
     */
    Root.prototype.addFocusNode = function(node){
        for(var i=0,l=this.focusedNodes.length; i<l; i++){
            if(node == this.focusedNodes[i]){
                return;
            }
        }
        this.focusedNodes.push(node);
    };
    /**
     * Remove focused node from tree cache.
     * @param {Node} node, target node.
     */
    Root.prototype.removeFocusNode = function(node){
        for(var i=0,l=this.focusedNodes.length; i<l; i++){
            if(node == this.focusedNodes[i]){
                this.focusedNodes.splice(i, 1);
                return;
            }
        }
    };
    Root.prototype.blurAll = function(){
        var l=this.focusedNodes.length
        for(var i=0; i<l; i++){
            this.focusedNodes[i].blur();
        }
        this.focusedNodes.splice(0, l);
    };

    // TODO:
    function parseArray(arr, rootId, handler){
        rootId = rootId || 0;
        var cache={};
        for(var i=0,pid,l=arr.length; i<l; i++){
            pid = arr[i].pid;
            if(!cache[pid]){ cache[pid] = []; }
            cache[pid].push(arr[i]);
        }

        var root = new Root();
        var node = cache[rootId];

        /*
         * 递归深度遍历并构建 DOM 结构。
         * @param {Array} items children list data.
         * @param {HTMLElement} tree parent html node reference.
         */
        function deep(items, tree){
            if(!items || items.length<1){return;}
            for(var i=0,node,insExpandBar,achor,insNodeType,l=items.length; i<l; i++){
                node = new Node();
                node.text = items[i].text;
                node.uri = items[i].url || "javascript:void(0);";
                tree.add(node);

                if(cache[items[i].id] && cache[items[i].id].length>0){
                    var subtree = new Tree();
                    node.addChild(subtree);
                    deep(cache[items[i].id], subtree);
                }
            }
        }
        deep(cache[rootId], root);
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
    /**
     * TODO:
     * datas 和 dom 参数最好只有其中一个属性。
     *  options:{
     *      datas:[],
     *      dom:document.getElementById("tree"),
     *      lazyload:true,
     *      datasrc:"datas.json"
     *  }
     */
    function Smartree(options){
        if(arguments[0] instanceof Array){
            return parseArray(arguments[0], arguments[1]);
        }else{
            return parseDOM(arguments[0]);
        }
    }
    return Smartree;
})();
