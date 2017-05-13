import {inject, Container} from 'aurelia-framework';
import {CurrentWorkflow} from './current-workflow';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Session} from './session';

@inject(Session, Container, EventAggregator)
export class App {

  constructor(session, container, ea) {
    this.session = session;
    this.container = container;
    ea.subscribe('workflowChanged', () => this.session.update(this.container.get(CurrentWorkflow)));
  }

  activate() {
    return this.session.restore()
    .then(json => {
      this.container.registerInstance(CurrentWorkflow, Object.assign(new CurrentWorkflow(), json));
    });
  }

  graphClicked() {
    this.selectedActivity = null;
    this.editorX = 0;
    this.editorY = 0;
  }

  activityClicked(evt) {
    let cell = evt.properties.cell;

    this.selectedActivity = null;
    this.editorX = 0;
    this.editorY = 0;

    if (cell && cell.__meta__) {
      this.selectedActivity = cell.__meta__.activity;

      let geometry = cell.geometry;
      let offset = 25;
      this.editorX = geometry.x + offset;
      this.editorY = geometry.y + offset;
    }
  }
}
