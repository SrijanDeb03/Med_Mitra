const {  Medicine }=require('../models/index');
const {Op} = require('sequelize');

class MedicineRepository{
    #createFilter(data){
        let filter={};
        if(data.name){
            filter.name = data.name;
        }
        if(data.status){
            filter.status= data.status;
        }
        if(data.hospitalId) {
            filter.hospitalId = data.hospitalId;
        }
        return filter;
    }
    async createMedicine(data){
        try {
            const medicine=await Medicine.create(data);
            return medicine;
        } catch (error) {
            console.log("Something went wrong in the repository layer");
            throw {error};
        }
    }
    async deleteMedicine(medicineId, hospitalId){
        try {
            const response = await Medicine.destroy({
                where:{
                    id: medicineId,
                    hospitalId: hospitalId
                }
            });
            return response;
        }
        catch (error) {
            console.log("Something went wrong in the repository layer");
            throw {error};
        }
    }
    async getMedicine(medicineId){
        try {
            const medicine = await Medicine.findByPk(medicineId);
            return medicine;
        } catch (error) {
            console.log("Something went wrong in the repository layer");
            throw {error};
        }
    }

    async getAllMedicines(filter){
        try {
            const filterObject = this.#createFilter(filter);
            const medicines = await Medicine.findAll({
                where: filterObject
            });
            return medicines;
        } catch (error) {
            console.log("Something went wrong in the repository layer");
            throw {error};
        }
    }

    async updateMedicine(medicineId, hospitalId, data) {
        try {
           const response = await Medicine.update(data, {
               where: {
                   id: medicineId,
                   hospitalId: hospitalId
               }
           });
           return response;
       }
 catch (error) {
           console.log("Something went wrong in the repository layer");
           throw {error};
       }
   }

}

module.exports =MedicineRepository;