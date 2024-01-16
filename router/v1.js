const express = require("express");
const { createProduct, getAllProduct, updateProduct, deleteProduct } = require("../controller/product.controller");

const router = express.Router();

//product fetching api

router.post('/product/create', createProduct);
router.get('/product/get/all', getAllProduct);
router.put('/product/update', updateProduct);
router.delete('/product/delete/:productId', deleteProduct)

module.exports = router;
