const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')

router.post('/signup', (req, res, next) => {

    if(validator.isEmail(req.body.email)) {
        User.find({
            email: req.body.email
        })
        .then(user => {
            if (user.length >= 1) {
                res.status(409).json({
                    message: 'Mail id taken'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) res.status(500).json(err)
                    else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            email: req.body.email,
                            password: hash
                        })
                        user.save()
                            .then(user => {
                                console.log(user)
                                res.status(201).json({
                                    message: 'User created'
                                })
                            })
                            .catch(err => res.status(500).json(err))
                    }
                })
            }
        })
    } else {
        res.status(500).json({message:'Invalid Email'})
    }
    
})

router.post('/login', (req, res, next) => {
    console.log(req.body.email)
    User.findOne({email: req.body.email})
    .then(user => {
        console.log(user)
        if(user.length < 1) {
            return res.status(401).json({
                message: 'Auth failed'
            })
        } else {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if(err) {
                    res.status(401).json({
                        message: 'Auth failed'
                    })
                } 
                if(result) {
                   const token =  jwt.sign({
                        email: user.email,
                        userId: user._id
                    }, "jwtkey", {expiresIn: "2h"})
                    res.status(200).json({
                        message: 'Auth Success',
                        toekn: token
                    })
                } else {
                    res.status(500).json({
                        message: 'Auth Failed'
                    })
                }
            })
        }
    })
    .catch(err => res.status(500).json(err))
})

router.delete(':/userId', (req, res) => {
    User.remove({_id: req.params.userId})
    .then(result => {
        res.status(200).json({message: 'User deleted'})
    })
    .catch(err => res.status(500).json(err))
})


module.exports = router