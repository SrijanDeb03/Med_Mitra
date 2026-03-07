'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Medicines', 'hospitalId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Hospitals',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Medicines', 'hospitalId');
  }
};
