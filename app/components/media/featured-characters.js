import Component from 'ember-component';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';
import { capitalize } from 'ember-string';
import { isPresent } from 'ember-utils';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: 'section',
  classNames: ['media--main-characters'],
  ajax: service(),
  store: service(),

  getCharacters: task(function* (mediaType, mediaId) {
    let language;
    if (mediaType === 'anime') {
      const languages = yield get(this, 'ajax').request(`/anime/${mediaId}/_languages`);
      if (isPresent(languages)) {
        language = languages.find(item => item === 'Japanese') || get(languages, 'firstObject');
      }
    }
    return yield get(this, 'store').query('casting', {
      filter: Object.assign({
        media_id: mediaId,
        media_type: capitalize(mediaType),
        is_character: true
      }, { language }),
      include: 'character',
      sort: '-featured',
      page: { limit: 4 }
    });
  }).restartable(),

  didReceiveAttrs() {
    const type = get(this, 'media.modelType');
    const id = get(this, 'media.id');
    const taskInstance = get(this, 'getCharacters').perform(type, id);
    set(this, 'taskInstance', taskInstance);
  },
});
