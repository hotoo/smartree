
# Smartree

----

[![spm package](http://spmjs.io/badge/smartree)](http://spmjs.io/package/smartree)

Smart Tree 致力于实现一个简洁、轻量级、高效的树形控件。

## 使用说明

```js
var smartree = require("smartree");

var nodes = [
  {"pid":"0", "id":"1", "text":"Node 1"},
  {"pid":"0", "id":"2", "text":"Node 2"},
  {"pid":"1", "id":"3", "text":"SubNode 1.1"},
  {"pid":"3", "id":"4", "text":"SubNode 1.1.1"}
];

var tree = new smartree({
  datas: nodes,
  root: "0"
});
```

## API

### toString()

返回树的 HTML 字符串。

### valueOf()

返回树的 DOM 树，可以 appendChild 到 DOM 中。

### on(eventName, handler)

* String eventName.
* Function handler.

### off(eventName, handler)

* String eventName.
* Function handler. [optional]

## Events

### expand

```js
tree.on("expand", function(node){
  jQuery.get("/childnodes?pid="+node.id, function(childNodes){
    tree.appendChild(id, childNodes);
  });
});
```

### fold

## support

* IE6+, FF1+, Chrome1+, Safari3+, Opera8+
* checkbox
* Client & Server Filter support.
