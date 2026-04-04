const mongoose = require('mongoose');

const conferenceDataSchema = new mongoose.Schema({
    conference: { type: mongoose.Schema.Types.Mixed },
    hero: { type: mongoose.Schema.Types.Mixed },
    stats: { type: mongoose.Schema.Types.Mixed },
    offerings: { type: Array },
    why_attend: { type: Array },
    reference_benefits: { type: Array },
    audience: { type: Array },
    event_2026: { type: mongoose.Schema.Types.Mixed },
    clinical_workshop_speakers: { type: Array },
    workshops: { type: Array },
    speakers: { type: Array },
    schedule_days: { type: Array },
    faq: { type: Array },
    social_proof: { type: mongoose.Schema.Types.Mixed },
    registration: { type: mongoose.Schema.Types.Mixed }
}, {
    timestamps: true,
    strict: false // Allows for future additions in json without schema changes
});

const ConferenceData = mongoose.model('ConferenceData', conferenceDataSchema);

module.exports = ConferenceData;
