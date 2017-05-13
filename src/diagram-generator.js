import {Edge} from './edge';

export class DiagramGenerator {
  constructor(currentWorkflow, graph) {
    this.currentWorkflow = currentWorkflow;
    this.graph = graph;
  }

  generate(parent, graph) {
    let activities = this.currentWorkflow.activities;

    for (let i = 0; i < activities.length; i++) {
      let activity = activities[i];

      let vertex = graph.insertVertex(parent, null, this.getTitle(activity), window.innerWidth / 2, i * 20, 120, 60, `shape=${this.getShape(activity)}, editable=0`);
      vertex.__meta__ = { activity };
    }

    for (let activity of activities) {
      for (let edge of this.getEdges(activity)) {
        this.renderEdge(parent, graph, edge);
      }
    }
  }

  getEdges(activity) {
    let edges = [];

    switch (activity.type) {
    case 'branch-switch':
      edges = activity.branches.map(x => {
        return new Edge(
          activity,
          this.currentWorkflow.getActivity(x.nextActivity),
          'nextActivity',
          x.case
        );
      });
      break;
    default:
      if (activity.nextActivity && this.currentWorkflow.activityExists(activity.nextActivity)) {
        edges.push(new Edge(activity, this.currentWorkflow.getActivity(activity.nextActivity), 'nextActivity'));
      }
      if (activity.restartActivity && this.currentWorkflow.activityExists(activity.restartActivity)) {
        edges.push(new Edge(activity, this.currentWorkflow.getActivity(activity.restartActivity), 'restartActivity'));
      }
    }

    return edges;
  }

  getShape(activity) {
    switch (activity.type) {
    case 'branch-switch':
      return 'rhombus';
    default:
      return 'rectangleshape';
    }
  }

  getTitle(activity) {
    switch (activity.type) {
    case 'branch-switch':
      return `${activity.id}\r\nbranch-switch\r\n${activity.stateProperty}`;
    case 'input-select':
      return `${activity.id}\r\ninput-select\r\nProperty: ${activity.stateProperty}`;
    case 'input-text':
      return `${activity.id}\r\ninput-text\r\nProperty: ${activity.stateProperty}`;
    default:
      return `${activity.id}\r\n${activity.type}`;
    }
  }

  renderEdge(parent, graph, edge) {
    graph.insertEdge(parent, null, edge.title, this.getVertex(edge.source), this.getVertex(edge.target));
  }

  getVertex(activity) {
    for (let [idx, cell] of Object.entries(this.graph.model.cells)) {
      if (cell.__meta__ && cell.__meta__.activity === activity) {
        return cell;
      }
    }
  }
}
