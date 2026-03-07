const { response } = require('express');
const HospitalService = require('../services/Hospital-service');

const captainService = new HospitalService();

const create = async (req, res) => {
    try {
        //console.log("hello");
        //console.log(req.body.email)
        //console.log(req.body.password)
        const response = await captainService.create({
            email: req.body.email,
            password: req.body.password,
            address: req.body.address,
            hospitalCode: req.body.hospitalCode,
            isVerified: req.body.isVerified,
            name: req.body.name
        });
        //console.log(response);
        return res.status(201).json({
            success: true,
            message: 'Successfully created a new user',
            data: response,
            err: {}
        });
    } catch (error) {
         //console.log(req.body.email);
         //console.log(req.body.password);
        return res.status(500).json({
            message: error.message,
            data: {},
            success: false,
            err: error.explanation
        });
    }
}

const signIn = async (req, res) => {
    try {
        const response = await captainService.signIn(req.body.email, req.body.password);
        return res.status(200).json({
            success: true,
            data: response,
            err: {},
            message: 'Successfully signed in'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Something went wrong',
            data: {},
            success: false,
            err: error
        });
    }
}

const isAuthenticated = async (req, res) => {
    try {
        const token = req.headers['x-access-token'];
        const response = await captainService.isAuthenticated(token);
        return res.status(200).json({
            success: true,
            err: {},
            data: response,
            message: 'user is authenticated and token is valid'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Something went wrong',
            data: {},
            success: false,
            err: error
        });
    }
}



module.exports = {
    create,
    signIn,
    isAuthenticated,
}