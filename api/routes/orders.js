const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Order = require('../models/order')
const Product = require('../models/product')

router.get('/', (req, res) => {
    Order.find().populate('product')
        .then(results => {
            res.status(200).json({
                message: 'Get Orders',
                count: results.length,
                orders: results.map(result => {
                    return {
                        _id: result._id,
                        product: result.product,
                        quantity: result.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + result._id
                        }
                    }
                }),

            })
        })
        .catch(err => res.status(500).json(err))
})

router.post('/', (req, res) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                res.status(500).json({
                    message: 'Product Not Found'
                })
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            })
            return order.save()
        })
        .then(result => {
            console.log(result)
            res.status(201).json({
                message: 'Order Stored',
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity,
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            })
        })
        .catch(err => res.status(500).json(err))
})


router.get('/:orderId', (req, res) => {
        Order.findById(req.params.orderId).populate('product')
            .then(order => {
                if(!order) {
                    return res.status(500).json({message: 'Order Not Found'})
                }

                res.status(200).json({
                    order: order,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + order._id
                    }
                })
            })
            .catch(err => res.status(500).json(err))
})

router.patch('/:orderId', (req, res) => {
    res.status(200).json({
        message: 'Patch Order'
    })
})

router.delete('/:orderId', (req, res) => {

    Order.remove(req.params.orderId)
    .then(result => {
        res.status(200).json({
            message: 'Order deleted'
        })
    })
    .catch(err => res.status(500).json(err))
})

module.exports = router