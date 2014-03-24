
exports.sendInvalidToken = function (res) {
  return res.send('Invalid token', 401);
};

exports.sendInternalError = function (res, message) {
  return res.send('Internal Error:' + message, 500);
};

exports.sendContentError = function (res, message) {
  var response = { errors: [ {message: message} ] };
  return res.json(response, 400);
};