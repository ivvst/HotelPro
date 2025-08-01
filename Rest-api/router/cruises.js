const router = require('express').Router();
const Cruise = require('../models/cruise');

router.get('/', async (req, res) => {
  try {
    const cruises = await Cruise.find();
    res.json(cruises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const cruise = await Cruise.findById(req.params.id);
  // .populate('excursions');
  if (!cruise) return res.status(404).json({ error: 'Cruise not found' });
  res.json(cruise);
});



router.post('/', async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    const cruise = new Cruise({ name, startDate, endDate });
    await cruise.save();
    res.status(201).json(cruise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    const cruise = await Cruise.findByIdAndUpdate(
      req.params.id,
      { name, startDate, endDate },
      { new: true }
    );
    res.json(cruise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Excurion router
router.get('/:id/excursions', async (req, res) => {
  try {
    const cruise = await Cruise.findById(req.params.id);
    if (!cruise) return res.status(404).json({ error: 'Cruise not found' });
    res.json(cruise.excursions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/excursions', async (req, res) => {
  try {
    const cruise = await Cruise.findById(req.params.id);
    if (!cruise) return res.status(404).json({ error: 'Cruise not found' });

    cruise.excursions.push(req.body); // req.body трябва да има name, date, fromTime, toTime...
    await cruise.save();
    res.status(201).json(cruise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/excursions/:exId', async (req, res) => {
  try {
    const cruise = await Cruise.findById(req.params.id);
    if (!cruise) return res.status(404).json({ error: 'Cruise not found' });

    const excursion = cruise.excursions.id(req.params.exId);
    if (!excursion) return res.status(404).json({ error: 'Excursion not found' });

    // Обнови полетата:
    excursion.name = req.body.name ?? excursion.name;
    excursion.description = req.body.description ?? excursion.description;
    excursion.date = req.body.date ?? excursion.date;
    excursion.fromTime = req.body.fromTime ?? excursion.fromTime;
    excursion.toTime = req.body.toTime ?? excursion.toTime;

    await cruise.save();
    res.json(excursion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete('/:id/excursions/:exId', async (req, res) => {
  try {
    const cruise = await Cruise.findById(req.params.id);
    if (!cruise) return res.status(404).json({ error: 'Cruise not found' });

    cruise.excursions = cruise.excursions.filter(ex => ex._id.toString() !== req.params.exId);
    await cruise.save();
    res.json({ message: 'Excursion deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
