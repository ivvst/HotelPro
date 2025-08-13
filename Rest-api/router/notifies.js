const router = require('express').Router();
const Notify = require('../models/notify');

// GET — всички задачи + username чрез populate
router.get('/', async (req, res) => {
  const tasks = await Notify.find().populate('assignedTo', 'username role').lean();
  res.json(tasks.map(t => ({
    _id: t._id,
    text: t.text,
    assignedTo: t.assignedTo._id,
    username: t.assignedTo.username,
    role: t.assignedTo.role,
    done: t.done
  })));
});

// POST — създаване
router.post('/', async (req, res) => {
  const { text, assignedTo } = req.body;
  if (!text || !assignedTo) return res.status(400).json({ error: 'Missing text or assignedTo' });
  
  const created = await Notify.create({ text, assignedTo });
  res.status(201).json(created);
});

// PATCH — маркиране като изпълнена
router.patch('/:id/done', async (req, res) => {
  const { userId } = req.body;
  const task = await Notify.findOne({ _id: req.params.id, assignedTo: userId });
  if (!task) return res.status(404).json({ error: 'Task not found or not assigned to this user' });

  task.done = true;
  await task.save();
  res.json(task);
});

module.exports = router;
