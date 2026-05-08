const Ticket = require('../models/Ticket');
const UserProfile = require('../models/UserProfile');

// @desc    Create a new ticket booking
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
    try {
        const userId = 'guest';
        const {
            eventName,
            eventDate,
            eventVenue,
            eventImage,
            ticketType,
            quantity,
            pricePerTicket,
            merchantTxnNo
        } = req.body;

        // Validate required fields
        if (!eventName || !quantity || !pricePerTicket) {
            return res.status(400).json({
                success: false,
                message: 'Please provide: eventName, quantity, pricePerTicket'
            });
        }

        // Auto-fetch buyer details from User Profile
        const profile = await UserProfile.findOne({ userId });
        if (!profile) {
            return res.status(400).json({
                success: false,
                message: 'Please complete your profile first before booking a ticket.'
            });
        }

        const totalAmount = Number(quantity) * Number(pricePerTicket);

        const ticket = await Ticket.create({
            userId,
            eventName,
            eventDate: eventDate || '',
            eventVenue: eventVenue || '',
            eventImage: eventImage || '',
            ticketType: ticketType || 'standard',
            quantity: Number(quantity),
            pricePerTicket: Number(pricePerTicket),
            totalAmount,
            buyerName: `${profile.firstName} ${profile.lastName}`,
            buyerEmail: profile.email,
            buyerPhone: profile.phone,
            merchantTxnNo: merchantTxnNo || '',
            paymentStatus: 'Pending'
        });

        res.status(201).json({
            success: true,
            message: 'Ticket booked successfully',
            data: ticket
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all tickets for logged-in user
// @route   GET /api/tickets
// @access  Private
const getMyTickets = async (req, res) => {
    try {
        const userId = 'guest';
        const tickets = await Ticket.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single ticket by ticketCode
// @route   GET /api/tickets/:ticketCode
// @access  Private
const getTicketByCode = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            ticketCode: req.params.ticketCode,
            userId: 'guest'
        });

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all tickets (Admin only)
// @route   GET /api/tickets/admin/all
// @access  Private (Admin)
const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a ticket
// @route   PUT /api/tickets/:ticketCode
// @access  Private
const updateTicket = async (req, res) => {
    try {
        const userId = 'guest';
        const { ticketCode } = req.params;

        const {
            eventName,
            eventDate,
            eventVenue,
            eventImage,
            ticketType,
            quantity,
            pricePerTicket,
            paymentStatus,
            merchantTxnNo,
            status
        } = req.body;

        // Find ticket by code and make sure it belongs to this user
        const ticket = await Ticket.findOne({ ticketCode, userId });
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Build update object (only update fields that are provided)
        const updateData = {};
        if (eventName) updateData.eventName = eventName;
        if (eventDate) updateData.eventDate = eventDate;
        if (eventVenue) updateData.eventVenue = eventVenue;
        if (eventImage) updateData.eventImage = eventImage;
        if (ticketType) updateData.ticketType = ticketType;
        if (quantity) updateData.quantity = Number(quantity);
        if (pricePerTicket) updateData.pricePerTicket = Number(pricePerTicket);
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (merchantTxnNo) updateData.merchantTxnNo = merchantTxnNo;
        if (status) updateData.status = status;

        // Recalculate total if quantity or price changed
        const newQty = quantity ? Number(quantity) : ticket.quantity;
        const newPrice = pricePerTicket ? Number(pricePerTicket) : ticket.pricePerTicket;
        updateData.totalAmount = newQty * newPrice;

        const updatedTicket = await Ticket.findOneAndUpdate(
            { ticketCode, userId },
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Ticket updated successfully',
            data: updatedTicket
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createTicket, getMyTickets, getTicketByCode, getAllTickets, updateTicket };
