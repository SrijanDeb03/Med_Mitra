const HospitalService = require('../services/Hospital-service');
const hospitalService = new HospitalService();

const validateIsAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        if(!token) {
            return res.status(401).json({
                success: false,
                message: 'Token not provided',
                data: {},
                err: {message: 'Token not provided'}
            });
        }
        const response = await hospitalService.isAuthenticated(token);
        if(!response) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                data: {},
                err: {message: 'Invalid token'}
            });
        }
        req.user = response.id; // Attach hospital ID
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Auth failure',
            data: {},
            err: error
        });
    }
}

module.exports = {
    validateIsAuthenticated
}
