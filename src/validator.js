import {inject} from 'aurelia-framework';
import {CurrentWorkflow} from './current-workflow';
import * as toastr from 'toastr';

@inject(CurrentWorkflow)
export class Validator {
  constructor(currentWorkflow) {
    this.currentWorkflow = currentWorkflow;
  }

  validate() {
    let errors = this._validate();

    toastr.options = {
      positionClass: 'toast-top-left'
    };

    errors.length === 0 ? toastr.success('Valid') : toastr.error(`invalid<br>${errors.join('<br>')}`);
  }

  _validate() {
    let errors = [];
    let foundIds = [];

    for (let activity of this.currentWorkflow.activities) {
      if (foundIds.indexOf(activity.id) > -1) {
        errors.push(`Activity ${activity.id} exists more than once`);
      }
      foundIds.push(activity.id);

      let relatedActivities = this.currentWorkflow.getNextActivities(activity);
      let missingActivities = relatedActivities.filter(x => !this.currentWorkflow.activityExists(x));
      if (missingActivities.length > 0) {
        missingActivities.map(id => errors.push(`Activity ${activity.id} references id ${id} which doesn't exist`));
      }
    }

    return errors;
  }
}
