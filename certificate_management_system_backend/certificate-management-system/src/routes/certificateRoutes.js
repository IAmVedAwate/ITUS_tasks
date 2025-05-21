const express = require('express');
const { addCertificate, getCertificateById } = require('../controllers/certificateController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, addCertificate);
router.get('/:id', authMiddleware, getCertificateById);

module.exports = router;