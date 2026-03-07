const { MedicineService }= require('../services/index');

const medicineService = new MedicineService();
const create= async (req,res)=>{
    try{
        const medicine= await medicineService.createMedicine({
            ...req.body,
            hospitalId: req.user
        });
        return res.status(201).json({
            data: medicine,
            success: true,
            err: {},
            message: 'Successfully created a medicine'
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            data:{},
            success:false,
            message:'Not able to create a medicine',
            err: error
        });
    }
}

const getAll = async (req,res)=>{
    try {
        const response = await medicineService.getAllMedicineData({
            ...req.query,
            hospitalId: req.user
        });
        return res.status(200).json({
            data:response,
            success:true,
            err: {},
            message:'Successfully fetched the medicines'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data:{},
            success:false,
            message:'Not able get medicines',
            err: error
        });
    }
}

const get = async (req,res)=>{
    try {
        const response = await flightService.getMedicine(req.params.id);
        return res.status(200).json({
            data:response,
            success:true,
            err: {},
            message:'Successfully fetched the medicine'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data:{},
            success:false,
            message:'Not able get medicine',
            err: error
        });
    }
}

const update = async (req, res) => {
    try {
        const response = await medicineService.updateMedicine(req.params.id, req.user, req.body);
        if (response[0] === 0) {
            return res.status(404).json({
                data: response,
                success: false,
                message: 'No medicine found or unauthorized',
                err: {}
            });
        }
        return res.status(200).json({
            data: response,
            success: true,
            err: {},
            message: 'Successfully updated the medicine'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data: {},
            success: false,
            message: 'Not able to update the medicine',
            err: error
        });
    }
}
const destroy = async (req,res)=>{
    try {
        const response = await medicineService.deleteMedicine(req.params.id, req.user);
        if (response === 0) {
            return res.status(404).json({
                data: response,
                success: false,
                message: 'No medicine found or unauthorized',
                err: {}
            });
        }
        return res.status(200).json({
            data: response,
            success:true,
            message: 'succesfully deleted the medicine',
            err: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data:{},
            success:false,
            message:'Not able to delete the medicine',
            err: error
        });
    }
}

module.exports ={
    create,
    getAll,
    get,
    update,
    destroy
}