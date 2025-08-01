const GuestModel = require('../models/guest');  // Импортиране на модела за гост
const CruiseModel = require('../models/cruise'); // Модел за круиз (ако имате такъв)

const createGuest = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            nationality,
            birthDate,
            stayFrom,
            stayTo,
            roomNumber,
            picture,
            cruiseId  // ID на круиза
        } = req.body;

        // Вземаме круиза по ID, за да се уверим, че съществува
        const cruise = await CruiseModel.findById(cruiseId);

        if (!cruise) {
            return res.status(400).json({ message: 'Круизът не съществува' });
        }

        // Създаваме нов гост с ID на круиза
        const newGuest = new GuestModel({
            firstName,
            lastName,
            email,
            nationality,
            birthDate,
            stayFrom,
            stayTo,
            roomNumber,
            picture,
            cruiseId  // Записваме само ID-то на круиза
        });

        await newGuest.save(); // Записваме госта в базата данни

        return res.status(201).json(newGuest);  // Връщаме създадения гост като отговор
    } catch (error) {
        console.error('Error creating guest:', error);
        return res.status(500).json({ message: 'Неуспешно създаване на гост' });
    }
};

module.exports = {
    createGuest,
};
