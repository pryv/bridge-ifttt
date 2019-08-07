const config = require('../src/utils/config');
const domain = config.get('pryv:domain');

module.exports = {
  userAccess: {
    // old user
    username: 'ifttttest',
    pryvToken: 'cjxokdnpq00081ftuoz1gvyv3',
    oauthToken: 'OI2O98AHF9A',
    name: 'ifttttest',
    url: makeUrl('ifttttest', domain),
    id: 'ifttttest'
  },
  endpointAccess: {
    // new user
    username: 'ifttttest2',
    urlEndpoint: makeUrl('ifttttest2', domain),
    pryvToken: 'cjy8nr1xd00153xtul5acmfhh',
    oauthToken: 'OI2O98AHF9B',
    name: makeUrl('ifttttest2', domain),
    url: makeUrl('ifttttest2', domain),
    id: makeUrl('ifttttest2', domain)
  },
  streamId: 'diary'
};

function makeUrl(username, domain) {
  return 'https://' + username + '.' + domain;
}