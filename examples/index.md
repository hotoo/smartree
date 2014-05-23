
# 演示

----

<link rel="stylesheet" type="text/css" href="../smartree.css" media="all" />

<div>
  <form action="" method="get" accept-charset="utf-8">
    <label>节点数量：</label>
    <input type="text" name="tot" value="1024" />
    <label>每节点的子节点数量：</label>
    <input type="text" name="child" value="10" size="3" />
    <input type="submit" value="确定" />
  </form>
</div>
<div>
  <button type="button" id="btn-getpath">getPath()</button>
  <span id="debug"></span>
</div>
<div>
  <form id="formSearch" name="formSearch" action="javascript:void(0)" method="get" accept-charset="utf-8">
    <input type="text" name="key" value="" />
    <input type="submit" value="Search" />
  </form>
</div>
<div id="demo" class="smartree"></div>

<script>

seajs.use(["../smartree"], function(Smartree){

    function getQuery(name){
      var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if (r!=null) return unescape(r[2]); return null;
    }

    var tot = getQuery("tot");      tot = !tot || isNaN(tot) ? 1024 : tot;
    var cns = getQuery("child"); cns = !cns || isNaN(cns) ? 10 : cns;
    document.forms[0].tot.value = tot;
    document.forms[0].child.value = cns;

    var nodes = [];
    nodes[0] = {"pid":"0", "id":"1", "text":"Node 1"};
    nodes[1] = {"pid":"0", "id":"2", "text":"Node 2"};
    nodes[2] = {"pid":"0", "id":"3", "text":"Node 3"};
    nodes[3] = {"pid":"0", "id":"4", "text":"Node 4"};
    nodes[4] = {"pid":"0", "id":"5", "text":"Node 5"};
    nodes[5] = {"pid":"0", "id":"6", "text":"Node 6"};
    nodes[6] = {"pid":"0", "id":"7", "text":"Node 7"};
    nodes[7] = {"pid":"0", "id":"8", "text":"Node 8"};
    nodes[8] = {"pid":"0", "id":"9", "text":"Node 9"};
    nodes[9] = {"pid":"0", "id":"10", "text":"Node 10"};

    for (i=10; i<tot; i++){
        nodes[i] = {"pid":Math.floor(Math.random()*(tot/cns))+1, "id":i, "text":"Node "+i};
    }

    function $(id){
        return document.getElementById(id);
    }

    window.onload = function(){
        var tree = new Smartree({
            datas:nodes,
            root:0
        });
        document.getElementById("demo").appendChild(tree.valueOf());
        $("btn-getpath").onclick = function(){
            $("debug").innerHTML = tree.getFocusedPath().join("<br />");
        };

        //$("from-search").onsubmit = function(){
        document.forms["formSearch"].onsubmit = function(){
            tree.filter(this.key.value);
            return false;
        };
    };

});
</script>
