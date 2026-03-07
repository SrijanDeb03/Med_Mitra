const { Medicine } = require('./src/models/index');

async function checkMedicines() {
    try {
        const medicines = await Medicine.findAll();
        console.log('Total Medicines:', medicines.length);
        medicines.forEach(m => {
            console.log(`ID: ${m.id}, Name: ${m.name}, HospitalID: ${m.hospitalId}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkMedicines();
