import * as _mxgraph from 'mxgraph';
import {bindable, inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DiagramGenerator} from './diagram-generator';
import {CurrentWorkflow} from './current-workflow';
import 'json-editor';

const {
  mxHierarchicalLayout,
  mxConstants,
  mxGraph,
  mxRubberband,
  mxEvent,
  mxKeyHandler,
  mxEdgeStyle
} = _mxgraph();

@inject(EventAggregator, CurrentWorkflow)
export class Diagram {
  @bindable onClick;
  @bindable onDblClick;

  constructor(ea, currentWorkflow) {
    this.ea = ea;
    this.changeSubscription = ea.subscribe('workflowChanged', () => this.recreate());
    this.currentWorkflow = currentWorkflow;
  }

  attached() {
    this.recreate();
  }

  detached() {
    this.changeSubscription();
  }

  recreate() {
    if (this.graph) {
      this.graph.destroy();
    }

    let container = this.container;

    // Creates the graph inside the given container
    this.graph = new mxGraph(container);

    mxConstants.HANDLE_FILLCOLOR = '#99ccff';
    mxConstants.HANDLE_STROKECOLOR = '#0088cf';
    mxConstants.VERTEX_SELECTION_COLOR = '#00a8ff';

    // Disables the built-in context menu
    mxEvent.disableContextMenu(container);

    this.diagramGenerator = new DiagramGenerator(this.currentWorkflow, this.graph);

    // Enables rubberband selection
    new mxRubberband(this.graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    let parent = this.graph.getDefaultParent();

    // Adds cells to the model in a single step
    this.graph.getModel().beginUpdate();
    try {
      this.diagramGenerator.generate(parent, this.graph);
    } finally {
      // auto organize cells
      let layout = new mxHierarchicalLayout(this.graph);
      // make sure activity 1 is at the top
      layout.roots = [this.diagramGenerator.getVertex(this.currentWorkflow.getActivity(1))];
      layout.execute(this.graph.getDefaultParent());

      this.center(this.graph);

      this.registerEventHandlersPreRender(this.graph);

      // Updates the display
      this.graph.getModel().endUpdate();

      this.registerEventHandlersPostRender(this.graph);
    }
  }

  center(graph) {
    for (let [idx, cell] of Object.entries(graph.model.cells)) {
      let geometry = cell.getGeometry();
      if (geometry) {
        geometry.translate(((window.innerWidth) / 2) - 150, 0);
      }
    }
  }

  addActivity() {
    this.currentWorkflow.activities.push({
      id: this.currentWorkflow.uniqueId(),
      type: 'input-text'
    });

    this.ea.publish('workflowChanged');
  }

  registerEventHandlersPreRender(model) {
    let keyHandler = new mxKeyHandler(this.graph);
    keyHandler.bindKey(46, (evt) => {
      this.graph.selectionModel.cells.forEach(cell => {
        if (cell.__meta__ && cell.__meta__.activity) {
          this.removeActivity(cell.__meta__.activity);
        } else {
          this.removeLink(cell.source.__meta__.activity, cell.target.__meta__.activity.id);
        }
      });
      this.ea.publish('workflowChanged');
    });
  }

  registerEventHandlersPostRender(model) {
    model.addListener(mxEvent.CLICK, (sender, evt) => this.onClick({ sender, evt }));
    model.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) => this.onDblClick({ sender, evt }));
    model.addListener(mxEvent.CHANGE, (sender, evt) => this.onChange(sender, evt));
    model.addListener(mxEvent.CELL_CONNECTED, (sender, evt) => this.onCellConnected(sender, evt));
  }

  removeLink(activity, id) {
    if (activity.nextActivity === id) {
      activity.nextActivity = null;
    }

    if (activity.type === 'branch-switch') {
      for (let branch of activity.branches) {
        if (branch.nextActivity === id) {
          branch.nextActivity = null;
        }
      }
    }

    if (activity.restartActivity === id) {
      activity.restartActivity = null;
    }
  }

  removeActivity(activityToRemove) {
    let index = this.currentWorkflow.activities.findIndex(x => x.id === activityToRemove.id);

    // set all nextActivities pointing to the activity that's about to get deleted to null
    for (let activity of this.currentWorkflow.activities) {
      this.removeLink(activity, activityToRemove.id);
    }

    this.currentWorkflow.activities.splice(index, 1);
  }

  onChange(sender, evt) {
    console.log(sender, evt);
  }

  onCellConnected(sender, evt) {
    let sourceActivity = evt.properties.edge.source.__meta__.activity;
    let previousActivity = evt.properties.previous.__meta__.activity;
    let newActivity = evt.properties.terminal.__meta__.activity;

    if (sourceActivity.type === 'branch-switch') {
      let branch = sourceActivity.branches.find(x => x.nextActivity === previousActivity.id);
      branch.nextActivity = newActivity.id;
    } else {
      sourceActivity.nextActivity = newActivity.id;
    }

    this.ea.publish('workflowChanged');
  }
}
