const Certificate = require('../models/certificate');
const authMiddleware = require('../middleware/authMiddleware');

exports.addCertificate = async (req, res) => {
    const { traineeName, traineeId, trainingType, trainerName, issueDate, batchNumber, remarks } = req.body;

    if (!traineeName || !trainingType || !trainerName || !issueDate) {
        return res.status(400).json({ message: 'Required fields are missing.' });
    }

    try {
        const newCertificate = new Certificate({
            traineeName,
            traineeId,
            trainingType,
            trainerName,
            issueDate,
            batchNumber,
            remarks
        });

        await newCertificate.save();
        res.status(201).json({ message: 'Certificate added successfully', certificate: newCertificate });
    } catch (error) {
        res.status(500).json({ message: 'Error adding certificate', error: error.message });
    }
};

exports.getCertificateById = async (req, res) => {
    const { id } = req.params;

    try {
        const certificate = await Certificate.findById(id);
        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }
        res.status(200).json(certificate);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving certificate', error: error.message });
    }
};