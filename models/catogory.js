'use strict';
module.exports = (sequelize, DataTypes) => {
  const Catogory = sequelize.define('Catogory', {
    name: DataTypes.STRING
  }, {});
  Catogory.associate = function (models) {
    Catogory.hasMany(models.Product)
  };
  return Catogory;
};