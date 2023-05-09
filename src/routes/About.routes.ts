import express from 'express';

const router = express.Router();

router.get('/labTypes', (req, res) => {
    res.status(200).json({
        labTypes: [
            'docker'
        ]
    })
})

export default router;