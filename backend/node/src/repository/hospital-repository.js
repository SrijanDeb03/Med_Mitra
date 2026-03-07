const { Hospital } = require('../models/index');
const ValidationError = require('../utils/validation-error');

class HospitalRepository {

    async create(data) {
        try {
            const captain = await Hospital.create(data);
            return captain;
        } catch (error) {
            if(error.name == 'SequelizeValidationError') {
                throw new ValidationError(error);
            }
            console.log("Something went wrong on repository layer");
            throw error;
        }
    }

    async destroy(userId) {
        try {
            await Hospital.destroy({
                where: {
                    id: userId
                }
            });
            return true;
        } catch (error) {
            console.log("Something went wrong on repository layer");
            throw error;
        }
    }

    async getById(userId) {
        try {
            const user = await Hospital.findByPk(userId, {
                attributes: ['email', 'id','address','hospitalCode','isVerified'],
            });
            return user;
        } catch (error) {
            console.log("Something went wrong on repository layer");
            throw error;
        }
    }

    async getByEmail(userEmail) {
        try {
            const user = await Hospital.findOne({where: {
                email: userEmail
            }});
            return user;
        } catch (error) {
            console.log("Something went wrong on repository layer");
            throw error;
        }
    }

}

module.exports = HospitalRepository;