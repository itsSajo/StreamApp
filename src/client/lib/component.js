import $ from 'jquery';

import { Observable } from 'rxjs';

// overloading subscribe function with compoent and passed args
// after subing it wil push to detach handler
Observable.prototype.compSub = function(component, ...args) {
  let subscription = this.safeSubscribe(...args);
  component._onDetachHandlers.push(() => subscription.unsubscribe());
  return subscription;
};

export class ComponentBase {

  attach($mount) {
    this._$mount = $mount;
    this._onDetachHandlers = [];
    this.children = [];
    this._onAttach();
  }

  // list of handlers whom whill be called when component detach
  // and all of his children
  detach() {
    this._onDetach();

    for(let handler of this._onDetachHandlers)
      handler();

    for(let child of this.children)
      child.detach();

    this._onDetachHandlers = [];
    this.children = [];
  }

  _onAttach() {

  }

  _onDetach() {

  }
}

export class ElementComponent extends ComponentBase {

  get $element() { return this._$element; }

  constructor(elementType = "div") {
    super();
    this._$element = $(`<${elementType}>`).data("component", this);
  }

  // init props and onattach method and mounting DOM to section
  attach($mount) {
    super.attach($mount);
    this.$element.appendTo(this._$mount);
  }

  detach() {
    super.detach();
    this.$element.remove();
  }

  _setClass(className, isOn) {
    if (isOn)
      this._$element.addClass(className);
    else
      this._$element.removeClass(className);
  }

}
