const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    traineeName: { type: String, required: true },
    traineeId: { type: String },
    trainingType: { type: String, required: true },
    trainerName: { type: String, required: true },
    issueDate: { type: Date, required: true },
    batchNumber: { type: String },
    remarks: { type: String }
});

module.exports = mongoose.model('Certificate', certificateSchema);