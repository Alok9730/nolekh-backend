import express from 'express';
import {verifyToken , authorizeRole} from '../../middleWares/Session$RoleCheck.js';

import RenameCustomer from '../../controllers/ShopKeeperController/RenameCustomerName.js'


import CustomerSignup from './Signup.js';
import ShopkeeperSignup from './ShopkeeperSignup.js';
import login from './login.js';
import AllCustomerList from '../../controllers/ShopKeeperController/AllCustomerList.js';
import CustomerMonth from '../../controllers/ShopKeeperController/CustomerMonth.js';
import CustomerData from '../../controllers/ShopKeeperController/CustomerData.js';
import MonthCreation from "../../controllers/ShopKeeperController/MonthCreation.js";
import AddCustomerData from '../../controllers/ShopKeeperController/AddEntry.js'; 
//import ManuallyDataEntry from '../../controllers/ShopKeeperController/AddManuallyData.js';
import EditEntry from '../../controllers/ShopKeeperController/EditEntry.js';
import AiCustomerEntry from '../../controllers/ShopKeeperController/ShopkeeperAIDataEntry.js'
import DeleteCustomer from '../../controllers/ShopKeeperController/DeleteCustomer.js';
import DeleteCustomerMonth from '../../controllers/ShopKeeperController/DeleteCustomerMonth.js';
import FieldDeletion from '../../controllers/ShopKeeperController/DeleteField.js';
import StatusRoute from '../../controllers/ShopKeeperController/StatusRoute.js'; 

const router = express.Router();




router.use('/shopkeeper',ShopkeeperSignup); // shopkeeper SingUp underProcess
router.use('/shopkeeper',login)

router.use(verifyToken,authorizeRole("shopkeeper"));
router.use('/shopkeeper',CustomerSignup)
router.use('/shopkeeper',AllCustomerList);
router.use('/shopkeeper',CustomerMonth)
router.use('/shopkeeper',MonthCreation);
router.use('/shopkeeper',AiCustomerEntry);
router.use('/shopkeeper',CustomerData);
router.use('/shopkeeper',EditEntry);
router.use('/shopkeeper',AddCustomerData);
router.use('/shopkeeper',RenameCustomer);
router.use('/shopkeeper',DeleteCustomer);
router.use('/shopkeeper',DeleteCustomerMonth);
router.use('/shopkeeper',StatusRoute);
router.use('/shopkeeper',FieldDeletion);

export default router