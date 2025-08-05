console.log('LOADING CRUISES ROUTER!');
const router = require('express').Router();
const Cruise = require('../models/cruise');
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin').default; // и този ред, ако го нямаш

console.log('auth:', typeof auth);      // трябва да изпише "function"
console.log('isAdmin:', typeof isAdmin); // трябва да изпише "function"

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



router.post('/', auth, isAdmin, async (req, res) => {
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

router.patch('/:cruiseId/excursions/:excursionId/request-delete', async (req, res) => {
  console.log('What is the request');

  const { cruiseId, excursionId } = req.params;
  const cruise = await Cruise.findById(cruiseId);
  if (!cruise) return res.status(404).json({ error: 'Cruise not found' });

  const excursion = cruise.excursions.id(excursionId);
  if (!excursion) return res.status(404).json({ error: 'Excursion not found' });

  excursion.deleteRequested = true;
  await cruise.save();

  res.json({ message: 'Заявката е отбелязана. Очаква одобрение от администратор.' });
});

router.patch('/:cruiseId/excursions/:excursionId/reject-delete', auth, isAdmin, async (req, res) => {

  console.log('--- Заявка за reject-delete ---');
  console.log('req.user:', req.user);
  console.log('params:', req.params);
  console.log('headers:', req.headers);
  // Ако искаш виж и cookie:
  console.log('cookies:', req.cookies);

  const { cruiseId, excursionId } = req.params;
  const cruise = await Cruise.findById(cruiseId);
  if (!cruise) return res.status(404).json({ error: 'Cruise not found' });

  const excursion = cruise.excursions.id(excursionId);
  if (!excursion) return res.status(404).json({ error: 'Excursion not found' });

  excursion.deleteRequested = false;
  await cruise.save();

  res.json({ message: 'Заявката за изтриване е отказана.' });
});


module.exports = router;
