'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    address: DataTypes.STRING,
    telephone: DataTypes.STRING,
    role: DataTypes.STRING
  }, {});
  User.associate = function (models) {
    User.hasMany(models.Order)
    User.hasMany(models.CartProduct)
  };
  return User;
};