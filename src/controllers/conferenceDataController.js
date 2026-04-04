const ConferenceData = require('../models/ConferenceData');
const path = require('path');
const fs = require('fs');

// @desc    Get conference data
// @route   GET /api/conference-data
// @access  Public
const getConferenceData = async (req, res) => {
    try {
        const data = await ConferenceData.findOne();
        if (!data) {
            return res.status(404).json({ success: false, message: 'Conference data not found' });
        }
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update conference data
// @route   PUT /api/conference-data
// @access  Private
const updateConferenceData = async (req, res) => {
    try {
        let data = await ConferenceData.findOne();
        
        if (data) {
            // Update existing document
            // We use findOneAndUpdate to replace all fields that are in req.body
            data = await ConferenceData.findOneAndUpdate({}, req.body, { 
                new: true, 
                runValidators: true,
                overwrite: true // Allows total replacement if needed, though req.body merge is fine too
            });
        } else {
            // Create new if none exists
            data = await ConferenceData.create(req.body);
        }
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Seed data from JSON file
// @route   POST /api/conference-data/seed
// @access  Private (Admin ideally)
const seedConferenceData = async (req, res) => {
    try {
        // Read data from JSON file
        const dataPath = path.join(__dirname, '../../data/Data.json');
        
        if (!fs.existsSync(dataPath)) {
            return res.status(404).json({ success: false, message: 'Data.json file not found' });
        }

        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        // Clear existing data
        await ConferenceData.deleteMany();

        // Create new document with JSON data
        const data = await ConferenceData.create(jsonData);

        res.status(201).json({ 
            success: true, 
            message: 'Conference data seeded successfully from Data.json',
            data 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new conference data
// @route   POST /api/conference-data
// @access  Private
const createConferenceData = async (req, res) => {
    try {
        // Option to clear old data if you only want 1 document at a time
        // await ConferenceData.deleteMany(); 
        
        const data = await ConferenceData.create(req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getConferenceData,
    updateConferenceData,
    seedConferenceData,
    createConferenceData
};
