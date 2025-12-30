import express from 'express';
import {verifyToken , authorizeRole} from '../../middleWares/Session$RoleCheck.js';
import login from './login.js';
import AllCustomer from '../../controllers/CustomerControllers/CustomerMonths.js';
import DataOdCustomer from '../../controllers/CustomerControllers/DataOfCustomer.js';


const router = express.Router();


router.use('/Customer',login)

router.use(verifyToken,authorizeRole("customer"));
router.use('/Customer', AllCustomer);
router.use('/Customer',DataOdCustomer);

export default router