const { getDB } = require('../config/db');

const getAllUsers = async () => {
  const db = getDB();
  return await db.collection('users').find().toArray();
};

const createUser = async (userData) => {
  const db = getDB();
  return await db.collection('users').insertOne(userData);
};

module.exports = { getAllUsers, createUser };
