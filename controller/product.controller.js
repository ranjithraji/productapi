const { Product } = require('../models');
const { CONFIG } = require("../config/config");
const { isEmpty, ReE, firstLatterCap, ReS, isNull, to } = require("../service/until.services");
const HttpStatus = require('http-status');
const { ObjectId } = require('mongoose').Types;

module.exports.createProduct = async (req, res) => {

    let err, body = req.body;

    //product required fields validation

    let fields = ['name', 'price', 'category', 'description'];

    let inVaildField = await fields.filter(x => isNull(body[x]));

    if (!isEmpty(inVaildField)) return ReE(res, { message: `Please enter required fields ${inVaildField}` }, HttpStatus.BAD_REQUEST);

    let { name, price, category, description } = body;

    // product data validation

    if (String(name).trim().length < CONFIG.name.min || String(name).trim().length > CONFIG.name.max) return ReE(res, { message: `Please enter vaild product name within ${CONFIG.name.min} to ${CONFIG.name.max} characters!.` }, HttpStatus.BAD_REQUEST);

    if (isNaN(price)) return ReE(res, { message: "Please enter vaild product price detail!." }, HttpStatus.BAD_REQUEST);

    if (Number(price) < CONFIG.price.min || Number(price) > CONFIG.price.max) return ReE(res, { message: `Please enter vaild product price within ${CONFIG.price.min}to ${CONFIG.price.max} !.` }, HttpStatus.BAD_REQUEST);

    if (!CONFIG.category.includes(String(category))) return ReE(res, { message: "Please select vaild product category details!." }, HttpStatus.BAD_REQUEST);

    if (String(description).trim().length < CONFIG.description.min || String(description).trim().length > CONFIG.description.max) return ReE(res, { message: `Please enter vaild product description within ${CONFIG.description.min} to ${CONFIG.description.max} characters!.` }, HttpStatus.BAD_REQUEST);

    if (!isNull(body.url)) {
        if (!CONFIG.img_src.test(body.url)) return ReE(res, { message: "Please enter vaild product image url details!." }, HttpStatus.BAD_REQUEST);
    }

    // check the product was already created or not

    let checkProduct, productOption = {
        where: {
            active: true,
            name: firstLatterCap(name).trim()
        }
    };

    [err, checkProduct] = await to(Product.findOne(productOption.where));

    if (err) {
        return ReE(res, err, HttpStatus.BAD_REQUEST);
    }

    if (!isNull(checkProduct)) {
        return ReE(res, { message: "Please check the product name, as it already exists!." }, HttpStatus.BAD_REQUEST);
    }

    // model data  object

    const ProductData = new Product({
        name: firstLatterCap(name).trim(),
        price: Number(price),
        description: firstLatterCap(description).trim(),
        category: firstLatterCap(category).trim(),
        url: body.url ? String(body.url).trim() : '',
        active: true,
        block: false
    });

    let createProduct;

    //create product 

    [err, createProduct] = await to(ProductData.save());

    if (err) {
        return ReE(res, err, HttpStatus.BAD_REQUEST);
    }

    if (isNull(createProduct)) {
        return ReE(res, { message: "Something went wrong to create the product!." }, HttpStatus.BAD_REQUEST);
    }

    if (!isNull(createProduct)) {
        return ReS(res, { message: 'Product was created!.' }, HttpStatus.OK)
    }

}

module.exports.getAllProduct = async (req, res) => {
    const body = req.params;

    let page = req.query.page || 1
    let limit = parseInt(req.query.limit) || 10

    let optionProuct = {
        where: { active: true },
        option: {
            page: page,
            limit: limit,
            sort: {
                createdAt: 'desc',
            },
        }
    };

    if (!isNull(body.productId)) {

        if (!ObjectId.isValid(body.productId)) return ReE(res, { message: "Please enter vaild product details!." }, HttpStatus.BAD_REQUEST);

        optionProuct.where = { ...optionProuct.where, _id: body.productId };
    }

    if (!isNull(body.category)) {
        if (!CONFIG.category.includes(firstLatterCap(body.category))) return ReE(res, { message: "Please enter vaild product category details!." }, HttpStatus.BAD_REQUEST);

        optionProuct.where = { ...optionProuct.where, category: firstLatterCap(body.category) };
    }

    if (!isNull(body.minprice) || !isNull(body.maxprice)) {

        let price = { min: CONFIG.price.min, max: CONFIG.price.max };

        if (!isNull(body.minprice) && !isNaN(body.minprice)) {
            price.min = body.minprice;
        }

        if (!isNull(body.maxprice) && !isNaN(body.maxprice)) {
            price.max = body.maxprice;
        }

        optionProuct.where = { ...optionProuct.where, price: { $gte: price.min, $lte: price.max } };
    }

    let err, existingProducts;

    [err, existingProducts] = await to(Product.paginate(optionProuct.where, optionProuct.option));

    if (err) {
        return ReE(res, err, HttpStatus.BAD_GATEWAY);
    }

    if (isEmpty(existingProducts)) {
        return ReE(res, { message: "Product was empty!." }, HttpStatus.BAD_REQUEST);
    }

    if (!isEmpty(existingProducts)) {
        return ReS(res, { message: "Product was found!.", products: existingProducts.docs }, HttpStatus.OK);
    }

}

module.exports.updateProduct = async (req, res) => {

    let err, body = req.body;

    let fields = ['name', 'price', 'category', 'description', 'url'];

    let VaildFields = fields.filter(x => x == 'url' || !isNull(body[x]));

    if (isEmpty(VaildFields)) {
        return ReE(res, { message: `Please enter something to updated product!.` }, HttpStatus.BAD_REQUEST);
    }

    //check product

    let checkProduct, optionProuct = {
        where: { active: true }
    };

    if (isNull(body.productId)) {
        return ReE(res, { message: "Please select product detail!." }, HttpStatus.BAD_REQUEST);
    }

    if (!ObjectId.isValid(body.productId)) return ReE(res, { message: "Please enter vaild product details!." }, HttpStatus.BAD_REQUEST);

    optionProuct.where = { ...optionProuct.where, _id: body.productId };

    [err, checkProduct] = await to(Product.findOne(optionProuct.where));

    if (err) {
        return ReE(res, err, HttpStatus.BAD_GATEWAY);
    }

    if (isNull(checkProduct)) return ReE(res, { message: "Product detail was not found!." }, HttpStatus.BAD_REQUEST);


    // update validation

    let updatedData = {
        where: {
            _id: checkProduct._id,
            active: true
        },
        set: {

        }
    };

    let updatedField = await VaildFields.filter(x => body[x] != checkProduct[x]);

    if (isEmpty(updatedField)) {
        return ReE(res, { message: `Please edit something to updated product!.` }, HttpStatus.BAD_REQUEST);
    }

    //update fields validation

    if (updatedField.includes('name')) {

        if (firstLatterCap(body.name).trim() === checkProduct.name) return ReE(res, { message: "Please edit something to update product name!" }, HttpStatus.BAD_REQUEST);

        if (String(body.name).length < CONFIG.name.min && String(body.name).length > CONFIG.name.max) return ReE(res, { message: `Please enter vaild product name within ${CONFIG.name.min} to ${CONFIG.name.max} characters!.` }, HttpStatus.BAD_REQUEST);

        // check the product was already created or not

        let checkProductName, productOption = {
            where: {
                active: true,
                name: firstLatterCap(body.name).trim()
            }
        };

        [err, checkProductName] = await to(Product.findOne(productOption.where));

        if (err) {
            return ReE(res, err, HttpStatus.BAD_REQUEST);
        }

        if (!isNull(checkProductName)) {
            return ReE(res, { message: "Please check the product name, as it already exists!." }, HttpStatus.BAD_REQUEST);
        }

        updatedData.set = {
            ...updatedData.set,
            name: firstLatterCap(body.name).trim()
        }

    }

    if (updatedField.includes('description')) {

        if (firstLatterCap(body.description).trim() === checkProduct.description) return ReE(res, { message: "Please edit something to update product description!" }, HttpStatus.BAD_REQUEST);

        if (String(body.description).length < CONFIG.description.min && String(body.description).length > CONFIG.description.max) return ReE(res, { message: `Please enter vaild product description within ${CONFIG.description.min} to ${CONFIG.description.max} characters!.` }, HttpStatus.BAD_REQUEST);

        updatedData.set = {
            ...updatedData.set,
            description: firstLatterCap(body.description).trim()
        }
    }

    if (updatedField.includes('price')) {

        if (isNaN(price)) return ReE(res, { message: "Please enter vaild product price detail!." }, HttpStatus.BAD_REQUEST);

        if (Number(body.price) === checkProduct.price) return ReE(res, { message: "Please edit something to update product price!" }, HttpStatus.BAD_REQUEST);

        if (Number(price) < CONFIG.price.min && Number(price) > CONFIG.price.max) return ReE(res, { message: `Please enter vaild product price within ${CONFIG.price.min}to ${CONFIG.price.max} !.` }, HttpStatus.BAD_REQUEST);

        updatedData.set = {
            ...updatedData.set,
            price: Number(price)
        }
    }

    if (updatedField.includes('category')) {

        if (firstLatterCap(body.category).trim() === checkProduct.category) return ReE(res, { message: "Please edit something to update product category!" }, HttpStatus.BAD_REQUEST);

        if (!CONFIG.category.includes(String(category))) return ReE(res, { message: "Please select vaild product category details!." }, HttpStatus.BAD_REQUEST);

        updatedData.set = {
            ...updatedData.set,
            category: firstLatterCap(body.category).trim()
        }
    }
    console.log(checkProduct.url,"ss");
    if (updatedField.includes('url')) {

        if ((body.url === checkProduct.url) || (isNull(body.url) && isNull(checkProduct.url))) return ReE(res, { message: "Please edit something to update product category!" }, HttpStatus.BAD_REQUEST);

        if (!isNull(body.url) && !CONFIG.img_src.test(body.url)) return ReE(res, { message: "Please enter vaild product image url details!." }, HttpStatus.BAD_REQUEST);

        updatedData.set = {
            ...updatedData.set,
            url: body.url ? String(body.url).trim() : ''
        }

    }

    //update functionality

    let updateProduct;

    [err, updateProduct] = await to(Product.updateOne(updatedData.where, { $set: updatedData.set }));

    if (err) {
        return ReE(res, err, HttpStatus.BAD_REQUEST);
    }

    if (isNull(updateProduct.modifiedCount)) {
        return ReE(res, { message: "Something went wrong to update product details!." }, HttpStatus.BAD_REQUEST);
    }

    if (!isNull(updateProduct.modifiedCount)) {
        return ReS(res, { message: "Product updated!." }, HttpStatus.OK);
    }

}

module.exports.deleteProduct = async (req, res) => {
    let err, body = req.params;
    //check product

    let checkProduct, optionProuct = {
        where: { active: true },
    };

    if (isNull(body.productId)) {
        return ReE(res, { message: "Please select product detail!." }, HttpStatus.BAD_REQUEST);
    }

    if (!ObjectId.isValid(body.productId)) return ReE(res, { message: "Please enter vaild product details!." }, HttpStatus.BAD_REQUEST);

    optionProuct.where = { ...optionProuct.where, _id: body.productId };

    [err, checkProduct] = await to(Product.findOne(optionProuct.where));

    if (err) {
        return ReE(res, err, HttpStatus.BAD_GATEWAY);
    }

    if (isNull(checkProduct)) return ReE(res, { message: "Product detail was not found!." }, HttpStatus.BAD_REQUEST);


    // update validation

    let updatedData = {
        where: {
            _id: checkProduct._id,
            active: true
        },
        set: {
            active: false
        }
    };

    //update functionality

    let updateProduct;

    [err, updateProduct] = await to(Product.updateOne(updatedData.where, { $set: updatedData.set }));

    if (err) {
        return ReE(res, err, HttpStatus.BAD_REQUEST);
    }

    if (isNull(updateProduct.modifiedCount)) {
        return ReE(res, { message: "Something went wrong to delete product details!." }, HttpStatus.BAD_REQUEST);
    }

    if (!isNull(updateProduct.modifiedCount)) {
        return ReS(res, { message: "Product deleted!." }, HttpStatus.OK);
    }

}