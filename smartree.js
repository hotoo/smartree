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
    /**
     * 封装的兼容多浏览器的XMLHttpRequest（注意大小写）对象。
     * 隐藏了各浏览器间异步&同步方式的差异性。
     * @usage
     *          AJAX.send("data.json","post","",function(st,re){
     *              // st: "ok"/"ing"/"err"
     *              // re: response, re.responseText
     *          });
     * @namespace org.xianyun.net;
     * @constructor XmlHttpRequest(a)
     * @param {Boolean} a 是否使用异步方式。false则为同步，否则异步。
     * @see 参考Robin Pan (htmlor@gmail.com)的同名类。
     * @since IE6.0, Firefox2.0, Opera9.0, Safari3.0, Netscape8.0
     * @version 2006/4/16, 2008/2/29
     * @author 闲耘 (mail@xianyun.org)
     */
    var Ajax = function(a){
        /**
         * @type {Boolean} 请求方式，true:异步/false:同步。
         */
        this.async = (a!=undefined?a:true);

        var d = true; // done?
        var r = null;
        if(window.XMLHttpRequest){
            r = new XMLHttpRequest();
            //如果服务器的响应没有XML mime-type header，
            //某些Mozilla浏览器可能无法正常工作。
            //所以需要XmlHttp.overrideMimeType('text/xml'); 来修改该header.
            if (r.overrideMimeType){
                r.overrideMimeType("text/xml");
            }
        } else if(window.ActiveXObject){ // 支持ActiveX的（ie）
            for (var i=Ajax.AXOI, l=Ajax.AXO.length; i<l; i++){
                try {
                    r = new ActiveXObject(Ajax.AXO[i]);
                    Ajax.AXOI = i; // 兼容性记忆体。
                    break;
                } catch(e){
                    r = null;
                }
            }
        }
        if (r===null) throw new NotSupportException("浏览器不支持XMLHttpRequest或类似对象。");

        /**
         * 发送请求。
         * @param {String} url 目标请求地址，可以是绝对/相对路径。
         * @param {String} method 发送请求的方式，"post"/"get"。默认为"get"方式。
         * @param {String} param 发送请求中带的参数。
         * @param {Function} callback 发送请求过程中的回调函数。
         */
        this.send = function(u, m, p, c){
            d = false;
            var isPost = /^post$/i.test(m);
            if(!isPost){
                u = u+"?"+p;
            }
            r.open(m, u, this.async); // 发送数据（异步）
            if(isPost){ // 提交方法为post时，发送信息头
                //r.setrequestheader("content-length",(new String(u)).length);
                r.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            }
            r.send(isPost?p:null);
            if (this.async) { // 同步方式不要设置回调。
                r.onreadystatechange = function(){ // 处理request的响应
                    if (r.readyState == 4) {// 响应完成后（状态4）
                        if (r.status == 200) { // 良好
                            c("ok", r);
                        } else { // 异常
                            c("ex", r);
                        }
                        d = true;
                    } else { // 响应未完成时（状态0/1/2/3）
                        c("ing", r);
                    }
                }
            }
            if ((!this.async)&& c instanceof Function){
                if (r.status===200) c("ok", r);
                else c("ex", r);
            }
        };

        /**
         * 取消未完成的异步请求。
         */
        this.abort = function(){
            if (!d){r.abort();}
            d=true;
        };

        /**
         * 判断当前XmlHttpRequest对象是否完成请求。
         * @return {Boolean} true，如果完成，否则返回false。
         */
        this.isDone=function(){
            return d;
        };
    }
    Ajax.AXO = [
    'MSXML3.XMLHTTP.5.0',
    'MSXML3.XMLHTTP.4.0',
    'MSXML3.XMLHTTP.3.0',
    'MSXML3.XMLHTTP.2.0',
    "Msxml3.XMLHTTP",
    "Msxml2.XMLHTTP.5.0",
    "Msxml2.XMLHTTP.4.0",
    "Msxml2.XMLHTTP.3.0",
    "Msxml2.XMLHTTP",
    "Microsoft.XMLHTTP"];
    Ajax.AXOI=0; // 兼容性记忆体。

    /**
     * XmlHttpRequest对象池，避免每次创建新的XmlHttpRequest对象。
     */
    var AJAX={
        pool:[],
        /**
         * @param {Boolean} a true则使用异步方式，false使用同步方式。默认为true。
         * @ignore
         */
        _instance:function(a){
            var p=AJAX.pool;
            if(a===undefined){a=true;}
            for(var i=0,l=p.length; i<l; i++){
                if(p[i].isDone()&&p[i].async===a){return p[i];}
            }
            return (p[p.length]=new Ajax(a));
        },
        send:function(u,m,p,c,a){
            AJAX._instance(a).send(u,m,p,c);
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
        this.id = "";
        this.text = "";                     // node link's display name.
        this.title = "";                    // link's title attribute.
        this.uri = "javascript:void(0);";   // link's href attribute.
        this.target = "_this";              // link's target attribute.
        this.handler = null;                // expand & fold bar.
        this.type = "folder";
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
        var a = this.root().datas_cache[this.id];
        return !!this.children || (a && a.length);
    };
    Node.prototype.hasNotChild = function(){
        E.remove(this._expandHandle, "click", this._toggle);
        this.children = null;
        D.removeClass(this._elem, "expand");
        D.removeClass(this._elem, "fold");
    };
    Node.prototype.addChild = function(node){
        if(!this.children){
            this.children = new Tree();
            this.children.id = this.id;
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
    Node.prototype.getPath = function(sep){
        if(!sep){sep = "/";}
        var path = "";
        var node = this;
        do{
            path = node.text + sep + path;
            node = node.parent.parent;
            //          |         +-- Tree<ul>.
            //          +-- Node<li>.
        }while(node);
        return path;
    };
    Node.prototype._mousedown = function(evt){
        evt = window.event || evt;
        E.stop(evt);
        return false;
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
    Node.prototype.valueOf = function(sync){
        var node = document.createElement("li");
        if(this.isLast){D.addClass(node, "last");}
        D.addClass(node, this.type);
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

        E.add(link, "mousedown", F.createDelegate(this, this._mousedown));
        E.add(link, "click", F.createDelegate(this, this._clickAchor));

        if(this.hasChild()){
            D.addClass(node, "fold");
            this._toggle = F.createDelegate(this, this.toggle);
            E.add(bar, "click", this._toggle);
            if(!this.children){
                this.addChild(new Tree());
            }
            node.appendChild(this.children.valueOf(sync));
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
    var Tree = function(){
        this.parent = null;
        this._elem = document.createElement("ul");
        this.nodes = [];
        this.expanded = false;
        this._inited = false;           // children nodes make dom finished.
        this.id;
    };
    Tree.prototype.root = function(){
        // TODO: simple?
        //return this.parent.root();

        var root = this;
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
        if(!this._inited){
            //TODO: sync for dom.
            var r = this.root();
            if(!r.lazyload){
                this._elem.appendChild(this.makeNodesDOM(
                    this.root().datas_cache[this.id]));
                this._inited = true;
                this.expanded = true;
            }else{
                var callback = F.createDelegate(this, function(state,json){
                    if("ing" == state){return;}
                    if(state == "ok"){
                        try{
                            var datas = window.eval(json.responseText);
                        }catch(ex){
                            throw new Error("json datas error from server.");
                        }
                        var d = r.lazyload.callback.call(this, datas);
						if(d && d instanceof Array){datas = d;}
                        if(0==datas.length){
                            this.parent.hasNotChild();
                        }else{
                            this._elem.appendChild(this.makeNodesDOM(datas));
                        }
                        this._inited = true;
                        this.expanded = true;
                    }else{
                        throw new Error("Error from server.")
                    }
                });
                AJAX.send(r.lazyload.url, r.lazyload.type, r.lazyload.data.replace("${ID}", this.parent.id),
                    callback, r.lazyload.async);
            }
        }else{
            this.expanded = true;
        }
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
    Tree.prototype.makeNodesDOM = function(datas){
        var frag = document.createDocumentFragment();
        for(var i=0,l=datas.length; i<l; i++){
            var node = new Node();
            node.id = datas[i].id;
            node.text = datas[i].text;
            node.uri = datas[i].url || "javascript:void(0);";
            node.type = datas[i].type || "folder";
            this.add(node);
            node.isLast = i==l-1;
            if(false!==datas[i].hasChild){
                node.addChild(new Tree());
            }
            frag.appendChild(node.valueOf(this.root().syncLoad));
        }
        //for(var i=0,l=this.nodes.length; i<l; i++){
            //frag.appendChild(this.nodes[i].valueOf(this.root().syncLoad));
        //}
        return frag;
    };
    Tree.prototype.valueOf = function(sync){
        if(0 == this.nodes.length){
            return document.createTextNode("");
        }
        if(sync){
            for(var i=0,l=this.nodes.length; i<l; i++){
                this._elem.appendChild(this.nodes[i].valueOf(sync));
            }
        }
        return this._elem;
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
        this.syncLoad = false;
        this.datas = null;
        this.datas_cache = null;
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
    Root.prototype.getFocusedNodes = function(){
        return this.focusedNodes;
    };
    Root.prototype.getFocusedPath = function(sep){
        var path = [];
        for(var i=0,l=this.focusedNodes.length; i<l; i++){
            path.push(this.focusedNodes[i].getPath(sep));
        }
        return path;
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
    /**
     * @param {Node,String} node, 节点或者节点ID。
     *
     */
    Root.prototype.focus = function(node){
    };
    Root.prototype.blurAll = function(){
        var l=this.focusedNodes.length
        for(var i=0; i<l; i++){
            this.focusedNodes[i].blur();
        }
        this.focusedNodes.splice(0, l);
    };
    Root.prototype.valueOf = function(){
        if(0 == this.nodes.length){
            return document.createTextNode("");
        }
        for(var i=0,l=this.nodes.length; i<l; i++){
            this._elem.appendChild(this.nodes[i].valueOf());
        }
        return this._elem;
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
        root.datas_cache = cache;
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
                node.id = items[i].id;
                node.text = items[i].text;
                node.uri = items[i].url || "javascript:void(0);";
                node.type = items[i].type || "folder";
                tree.add(node);

                if(items[i].hasChild || (cache[items[i].id] && cache[items[i].id].length>0)){
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
     *      root:0，
     *      lazyload:{
     *          url:"datas.json"
     *          async:true,
     *          type:"get",
     *          data:"id=${ID}&user=1",
     *          callback: function(dataJSON){}
     *      },
     *  }
     *  options:{
     *      dom:document.getElementById("tree"),
     *      lazyload:false,
     *  }
     */
    function Smartree(options){
        var opt = {
            datas:[],
            root:0,
            lazyload:false,
            dom:null
        };
        for(var k in options){
            if(options.hasOwnProperty(k)){
                opt[k] = options[k];
            }
        }
        if(options.hasOwnProperty("lazyload")){
            opt.lazyload = {
                url:"",
                async:true,
                type:"get",
                data:"id=${ID}",
                callback:function(datas){return datas;}
            };
            for(var k in options.lazyload){
                if(options.lazyload.hasOwnProperty(k)){
                    opt.lazyload[k] = options.lazyload[k];
                }
            }
        }

        var tree;
        if(opt.datas && (opt.datas instanceof Array)){
            tree = parseArray(opt.datas, opt.root);
            tree.lazyload = opt.lazyload;
        }else{
            // TODO: update this.
            tree = parseDOM(arguments[0]);
        }
        return tree;
    }
    return Smartree;
})();
