const express = require('express')
const router = express.Router()
const multer = require('multer')
const auth = require('../middleware/auth')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        console.log('original nane', file.originalname)
        cb(null, new Date().toISOString() +  file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    console.log('file filter', file.mimetype)
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

const mongoose = require('mongoose')

const Product = require('../models/product')



router.get('/', (req, res) => {
    console.log('get')
    Product.find()
        .select('_id name price productImage')
        .then(products => {
            if (products.length > 0) {
                res.status(200).json({
                    message: 'Get Products',
                    count: products.length,
                    products: products.map(product => {
                        return {
                            name: product.name,
                            price: product.price,
                            productImage: product.productImage,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/products/' + product._id
                            }
                        }
                    })
                })
            } else {
                res.status(404).json({
                    message: 'No entries found'
                })
            }

        })
        .catch(err => {
            res.status(500).json({
                err: err
            })
        })

})

router.post('/', auth, upload.single('productImage'),  (req, res) => {

    console.log('file',req.file)

    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    })

    product.save().then(product => {
        console.log('product', product)
        res.status(200).json({
            message: 'Post Products',
            createdProduct: {
                name: product.name,
                price: product.price,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + product._id
                }
            }
        })
    }).catch(err => {
        console.log('err', err)
        res.status(500).json({
            err: err
        })
    })


})


router.get('/:productId', (req, res) => {
    Product.findById(req.params.productId)
        .then(product => {
            console.log('product', product)
            if (product) {
                res.status(200).json({
                    name: product.name,
                    price: product.price,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + product._id
                    }
                })
            } else res.status(400).json({
                message: 'No valid entry found'
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                err: err
            })
        })
})

router.patch('/:productId', auth, (req, res) => {

    const updateOps = {}

    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }

    Product.update({
            _id: req.params.productId
        }, {
            $set: updateOps
        })
        .then(result => {
            res.status(200).json({
                message: 'Updated Products',
                result: {
                    name: result.name,
                    price: result.price,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })


})

router.delete('/:productId', auth, (req, res) => {

    Product.remove({
            _id: req.params.productId
        })
        .then(result => {
            res.status(200).json({
                message: 'Delete Success',
                result: result
            })
        }).catch(err => {
            console.log(err), res.status(500).json({
                message: err
            })
        })


})

module.exports = router