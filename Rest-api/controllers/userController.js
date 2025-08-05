const { userModel } = require('../models');

function getAllUsers(req, res, next) {
  userModel.find({}, { password: 0, __v: 0 })

    .then(users => res.status(200).json(users))
    .catch(next);
  console.log(req.user);

}

module.exports = {
  getAllUsers
};
