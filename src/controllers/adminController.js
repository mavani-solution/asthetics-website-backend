const Course = require('../models/Course');
const Registration = require('../models/Registration');
const ConferenceData = require('../models/ConferenceData');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private
const getAdminStats = async (req, res, next) => {
    try {
        const totalCourses = await Course.countDocuments();
        const totalRegistrations = await Registration.countDocuments();

        // Proxy for "Active Users" - Unique email registrations
        const activeUsersList = await Registration.distinct('email');
        const activeUsers = activeUsersList.length;

        // Date boundaries
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // --- Calculate Estimated Revenue ---
        const allRegistrations = await Registration.find().populate('courseId');
        let totalRevenueVal = 0;
        let thisMonthRevenueVal = 0;
        let lastMonthRevenueVal = 0;

        allRegistrations.forEach(reg => {
            if (reg.courseId && reg.courseId.fee) {
                const numericFee = parseFloat(reg.courseId.fee.replace(/[^\d.]/g, '')) || 0;
                totalRevenueVal += numericFee;
                
                if (reg.createdAt >= startOfThisMonth) {
                    thisMonthRevenueVal += numericFee;
                } else if (reg.createdAt >= startOfLastMonth && reg.createdAt <= endOfLastMonth) {
                    lastMonthRevenueVal += numericFee;
                }
            }
        });

        const estimatedRevenue = `₹${(totalRevenueVal / 1000).toFixed(1)}k`;
        const revenueGrowth = lastMonthRevenueVal === 0 ? '+100%' : 
            `${thisMonthRevenueVal >= lastMonthRevenueVal ? '+' : ''}${Math.round(((thisMonthRevenueVal - lastMonthRevenueVal) / lastMonthRevenueVal) * 100)}%`;

        // --- Calculate Growth Metrics ---
        // Courses Growth
        const thisMonthCourses = await Course.countDocuments({ createdAt: { $gte: startOfThisMonth } });
        const lastMonthCourses = await Course.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
        const coursesGrowth = lastMonthCourses === 0 ? `+${thisMonthCourses}` : 
            `${thisMonthCourses >= lastMonthCourses ? '+' : ''}${Math.round(((thisMonthCourses - lastMonthCourses) / lastMonthCourses) * 100)}%`;

        // Registrations Growth
        const thisMonthRegs = await Registration.countDocuments({ createdAt: { $gte: startOfThisMonth } });
        const lastMonthRegs = await Registration.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
        const registrationsGrowth = lastMonthRegs === 0 ? `+${thisMonthRegs}` : 
            `${thisMonthRegs >= lastMonthRegs ? '+' : ''}${Math.round(((thisMonthRegs - lastMonthRegs) / lastMonthRegs) * 100)}%`;

        // --- Calculate Last 6 Months Trends ---
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

            const mRegs = await Registration.countDocuments({ createdAt: { $gte: mStart, $lte: mEnd } });
            const mCourses = await Course.countDocuments({ createdAt: { $gte: mStart, $lte: mEnd } });
            
            monthlyData.push({
                month: monthNames[date.getMonth()],
                registrations: mRegs,
                courses: mCourses
            });
        }

        res.status(200).json({
            success: true,
            data: {
                totalCourses,
                totalRegistrations,
                activeUsers,
                estimatedRevenue,
                revenueGrowth,
                registrationsGrowth,
                coursesGrowth,
                monthlyData
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all registrations
// @route   GET /api/admin/registrations
// @access  Private
const getRegistrations = async (req, res, next) => {
    try {
        const registrations = await Registration.find().populate({
            path: 'courseId',
            select: 'title'
        }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminStats,
    getRegistrations
};
