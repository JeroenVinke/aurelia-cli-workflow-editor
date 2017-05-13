import {DialogController} from 'aurelia-dialog';

export class JSONExport {
  static inject = [DialogController];

  constructor(controller) {
    this.controller = controller;
  }

  activate(json) {
    this.json = JSON.stringify(json, null, 2);
  }

  ok() {
    return this.controller.ok();
  }
}
