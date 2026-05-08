const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, getTicketByCode, getAllTickets, updateTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

// Create a ticket
router.post('/', protect, createTicket);

// Get all tickets for logged-in user
router.get('/', protect, getMyTickets);

// Admin — Get all tickets
router.get('/admin/all', protect, getAllTickets);

// Get single ticket by code
router.get('/:ticketCode', protect, getTicketByCode);

// Update a ticket by code
router.put('/:ticketCode', protect, updateTicket);

module.exports = router;
