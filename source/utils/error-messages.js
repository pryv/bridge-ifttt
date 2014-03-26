
exports.sendAuthentificationRequired = function (res) {
  console.error('Error -- Authentification required');
  return res.send('Authentification required', 401);
};

exports.sendInvalidToken = function (res) {
  console.error('Error -- Invalid token');
  return res.send('Invalid token', 401);
};

exports.sendInternalError = function (res, message) {
  console.error('Error -- Internal Error:' + message);
  return res.send('Internal Error:' + message, 500);
};

exports.sendContentError = function (res, message) {
  console.error('Error -- sendContentError:', message);
  var response = { errors: [ {message: message} ] };
  return res.json(response, 400);
};