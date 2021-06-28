const {
  author,
  dependencies,
  repository,
  userScripts,
} = require('../../../package.json');

module.exports = {
  name: '[WoD] Display Skill Rolls',
  namespace: 'com.dobydigital.userscripts.wod',
  version: userScripts['display-skill-rolls'].version,
  author: author,
  source: repository.url,
  icon: 'https://info.world-of-dungeons.net/wod/css/WOD.gif',
  match: ['*://*.world-of-dungeons.net/wod/spiel/hero/skills*'],
  require: [
    `https://ajax.googleapis.com/ajax/libs/jquery/${dependencies.jquery}/jquery.min.js`,
  ],
  grant: ['GM.xmlHttpRequest', 'GM.getValue', 'GM.setValue'],
  'run-at': 'document-end',
};
