import express from 'express';
import { 
  getAssets, 
  getAssetById, 
  createAsset, 
  updateAsset, 
  sellAsset, 
  destroyAsset,
  getCategories 
} from '../../controllers/accounting/assets.js';

const router = express.Router();

router.get('/', getAssets);
router.get('/categories', getCategories);
router.get('/:id', getAssetById);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.put('/:id/sell', sellAsset);
router.put('/:id/destroy', destroyAsset);

export default router;
