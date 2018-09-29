import * as dom from './dom';
import {parseOptions} from "./utils";

export default class Component {

  constructor(element, options) {
    this.element = element;
    this.element['__component__'] = this;
    this.options = {...options, ...parseOptions(this.element)};
  }

  // DOM
  el(s) {
    return dom.el(s, this.element);
  }

  els(s) {
    return dom.els(s, this.element);
  }

  // Lifecycle hooks
  init() {
  }

  destroy() {
  }

}

export const getComponentFromElement = (element) => dom.getEl(element)['__component__'];

export const createInstance = (element, componentName, component, options) => {
  component.prototype._name = componentName;
  return new component(element, options);
};

export const destroyInstance = (element) => {
  const instance = getComponentFromElement(element);
  if (instance) {
    instance.destroy();
    element['__component__'] = null;
  }
};

//--------------------------------------------------------------
//	Components API
//--------------------------------------------------------------

export const loadComponents = (components = {}, context = dom.html) => {

  if (!Array.isArray(context['__components__'])) {
    context['__components__'] = [];
  }

  dom.els('[data-component]', context).forEach((element) => {
    const instance = getComponentFromElement(element);

    if (instance) {
      return true;
    }

    const componentName = element.getAttribute('data-component');
    if (typeof components[componentName] === 'function') {
      context['__components__'].push(createInstance(element, componentName, components[componentName]));
    } else {
      console.warn(`Constructor for component "${componentName}" not found.`);
    }
  });

  context['__components__'].forEach(component => component.init());
};

export const removeComponents = (context = dom.html) => {
  dom.els('[data-component]', context).forEach(element => destroyInstance(element));
  Array.isArray(context['__components__']) && (context['__components__'].length = 0);
};
