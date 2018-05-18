const express = require('express')
const router = express.Router();

const auth_ = require('../auth/auth.middleware')

const db = require('../../db')


const ERR_MSG = 'There was an error. Our #1 meme professional is on duty to solve this for you.'

