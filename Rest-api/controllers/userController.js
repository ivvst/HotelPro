const { userModel } = require('../models');

function getAllUsers(req, res, next) {
  userModel.find({}, { password: 0, __v: 0 })

    .then(users => res.status(200).json(users))
    .catch(next);
  console.log(req.user);

}

function getUserById(req, res, next) {
  const { id } = req.params;

  userModel.findById(id, { password: 0, __v: 0 })
    .then(user => {
      if (!user) return res.status(404).json({ message: 'User not found' });
      // console.log('🟡 DEBUG user:', user); // виж дали има `role`
      res.status(200).json(user);
    })
    .catch(next);
}

function updateUserById(req, res, next) {
  const { id } = req.params;
  const { username, email, role } = req.body;

  console.log('🛠 Получено от клиента в updateUserById:', req.body);

  userModel.findByIdAndUpdate(
    id,
    { username, email, role },
    { new: true, runValidators: true }
  )
    .then(updatedUser => {
      console.log('🔄 Updated user:', updatedUser); // <== добави това!
      res.status(200).json(updatedUser);
    })
    .catch(next);
}


module.exports = {
  getAllUsers,
  getUserById,
  updateUserById,
};
