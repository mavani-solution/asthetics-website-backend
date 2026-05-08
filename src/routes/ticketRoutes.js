const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, getTicketByCode, getAllTickets, updateTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

// Create a ticket (Public)
router.post('/', createTicket);

// Get all tickets for logged-in user (Public - Guest)
router.get('/', getMyTickets);

// Admin — Get all tickets
router.get('/admin/all', protect, getAllTickets);

// Get single ticket by code (Public)
router.get('/:ticketCode', getTicketByCode);

// Update a ticket by code (Public)
router.put('/:ticketCode', updateTicket);

module.exports = router;
