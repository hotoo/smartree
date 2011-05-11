/**
 * @overview
 * @required Smartree.js
 *
 * @author 闲耘™ (hotoo.cn[AT]gmail.com)
 * @version 2011/03/18
 */

/**
 * @param {HTMLElement} input forms input element.
 * @param {Object} treeOpt, the options for tree input.
 */
Smartree.Input = function(input, treeOpt){
    this._elem = input;
    this._valElem = null;
    this.datas = null;
    this._tree = null;
};
Smartree.Input.prototype.init = function(){
    // init input elements.
    this._elem.style.display = "none";
    this._valElem = document.createElement("input");
    this._valElem.setAttribute("type", "text");
    this._valElem.setAttribute("name", this._elem.getAttribute("name")+"_key");
    this._elem.parentNode.insertBefore(this._valElem, this._elem);
    // init tree.
    this._treePanel = document.createElement("div");
    this._tree = new Smartree({
        datas:datasource,
        root:root
    });
};
