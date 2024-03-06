// models/DNSRecord.js
const mongoose = require('mongoose');

const dnsRecordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  ttl: {
    type: Number,
    required: true,
  },
  
});

module.exports = mongoose.model('DNSRecord', dnsRecordSchema);
