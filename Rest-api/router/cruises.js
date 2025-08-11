console.log('LOADING CRUISES ROUTER!');
const router = require('express').Router();
const Cruise = require('../models/cruise');
const Guest = require('../models/guest');
const auth = require('../middlewares/auth')
const isAdmin = require('../middlewares/isAdmin').default;

console.log('auth:', typeof auth);
console.log('isAdmin:', typeof isAdmin);

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
//Statistics for Exursions

router.get('/:cruiseId/excursions/stats', async (req, res) => {
  try {
    const { cruiseId } = req.params;
    const cruise = await Cruise.findById(cruiseId);
    if (!cruise) return res.status(404).json({ message: 'Cruise not found' });

    // броим колко гости имат дадената екскурзия
    const counts = await Guest.aggregate([
      { $match: { cruiseId: new mongoose.Types.ObjectId(cruiseId) } },
      { $unwind: '$excursions' },
      { $group: { _id: '$excursions._id', enrolled: { $sum: 1 } } }
    ]);

    const countMap = new Map();
    counts.forEach(c => countMap.set(String(c._id), c.enrolled));

    const stats = cruise.excursions.map(ex => {
      const exId = String(ex._id);
      const enrolled = countMap.get(exId) || 0;
      const cap = ex.capacity || 0;
      const waitCount = ex.waitlist?.length || 0;
      const remaining = cap > 0 ? Math.max(cap - enrolled, 0) : null;
      return {
        excursionId: exId,
        name: ex.name,
        date: ex.date,
        capacity: cap,
        enrolled,
        waitlist: waitCount,
        remaining
      };
    }).sort((a, b) => b.enrolled - a.enrolled);

    res.json(stats);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
//Add guest to waiting list if excursion list is full
// Add guest to excursion or waitlist if full
router.post('/:cruiseId/:excursionId/enroll/:guestId', async (req, res) => {
  try {
    const { cruiseId, excursionId, guestId } = req.params;

    const [cruise, guest] = await Promise.all([
      Cruise.findById(cruiseId),
      Guest.findById(guestId)
    ]);
    if (!cruise || !guest) return res.status(404).json({ message: 'Not found' });

    const ex = cruise.excursions.id(excursionId);
    if (!ex) return res.status(404).json({ message: 'Excursion not found' });

    const already = (guest.excursions || []).some(e => String(e._id) === String(excursionId));
    if (already) return res.status(200).json({ message: 'Guest already enrolled' });

    // реално записани
    const enrolledCount = await Guest.countDocuments({
      cruiseId,
      'excursions._id': ex._id
    });

    const cap = Number(ex.capacity || 0);
    if (cap > 0 && enrolledCount >= cap) {
      // Няма места → в чакащи (ако го няма)
      ex.waitlist = ex.waitlist || [];
      const inWait = ex.waitlist.some(w => String(w.guestId) === String(guestId));
      if (!inWait) {
        ex.waitlist.push({
          guestId,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email
        });
        await cruise.save();
      }
      return res.status(200).json({ message: 'Added to waitlist' });
    }

    // Има места → махаме от чакащите, ако присъства (важно!)
    if (Array.isArray(ex.waitlist) && ex.waitlist.length) {
      ex.waitlist = ex.waitlist.filter(w => String(w.guestId) !== String(guest._id)); // ← ТУК
      await cruise.save(); // ← ТУК
    }

    // Записваме в guest.excursions
    guest.excursions = guest.excursions || [];
    guest.excursions.push({ _id: excursionId, name: ex.name });
    await guest.save();

    res.json({ message: 'Enrolled', excursion: { _id: excursionId, name: ex.name } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update excursion capacity
router.patch('/:cruiseId/excursions/:excursionId/capacity', async (req, res) => {
  try {
    const { cruiseId, excursionId } = req.params;
    const { capacity } = req.body;

    const cruise = await Cruise.findById(cruiseId);
    if (!cruise) return res.status(404).json({ message: 'Cruise not found' });

    const ex = cruise.excursions.id(excursionId);
    if (!ex) return res.status(404).json({ message: 'Excursion not found' });

    ex.capacity = Math.max(Number(capacity) || 0, 0);
    await cruise.save();

    res.json({ message: 'Capacity updated', capacity: ex.capacity });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


//Edit Excursion
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
    const { id: cruiseId, exId } = req.params;

    // валидации
    if (!mongoose.isValidObjectId(cruiseId) || !mongoose.isValidObjectId(exId)) {
      return res.status(400).json({ error: 'Invalid cruiseId or exId' });
    }

    // намери круиза
    const cruise = await Cruise.findById(cruiseId);
    if (!cruise) return res.status(404).json({ error: 'Cruise not found' });

    // намери екскурзията като поддокумент
    const sub = cruise.excursions.id(exId);
    if (!sub) return res.status(404).json({ error: 'Excursion not found in this cruise' });

    // премахни екскурзията от круиза (вкл. waitlist вътре)
    sub.remove(); // еквивалентно на splice върху поддокумент
    await cruise.save();

    // изтрий екскурзията от всички гости на този КРУИЗ
    const result = await Guest.updateMany(
      { cruiseId: cruise._id, 'excursions._id': sub._id },
      { $pull: { excursions: { _id: sub._id } } }
    );

    return res.json({
      message: 'Excursion deleted from cruise and removed from all its guests',
      guestsUpdated: result.modifiedCount ?? result.nModified ?? 0
    });
  } catch (err) {
    console.error('Error deleting excursion:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
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
