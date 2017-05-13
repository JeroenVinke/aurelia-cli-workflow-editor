const sessionKey = 'workflowjson';

import {inject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import {JSONImport} from './json-import';

@inject(DialogService)
export class Session {

  constructor(dialogService) {
    this.dialogService = dialogService;
  }

  _has() {
    return !!localStorage.getItem(sessionKey);
  }

  _get() {
    return JSON.parse(localStorage.getItem(sessionKey));
  }

  update(json) {
    localStorage.setItem(sessionKey, JSON.stringify(json));
  }

  clear() {
    localStorage.removeItem(sessionKey);
  }

  restore() {
    if (this._has()) {
      return Promise.resolve(this._get());
    }

    return this.dialogService.open({ viewModel: JSONImport, lock: false }).whenClosed(response => {
      let json = response.output;

      this.update(json);

      return json;
    });
  }
}
