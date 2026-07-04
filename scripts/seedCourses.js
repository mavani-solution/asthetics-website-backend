const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Course = require('../src/models/Course');

const seedCourses = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aesthetic_india';
        console.log(`Connecting to MongoDB at: ${mongoUri}`);
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected successfully.');

        const dataPath = path.join(__dirname, '../data/CourseData.json');
        if (!fs.existsSync(dataPath)) {
            console.error(`Error: CourseData.json file not found at path: ${dataPath}`);
            process.exit(1);
        }

        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        const coursesData = JSON.parse(fileContent);

        console.log('Clearing existing courses from database...');
        const deleteResult = await Course.deleteMany();
        console.log(`Deleted ${deleteResult.deletedCount} existing courses.`);

        console.log(`Inserting ${coursesData.length} courses...`);
        const insertedCourses = await Course.insertMany(coursesData);
        console.log(`Successfully seeded ${insertedCourses.length} courses into the database.`);

        mongoose.connection.close();
        console.log('Database connection closed. Seeding process complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding courses:', error);
        process.exit(1);
    }
};

seedCourses();
