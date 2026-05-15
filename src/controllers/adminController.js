const Course = require('../models/Course');
const Inquiry = require('../models/Inquiry');
const ConferenceData = require('../models/ConferenceData');
const Payment = require('../models/Payment');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private
const getAdminStats = async (req, res, next) => {
    try {
        const totalCourses = await Course.countDocuments();
        const totalInquiries = await Inquiry.countDocuments();
        
        // Actual Payments stats
        const totalPayments = await Payment.countDocuments({ status: 'Success' });
        const successPayments = await Payment.find({ status: 'Success' });

        // Date boundaries
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // --- Calculate Actual Revenue from Payments ---
        let totalRevenueVal = 0;
        let thisMonthRevenueVal = 0;
        let lastMonthRevenueVal = 0;

        successPayments.forEach(pay => {
            totalRevenueVal += pay.amount || 0;
            
            if (pay.createdAt >= startOfThisMonth) {
                thisMonthRevenueVal += pay.amount || 0;
            } else if (pay.createdAt >= startOfLastMonth && pay.createdAt <= endOfLastMonth) {
                lastMonthRevenueVal += pay.amount || 0;
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

        // Inquiries Growth
        const thisMonthInqs = await Inquiry.countDocuments({ createdAt: { $gte: startOfThisMonth } });
        const lastMonthInqs = await Inquiry.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
        const inquiriesGrowth = lastMonthInqs === 0 ? `+${thisMonthInqs}` : 
            `${thisMonthInqs >= lastMonthInqs ? '+' : ''}${Math.round(((thisMonthInqs - lastMonthInqs) / lastMonthInqs) * 100)}%`;

        // --- Calculate Last 6 Months Trends ---
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

            const mInqs = await Inquiry.countDocuments({ createdAt: { $gte: mStart, $lte: mEnd } });
            const mCourses = await Course.countDocuments({ createdAt: { $gte: mStart, $lte: mEnd } });
            const mPayments = await Payment.countDocuments({ status: 'Success', createdAt: { $gte: mStart, $lte: mEnd } });
            
            monthlyData.push({
                month: monthNames[date.getMonth()],
                inquiries: mInqs,
                courses: mCourses,
                payments: mPayments
            });
        }

        res.status(200).json({
            success: true,
            data: {
                totalCourses,
                totalInquiries,
                totalPayments,
                estimatedRevenue,
                revenueGrowth,
                inquiriesGrowth,
                coursesGrowth,
                monthlyData
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all inquiries (alias for registrations in dashboard)
// @route   GET /api/admin/registrations
// @access  Private
const getRegistrations = async (req, res, next) => {
    try {
        const inquiries = await Inquiry.find().populate({
            path: 'courseInterest',
            select: 'title'
        }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: inquiries.length,
            data: inquiries
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminStats,
    getRegistrations
};
