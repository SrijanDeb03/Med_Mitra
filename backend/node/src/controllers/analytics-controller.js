const { Medicine } = require('../models/index');
const { Op } = require('sequelize');

const getStats = async (req, res) => {
    try {
        const hospitalId = req.user;
        const totalMedicines = await Medicine.count({
            where: { hospitalId }
        });
        
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const expiringSoon = await Medicine.count({
            where: {
                hospitalId,
                expiry_date: {
                    [Op.lte]: thirtyDaysFromNow,
                    [Op.gt]: new Date()
                }
            }
        });
        
        const expired = await Medicine.count({
            where: {
                hospitalId,
                expiry_date: {
                    [Op.lte]: new Date()
                }
            }
        });

        const lowStock = await Medicine.count({
            where: {
                hospitalId,
                quantity: {
                    [Op.lt]: 10
                }
            }
        });

        // Data for Manufacturer chart
        const manufacturerData = await Medicine.findAll({
            where: { hospitalId },
            attributes: [
                'manufacturer',
                [Medicine.sequelize.fn('COUNT', Medicine.sequelize.col('id')), 'count']
            ],
            group: 'manufacturer',
            raw: true
        });

        return res.status(200).json({
            data: {
                totalMedicines,
                expiringSoon,
                expired,
                lowStock,
                manufacturerData
            },
            success: true,
            message: 'Successfully fetched analytics',
            err: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error
        });
    }
}

module.exports = {
    getStats
}
