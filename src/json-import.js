import {DialogController} from 'aurelia-dialog';

export class JSONImport {
  static inject = [DialogController];

  constructor(controller) {
    this.controller = controller;
  }

  ok() {
    return this.controller.ok(JSON.parse(this.json));
  }
}
