import Route from 'ember-route';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import { task } from 'ember-concurrency';
import Pagination from 'client/mixins/pagination';

export default Route.extend(Pagination, {
  model() {
    return {
      taskInstance: get(this, 'findBlockedUsersTask').perform(),
      paginatedRecords: []
    };
  },

  findBlockedUsersTask: task(function* () {
    return yield get(this, 'store').query('block', { include: 'blocked' }).then((records) => {
      this.updatePageState(records);
      const controller = this.controllerFor(get(this, 'routeName'));
      set(controller, 'hasNextPage', this._hasNextPage());
      return records;
    });
  }),

  onPagination() {
    const controller = this.controllerFor(get(this, 'routeName'));
    set(controller, 'hasNextPage', this._hasNextPage());
    set(controller, 'isLoading', false);
    this._super(...arguments);
  },

  actions: {
    onPagination() {
      const controller = this.controllerFor(get(this, 'routeName'));
      set(controller, 'isLoading', true);
      this._super(...arguments);
    }
  }
});
