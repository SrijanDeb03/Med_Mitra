'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Medicine extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Hospital, {
        foreignKey: 'hospitalId',
        onDelete: 'CASCADE'
      });
    }
  }
  Medicine.init({
    hospitalId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Keep true to match migration
    },
    name: {
      type:DataTypes.STRING,
      allowNull: false,
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: false,  
    },
    batch_number: {
      type:DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('approved', 'near expiry', 'expired'),
      defaultValue: 'approved'
    }
  }, {
    sequelize,
    modelName: 'Medicine',
  });
  return Medicine;
};