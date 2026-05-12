import { Router } from 'express';
import * as tc from '../../controllers/transaction.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionSchema,
  deleteTransactionSchema,
  queryTransactionsSchema,
  getStatsSchema,
  bulkCreateSchema,
  creditCardSummarySchema,
  creditCardDetailSchema,
} from '../../validators/transaction.validator.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Transactions
 *     description: Transaction management
 *   - name: Credit Cards
 *     description: Credit card expense tracking
 */

router.use(authenticate);

// Transactions
router.post('/', validate(createTransactionSchema), tc.createTransaction);
router.post('/bulk', validate(bulkCreateSchema), tc.bulkCreateTransactions);
router.get('/', validate(queryTransactionsSchema), tc.getTransactions);
router.get('/stats', validate(getStatsSchema), tc.getStats);
router.get('/categories', tc.getCategories);

// Credit card endpoints
router.get('/credit-cards', validate(creditCardSummarySchema), tc.getCreditCardSummaries);
router.get('/credit-cards/:cardName', validate(creditCardDetailSchema), tc.getCreditCardTransactions);

// Single transaction
router.get('/:id', validate(getTransactionSchema), tc.getTransaction);
router.put('/:id', validate(updateTransactionSchema), tc.updateTransaction);
router.delete('/:id', validate(deleteTransactionSchema), tc.deleteTransaction);

export default router;
