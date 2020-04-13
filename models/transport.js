'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transport = sequelize.define('Transport', {
    name: DataTypes.STRING
  }, {});
  Transport.associate = function (models) {
    Transport.hasMany(models.Order)
  };
  return Transport;
};