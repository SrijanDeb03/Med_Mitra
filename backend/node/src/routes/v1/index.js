const express =require('express');

const MedicineController = require('../../controllers/medicine-controller');
const HospitalController = require('../../controllers/hospital-controller');
const AnalyticsController = require('../../controllers/analytics-controller');


const { AuthMiddleware } = require('../../middlewares/index');

const router = express.Router();

router.post('/medicine', AuthMiddleware.validateIsAuthenticated, MedicineController.create);
router.delete('/medicine/:id', AuthMiddleware.validateIsAuthenticated, MedicineController.destroy);
router.get('/medicine/:id', AuthMiddleware.validateIsAuthenticated, MedicineController.get);
router.get('/medicine', AuthMiddleware.validateIsAuthenticated, MedicineController.getAll);
router.patch('/medicine/:id', AuthMiddleware.validateIsAuthenticated, MedicineController.update);

router.get('/analytics', AuthMiddleware.validateIsAuthenticated, AnalyticsController.getStats);

router.post(
    '/signup', 
    HospitalController.create
);
router.post(
    '/signin',
    HospitalController.signIn
);

router.get(
    '/isAuthenticated',
    HospitalController.isAuthenticated
);


module.exports = router;