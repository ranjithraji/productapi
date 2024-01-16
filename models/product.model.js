const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 200
    },
    price: {
        type: Number,
        required: true,
        min: 10,
        max: 2000
    },
    description: {
        type: String,
        required: true,
        min: 10,
        max: 2000
    },
    url: {
        type: String,
    },
    category: {
        type: String,
        required: true,
        enum: ['Fashion', 'Clothes', 'Shoes', 'Jwellary']
    },
    block: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

ProductSchema.plugin(mongoosePaginate);

ProductSchema.index({ '$**': 'text' });

module.exports = Product = mongoose.model('Product', ProductSchema);