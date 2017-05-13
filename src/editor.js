import {bindable, inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {CurrentWorkflow} from './current-workflow';

@inject(EventAggregator, CurrentWorkflow)
export class Editor {
  @bindable selectedActivity;
  @bindable x;
  @bindable y;

  constructor(ea, currentWorkflow) {
    this.ea = ea;
    this.currentWorkflow = currentWorkflow;
  }

  selectedActivityChanged() {
    if (this.editor) {
      this.editor.destroy();
    }

    if (!this.selectedActivity) {
      return;
    }

    let schema = this.getSchema(this.selectedActivity.type);

    this.editor = new JSONEditor(this.editor_holder, {
      theme: 'bootstrap2',
      schema: schema,
      startval: this.selectedActivity
    });

    this.editor.on('change', (x) => {
      this.updateActivity(this.selectedActivity, this.editor.getValue());
      this.ea.publish('workflowChanged');
      return true;
    });

    setTimeout(() => {
      window.scrollTo(this.x, this.y);
    }, 10);
  }

  updateActivity(old, n) {
    let index = this.currentWorkflow.activities.findIndex(x => x.id === old.id);
    this.currentWorkflow.activities[index] = n;
  }

  removeActivity(activity) {
    let index = this.currentWorkflow.activities.findIndex(x => x === activity);
    this.currentWorkflow.activities.splice(index, 1);
  }

  getSchema(type) {
    let defaultProperties = {
      type: {
        type: 'string',
        readOnly: true,
        required: true,
        enum: ['state-assign', 'project-create', 'branch-switch', 'input-text', 'input-select', 'project-install']
      },
      id: {
        type: 'integer'
      }
    };

    let schema = require(`./schemas/${type}.json`);
    schema.properties = Object.assign(defaultProperties, schema.properties);

    return schema;
  }
}
