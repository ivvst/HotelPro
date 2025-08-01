const Platform = require('../models/platforms');

exports.create = async (req, res) => {
  try {
    const platform = await Platform.create(req.body);
    res.status(201).json(platform);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const platforms = await Platform.find();
    res.status(200).json(platforms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
