export class CurrentWorkflow {
  getNextActivities(activity) {
    let activities = [];

    switch (activity.type) {
    case 'branch-switch':
      activities = activity.branches.map(x => x.nextActivity);
      break;
    default:
      activities = [activity.nextActivity, activity.restartActivity];
    }

    return activities.filter(x => !!x);
  }

  activityExists(id) {
    return !!this.activities.find(x => x.id === id);
  }

  getActivity(id) {
    return this.activities.find(x => x.id === id);
  }

  uniqueId() {
    return Math.max(...this.activities.map(x => x.id)) + 1;
  }
}
