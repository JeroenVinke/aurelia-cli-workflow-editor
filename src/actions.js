import {inject, bindable} from 'aurelia-framework';
import {CurrentWorkflow} from './current-workflow';
import {DialogService} from 'aurelia-dialog';
import {JSONExport} from './json-export';
import {Validator} from './validator';
import {Session} from './session';

@inject(DialogService, CurrentWorkflow, Validator, Session)
export class Actions {
  @bindable addActivity;

  constructor(dialogService, currentWorkflow, validator, session) {
    this.currentWorkflow = currentWorkflow;
    this.dialogService = dialogService;
    this.validator = validator;
    this.session = session;
  }

  validate() {
    this.validator.validate();
  }

  export() {
    return this.dialogService.open({ viewModel: JSONExport, lock: false, model: this.currentWorkflow });
  }

  help() {
    alert('Double click on activity to edit. Delete selected activities and connections with the delete key');
  }

  reset() {
    if (!confirm('Are you sure? Everything will be lost')) {
      return false;
    }

    this.session.clear();

    document.location = document.location;
  }
}
