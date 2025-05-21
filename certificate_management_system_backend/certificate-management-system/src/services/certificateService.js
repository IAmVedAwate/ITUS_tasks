const Certificate = require('../models/certificate');

const addCertificate = async (certificateData) => {
    const certificate = new Certificate(certificateData);
    return await certificate.save();
};

const getCertificateById = async (id) => {
    return await Certificate.findById(id);
};

module.exports = {
    addCertificate,
    getCertificateById,
};