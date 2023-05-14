import express from 'express';
import packageJson from '../../package.json';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
        running: packageJson.name,
        version: packageJson.version,
        labTypes: [
            'docker'
        ],
        loginProviderTypes: [
            'guacamole'
        ]
    })
});

export default router;