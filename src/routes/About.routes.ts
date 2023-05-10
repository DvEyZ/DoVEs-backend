import express from 'express';
import packageJson from '../../package.json';
import DockerConfig from '../configs/Docker.config';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
        running: packageJson.name,
        version: packageJson.version,
        labTypes: [
            {
                name: 'docker',
                via: DockerConfig.via,
                api: DockerConfig.api,
                compose: DockerConfig.compose
            }
        ],
        loginProviderTypes: [
            'guacamole'
        ]
    })
});

export default router;