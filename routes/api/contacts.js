const express = require('express')
const { listContacts, getContactById, addContact, removeContact, updateContact, updateStatusContact } = require('../../models/contacts');
const { verifyToken } = require('../../models/users');
const router = express.Router()

router.get('/', verifyToken, listContacts)

router.get("/:contactId", verifyToken, getContactById);

router.post('/', verifyToken, addContact)

router.delete("/:contactId", verifyToken, removeContact);

router.put('/:contactId', verifyToken, updateContact);

router.patch("/:contactId/favorite", verifyToken, updateStatusContact);

module.exports = router
